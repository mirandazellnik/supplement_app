import json
import redis
import psycopg2
import os
import logging

from decimal import Decimal

from backend_server.utils import api_requests
from backend_server.config import Config
from backend_server.utils.database_tools.db_query import db_execute
from backend_server.utils.database_tools.top_by_essentials import get_top_fast
from backend_server.utils.database_tools.get_product_json import get_raw_json_by_ids

# --- Redis setup (reuse same Redis instance) ---
REDIS_URL = os.getenv("REDIS_URL") or "redis://localhost:6379/0"
CACHE_EXPIRE = 30 * 24 * 60 * 60  # 30 days
redis_client = redis.from_url(REDIS_URL)
NIH_API_URL = Config.NIH_API_URL


DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    def search_by_essentials(essentials):
        logging.info("Using internet for search by essentials. COMPLETEME")
        # COMPLETE ME
        #return api_requests.get(NIH_API_URL + f"/search-filter?q=%22{upc}%22", timeout=15)
else:    

    def search_by_essentials(essentials, n=10):
        """
        Fetch a label row by UPC, using Redis cache. [CACHE DISABLED]
        Independent of the existing API caching.
        """
        # Use a distinct key prefix to avoid collisions with your API cache
        logging.info("Using real DB for essential top product lookup.")
        #label_json = None

        try:
            top20 = get_top_fast(essentials, n=2*n)
            
            top20_json = get_raw_json_by_ids([pid for pid, _ in top20]) # dict: id->json

            top20_scores = {pid: score for pid, score in top20}

            recommendations = []
            for product_id, product_json in top20_json.items():
                if not product_json:
                    continue

                if isinstance(product_json, str):
                    try:
                        product_json = json.loads(product_json)
                    except Exception as e:
                        logging.warning(f"Invalid JSON for id {product_id}: {e}")
                        continue

                recommendations.append({
                    "id": str(product_id),
                    "name": product_json.get("fullName"),
                    "brand": product_json.get("brandName"),
                    "image": product_json.get("thumbnail"),
                    "score": top20_scores.get(product_id)
                })
            
            results_new = []

            products_already_listed = []

            for hit in recommendations:
                try:
                    if hit["name"] + hit["brand"] in products_already_listed:
                        continue
                    else:
                        products_already_listed.append(hit["name"] + hit["brand"])
                        results_new.append(hit)
                except:
                    pass
            
            recommendations = results_new

            def convert_decimals(obj):
                if isinstance(obj, list):
                    return [convert_decimals(i) for i in obj]
                elif isinstance(obj, dict):
                    return {k: convert_decimals(v) for k, v in obj.items()}
                elif isinstance(obj, Decimal):
                    return float(obj)
                return obj
            
            recommendations = convert_decimals(recommendations)

            recommendations = {"recommendations": recommendations}
        except Exception as e:
            logging.error(f"Error during search_by_essentials: {e}")
            recommendations = {"recommendations": []}

        return recommendations
