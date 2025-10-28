# backend_server/services/tasks.py
#from .celery_worker import celery

#from backend_server.services.make_celery import celery

from backend_server.services.celery_worker import celery  # <-- use celery from worker


import requests
import math
import logging
import json
import time

# shared socketio reference (the one you already created in socketio_ref)
from backend_server.services.socketio_ref import socketio
from backend_server.services.gpt_service import fetch_similar_products
from backend_server.utils import api_requests
from backend_server.services.rating_calculators import nih_dsld, openfoodfacts, essential_finder
from backend_server.utils.socket_emit import emit_with_retry
from backend_server.utils.search_by_essentials import search_by_essentials

from backend_server.utils.database_tools.get_ingredients_for_label import get_ingredients_for_label
from backend_server.utils.database_tools.get_rating import get_ratings_for_id
from backend_server.utils.database_tools.top_by_essentials import get_top_fast

logger = logging.getLogger(__name__)

# celery task ---------------------------------------------------------------
@celery.task
def fetch_label_details(user_id, product_id, recommend_after=False):
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
            socketio.emit("lookup_update_error", {"room": user_id, "data": {"product_id": product_id, "error": str(e)}}, room=user_id)
        except Exception:
            logger.exception("Failed to emit lookup_update_error")
        return None

    # Calculate and send essentials
    essential_info = {}
    try:
        #essential_info = essential_finder.classify_ingredients_with_gpt(label)
        essential_info = get_ingredients_for_label(product_id)
        assert essential_info["essentials"] or essential_info["non_essentials"]
        if essential_info["essentials"] == None:
            essential_info["essentials"] = []
        if essential_info["non_essentials"] == None:
            essential_info["non_essentials"] = []

        socketio.emit("essentials", {"room": user_id, "data": essential_info}, room=user_id)
    except Exception as e:
        logger.exception("Failed to calculate essentials %s: %s", product_id, e)
        try:
            socketio.emit("essentials_error", {"room": user_id, "data": {"product_id": product_id, "error": str(e)}}, room=user_id)
        except:
            logger.exception("Failed to emit essentials_error")
    
    # compute categories / rating
    categories = nih_dsld.compute_category_scores(label)
    overall = nih_dsld.compute_overall_rating(categories)

    ratings = get_ratings_for_id(product_id)
    db_categories = ratings.get("categories", []) if ratings else []
    db_overall = ratings.get("overall_score") if ratings else None

    #print("RATINGS BELOW")
    #print(f"RATINGS: {ratings}")

    #print("RATINGS END")

    #print("CATEGORIES BELOW")
    #print(f"CATS: {categories}")
    #print("CATEGORIES END")

    payload = {
        "product_id": str(product_id),
        "rating": db_overall,
        "categories": db_categories,
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
        socketio.emit("lookup_update", {"room": user_id, "data": payload}, room=user_id)
    except Exception as e:
        logger.exception("Failed to emit lookup_update: %s", e)
        return None
    
    if recommend_after:
        #recommend_similar_products.delay(str(user_id), str(product_id), payload["name"], payload["brand"])
        #recommend_similar_by_essentials.delay(str(user_id), essential_info["essentials"])

        recommend_similar_by_essentials_ranked.delay(str(user_id), essential_info["essentials"], n=10)
    return None

@celery.task
def recommend_similar_by_essentials(user_id, essentials):
    """
    Recommend similar products based on the given essentials list.
    Emitted event: 'recommend_similar_products' with payload:
      {
        user_id: "...",
        recommendations: [{id, name, image, ...}, ...]
      }
    """

    try:
        logger.info("Recommending similar products by essentials (emit to room=%s)", user_id)
        # Fetch similar products from your recommendation engine
        r = api_requests.get(f"https://api.ods.od.nih.gov/dsld/v9/search-filter/?q={' '.join(essentials)}", timeout=15)
        r.raise_for_status()
        resp = r.json()
        if resp.get("hits") == None:
            raise ValueError("No hits in response")
        
        recommendations = []
        for product in resp.get("hits", [])[:10]:  # limit to top 10
            p = product.get("_source", {})
            recommendations.append({
                "id": str(product.get("_id")),
                "name": p.get("fullName"),
                "brand": p.get("brandName"),
                "image": p.get("thumbnail"),
                "netContents": p.get("netContents"),
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
        recommendations = {"recommendations": recommendations}

    except Exception as e:
        logger.exception("Failed to recommend similar products by essentials: %s", e)
        try:
            socketio.emit("recommend_similar_products_error", {"room": user_id, "data": {"error": str(e)}}, room=user_id)
        except Exception:
            logger.exception("Failed to emit recommend_similar_products_error")
        return None

    # Emit recommendations to the user's room
    try:
        logger.info("Emitting recommend_similar_products to room=%s", user_id)
        socketio.emit("recommend_similar_products", {"room": user_id, "data": recommendations}, room=user_id)
    except Exception as e:
        logger.exception("Failed to emit recommend_similar_products: %s", e)

    return None


@celery.task
def recommend_similar_by_essentials_ranked(user_id, essentials, n=10):
    """
    USING DATABASE: Recommend similar products based on the given essentials list.
    Emitted event: 'recommend_similar_products' with payload:
      {
        user_id: "...",
        recommendations: [{id, name, image, ...}, ...]
      }
    """

    try:
        logger.info("DATABASE: Recommending similar products by essentials (emit to room=%s)", user_id)
        recommendations = search_by_essentials(essentials, n=n)
        print("RECOMMENDATIONS BELOW")
        print(recommendations)

    except Exception as e:
        logger.exception("Failed to recommend similar products by essentials: %s", e)
        try:
            socketio.emit("recommend_similar_products_error", {"room": user_id, "data": {"error": str(e)}}, room=user_id)
        except Exception:
            logger.exception("Failed to emit recommend_similar_products_error")
        return None

    # Emit recommendations to the user's room
    try:
        logger.info("Emitting recommend_similar_products to room=%s", user_id)
        socketio.emit("recommend_similar_products", {"room": user_id, "data": recommendations}, room=user_id)
    except Exception as e:
        logger.exception("Failed to emit recommend_similar_products: %s", e)

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
            socketio.emit("recommend_similar_products_error", {"room": user_id, "data": {"product_id": product_id, "error": "Invalid recommendations format"}}, room=user_id)
            return None
    except Exception as e:
        logger.exception("Failed to recommend similar products for %s: %s", product_id, e)
        try:
            socketio.emit("recommend_similar_products_error", {"room": user_id, "data": {"product_id": product_id, "error": str(e)}}, room=user_id)
        except Exception:
            logger.exception("Failed to emit recommend_similar_products_error")
        return None

    # Emit recommendations to the user's room
    try:
        logger.info("Emitting recommend_similar_products to room=%s", user_id)
        socketio.emit("recommend_similar_products", {"room": user_id, "data": recommendations}, room=user_id)
    except Exception as e:
        logger.exception("Failed to emit recommend_similar_products: %s", e)

    return None

@celery.task
def openfoodfacts_request(user_id, upc):
    """
    Attempt to fetch product info from OpenFoodFacts database.
    """
    try:
        logger.info("Fetching OFF details for id=%s (emit to room=%s)", upc, user_id)
        r = api_requests.get(f"https://world.openfoodfacts.net/api/v2/product/{upc}.json", timeout=15)
        r.raise_for_status()
        info = r.json()
    except Exception as e:
        logger.exception("Failed to fetch OFF %s: %s", upc, e)
        try:
            socketio.emit("off_error", {"room": user_id, "data": {"upc": upc, "error": str(e)}}, room=user_id)
        except Exception:
            logger.exception("Failed to emit off_error")
        return None

    if (info["status"] == 0):
        logger.exception("OFF not found!")
        socketio.emit("off_error", {"room": user_id, "data": {"upc": upc, "error": "Not found"}}, room=user_id)
        return None
    
    # compute categories / rating
    cat_and_conf = openfoodfacts.compute_scores(info)
    print(cat_and_conf)
    print(info["product"]["image_url"])
    #overall = nih_dsld.compute_overall_rating(categories)

    """
    payload = {
        "product_id": str(upc),
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
        socketio.emit("lookup_update", {"room": user_id, "data": payload}, room=user_id)
    except Exception as e:
        logger.exception("Failed to emit lookup_update: %s", e)
    """

    return None

@celery.task
def get_products_for_essential(user_id, essential_name):
    """
    Fetch products related to the given essential from NIH DSLD API.
    Returns a list of products.
    """
    try:
        logger.info("Fetching products for essential=%s (emit to room=%s)", essential_name, user_id)
        
        """
        r = api_requests.get(f"https://api.ods.od.nih.gov/dsld/v9/search-filter/?q=%22{essential_name}%22", timeout=15)
        r.raise_for_status()
        resp_json = r.json()
        products = resp_json.get("hits", [])
        results = []
        for product in products[:20]:  # limit to top 20
            p = product.get("_source", {})
            results.append({
                "id": str(product.get("_id")),
                "name": p.get("fullName"),
                "brand": p.get("brandName"),
                "image": p.get("thumbnail"),
                "netContents": p.get("netContents"),
            })
        
        # Prune duplicates
        results_new = []
        products_already_listed = []

        for hit in results:
            try:
                if hit["name"] + hit["brand"] in products_already_listed:
                    continue
                else:
                    products_already_listed.append(hit["name"] + hit["brand"])
                    results_new.append(hit)
            except:
                pass
        """

        top_with_essential = search_by_essentials([essential_name], n=10)
        logger.info(f"printing top {top_with_essential}")
        
        roomName = str(user_id) + "-e_" + essential_name
        print(roomName + "room name <---------")

        socketio.emit("e_essential_products", {"room": roomName, "data": {"essential": essential_name, "products": top_with_essential}}, room=roomName)
    except Exception as e:
        logger.exception("Failed to fetch products for essential %s: %s", essential_name, e)
        socketio.emit("e_essential_products_error", {"room": roomName, "data": {"essential": essential_name, "error": str(e)}}, room=roomName)
    return None