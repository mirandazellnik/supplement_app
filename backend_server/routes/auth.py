import re
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity, create_refresh_token
)
from datetime import timedelta

from backend_server.utils.extensions import db
from backend_server.models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

# --- Helper function for email validation ---
EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[a-zA-Z0-9]+$")

def is_valid_email(email: str) -> bool:
    return bool(email and EMAIL_REGEX.match(email.strip()))


# --- ROUTES ---

@auth_bp.route("/check_whether_user_exists", methods=["POST"])
def check_whether_user_exists():
    data = request.get_json()
    username = data.get("username", "").strip().lower()

    if not username:
        return jsonify({"msg": "Missing email. Please enter an email and try again!"}), 400

    if not is_valid_email(username):
        return jsonify({"msg": "Invalid email format. Please enter a valid email and try again!"}), 400

    user = User.query.filter_by(username=username).first()
    return jsonify({"exists": bool(user)}), 200


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username", "").strip().lower()
    name = data.get("name", "").strip()
    password = data.get("password")

    if not username or not password:
        return jsonify({"msg": "Missing information. Please re-enter and try again!"}), 400

    if not is_valid_email(username):
        return jsonify({"msg": "Invalid email format. Please enter a valid email and try again!"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "Email already exists. An account with this email has already been created. Try signing in."}), 400

    user = User(username=username, name=name)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return jsonify({"msg": "User registered successfully"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username", "").strip().lower()
    password = data.get("password")

    if not username or not password:
        return jsonify({"msg": "Missing email or password."}), 400

    if not is_valid_email(username):
        return jsonify({"msg": "Invalid email format. Please enter a valid email and try again!"}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({"msg": "Incorrect email or password"}), 401

    # Note: your code used expires_delta=False, meaning token never expires.
    # Using timedelta is recommended for better security.
    access_token = create_access_token(identity=str(user.id), expires_delta=timedelta(minutes=120))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "setup_complete": user.setup_complete
    })


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    new_access_token = create_access_token(identity=user_id, expires_delta=timedelta(minutes=15))
    return jsonify(access_token=new_access_token)
