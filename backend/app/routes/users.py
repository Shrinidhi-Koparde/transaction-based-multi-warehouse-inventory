import logging

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

from app import db
from app.models import User, Role
from app.utils.permissions import role_required


users_bp = Blueprint(
    "users",
    __name__,
    url_prefix="/api/users"
)

# ==========================================
# CREATE USER (ADMIN ONLY)
# ==========================================

@users_bp.route("/", methods=["POST"])
@jwt_required()
@role_required("Admin")
def create_user():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "JSON request body is required."
        }), 400

    username = data.get("username", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    role_name = data.get("role", "").strip()

    if not all([username, email, password, role_name]):
        return jsonify({
            "success": False,
            "message": "All fields are required."
        }), 400

    if len(username) < 3 or len(username) > 80:
        return jsonify({
            "success": False,
            "message": "Username must contain 3-80 characters."
        }), 400

    if "@" not in email or "." not in email.split("@")[-1]:
        return jsonify({
            "success": False,
            "message": "Invalid email address."
        }), 400

    if len(password) < 8:
        return jsonify({
            "success": False,
            "message": "Password must contain at least 8 characters."
        }), 400

    try:
        if User.query.filter_by(username=username).first():
            return jsonify({
                "success": False,
                "message": "Username already exists."
            }), 409

        if User.query.filter_by(email=email).first():
            return jsonify({
                "success": False,
                "message": "Email already exists."
            }), 409

        role = Role.query.filter_by(name=role_name).first()

        if not role:
            return jsonify({
                "success": False,
                "message": "Invalid role."
            }), 400

        new_user = User(
            username=username,
            email=email,
            role_id=role.id
        )

        new_user.set_password(password)

        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "User created successfully.",
            "user": {
                "id": new_user.id,
                "username": new_user.username,
                "email": new_user.email,
                "role": role.name,
                "is_active": new_user.is_active
            }
        }), 201

    except Exception:
        db.session.rollback()
        logging.exception("Admin user creation failed")

        return jsonify({
            "success": False,
            "message": "Unable to create user."
        }), 500
    
    # ==========================================
# GET ALL USERS (ADMIN ONLY)
# ==========================================

@users_bp.route("/", methods=["GET"])
@jwt_required()
@role_required("Admin")
def get_users():

    try:
        users = User.query.order_by(User.id).all()

        user_list = []

        for user in users:
            user_list.append({
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role.name,
                "is_active": user.is_active
            })

        return jsonify({
            "success": True,
            "total_users": len(user_list),
            "users": user_list
        }), 200

    except Exception:
        db.session.rollback()
        logging.exception("User retrieval failed")

        return jsonify({
            "success": False,
            "message": "Unable to retrieve users."
        }), 500

    # ==========================================
# UPDATE USER (ADMIN ONLY)
# ==========================================

@users_bp.route("/<int:user_id>", methods=["PATCH"])
@jwt_required()
@role_required("Admin")
def update_user(user_id):

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "JSON request body is required."
        }), 400

    try:
        user = db.session.get(User, user_id)

        if not user:
            return jsonify({
                "success": False,
                "message": "User not found."
            }), 404

        # Update username
        if "username" in data:
            username = data["username"]

            if not isinstance(username, str):
                return jsonify({
                    "success": False,
                    "message": "Username must be a string."
                }), 400

            username = username.strip()

            if len(username) < 3 or len(username) > 80:
                return jsonify({
                    "success": False,
                    "message": "Username must contain 3-80 characters."
                }), 400

            existing = User.query.filter(
                User.username == username,
                User.id != user_id
            ).first()

            if existing:
                return jsonify({
                    "success": False,
                    "message": "Username already exists."
                }), 409

            user.username = username

        # Update email
        if "email" in data:
            email = data["email"]

            if not isinstance(email, str):
                return jsonify({
                    "success": False,
                    "message": "Email must be a string."
                }), 400

            email = email.strip().lower()

            if "@" not in email or "." not in email.split("@")[-1]:
                return jsonify({
                    "success": False,
                    "message": "Invalid email address."
                }), 400

            existing = User.query.filter(
                User.email == email,
                User.id != user_id
            ).first()

            if existing:
                return jsonify({
                    "success": False,
                    "message": "Email already exists."
                }), 409

            user.email = email

        # Update role
        if "role" in data:
            role_name = data["role"]

            if not isinstance(role_name, str):
                return jsonify({
                    "success": False,
                    "message": "Role must be a string."
                }), 400

            role = Role.query.filter_by(
                name=role_name.strip()
            ).first()

            if not role:
                return jsonify({
                    "success": False,
                    "message": "Invalid role."
                }), 400

            user.role_id = role.id

        if not any(field in data for field in ("username", "email", "role")):
            return jsonify({
                "success": False,
                "message": "No valid fields provided for update."
            }), 400

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "User updated successfully.",
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
        logging.exception("User update failed")

        return jsonify({
            "success": False,
            "message": "Unable to update user."
        }), 500

    # ==========================================
# DEACTIVATE USER (ADMIN ONLY)
# ==========================================

@users_bp.route("/<int:user_id>/deactivate", methods=["PATCH"])
@jwt_required()
@role_required("Admin")
def deactivate_user(user_id):

    try:
        user = db.session.get(User, user_id)

        if not user:
            return jsonify({
                "success": False,
                "message": "User not found."
            }), 404

        if not user.is_active:
            return jsonify({
                "success": False,
                "message": "User is already inactive."
            }), 400

        # Prevent accidental self-deactivation
        from flask_jwt_extended import get_jwt_identity

        if int(get_jwt_identity()) == user.id:
            return jsonify({
                "success": False,
                "message": "You cannot deactivate your own account."
            }), 400

        user.is_active = False
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "User deactivated successfully.",
            "user": {
                "id": user.id,
                "username": user.username,
                "is_active": user.is_active
            }
        }), 200

    except Exception:
        db.session.rollback()
        logging.exception("User deactivation failed")

        return jsonify({
            "success": False,
            "message": "Unable to deactivate user."
        }), 500

    # ==========================================
# REACTIVATE USER (ADMIN ONLY)
# ==========================================

@users_bp.route("/<int:user_id>/reactivate", methods=["PATCH"])
@jwt_required()
@role_required("Admin")
def reactivate_user(user_id):

    try:
        user = db.session.get(User, user_id)

        if not user:
            return jsonify({
                "success": False,
                "message": "User not found."
            }), 404

        if user.is_active:
            return jsonify({
                "success": False,
                "message": "User is already active."
            }), 400

        user.is_active = True
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "User reactivated successfully.",
            "user": {
                "id": user.id,
                "username": user.username,
                "is_active": user.is_active
            }
        }), 200

    except Exception:
        db.session.rollback()
        logging.exception("User reactivation failed")

        return jsonify({
            "success": False,
            "message": "Unable to reactivate user."
        }), 500