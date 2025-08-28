import os
from flask_socketio import SocketIO

REDIS_URL = os.getenv("REDIS_URL")  # Provided by Railway

socketio = SocketIO(
    cors_allowed_origins="*",
    async_mode="gevent",
    message_queue=REDIS_URL,
)