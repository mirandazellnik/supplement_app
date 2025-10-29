from backend_server.utils.database_tools.db_query import db_execute

def get_ingredient_description(ingredient_id):
    """
    Fetch the description for a given ingredient_id.
    Returns None if no description is set.
    """
    rows = db_execute("""
        SELECT description
        FROM ingredient_descriptions
        WHERE ingredient_id = :ingredient_id
        LIMIT 1
    """, {"ingredient_id": ingredient_id})

    if not rows:
        return None

    return rows[0][0]  # single string


def set_ingredient_description(ingredient_id, description):
    """
    Set or update the description for a given ingredient_id.
    If a row doesn't exist, it inserts a new one.
    """
    # Use UPSERT (INSERT ... ON CONFLICT) to avoid race conditions
    db_execute("""
        INSERT INTO ingredient_descriptions (ingredient_id, description)
        VALUES (:ingredient_id, :description)
        ON CONFLICT (ingredient_id)
        DO UPDATE SET description = EXCLUDED.description
    """, {"ingredient_id": ingredient_id, "description": description})