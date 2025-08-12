from flask import Blueprint, jsonify

users_bp = Blueprint("users", __name__)

@users_bp.route("/profile", methods=["GET"])
def get_profile():
    return jsonify({"user": "test_user"})