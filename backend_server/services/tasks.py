# backend_server/services/tasks.py
from .celery_worker import celery
import requests
import math
import logging
import json
import time

# shared socketio reference (the one you already created in socketio_ref)
from backend_server.services.socketio_ref import socketio
from backend_server.services.gpt_service import fetch_similar_products
from backend_server.utils import api_requests
from backend_server.services.rating_calculators import nih_dsld
from backend_server.utils.socket_emit import emit_with_retry

logger = logging.getLogger(__name__)

# celery task ---------------------------------------------------------------
@celery.task
def fetch_label_details(user_id, product_id):
    """
    Fetch the /label/{id} data and compute detailed ratings.
    Emitted event: 'lookup_update' with payload:
      {
        product_id: "...",
        rating: 4.2,
        categories: [{name, score, rating, detail}, ...],
        raw_label: { ... }   # optional: include raw label for debugging / optional UI details
      }
    """
    try:
        logger.info("Fetching label details for id=%s (emit to room=%s)", product_id, user_id)
        r = api_requests.get(f"https://api.ods.od.nih.gov/dsld/v9/label/{product_id}", timeout=15)
        r.raise_for_status()
        label = r.json()
    except Exception as e:
        logger.exception("Failed to fetch label %s: %s", product_id, e)
        try:
            socketio.emit("lookup_update_error", {"product_id": product_id, "error": str(e)}, room=user_id)
        except Exception:
            logger.exception("Failed to emit lookup_update_error")
        return None

    # compute categories / rating
    categories = nih_dsld.compute_category_scores(label)
    overall = nih_dsld.compute_overall_rating(categories)

    payload = {
        "product_id": str(product_id),
        "rating": overall,
        "categories": categories,
        # optionally include a few display-friendly fields from label
        "name": label.get("fullName") or label.get("brandName"),
        "brand": label.get("brandName"),
        "image": label.get("thumbnail"),
        "raw_label": label,  # optional: include raw label if you want the frontend to show more details
    }

    # emit to the user's room
    try:
        #time.sleep(1)
        logger.info("Emitting lookup_update to room=%s", user_id)
        socketio.emit("lookup_update", payload, room=user_id)
    except Exception as e:
        logger.exception("Failed to emit lookup_update: %s", e)

    return None

@celery.task
def recommend_similar_products(user_id, product_id, product_name, brand_name):
    """
    Recommend similar products based on the given product ID.
    Emitted event: 'recommend_similar_products' with payload:
      {
        user_id: "...",
        product_id: "...",
        recommendations: [{id, name, image, ...}, ...]
      }
    """
    try:
        logger.info("Recommending similar products for id=%s (emit to room=%s)", product_id, user_id)
        # Fetch similar products from your recommendation engine
        recommendations = fetch_similar_products(product_name, brand_name)
        try:
            recommendations = json.loads(recommendations)
        except json.JSONDecodeError as e:
            logger.exception("Failed to parse recommendations JSON: %s", e)
            socketio.emit("recommend_similar_products_error", {"product_id": product_id, "error": "Invalid recommendations format"}, room=user_id)
            return None
    except Exception as e:
        logger.exception("Failed to recommend similar products for %s: %s", product_id, e)
        try:
            socketio.emit("recommend_similar_products_error", {"product_id": product_id, "error": str(e)}, room=user_id)
        except Exception:
            logger.exception("Failed to emit recommend_similar_products_error")
        return None

    # Emit recommendations to the user's room
    try:
        logger.info("Emitting recommend_similar_products to room=%s", user_id)
        socketio.emit("recommend_similar_products", recommendations, room=user_id)
    except Exception as e:
        logger.exception("Failed to emit recommend_similar_products: %s", e)

    return None