import threading
import logging
from backend_server.services.socketio_ref import socketio

logger = logging.getLogger(__name__)

def emit_with_retry(event, payload, room, max_attempts=5, delay=1, namespace="/"):
    """
    Try to emit to a room. If the room has no connected clients, retry up to max_attempts.
    Non-blocking: uses threading.Timer.
    """
    attempts = {"count": 0}  # mutable object to track across retries

    def room_has_clients():
        rooms = socketio.server.manager.rooms.get(namespace, {})
        print("rooms:", rooms)
        return room in rooms and len(rooms[room]) > 0

    def try_emit():
        attempts["count"] += 1
        if room_has_clients():
            try:
                logger.info("Emitting event=%s to room=%s (attempt %s)", event, room, attempts["count"])
                socketio.emit(event, payload, room=room, namespace=namespace)
            except Exception as e:
                logger.exception("Failed to emit %s: %s", event, e)
        else:
            if attempts["count"] < max_attempts:
                logger.info("Room %s not connected yet. Retrying in %s seconds...", room, delay)
                threading.Timer(delay, try_emit).start()
            else:
                logger.warning("Max emit attempts reached for event=%s, room=%s", event, room)

    # initial try
    try_emit()