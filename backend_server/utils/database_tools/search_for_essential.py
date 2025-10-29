from backend_server.utils.database_tools.db_query import db_execute, db_execute_no_result
from backend_server.utils.database_tools.normalize_ingredient import normalize_ingredient

def search_essentials(query, limit=10, min_similarity=0.3):
    """
    Search for essentials using fuzzy matching.
    Returns a list of dicts: {"name": ..., "human_name": ...}.
    Requires pg_trgm extension in Postgres.
    """
    if not query:
        return []

    norm_query = normalize_ingredient(query)

    # 1️⃣ Check for exact match first (either canonical or human_name)
    exact_rows = db_execute("""
        SELECT name, human_name
        FROM ingredients
        WHERE name = :norm_query
           OR human_name ILIKE :query
        LIMIT 1
    """, {
        "norm_query": norm_query,
        "query": query
    })

    if exact_rows:
        # If there is an exact match, return only that
        return [{"name": r[0], "human_name": r[1]} for r in exact_rows]

    # 2️⃣ Fuzzy search if no exact match
    rows = db_execute("""
        SELECT name, human_name, GREATEST(
            similarity(name, :norm_query::text),
            similarity(human_name, :query::text)
        ) AS sim_score
        FROM ingredients
        WHERE similarity(name, :norm_query::text) > :min_similarity
           OR similarity(human_name, :query::text) > :min_similarity
        ORDER BY sim_score DESC
        LIMIT :limit
    """, {
        "norm_query": norm_query,
        "query": query,
        "min_similarity": min_similarity,
        "limit": limit
    })

    results = [{"name": r[0], "human_name": r[1]} for r in rows]
    return results

# THIS HAD TO RUN ONCE!
#new = db_execute_no_result("""CREATE EXTENSION IF NOT EXISTS pg_trgm;""")
#print("created new thing")
