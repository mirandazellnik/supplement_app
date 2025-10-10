from sqlalchemy import text
from backend_server.utils.extensions import db

def db_execute(query, params=None):
    result = db.session.execute(text(query), params or {})
    return result.fetchall()