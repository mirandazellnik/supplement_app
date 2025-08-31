# backend_server/services/tasks.py
import logging

# shared socketio reference (the one you already created in socketio_ref)
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

def scores_and_confidences(label_json: dict) -> dict:
    """
    Given the /label response, compute a dict of category scores and confidences (0-1).
    This is a more detailed output if you want to show confidence levels in the UI.
    """
    categories = compute_category_scores(label_json)
    out = {}
    for cat in categories:
        out[cat["name"]] = {"score": cat["score"], "confidence": 0.8}  # placeholder confidence
    return out

def compute_overall_rating(categories: list) -> float:
    """Weighted average of category scores -> 0..5 rounded to 2 decimal places."""
    if not categories:
        return 0.0
    # equal weight for now
    total = sum(cat["score"] for cat in categories)
    avg = total / len(categories)
    return round(avg, 2)