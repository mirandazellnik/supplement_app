import re
from typing import Dict, Any, Tuple

CATEGORIES = [
    "purity",
    "potency",
    "additives",
    "safety",
    "evidence",
    "brand",
    "environmental",
    "value",
]


def text_from_product(product: Dict[str, Any]) -> str:
    """Concatenate various text fields for keyword matching."""
    fields = [
        product.get("product_name", ""),
        product.get("generic_name", ""),
        product.get("categories", ""),
        product.get("ingredients_text", ""),
        product.get("labels", ""),
        " ".join(product.get("labels_tags", [])),
    ]
    return " ".join(f.lower() for f in fields if f)


def has_info(product: Dict[str, Any], field: str) -> bool:
    """Check if product has non-empty field."""
    val = product.get(field)
    return bool(val and str(val).strip())


def nutrition_value(product: Dict[str, Any], key: str):
    return product.get("nutriments", {}).get(key)

def compute_scores(json_obj: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
    product = json_obj.get("product", {})
    text = text_from_product(product)

    results = {}

    for cat in CATEGORIES:
        score = 0
        confidence = 0.3
        explanation = "Insufficient data available."

        if cat == "purity":
            if "organic" in text or "non-gmo" in text:
                score = 8
                confidence += 0.3
                explanation = "Labeled as organic / non-GMO."
            elif "artificial" in text or "synthetic" in text:
                score = 3
                explanation = "Contains artificial or synthetic ingredients."
            else:
                score = 5
                explanation = "No clear purity claims found."

        elif cat == "potency":
            prot = nutrition_value(product, "proteins_value")
            caffeine = nutrition_value(product, "caffeine_value")
            if prot and prot > 20:
                score = 9
                confidence += 0.3
                explanation = f"High protein content ({prot}g)."
            elif caffeine and caffeine > 200:
                score = 8
                confidence += 0.3
                explanation = f"Strong stimulant content ({caffeine}mg caffeine)."
            else:
                score = 4
                explanation = "No strong evidence of potency."

        elif cat == "additives":
            additives_tags = product.get("additives_tags", [])
            if not additives_tags:
                score = 10
                confidence += 0.4
                explanation = "No additives detected."
            else:
                # Example: flag titanium dioxide specifically
                if any("titanium-dioxide" in a for a in additives_tags):
                    score = 2
                    explanation = "Contains titanium dioxide, a potentially harmful additive."
                else:
                    score = max(1, 10 - len(additives_tags) * 2)
                    explanation = f"Contains {len(additives_tags)} additives."

        elif cat == "safety":
            caffeine = nutrition_value(product, "caffeine_value") or 0
            if caffeine > 400:
                score = 2
                explanation = f"Very high caffeine content ({caffeine}mg)."
            else:
                score = 8
                explanation = "No major safety concerns detected."

        elif cat == "evidence":
            if any(kw in text for kw in ["clinically studied", "third party tested", "usp certified"]):
                score = 9
                confidence += 0.4
                explanation = "Includes third-party testing or clinical evidence."
            else:
                score = 3
                explanation = "No scientific support or testing claims found."

        elif cat == "brand":
            brand = product.get("brands", "")
            if brand:
                score = 7
                explanation = f"Brand listed: {brand}."
                if brand.lower() in ["optimum nutrition", "now foods", "thorne", "gnc"]:
                    score = 9
                    explanation = f"Recognized supplement brand: {brand}."
            else:
                score = 2
                explanation = "No brand information available."

        elif cat == "environmental":
            if "vegan" in text or "plant-based" in text:
                score = 8
                explanation = "Labeled as vegan/plant-based."
            elif "organic" in text:
                score = 7
                explanation = "Certified organic."
            else:
                score = 4
                explanation = "No environmental or ethical claims detected."

        elif cat == "value":
            protein = nutrition_value(product, "proteins_value") or 0
            energy = nutrition_value(product, "energy-kcal_value") or 0
            if protein and energy:
                ratio = protein / energy
                if ratio > 0.25:
                    score = 8
                    explanation = f"High protein-to-calorie ratio ({ratio:.2f})."
                elif ratio > 0.1:
                    score = 6
                    explanation = f"Moderate protein-to-calorie ratio ({ratio:.2f})."
                else:
                    score = 3
                    explanation = "Low protein density."
            else:
                score = 5
                explanation = "Insufficient nutrition data for value."

        results[cat] = {
            "score": round(float(score), 1),
            "confidence": round(min(max(confidence, 0), 1.0), 2),
            "explanation": explanation,
        }

    return results