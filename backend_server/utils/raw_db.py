import json
import redis
import psycopg2
import os
import logging

from backend_server.utils import api_requests
from backend_server.config import Config

from backend_server.utils.db_query import db_execute

# --- Redis setup (reuse same Redis instance) ---
REDIS_URL = os.getenv("REDIS_URL") or "redis://localhost:6379/0"
CACHE_EXPIRE = 30 * 24 * 60 * 60  # 30 days
redis_client = redis.from_url(REDIS_URL)
NIH_API_URL = Config.NIH_API_URL

def transform_record(record):
    if not record:
        return {"hits": []}

    def extract_ingredient(ingr):
        """Extract a simplified ingredient entry (safe)."""
        return {
            "ingredientGroup": ingr.get("ingredientGroup", ""),
            "notes": ingr.get("notes", ""),
            "name": ingr.get("name", ""),
            "category": ingr.get("category", ""),
        }

    def flatten_ingredients(rows):
        """Recursively flatten ingredientRows + nestedRows."""
        result = []
        for ingr in rows or []:
            result.append(extract_ingredient(ingr))
            nested = ingr.get("nestedRows", [])
            if nested:
                result.extend(flatten_ingredients(nested))
        return result

    all_ingredients = []
    all_ingredients.extend(flatten_ingredients(record.get("ingredientRows", [])))
    all_ingredients.extend(
        [extract_ingredient(ingr) for ingr in record.get("otheringredients", {}).get("ingredients", [])]
    )

    return {
        "hits": [{
            "_index": "dsldnxt_labels_syns1149",
            "_type": "_doc",
            "_id": str(record.get("id", "")),
            "_score": 19.61498,  # placeholder
            "_source": {
                "userGroups": record.get("userGroups", []),
                "brandName": record.get("brandName", ""),
                "physicalState": record.get("physicalState", {}),
                "entryDate": record.get("entryDate", ""),
                "allIngredients": all_ingredients,
                "claims": record.get("claims", []),
                "fullName": record.get("fullName", ""),
                "offMarket": record.get("offMarket", 0),
                "netContents": [
                    {
                        "unit": nc.get("unit", ""),
                        "quantity": nc.get("quantity", ""),
                        "display": nc.get("display", ""),
                        "order": nc.get("order", 0),
                    }
                    for nc in record.get("netContents", [])
                ],
                "productType": record.get("productType", {}),
                "events": record.get("events", []),
            }
        }],
        "stats": {"count": 1, "pct": 4.721836605566101e-06},
    }


class SpoofedResponse:
    def __init__(self, json):
        self.internaljson = json
    
    def json(self):
        return self.internaljson
    
    def raise_for_status(self):
        return

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    def get_label_by_upc(upc: str):
        logging.info("Using internet for barcode lookup.")
        return api_requests.get(NIH_API_URL + f"/search-filter?q=%22{upc}%22", timeout=15)
else:
    def get_label_by_upc(upc: str):
        """
        Fetch a label row by UPC, using Redis cache.
        Independent of the existing API caching.
        """
        # Use a distinct key prefix to avoid collisions with your API cache
        logging.info("Using real DB for barcode lookup.")
        label_json = None

        upc = upc.replace("%20", " ")

        cache_key = f"label:upc:{upc}"

        # 1️⃣ Check Redis first
        cached = redis_client.get(cache_key)
        if cached:
            logging.info(f"[LABELS] UPC {upc} fetched from cache")
            label_json = json.loads(cached)
            

        """
        # 2️⃣ Fetch from PostgreSQL if not cached
        with conn.cursor() as cur:
            cur.execute("SELECT raw_json FROM labels WHERE upc = %s", (upc,))
            row = cur.fetchone()
            if row is None:
                logging.info(f"[LABELS] UPC {upc} not found")            
            else:
                label_json = row[0]
        """

        query = "SELECT raw_json FROM labels WHERE upc = :upc"
        rows = db_execute(query, {"upc": upc})

        if not rows:
            logging.info(f"[LABELS] UPC {upc} not found")
            return None
        logging.info(f"[LABELS] upc {upc} fetched from DB")

        # rows is a list of Row objects (use ._mapping for dict-style access if needed)
        label_json = rows[0][0]  # or rows[0]._mapping['raw_json']

        # 3️⃣ Cache the result in Redis
        if label_json:
            redis_client.setex(cache_key, CACHE_EXPIRE, json.dumps(label_json))
            logging.info(f"[LABELS] UPC {upc} fetched from DB and cached")
        
        label_json = transform_record(label_json)

        logging.info(f"JSON 1: {label_json}")
        j2 = api_requests.get(NIH_API_URL + f"/search-filter?q=%22{upc}%22", timeout=15)
        j2 = j2.json()
        logging.info(f"JSON 2: {j2}")

        
        return SpoofedResponse(label_json)
