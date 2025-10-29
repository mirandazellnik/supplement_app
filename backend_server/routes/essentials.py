from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
import requests

from backend_server.services.gpt_service import analyze_supplements, recommend_supplement_by_question
from backend_server.services.llm_client import ask_openrouter
from backend_server.services.vector_store import vector_search
from backend_server.utils.barcodes import format_barcode
from backend_server.services.tasks import get_products_for_essential
from backend_server.config import Config
from backend_server.utils import api_requests
from backend_server.utils.database_tools.search_for_essential import search_essentials
from backend_server.services.essential_description import get_essential_description

essentials_bp = Blueprint("essentials", __name__)

@essentials_bp.route("/lookup", methods=["POST"])
@jwt_required()
def lookup():
    data = request.get_json()
    essential_name = data.get("name")
    if not essential_name:
        return jsonify({"error": "Missing essential name"}), 400
    
    user_id = get_jwt_identity()  # current user
    print(f"ess name {essential_name}")
    
    try:
        response = get_essential_description(essential_name)
    except Exception as e:
        print("Error with essential lookup", e)
        return jsonify({"error": str(e)}), 500
    
    get_products_for_essential.delay(user_id, essential_name)

    return response

@essentials_bp.route("/search", methods=["POST"])
@jwt_required()
def search():
    data = request.get_json()
    q = data.get("q")
    if not q:
        return jsonify({"error": "Missing query"}), 400
    
    results = search_essentials(q)
    print(results)

    return {"results": results}