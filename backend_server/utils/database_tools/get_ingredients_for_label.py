# backend_server/utils/top_by_essentials.py (or a similar util module)
from backend_server.utils.database_tools.db_query import db_execute

def get_ingredients_for_label(label_id):
    """
    Fetch all ingredient names for a given label ID.
    Return 'essentials' and 'non_essentials' lists.
    """

    rows = db_execute("""
        SELECT i.name
        FROM ingredients i
        JOIN labels l ON i.ingredient_id = ANY(l.ingredient_ids)
        WHERE l.id = :label_id
    """, {"label_id": label_id})

    rows2 = db_execute("""
        SELECT non_essentials_raw
        FROM labels
        WHERE id = :label_id
    """, {"label_id": label_id})

    # Extract names from rows
    essential_names = [row[0] for row in rows] if rows else []

    non_essential_names = rows2[0][0] if rows2 else []
    if isinstance(non_essential_names, str):
        import json
        non_essential_names = json.loads(non_essential_names)

    print("TEST: >", essential_names, non_essential_names)
    print(type(essential_names), type(non_essential_names))

    return {"essentials": essential_names, "non_essentials": non_essential_names}
