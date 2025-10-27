from sqlalchemy import text
from backend_server.utils.database_tools.db_query import db_execute
from backend_server.utils.database_tools.normalize_ingredient import normalize_ingredient


def get_ingredient_ids(names):
    """Fetch ingredient IDs for a list of canonical ingredient names."""
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


def top_labels_by_ingredients_fast(ingredient_ids, n):
    """
    Fast search for top N labels containing ALL ingredient_ids.
    If fewer than N results, drop rarest ingredient and retry.
    """
    if not ingredient_ids:
        return []

    # Get ingredient frequencies
    freqs = db_execute("""
        SELECT ingredient_id, label_count
        FROM ingredient_frequency
        WHERE ingredient_id = ANY(:ingredient_ids)
    """, {"ingredient_ids": ingredient_ids})

    if not freqs:
        return []

    # Sort by rarity (lowest count = rarest)
    freqs.sort(key=lambda x: x[1])
    sorted_ids = [fid for fid, _ in freqs]

    results = []
    current_ids = sorted_ids[:]  # copy

    # Iteratively broaden search until we have N results or only 1 ingredient left
    while current_ids:
        rarest_id = current_ids[0]
        query_results = db_execute("""
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
            "ingredient_ids": current_ids,
            "n": n
        })

        results = query_results

        if len(results) >= n or len(current_ids) == 1:
            break  # we have enough, or we can’t drop more ingredients

        # Drop the rarest (first) ingredient and retry
        print(f"🔎 Only {len(results)} results found, dropping rarest ingredient {current_ids[0]}")
        current_ids.pop(0)

    return results


def get_top_fast(ingredients, n=10):
    """
    Get top N labels matching all (or most) ingredients by name.
    Broadens search automatically if too few matches found.
    """
    normalized = [normalize_ingredient(i) for i in ingredients]
    ingredient_ids = get_ingredient_ids(normalized)

    if len(ingredient_ids) < len(ingredients):
        print("Some ingredients not found, returning empty result.")
        return []

    return top_labels_by_ingredients_fast(ingredient_ids, n)