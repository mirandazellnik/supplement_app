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
        SELECT i.name, i.human_name
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
    essentials = [{"name": row[0], "human_name": row[1]} for row in rows] if rows else []

    # Parse non-essentials
    non_essentials = rows2[0][0] if rows2 else []
    if isinstance(non_essentials, str):
        try:
            non_essentials = json.loads(non_essentials)
        except json.JSONDecodeError:
            non_essentials = []

    #print("TEST: >", essentials, non_essentials)
    #print(type(essentials), type(non_essentials))

    return {"essentials": essentials, "non_essentials": non_essentials}