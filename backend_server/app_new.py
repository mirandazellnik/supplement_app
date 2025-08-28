# backend_server/app.py
import eventlet
eventlet.monkey_patch()

from flask import Flask
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")

@app.route("/")
def index():
    return "Hello, world!"

@socketio.on("connect")
def handle_connect():
    print("✅ Client connected")

@socketio.on("disconnect")
def handle_disconnect():
    print("❌ Client disconnected")

if __name__ == "__main__":
    print("starting socketio")
    socketio.run(app, host="0.0.0.0", port=5000, use_reloader=False, debug=True)
