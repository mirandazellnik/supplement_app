from flask import Blueprint, request, jsonify
from app import db
from models import User
from flask_jwt_extended import jwt_required, get_jwt_identity

users_bp = Blueprint("users", __name__)

@users_bp.route("/profile", methods=["GET"])
def get_profile():
    return jsonify({"user": "test_user"})

@users_bp.route("/setup", methods=["POST"])
@jwt_required()
def setup_user():
    data = request.json
    goals = data.get("goals", [])
    meds = data.get("meds", [])

    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"msg": "User not found"}), 404

    user.goals = goals
    user.meds = meds
    user.setup_complete = True

    db.session.commit()
    return jsonify(user.to_dict())

@users_bp.route("/is_setup", methods=["PUT"])
@jwt_required()
def is_setup():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"msg": "User not found"}), 404

    return jsonify({"setup_complete": user.setup_complete})
