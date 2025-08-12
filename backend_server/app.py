from flask import Flask
from flask_cors import CORS
from config import Config
from routes import register_routes

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config.from_object(Config)
    
    register_routes(app)
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000)