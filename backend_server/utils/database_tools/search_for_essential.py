from backend_server.utils.database_tools.db_query import db_execute
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

    rows = db_execute("""
        SELECT name, human_name, GREATEST(
            similarity(name, :norm_query),
            similarity(human_name, :query)
        ) AS sim_score
        FROM ingredients
        WHERE similarity(name, :norm_query) > :min_similarity
           OR similarity(human_name, :query) > :min_similarity
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