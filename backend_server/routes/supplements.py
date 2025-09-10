from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
import requests

from backend_server.services.gpt_service import analyze_supplements, recommend_supplement_by_question
from backend_server.services.llm_client import ask_openrouter
from backend_server.services.vector_store import vector_search
from backend_server.utils.barcodes import format_barcode
from backend_server.services.tasks import fetch_label_details, recommend_similar_products, openfoodfacts_request
from backend_server.config import Config
from backend_server.utils import api_requests

NIH_API_URL = "https://api.ods.od.nih.gov/dsld/v9"

supplements_bp = Blueprint("supplements", __name__)

@supplements_bp.route("/rate", methods=["POST"])
def rate_supplements():
    data = request.get_json()
    supplement_list = data.get("supplements", [])
    
    if not supplement_list:
        return jsonify({"error": "No supplements provided"}), 400

    result = analyze_supplements(supplement_list)
    return jsonify(result)

@supplements_bp.route("/recommend", methods=["POST"])
def recommend():
    data = request.get_json()
    question = data.get("query", "")
    if not question:
        return jsonify({"error": "Missing question"}), 400

    response = recommend_supplement_by_question(question)
    print(response)

    return response

def preliminary_score_from_search(hit_source: dict) -> float:
    """
    Quick heuristic to produce a preliminary rating from the search-filter result.
    Keep this cheap — used for immediate UI feedback.
    """
    score = 3.0
    if hit_source.get("brandName"):
        score += 0.3
    if hit_source.get("productType") and hit_source["productType"].get("langualCodeDescription"):
        score += 0.2
    # if offMarket present in source -> penalize
    if hit_source.get("offMarket"):
        score -= 1.0
    # if there are claims like 'Structure/Function' which are neutral -> small boost
    claims = hit_source.get("claims") or []
    for c in claims:
        if c.get("langualCodeDescription") and "Structure/Function".lower() in c.get("langualCodeDescription").lower():
            score += 0.2
    return round(max(0.0, min(5.0, score)), 2)

@supplements_bp.route("/lookup", methods=["POST"])
@jwt_required()
def lookup():
    data = request.get_json()
    barcode = data.get("barcode")
    if not barcode:
        return jsonify({"error": "Missing barcode"}), 400
    barcode = format_barcode(barcode)
    user_id = get_jwt_identity()  # current user

    try:
        # Query NIH DSLD API by UPC
        print(f"looking for", NIH_API_URL + f"/search-filter?q=%22{barcode}%22")
        response = api_requests.get(NIH_API_URL + f"/search-filter?q=%22{barcode}%22", timeout=15)
        response.raise_for_status()
        resp_json = response.json()
        products = resp_json.get("hits", [])

        if not products:
            return jsonify({"error": "No product found"}), 404

        # Immediately return initial info to frontend
        product = products[0]  # take first match

        _id = product.get("_id")
        p = product.get("_source", {})
        prelim = preliminary_score_from_search(p)
        initial_info = {
            "id": str(_id),
            "name": p.get("fullName"),
            "brand": p.get("brandName"),
            "image": p.get("thumbnail"),          # often filename; convert to full URL in frontend if needed
            "netContents": p.get("netContents"),
            "claims": p.get("claims"),
            "preliminary_rating": prelim,
            "fetching_more": True
        }

        # Trigger background task to fetch /label details
        try:
            fetch_label_details.delay(str(user_id), str(_id))
            recommend_similar_products.delay(str(user_id), str(_id), p.get("fullName", ""), p.get("brandName", ""))
            openfoodfacts_request.delay(str(user_id), str(barcode))
        except Exception as e:
            # if Celery is not available, still continue (optionally do synchronous fallback)
            print("Warning: failed to queue background task:", e)

        return jsonify(initial_info)

    except requests.RequestException as e:
        print("Error querying NIH API:", e)
        return jsonify({"error": str(e)}), 500
    except ValueError as ve:
        print("JSON decode error:", ve)
        return jsonify({"error": "Invalid response from NIH API"}), 500

def dsld_get(path, params=None):
    r = api_requests.get(f"{NIH_API_URL}{path}", params=params, timeout=15)
    r.raise_for_status()
    return r.json()

@supplements_bp.route("/search")
def search():
    data = request.get_json()
    q = data.get("q")
    if not q:
        return jsonify({"error": "Missing query for /search"}), 400
    method = request.args.get("method", "by_keyword")  # default
    results = dsld_get("/browse-products/", {"method": method, "q": q})
    return jsonify(results)