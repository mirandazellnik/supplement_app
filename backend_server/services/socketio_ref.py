# backend_server/services/socketio_ref.py
from flask_socketio import SocketIO

# one, shared instance backed by Redis (works across processes)
socketio = SocketIO(
    cors_allowed_origins="*",
    async_mode="eventlet",
    message_queue="redis://localhost:6379/0",
)