from flask import Blueprint, jsonify, request
from services.gpt_service import analyze_supplements
from services.llm_client import ask_openrouter
from services.vector_store import vector_search
import requests

NIH_API_URL = "https://api.ods.od.nih.gov/dsld/v9/products"

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

    # Search vector DB for relevant docs
    docs = vector_search(question, top_k=5)

    # Build context string from docs
    context = "\n\n".join([doc["text"] for doc in docs])

    print(f"context: {context}")

    # Ask OpenRouter LLM with context + question
    prompt = f"""
You are a helpful assistant providing supplement recommendations based on trusted wellness documents.

Context:
{context}

User question:
{question}

Please answer in JSON format like this:
{{
  "recommendations": [
    {{"name": "Vitamin D", "rating": 4.5, "link": "https://example.com/vitamin-d"}},
    {{"name": "Magnesium", "rating": 4.0, "link": "https://example.com/magnesium"}}
  ]
}}
"""

    
    # TEMPORARY: USE FIXED RESPONSE
    response = """{
  "recommendations": [
    {"name": "Magnesium Citrate", "rating": 4.5, "link": "https://example.com/magnesium-citrate"},
    {"name": "Magnesium Glycinate", "rating": 4.7, "link": "https://example.com/magnesium-glycinate"},
    {"name": "Magnesium Oxide", "rating": 4.0, "link": "https://example.com/magnesium-oxide"}
  ]
}"""

    response = ask_openrouter(prompt)
    print(response)

    return response

@supplement_bp.route("/lookup", methods=["POST"])
def lookup():
    data = request.get_json()
    barcode = data.get("barcode")

    if not barcode:
        return jsonify({"error": "No barcode provided"}), 400

    try:
        # Query NIH DSLD API by UPC
        response = requests.get(NIH_API_URL, params={"upc": barcode})
        response.raise_for_status()

        products = response.json()
        if not products:
            return jsonify({"error": "No product found"}), 404

        print(products)
        return jsonify(products)

    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500