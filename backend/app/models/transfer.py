from datetime import datetime, timezone

from app import db


class Transfer(db.Model):

    __tablename__ = "transfers"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    source_warehouse_id = db.Column(
        db.Integer,
        nullable=False
    )

    destination_warehouse_id = db.Column(
        db.Integer,
        nullable=False
    )

    requested_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    approved_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True
    )

    assigned_logistics_staff = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True
    )

    status = db.Column(
        db.String(30),
        default="Pending",
        nullable=False
    )

    rejection_reason = db.Column(
        db.Text,
        nullable=True
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    requester = db.relationship(
        "User",
        foreign_keys=[requested_by]
    )

    approver = db.relationship(
        "User",
        foreign_keys=[approved_by]
    )

    logistics_staff = db.relationship(
        "User",
        foreign_keys=[assigned_logistics_staff]
    )

    def __repr__(self):
        return f"<Transfer {self.id}: {self.status}>"