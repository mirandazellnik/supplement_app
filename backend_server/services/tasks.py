# backend_server/services/tasks.py
from .celery_worker import celery
import requests
import math
import logging
import json

# shared socketio reference (the one you already created in socketio_ref)
from backend_server.services.socketio_ref import socketio
from backend_server.services.gpt_service import fetch_similar_products

logger = logging.getLogger(__name__)

# rating helpers -------------------------------------------------------------
def score_to_label(score: float) -> str:
    """Map numeric 0..5 score to descriptive label used in UI."""
    if score >= 4.25:
        return "Great"
    if score >= 3.25:
        return "Good"
    if score >= 2.0:
        return "Okay"
    return "Bad"

def clamp(v, lo=0.0, hi=5.0):
    return max(lo, min(hi, v))

def safe_get(obj, *keys, default=None):
    cur = obj
    for k in keys:
        if not isinstance(cur, dict):
            return default
        cur = cur.get(k, default)
        if cur is default:
            return default
    return cur

# heuristics ---------------------------------------------------------------
def compute_category_scores(label_json: dict) -> list:
    """
    Given the /label response, compute seven category scores (0-5).
    Categories: Purity, Potency, Additives, Safety, Evidence, Brand, Environmental
    These are heuristics — tweak weights later.
    """
    cats = []

    # Purity: look for third-party/contact info, 'no artificial' statements, and presence of many 'otheringredients' suspicious ones
    purity = 3.0
    # presence of manufacturer/contact -> slightly positive
    contacts = label_json.get("contacts") or []
    if contacts:
        purity += 0.5
    statements = label_json.get("statements") or []
    # if "Does NOT Contain" or "No artificial" found -> bonus
    statements_text = " ".join([s.get("notes","") for s in statements]).lower()
    if "does not contain" in statements_text or "no artificial" in statements_text:
        purity += 0.75
    # off-market -> penalty
    if label_json.get("offMarket"):
        purity -= 1.0

    cats.append(("Purity", clamp(purity, 0, 5), "Purity indicates third-party testing and absence of contaminants."))

    # Potency: presence of explicit quantities in ingredientRows
    potency = 3.0
    ingredient_rows = label_json.get("ingredientRows") or []
    qty_present = 0
    qty_unknown = 0
    for row in ingredient_rows:
        quantities = row.get("quantity") or []
        for q in quantities:
            # If quantity has numeric 'quantity' or unit -> treat as known
            if isinstance(q.get("quantity"), (int, float)) and q.get("quantity", 0) > 0:
                qty_present += 1
            else:
                qty_unknown += 1
    if qty_present > 0:
        potency += min(1.5, qty_present * 0.35)
    if qty_unknown > qty_present:
        potency -= 0.75
    cats.append(("Potency", clamp(potency, 0, 5), "Potency looks for explicit ingredient amounts per serving."))

    # Additives: check otheringredients list and presence of fillers / stearates etc.
    additives = 3.0
    other_ings = safe_get(label_json, "otheringredients", "ingredients", default=[]) or []
    # penalize if many filler-like names
    filler_hits = 0
    filler_keywords = ["stearate", "cellulose", "silicon dioxide", "magnesium stearate", "dicalcium phosphate"]
    for oi in other_ings:
        name = (oi.get("name") or "").lower()
        for fk in filler_keywords:
            if fk in name:
                filler_hits += 1
    additives -= 0.5 * min(3, filler_hits)
    # if "Proprietary Blend" found, that's ambiguous for additives -> small penalty
    if any("proprietary" in (r.get("name") or "").lower() for r in ingredient_rows):
        additives -= 0.75
    cats.append(("Additives", clamp(additives, 0, 5), "Additives looks at fillers, excipients and proprietary blends."))

    # Safety: offMarket flag, explicit precaution statements, targetGroups etc.
    safety = 3.25
    if label_json.get("offMarket"):
        safety -= 1.5
    # if statements contain 'Not for use by pregnant' etc -> safety notes but not necessarily bad
    if "not for use by pregnant" in statements_text or "keep out of reach of children" in statements_text:
        safety -= 0.25
    cats.append(("Safety", clamp(safety, 0, 5), "Safety considers recalls/off-market flags and explicit precautionary statements."))

    # Evidence: presence of clinical claims / 'clinically validated' / 'patent' -> +, many vague marketing -> -
    evidence = 3.0
    if "clinically validated" in statements_text or "clinically" in statements_text:
        evidence += 0.75
    if "patent" in statements_text:
        evidence += 0.3
    # if only marketing keywords and no quantities -> reduce
    if qty_present == 0 and ("clinically" not in statements_text):
        evidence -= 0.5
    cats.append(("Evidence", clamp(evidence, 0, 5), "Evidence checks for clinical validation claims and concrete data."))

    # Brand: presence of known manufacturer / website / contact / brand reputation heuristics (we'll just check presence)
    brand = 3.0
    brand_name = label_json.get("brandName") or ""
    contacts = label_json.get("contacts") or []
    if brand_name:
        brand += 0.5
    if any((c.get("contactDetails") or {}).get("webAddress") for c in contacts):
        brand += 0.5
    # offMarket penalizes brand
    if label_json.get("offMarket"):
        brand -= 1.0
    cats.append(("Brand", clamp(brand, 0, 5), "Brand looks at manufacturer presence, contact info, and off-market status."))

    # Environmental: manufactured in, 'organic', 'no GMOs', packaging statements
    env = 3.0
    # heuristics from statements_text
    if "manufactured in" in statements_text:
        env += 0.25
    if "no genetically modified" in statements_text or "no gmo" in statements_text or "dairy free" in statements_text:
        env += 0.35
    if "manufactured in canada" in statements_text:
        env += 0.1
    cats.append(("Environmental", clamp(env, 0, 5), "Environmental depends on claims like 'organic', 'no GMO', and manufacturing/sourcing statements."))

    # return list of dicts
    out = []
    for name, score, detail in cats:
        out.append({"name": name, "score": round(score, 2), "rating": score_to_label(score), "detail": detail})
    return out

def compute_overall_rating(categories: list) -> float:
    """Weighted average of category scores -> 0..5 rounded to 2 decimal places."""
    if not categories:
        return 0.0
    # equal weight for now
    total = sum(cat["score"] for cat in categories)
    avg = total / len(categories)
    return round(avg, 2)

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
        r = requests.get(f"https://api.ods.od.nih.gov/dsld/v9/label/{product_id}", timeout=15)
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
    categories = compute_category_scores(label)
    overall = compute_overall_rating(categories)

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