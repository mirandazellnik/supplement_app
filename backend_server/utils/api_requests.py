import requests
from requests.adapters import HTTPAdapter, Retry
import requests_cache
import logging

# ---- Configure caching ----
requests_cache.install_cache("api_cache", expire_after=3600)  # 1 hour cache

# ---- Configure session with retries ----
session = requests.Session()
retries = Retry(
    total=3,
    backoff_factor=0.5,
    status_forcelist=[429, 500, 502, 503, 504],
)
adapter = HTTPAdapter(max_retries=retries)
session.mount("http://", adapter)
session.mount("https://", adapter)


def get(url, params=None, timeout=15, use_cache=True):
    """
    Perform a GET request with retry + optional caching.
    Returns `requests.Response` or None if completely failed.
    
    Args:
        url (str): API endpoint.
        params (dict): Query parameters.
        timeout (int): Timeout in seconds.
        use_cache (bool): If False, bypass requests-cache.
    """
    try:
        # If caching disabled, temporarily disable the cache context
        if not use_cache:
            with requests_cache.disabled():
                response = session.get(url, params=params, timeout=timeout)
        else:
            response = session.get(url, params=params, timeout=timeout)

        return response
    except requests.RequestException as e:
        logging.error(f"[API_CLIENT] {url} Request failed: {e}")
        return None