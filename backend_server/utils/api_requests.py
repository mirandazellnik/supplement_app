import os
import time
import logging
import requests
from requests.adapters import HTTPAdapter, Retry
from ratelimit import limits, sleep_and_retry
import requests_cache
from sqlalchemy import create_engine
import redis
from backend_server.config import Config

# --- Configuration ---
REDIS_URL = os.getenv("REDIS_URL") or "redis://localhost:6379/0"  # Provided by Railway
CACHE_EXPIRE = 30 * 24 * 60 * 60  # 30 days
ONE_MINUTE = 60  # for rate limit
NIH_API_URL = Config.NIH_API_URL

# --- Setup caching with Redis ---
redis_client = redis.from_url(REDIS_URL)
requests_cache.install_cache(
    name='api_cache',
    backend='redis',
    connection=redis_client,
    prefix='cache:',       # avoids collision with queues
    expire_after=CACHE_EXPIRE,  # 30 days
    allowable_codes=(200,),     # only cache successful responses
)

# --- Configure session with retries ---
session = requests.Session()
retries = Retry(
    total=3,
    backoff_factor=0.5,
    status_forcelist=[429, 500, 502, 503, 504],
)
adapter = HTTPAdapter(max_retries=retries)
session.mount("http://", adapter)
session.mount("https://", adapter)

# --- Request function ---
def get(url, params=None, timeout=15, use_cache=True):
    """
    Perform a GET request with retry + optional caching.
    Only caches successful responses.
    """
    headers = requests.utils.default_headers()
    # If requesting api.ods.od.nih.gov, add API key if available
    if "api.ods.od.nih.gov" in url:
        api_key = Config.NIH_API_KEY
        headers["X-Api-Key"] = api_key

    try:
        if not use_cache:
            with requests_cache.disabled():
                response = session.get(url, params=params, timeout=timeout)
        else:
            response = session.get(url, params=params, timeout=timeout)
        
        logging.info(f"[API_CLIENT] {url} fetched from {'cache' if getattr(response, 'from_cache', False) else 'network'}")

        if response.status_code != 200:
            # Remove from cache if it was cached due to retry
            if getattr(response, 'from_cache', False):
                requests_cache.get_cache().delete_url(response.url)
        return response
    except requests.RequestException as e:
        logging.error(f"[API_CLIENT] {url} Request failed: {e}")
        return None

# --- Rate-limited wrapper ---
@sleep_and_retry
@limits(calls=100, period=ONE_MINUTE)
def limited_get(url, **kwargs):
    response = get(url, **kwargs)
    if response and response.status_code == 429:
        raise Exception("Rate limit hit")
    return response

if __name__ == "__main__":
    # Do a test by fetching https://api.ods.od.nih.gov/dsld/v9/search-filter/?method=by_keyword&q=Vitamin%20E%20Vitamin%20C%20Vitamin%20B6%20Biotin%20Zinc&size=11 twice, to see if it caches and thus is faster the second time.
    import time
    url = "https://api.ods.od.nih.gov/dsld/v9/search-filter/"
    params = {"method": "by_keyword", "q": "Vitamin E Vitamin C Vitamin B6 Biotin  Zinc", "size": 11}
    start = time.time()
    r1 = limited_get(url, params=params)
    duration1 = time.time() - start

    start = time.time()
    r2 = limited_get(url, params=params)
    duration2 = time.time() - start

    print(f"First request took: {duration1} seconds")
    print("First request:", r1.from_cache)  # Should print False
    print(f"Second request took: {duration2} seconds")
    print("Second request:", r2.from_cache)  # Should print True

def dsld_get(path, params=None):
    r = get(f"{NIH_API_URL}{path}", params=params, timeout=15)
    r.raise_for_status()
    return r.json()