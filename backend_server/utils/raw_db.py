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


class SpoofedResponse:
    def __init__(self, json):
        self.json = {"hits":[json]}
    
    def json(self):
        return self.json
    
    def raise_for_status(self):
        return

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    def get_label_by_upc(upc: str):
        logging.info("Using spoofed DB for barcode lookup.")
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

        cache_key = f"label:upc:{upc}"

        # 1️⃣ Check Redis first
        cached = redis_client.get(cache_key)
        if cached:
            logging.info(f"[LABELS] UPC {upc} fetched from cache")
            return json.loads(cached)

        # 2️⃣ Fetch from PostgreSQL if not cached
        with conn.cursor() as cur:
            cur.execute("SELECT raw_json FROM labels WHERE upc = %s", (upc,))
            row = cur.fetchone()
            if row is None:
                logging.info(f"[LABELS] UPC {upc} not found")
                return None

            label_json = row[0]

        # 3️⃣ Cache the result in Redis
        redis_client.setex(cache_key, CACHE_EXPIRE, json.dumps(label_json))
        logging.info(f"[LABELS] UPC {upc} fetched from DB and cached")

        return label_json
