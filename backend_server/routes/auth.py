from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, create_refresh_token
from datetime import timedelta

from backend_server.utils.extensions import db
from backend_server.models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/check_whether_user_exists", methods=["POST"])
def check_whether_user_exists():
    data = request.get_json()
    username = data.get("username")
    if not username:
        return jsonify({"msg": "Missing username"}), 400
    user = User.query.filter_by(username=username).first()
    if user:
        return jsonify({"exists": True}), 200
    return jsonify({"exists": False}), 200

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    name = data.get("name")
    password = data.get("password")
    print(F" username: {username}, name: {name}, password: {password} ")
    if not username or not password:
        return jsonify({"msg": "Missing information. Please re-enter and try again!"}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "Email already exists"}), 400
    user = User(username=username, name=name)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return jsonify({"msg": "User registered successfully"}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    print(username)
    
    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({"msg": "Bad email or password"}), 401

    token_expiration = timedelta(minutes=120)
    access_token = create_access_token(identity=str(user.id), expires_delta=False)
    refresh_token = create_refresh_token(identity=str(user.id))  # default long lifetime
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