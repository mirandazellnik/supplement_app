from backend_server.services.vector_store import vector_search
from backend_server.services.llm_client import ask_openrouter

def analyze_supplements(supplements):
    # Placeholder for GPT logic — right now, just returns fake ratings
    results = []
    for supp in supplements:
        results.append({
            "name": supp,
            "rating": 4.5,  # fake value
            "link": f"https://example.com/{supp.replace(' ', '-')}"
        })
    return {"results": results}

def recommend_supplement_by_question(question):
    
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

    return response

def fetch_similar_products(product_name, brand_name):
    # Search vector DB for relevant docs
    docs = vector_search(product_name, top_k=5)

    # Build context string from docs
    context = "\n\n".join([doc["text"] for doc in docs])

    print(f"context: {context}")

    # Ask OpenRouter LLM with context + product name
    prompt = f"""
You are a helpful assistant providing supplement recommendations based on trusted wellness documents.

Context:
{context}

User question:
Please recommend 3 supplements similar to this product: {product_name} by {brand_name}.
For each one, provide a name, manufacturer, and UPC-A code.
If you don't know the UPC-A code for a product, do not recommend the product.

Please answer in JSON format like this:
{{"recommendations": [{{"name": "Clean Vitamin D", "brand": "HealthCorp", "upc": "123456789012"}},{{"name": "Health Boost XL", "brand": "WellnessInc", "upc": "987654321098"}}]}}

Respond ONLY with a valid JSON object. Do not wrap it in quotes or escape characters. Do not include any text before or after the JSON.
Return the JSON inside a single top-level object, nothing else.
"""

    response = ask_openrouter(prompt)
    print(f"LLM response: {response}")

    return response