from app import create_app, db
from app.models import Role

app = create_app()

def seed_roles():
    roles = [
        {
            "name": "Admin",
            "description": "Full system access and user management."
        },
        {
            "name": "Operations Manager",
            "description": "Approves or rejects transfer requests and monitors operations."
        },
        {
            "name": "Warehouse Manager",
            "description": "Handles warehouse-level transfer activities."
        },
        {
            "name": "Logistics Staff",
            "description": "Manages logistics assignments and transfer progress."
        }
    ]

    with app.app_context():
        for role_data in roles:
            existing_role = Role.query.filter_by(
                name=role_data["name"]
            ).first()

            if existing_role is None:
                new_role = Role(
                    name=role_data["name"],
                    description=role_data["description"]
                )
                db.session.add(new_role)

        db.session.commit()
        print("Roles initialized successfully!")

        for role in Role.query.order_by(Role.id).all():
            print(f"{role.id}: {role.name} - {role.description}")


if __name__ == "__main__":
    seed_roles()