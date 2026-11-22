from datetime import datetime, timezone

from app import db


class AuditLog(db.Model):

    __tablename__ = "audit_logs"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True
    )

    transfer_id = db.Column(
        db.Integer,
        db.ForeignKey("transfers.id"),
        nullable=True
    )

    action = db.Column(
        db.String(100),
        nullable=False
    )

    previous_status = db.Column(
        db.String(30),
        nullable=True
    )

    new_status = db.Column(
        db.String(30),
        nullable=True
    )

    description = db.Column(
        db.Text,
        nullable=True
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    user = db.relationship("User")

    transfer = db.relationship("Transfer")

    def __repr__(self):
        return f"<AuditLog {self.id}: {self.action}>"