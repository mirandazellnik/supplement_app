# backend_server/utils/top_by_essentials.py (or a similar util module)
from backend_server.utils.database_tools.db_query import db_execute
import json

def get_ingredients_for_label(label_id):
    """
    Fetch all ingredient names and human-readable names for a given label ID.
    Return 'essentials' and 'non_essentials' lists.
    """

    # Fetch essentials: name and human_name
    rows = db_execute("""
        SELECT i.ingredient_id, i.name, i.human_name
        FROM ingredients i
        JOIN labels l ON i.ingredient_id = ANY(l.ingredient_ids)
        WHERE l.id = :label_id
    """, {"label_id": label_id})

    # Fetch non-essentials (stored as JSON text)
    rows2 = db_execute("""
        SELECT non_essentials_raw
        FROM labels
        WHERE id = :label_id
    """, {"label_id": label_id})

    # Parse essential ingredients into list of dicts
    essentials = {row[0] : { "name": row[1], "human_name": row[2]} for row in rows} if rows else {}

    # Sort from most to least frequent
    ingredient_ids = [a for a in essentials.keys()]
    freqs = db_execute("""
        SELECT ingredient_id, label_count
        FROM ingredient_frequency
        WHERE ingredient_id = ANY(:ingredient_ids)
    """, {"ingredient_ids": ingredient_ids})

    # Sort by increasing frequency
    freqs.sort(key=lambda x: x[1])
    sorted_ids = [fid for fid, _ in freqs]

    essentials_sorted = [{"name": essentials[a]["name"], "human_name": essentials[a]["human_name"]} for a in sorted_ids]

    #rarest_id = sorted_ids[0]

    # Parse non-essentials
    non_essentials = rows2[0][0] if rows2 else []
    if isinstance(non_essentials, str):
        try:
            non_essentials = json.loads(non_essentials)
        except json.JSONDecodeError:
            non_essentials = []

    #print("TEST: >", essentials, non_essentials)
    #print(type(essentials), type(non_essentials))

    return {"essentials": essentials_sorted, "non_essentials": non_essentials}