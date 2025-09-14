#import eventlet
#eventlet.monkey_patch()
import sys
if sys.platform == "win32":  # only patch on Windows
    print("Patching for Windows")
    import gevent.monkey
    gevent.monkey.patch_all()

from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, decode_token
from backend_server.config import Config
from backend_server.routes import register_routes
from backend_server.utils.extensions import db
from backend_server.services.celery_worker import init_celery
from backend_server.services.socketio_ref import socketio

import logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

logger.info("Logtest 1")

jwt = JWTManager()
migrate = Migrate()

@jwt.unauthorized_loader
def custom_unauthorized_response(err_str):
    print("JWT error:", err_str)
    return jsonify({"msg": f"JWT error: {err_str}"}), 401

@jwt.invalid_token_loader
def custom_invalid_token_response(err_str):
    print("Invalid token:", err_str)
    return jsonify({"msg": f"Invalid token: {err_str}"}), 422

def create_app():
    logger.info("Logtest 2")
    app = Flask(__name__)
    CORS(app)
    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    init_celery(app)

    from backend_server.models.user import User
    with app.app_context():
        db.create_all()

    register_routes(app)

    # bind SocketIO to Flask app
    socketio.init_app(app)
    return app

app = create_app()
print("App created")


# --- CONNECT ---
@socketio.on("connect")
def handle_connect(auth=None):
    #print("Connect event fired, auth:", auth)
    token = auth.get("token") if auth else None
    if not token:
        logger.info("No token provided, rejecting")
        return False

    try:
        decoded = decode_token(token)
        user_id = str(decoded["sub"])
        from flask_socketio import join_room
        join_room(user_id)
        logger.info(f"User {user_id} connected to WebSocket")
        #emit("connected", {"message": f"Connected as {user_id}"}, room=user_id)
    except Exception as e:
        logger.error(f"Connect error: {e}")
        return False

# --- JOIN ROOM ---
@socketio.on("join_room")
def handle_join(data):

    token = data.get("token")
    upc_or_id = data.get("upcOrId")
    if not token or not upc_or_id:
        return

    try:
        decoded = decode_token(token)
        user_id = str(decoded["sub"])
        room_name = f"{user_id}-{upc_or_id}"
        from flask_socketio import join_room, emit
        join_room(room_name)
        logger.info(f"User {user_id} joined room {room_name}")
        emit("room_ready", {"room": room_name}, room=room_name)
    except Exception as e:
        logger.error(f"Join room error: {e}")

# --- LEAVE ROOM ---
@socketio.on("leave_room")
def handle_leave(data):
    token = data.get("token")
    upc_or_id = data.get("upcOrId")
    if not token or not upc_or_id:
        return

    try:
        decoded = decode_token(token)
        user_id = str(decoded["sub"])
        room_name = f"{user_id}-{upc_or_id}"
        from flask_socketio import leave_room
        leave_room(room_name)
        logger.info(f"User {user_id} left room {room_name}")
        #emit("left_room", {"room": room_name}, room=user_id)
    except Exception as e:
        logger.error(f"Leave room error: {e}")

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, use_reloader=False, debug=True)
