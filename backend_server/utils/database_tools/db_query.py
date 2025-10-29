from sqlalchemy import text
from backend_server.utils.extensions import db

def db_execute_no_result(query, params=None):
    db.session.execute(text(query), params or {})

def db_execute(query, params=None):
    result = db.session.execute(text(query), params or {})
    return result.fetchall()

def db_execute_mappings(query, params=None):
    result = db.session.execute(text(query), params or {})
    return result.mappings().all()