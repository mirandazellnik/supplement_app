import json
import redis
import psycopg2
import os
import logging

from backend_server.utils import api_requests
from backend_server.config import Config

# --- Redis setup (reuse same Redis instance) ---
REDIS_URL = os.getenv("REDIS_URL") or "redis://localhost:6379/0"
CACHE_EXPIRE = 30 * 24 * 60 * 60  # 30 days
redis_client = redis.from_url(REDIS_URL)
NIH_API_URL = Config.NIH_API_URL


def transform_label(record: dict) -> dict:
    """Transform DSLD-style label JSON into Elasticsearch-style hit format."""
    
    if not record:
        return {"hits": []}

    # Flatten ingredients
    def flatten_ingredients(rows, acc):
        for row in rows:
            acc.append({
                "name": row.get("name"),
                "notes": row.get("notes", ""),
                "ingredientGroup": row.get("ingredientGroup"),
                "category": row.get("category"),
            })
            if row.get("nestedRows"):
                flatten_ingredients(row["nestedRows"], acc)

    all_ingredients = []
    flatten_ingredients(record.get("ingredientRows", []), all_ingredients)

    if "otheringredients" in record and record["otheringredients"].get("ingredients"):
        for row in record["otheringredients"]["ingredients"]:
            all_ingredients.append({
                "name": row.get("name"),
                "notes": "",
                "ingredientGroup": row.get("ingredientGroup"),
                "category": row.get("category"),
            })

    # Build the _source object
    source = {
        "brandName": record.get("brandName"),
        "fullName": record.get("fullName"),
        "entryDate": record.get("entryDate"),
        "offMarket": record.get("offMarket", 0),
        "claims": record.get("claims", []),
        "events": record.get("events", []),
        "userGroups": record.get("userGroups", []),
        "netContents": record.get("netContents", []),
        "productType": record.get("productType"),
        "physicalState": record.get("physicalState"),
        "allIngredients": all_ingredients,
    }

    # Build the ES hit wrapper
    hit = {
        "_index": "dsldnxt_labels_syns1149",
        "_type": "_doc",
        "_id": str(record["id"]),
        "_score": 1.0,  # you can fill with real score later
        "_source": source,
    }

    return {
        "hits": [hit],
        "stats": {
            "count": 1,
            "pct": 4.7e-06,  # placeholder
        }
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
    conn = psycopg2.connect(DATABASE_URL)

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

        # 2️⃣ Fetch from PostgreSQL if not cached
        with conn.cursor() as cur:
            cur.execute("SELECT raw_json FROM labels WHERE upc = %s", (upc,))
            row = cur.fetchone()
            if row is None:
                logging.info(f"[LABELS] UPC {upc} not found")            
            else:
                label_json = row[0]

        # 3️⃣ Cache the result in Redis
        if label_json:
            redis_client.setex(cache_key, CACHE_EXPIRE, json.dumps(label_json))
            logging.info(f"[LABELS] UPC {upc} fetched from DB and cached")
        
        logging.info(f"JSON 1: {label_json}")
        j2 = api_requests.get(NIH_API_URL + f"/search-filter?q=%22{upc}%22", timeout=15)
        j2 = j2.json()
        logging.info(f"JSON 2: {j2}")
        
        return SpoofedResponse(label_json)
