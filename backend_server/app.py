import sys
import os

#print(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
#sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + r"\backend_server") # FIX ME

import eventlet
eventlet.monkey_patch()

from flask import Flask
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_jwt_extended import decode_token

from backend_server.services.celery_worker import init_celery, celery
from backend_server.config import Config
from backend_server.routes import register_routes
from backend_server.utils.extensions import db  # <- import from extensions


from flask_jwt_extended import JWTManager
from flask import jsonify

jwt = JWTManager()
migrate = Migrate()

from backend_server.services.socketio_ref import socketio as socketio_ref
socketio_ref = SocketIO(cors_allowed_origins="*", async_mode="eventlet", message_queue="redis://localhost:6379/0")
socketio = socketio_ref
#socketio = SocketIO(cors_allowed_origins="*", async_mode="eventlet", message_queue="redis://localhost:6379/0")

@jwt.unauthorized_loader
def custom_unauthorized_response(err_str):
    print("JWT error:", err_str)
    return jsonify({"msg": f"JWT error: {err_str}"}), 401

@jwt.invalid_token_loader
def custom_invalid_token_response(err_str):
    print("Invalid token:", err_str)
    return jsonify({"msg": f"Invalid token: {err_str}"}), 422


def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)  # <- add this
    init_celery(app)

    from backend_server.models.user import User  # <- import User model to ensure it's registered with SQLAlchemy

    with app.app_context():
        db.create_all()

    register_routes(app)

    socketio.init_app(app)

    return app

@socketio.on("connect")
def handle_connect(auth=None):
    print("Connect event fired, auth:", auth)
    token = None
    if auth and "token" in auth:
        token = auth["token"]

    if not token:
        print("No token provided, rejecting")
        return False  # reject connection

    try:
        decoded = decode_token(token)
        user_id = str(decoded["sub"])  # always stringify
        from flask_socketio import join_room
        join_room(user_id)
        print(f"User {user_id} connected to WebSocket")
    except Exception as e:
        print("Connect error:", e)
        return False

app = create_app()

if __name__ == "__main__":
    #app.run(host="0.0.0.0", port=5000)
    print("starting socketio old")
    socketio.run(app, host="0.0.0.0", port=5000, use_reloader=False, debug=True)