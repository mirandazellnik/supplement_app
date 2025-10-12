import json

from backend_server.utils.extensions import db
from sqlalchemy import text
from backend_server.utils.database_tools.db_query import db_execute

def get_raw_json_by_id(label_id):
    """
    Return the raw_json of a single label by ID.
    Returns None if not found.
    """
    rows = db_execute("""
        SELECT raw_json
        FROM labels
        WHERE id = :label_id
    """, {"label_id": label_id})

    if not rows:
        return None
    
    if isinstance(rows[0][0], dict):
        return rows[0][0]
    else:
        return json.loads(rows[0][0])



def get_raw_json_by_ids(label_ids):
    """
    Return a dict of raw_json entries for a list of label IDs.
    Preserves database order (not necessarily same as input order).
    """
    if not label_ids:
        return {}

    rows = db_execute("""
        SELECT id, raw_json
        FROM labels
        WHERE id = ANY(:label_ids)
    """, {"label_ids": label_ids})

    # Build lookup dictionary
    json_map = {row[0]: row[1] for row in rows}

    # Preserve order from input
    results = {lid: json_map.get(lid) for lid in label_ids if lid in json_map}

    # If raw_json is a string, parse it
    if results and isinstance(results[next(iter(results))], str):
        results = {k: json.loads(v) for k, v in results.items()}

    return results
