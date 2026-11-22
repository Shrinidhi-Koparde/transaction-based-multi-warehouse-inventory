from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from sqlalchemy import text

from app.config.settings import Config


# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()


def create_app():

    app = Flask(__name__)

    # Load configuration
    app.config.from_object(Config)

    # Initialize database
    db.init_app(app)

    # Register database models
    from app.models import Role, User

    # Initialize migrations
    migrate.init_app(app, db)
    # Register authentication routes
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp)

    # Register user management routes
    from app.routes.users import users_bp
    app.register_blueprint(users_bp)

    # Initialize JWT authentication
    jwt.init_app(app)

    # Enable frontend communication
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:5173"]
        }
    })

    # Health check endpoint
    @app.route("/api/health", methods=["GET"])
    def health():

        return jsonify({
            "success": True,
            "message": "Engine E4 Backend is running",
            "service": "Flask API"
        }), 200

    # Database connection test
    @app.route("/api/db-check", methods=["GET"])
    def database_check():

        try:
            result = db.session.execute(
                text("SELECT current_database(), current_user")
            ).fetchone()

            return jsonify({
                "success": True,
                "message": "PostgreSQL connected successfully",
                "database": result[0],
                "user": result[1]
            }), 200

        except Exception:
            db.session.rollback()

            app.logger.exception("Database connection failed")

            return jsonify({
                "success": False,
                "message": "Database connection failed"
            }), 500

    return app