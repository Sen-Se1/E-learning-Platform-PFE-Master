from sqlalchemy.orm import Session
from app.database.models import MetricSnapshot


class SnapshotService:
    @staticmethod
    def save_snapshot(db: Session, data: dict):
        snapshot = MetricSnapshot(**data)
        db.add(snapshot)
        db.commit()
        db.refresh(snapshot)
        return snapshot

    @staticmethod
    def get_latest(db: Session):
        return (
            db.query(MetricSnapshot)
            .order_by(MetricSnapshot.created_at.desc())
            .first()
        )

    @staticmethod
    def get_history(db: Session, limit: int = 50):
        return (
            db.query(MetricSnapshot)
            .order_by(MetricSnapshot.created_at.desc())
            .limit(limit)
            .all()
        )