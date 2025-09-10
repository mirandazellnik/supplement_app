import json

from backend_server.services.gpt_service import ask_openrouter

def extract_ingredients(dsld_json):
    """Extracts ingredient names from DSLD ingredientRows + nestedRows."""
    essentials = []
    
    def recurse(rows):
        for row in rows:
            essentials.append(row["name"])
            if "nestedRows" in row and row["nestedRows"]:
                recurse(row["nestedRows"])

    ing_rows = dsld_json.get("ingredientRows", [])
    if ing_rows == None:
        ing_rows = []
    recurse(ing_rows)

    other = dsld_json.get("otheringredients", {})
    if other == None:
        other = {}
    other = other.get("ingredients", [])
    if other == None:
        other = []

    return essentials, [x["name"] for x in other]

def classify_ingredients_with_gpt(dsld_json):
    essentials, non_essentials = extract_ingredients(dsld_json)

    prompt = f"""
You are given ingredient data for a dietary supplement. 
Here are the ingredients extracted from the DSLD entry:

Active candidates (possible essentials):
{json.dumps(essentials, indent=2)}

Other ingredients (likely excipients or fillers):
{json.dumps(non_essentials, indent=2)}

TASK:
- Classify ONLY the above ingredients into either "essentials" or "non_essentials".
- Essentials = active substances that provide health benefit (nutrients, vitamins, minerals, botanicals, amino acids, standardized compounds).
- Non_essentials = fillers, binders, preservatives, stabilizers, excipients, and inactive additives.
- Do NOT invent ingredients. Do NOT add generic nutrition facts (e.g., "Calories", "Protein", "Fat", "Carbohydrates")
- Do NOT classify macronutrients (Calories, Protein, Fat, Carbohydrates, Sugars, Fiber) as essentials. Even if they appear in the ingredient list, treat them as non_essentials because they are not the intended active supplement purpose.
- Standardize essentials to their common supplement names.
  Examples:
    - "Dicalcium Phosphate" → "Calcium"
    - "Indian Frankincense gum extract" → "Boswellia"
    - "Curcuma longa root extract" → "Turmeric"
- Keep non-essentials as-is.
- Do NOT put phrases like "Proprietary Blend" in the "essentials" category. Any item in "essentials" should have a generic name like "Vitamin C" or "Green Tea", such that users might easily search for other items with the same essential.

OUTPUT RULES:
- Respond ONLY with valid JSON.
- Do not include explanations, markdown, or extra commentary.
- Format must be exactly:

{{
  "essentials": ["name1", "name2", ...],
  "non_essentials": ["name1", "name2", ...]
}}

Now classify ONLY the given ingredients.
"""

    gpt_response = ask_openrouter(prompt)

    try:
        return json.loads(gpt_response)
    except json.JSONDecodeError:
        start = gpt_response.find("{")
        end = gpt_response.rfind("}") + 1
        if start != -1 and end != -1:
            return json.loads(gpt_response[start:end])
        raise
