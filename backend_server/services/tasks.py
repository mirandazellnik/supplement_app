from .celery_worker import celery
import requests

from flask_socketio import SocketIO
socketio = SocketIO(message_queue="redis://localhost:6379/0")  # no Flask app needed

@celery.task
def fetch_label_details(user_id, product_id):

    #from backend_server.services.socketio_ref import socketio
    print("Emitting to room:", user_id)
    
    try:
        response = requests.get(f"https://api.ods.od.nih.gov/dsld/v9/label/{product_id}")
        data = response.json()
        socketio.emit("lookup_update", data, room=user_id)
    except Exception as e:
        socketio.emit("lookup_update_error", {"error": str(e)}, room=user_id)