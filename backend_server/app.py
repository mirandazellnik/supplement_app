from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config
from routes import register_routes
from utils.extensions import db  # <- import from extensions

jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)

    from models.user import User  # <- import User model to ensure it's registered with SQLAlchemy

    with app.app_context():
        db.create_all()
    
    register_routes(app)
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000)