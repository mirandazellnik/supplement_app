from sqlalchemy import text
from backend_server.utils.extensions import db

def fast_query(query, params=None):
    result = db.session.execute(text(query), params or {})
    return result.fetchall()