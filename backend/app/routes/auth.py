import logging

from flask import Blueprint, request, jsonify
from app import db
from app.models import User
from flask_jwt_extended import (
    create_access_token,
    get_jwt_identity
)
from app.utils.permissions import role_required

logging.basicConfig(level=logging.INFO)
auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


# ==========================================
# USER REGISTRATION
# ==========================================

@auth_bp.route("/register", methods=["POST"])
def register():

    return jsonify({
        "success": False,
        "message": "Public registration is disabled. Contact your system administrator."
    }), 403
# ==========================================
# USER LOGIN
# ==========================================

@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    # Validate request body
    if not data:
        return jsonify({
            "success": False,
            "message": "Request body must contain JSON data."
        }), 400

    identifier = data.get("identifier", "").strip()
    password = data.get("password", "")

    # Check required fields
    if not identifier or not password:
        return jsonify({
            "success": False,
            "message": "Username/email and password are required."
        }), 400

    try:
        # Find user by username or email
        user = User.query.filter(
            db.or_(
                User.username == identifier,
                User.email == identifier.lower()
            )
        ).first()

        # Verify credentials
        if not user or not user.check_password(password):
            return jsonify({
                "success": False,
                "message": "Invalid username/email or password."
            }), 401

        # Check account status
        if not user.is_active:
            return jsonify({
                "success": False,
                "message": "Your account is inactive."
            }), 403

        # Generate JWT access token
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={
                "role": user.role.name,
                "username": user.username
            }
        )

        return jsonify({
            "success": True,
            "message": "Login successful.",
            "access_token": access_token,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role.name
            }
        }), 200

    except Exception:
        db.session.rollback()
        logging.exception("User login failed")

        return jsonify({
            "success": False,
            "message": "Login failed due to a server error."
        }), 500

# ==========================================
# USER PROFILE
# ==========================================

@auth_bp.route("/profile", methods=["GET"])
@role_required("Admin", "Operations Manager",
               "Warehouse Manager", "Logistics Staff")
def profile():

    try:
        # Get authenticated user's ID
        user_id = get_jwt_identity()

        # Find user in database
        user = db.session.get(User, int(user_id))

        if not user:
            return jsonify({
                "success": False,
                "message": "User not found."
            }), 404

        if not user.is_active:
            return jsonify({
                "success": False,
                "message": "Your account is inactive."
            }), 403

        return jsonify({
            "success": True,
            "message": "Profile retrieved successfully.",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role.name,
                "is_active": user.is_active
            }
        }), 200

    except Exception:
        db.session.rollback()
        logging.exception("Profile retrieval failed")

        return jsonify({
            "success": False,
            "message": "Unable to retrieve profile."
        }), 500

# ==========================================
# ADMIN-ONLY TEST ENDPOINT
# ==========================================

@auth_bp.route("/admin-test", methods=["GET"])
@role_required("Admin")
def admin_test():

    return jsonify({
        "success": True,
        "message": "Admin authorization successful.",
        "access": "Granted",
        "role": "Admin"
    }), 200