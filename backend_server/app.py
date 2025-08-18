from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config
from routes import register_routes
from utils.extensions import db  # <- import from extensions


from flask_jwt_extended import JWTManager
from flask import jsonify

jwt = JWTManager()

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

    from models.user import User  # <- import User model to ensure it's registered with SQLAlchemy

    with app.app_context():
        db.create_all()
    
    register_routes(app)
    return app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
