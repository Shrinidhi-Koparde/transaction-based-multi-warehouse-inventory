from functools import wraps

from flask import jsonify
from flask_jwt_extended import (
    verify_jwt_in_request,
    get_jwt_identity
)

from app import db
from app.models import User


def role_required(*allowed_roles):
    """
    Restricts an API endpoint to users with specified roles.

    Checks:
    1. Valid JWT access token.
    2. User exists in the database.
    3. User account is active.
    4. User currently holds an allowed role.

    Unauthorized users receive HTTP 403.
    """

    def decorator(function):

        @wraps(function)
        def wrapper(*args, **kwargs):

            # Step 1: Verify JWT access token
            verify_jwt_in_request()

            # Step 2: Retrieve authenticated user's ID
            user_id = get_jwt_identity()

            # Step 3: Find user in database
            user = db.session.get(User, int(user_id))

            if not user:
                return jsonify({
                    "success": False,
                    "message": "Authenticated user not found."
                }), 401

            # Step 4: Check account status
            if not user.is_active:
                return jsonify({
                    "success": False,
                    "message": "Your account is inactive."
                }), 403

            # Step 5: Check current database role
            user_role = user.role.name

            if user_role not in allowed_roles:
                return jsonify({
                    "success": False,
                    "message": "You do not have permission to access this resource.",
                    "required_roles": list(allowed_roles),
                    "your_role": user_role
                }), 403

            # Step 6: Permission granted
            return function(*args, **kwargs)

        return wrapper

    return decorator