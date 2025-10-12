from sqlalchemy import text
from backend_server.utils.database_tools.db_query import db_execute
from backend_server.utils.database_tools.normalize_ingredient import normalize_ingredient

def get_ingredient_ids(names):
    """
    Fetch ingredient IDs for a list of canonical ingredient names.
    """
    if not names:
        return []

    rows = db_execute("""
        SELECT ingredient_id
        FROM ingredients
        WHERE name = ANY(:names)
    """, {"names": names})

    ids = [row[0] for row in rows]
    print("-->", names, ids)
    return ids


def top_labels_by_ingredients_fast(ingredient_ids, n=10):
    """
    Fast search for top N labels containing ALL ingredient_ids.
    Uses ingredient_frequency to prioritize rare ingredients first.
    """
    if not ingredient_ids:
        return []

    # 1. Get ingredient frequencies
    freqs = db_execute("""
        SELECT ingredient_id, label_count
        FROM ingredient_frequency
        WHERE ingredient_id = ANY(:ingredient_ids)
    """, {"ingredient_ids": ingredient_ids})

    if not freqs:
        return []

    # Sort by increasing frequency
    freqs.sort(key=lambda x: x[1])
    sorted_ids = [fid for fid, _ in freqs]
    rarest_id = sorted_ids[0]

    # 2. Get top labels with all ingredients
    results = db_execute("""
        WITH candidate_labels AS (
            SELECT id, ingredient_ids
            FROM labels
            WHERE ingredient_ids @> ARRAY[:rarest_id]::int[]
        )
        SELECT c.id, r.overall_score
        FROM candidate_labels c
        JOIN ratings r ON c.id = r.id
        WHERE c.ingredient_ids @> :ingredient_ids
        ORDER BY r.overall_score DESC
        LIMIT :n
    """, {
        "rarest_id": rarest_id,
        "ingredient_ids": ingredient_ids,  # Python list is fine if db_execute uses psycopg2
        "n": n
    })


    return results


def get_top_fast(ingredients, n=10):
    """
    Get top N labels matching all ingredients (by name).
    Reuses the Flask SQLAlchemy db session for all queries.
    """
    normalized = [normalize_ingredient(i) for i in ingredients]
    ingredient_ids = get_ingredient_ids(normalized)

    if len(ingredient_ids) < len(ingredients):
        print("Some ingredients not found, returning empty result.")
        return []

    return top_labels_by_ingredients_fast(ingredient_ids, n)