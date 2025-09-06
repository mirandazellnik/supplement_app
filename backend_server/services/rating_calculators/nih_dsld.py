# backend_server/services/tasks.py
import logging
from backend_server.services.gpt_service import ask_openrouter

logger = logging.getLogger(__name__)

# rating helpers -------------------------------------------------------------
def score_to_label(score: float) -> str:
    """Map numeric 0..10 score to descriptive label used in UI."""
    if score >= 8.5:
        return "Great"
    if score >= 6.5:
        return "Good"
    if score >= 4.0:
        return "Okay"
    return "Bad"

def clamp(v, lo=0.0, hi=10.0):
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
    Given the /label response, compute seven category scores (0-10) with justifications.
    Categories: Purity, Potency, Additives, Safety, Evidence, Brand, Environmental
    """
    cats = []

    # Purity
    purity = 6.0
    justification = "Neutral baseline purity."
    contacts = label_json.get("contacts") or []
    statements = label_json.get("statements") or []
    statements_text = " ".join([s.get("notes","") for s in statements]).lower()

    if contacts:
        purity += 1.0
        justification = "Manufacturer/contact info present."
    if "does not contain" in statements_text or "no artificial" in statements_text:
        purity += 1.5
        justification += " No artificial ingredients stated."
    if label_json.get("offMarket"):
        purity -= 2.0
        justification += " Product is off-market."

    cats.append(("Purity", clamp(purity), justification))

    # Potency
    potency = 6.0
    justification = "Baseline potency."
    ingredient_rows = label_json.get("ingredientRows") or []
    qty_present = sum(1 for row in ingredient_rows for q in row.get("quantity", []) if isinstance(q.get("quantity"), (int,float)) and q.get("quantity")>0)
    qty_unknown = sum(1 for row in ingredient_rows for q in row.get("quantity", []) if not isinstance(q.get("quantity"), (int,float)) or q.get("quantity")==0)

    if qty_present > 0:
        potency += min(3.0, qty_present * 0.7)
        justification = f"{qty_present} ingredients have explicit amounts."
    if qty_unknown > qty_present:
        potency -= 1.5
        justification += " Some ingredient amounts unknown."

    cats.append(("Potency", clamp(potency), justification))

    # Additives
    additives = 6.0
    justification = "Baseline additives score."
    other_ings = safe_get(label_json, "otheringredients", "ingredients", default=[]) or []
    filler_keywords = ["stearate", "cellulose", "silicon dioxide", "magnesium stearate", "dicalcium phosphate"]
    filler_hits = sum(1 for oi in other_ings for fk in filler_keywords if fk in (oi.get("name") or "").lower())

    additives -= 1.0 * min(3, filler_hits)
    if any("proprietary" in (r.get("name") or "").lower() for r in ingredient_rows):
        additives -= 1.5
        justification = "Proprietary blend and fillers present."
    elif filler_hits:
        justification = f"{filler_hits} common filler ingredients detected."
    else:
        justification = "No major fillers detected."

    cats.append(("Additives", clamp(additives), justification))

    # Safety
    safety = 6.5
    justification = "Baseline safety."
    if label_json.get("offMarket"):
        safety -= 3.0
        justification = "Product is off-market, reducing safety score."
    elif "not for use by pregnant" in statements_text or "keep out of reach of children" in statements_text:
        safety -= 0.5
        justification = "Precaution statements detected."

    cats.append(("Safety", clamp(safety), justification))

    # Evidence
    evidence = 6.0
    justification = "Baseline evidence score."
    if "clinically validated" in statements_text or "clinically" in statements_text:
        evidence += 2.0
        justification = "Claims of clinical validation present."
    if "patent" in statements_text:
        evidence += 0.5
        justification += " Patent claims noted."
    if qty_present == 0 and ("clinically" not in statements_text):
        evidence -= 1.5
        justification = "No concrete quantities or clinical claims."

    cats.append(("Evidence", clamp(evidence), justification))

    # Brand
    brand = 6.0
    justification = "Baseline brand score."
    brand_name = label_json.get("brandName") or ""
    if brand_name:
        brand += 1.0
        justification = f"Brand name '{brand_name}' present."
    if any((c.get("contactDetails") or {}).get("webAddress") for c in contacts):
        brand += 1.0
        justification += " Contact website available."
    if label_json.get("offMarket"):
        brand -= 2.0
        justification += " Product is off-market."

    cats.append(("Brand", clamp(brand), justification))

    # Environmental
    env = 6.0
    justification = "Baseline environmental score."
    if "manufactured in" in statements_text:
        env += 0.5
        justification = "Manufacturing location stated."
    if "no genetically modified" in statements_text or "no gmo" in statements_text or "dairy free" in statements_text:
        env += 0.7
        justification += " Non-GMO/dairy free claims detected."
    if "organic" in statements_text:
        env += 1.0
        justification += " Organic claim present."

    cats.append(("Environmental", clamp(env), justification))

    # return list of dicts
    out = []
    for name, score, justification in cats:
        out.append({
            "name": name,
            "score": round(score, 2),
            "rating": score_to_label(score),
            "detail": justification
        })
    return out

def scores_and_confidences(label_json: dict) -> dict:
    """
    Returns dict: { category_name: { score, confidence, justification } }
    """
    categories = compute_category_scores(label_json)
    out = {}
    for cat in categories:
        out[cat["name"]] = {
            "score": cat["score"],
            "confidence": 0.8,  # placeholder
            "detail": cat["detail"]
        }
    return out

def compute_overall_rating(categories: list) -> float:
    """Weighted average of category scores -> 0..10 rounded to 2 decimal places."""
    if not categories:
        return 0.0
    total = sum(cat["score"] for cat in categories)
    avg = total / len(categories) / 2 
    return round(avg, 2)
