from sqlalchemy.orm import Session
from app.database.models import ServiceMetricSnapshot
from app.core.config import settings


class StatusService:
    @staticmethod
    def save_many(db: Session, services: list[dict]):
        saved = []

        for service in services:
            item = ServiceMetricSnapshot(
                platform=settings.PLATFORM,
                service_name=service.get("service_name", service.get("name", "unknown")),
                status=service.get("status", "unknown"),
                cpu_percent=service.get("cpu_percent", 0),

                # The DB model uses ram_percent, but the collector may return ram_mb.
                ram_percent=service.get("ram_percent", service.get("ram_mb", 0)),

                # The DB model uses disk_percent, but the collector may return disk_usage_mb.
                disk_percent=service.get("disk_percent", service.get("disk_usage_mb", 0)),
                disk_read_mb=service.get("disk_read_mb", 0),
                disk_write_mb=service.get("disk_write_mb", 0),

                network_rx_mb=service.get("network_rx_mb", 0),
                network_tx_mb=service.get("network_tx_mb", 0),
            )

            db.add(item)
            saved.append(item)

        db.commit()

        for item in saved:
            db.refresh(item)

        return saved

    @staticmethod
    def _to_response(row: ServiceMetricSnapshot):
        return {
            "id": row.id,
            "platform": row.platform,
            "service_name": row.service_name,
            "status": row.status,

            "cpu_percent": row.cpu_percent or 0,

            # API response expects ram_mb.
            # We map DB ram_percent to ram_mb for now.
            "ram_mb": row.ram_percent or 0,

            # API response expects disk_usage_mb.
            # We map DB disk_percent to disk_usage_mb for now.
            "disk_usage_mb": row.disk_percent or 0,
            "disk_read_mb": row.disk_read_mb or 0,
            "disk_write_mb": row.disk_write_mb or 0,

            "network_rx_mb": row.network_rx_mb or 0,
            "network_tx_mb": row.network_tx_mb or 0,
            "created_at": row.created_at,
        }

    @staticmethod
    def get_latest_all(db: Session):
        rows = (
            db.query(ServiceMetricSnapshot)
            .order_by(ServiceMetricSnapshot.created_at.desc())
            .all()
        )

        latest = {}

        for row in rows:
            if row.service_name not in latest:
                latest[row.service_name] = row

        return [StatusService._to_response(row) for row in latest.values()]

    @staticmethod
    def get_history(db: Session, limit: int = 200):
        rows = (
            db.query(ServiceMetricSnapshot)
            .order_by(ServiceMetricSnapshot.created_at.desc())
            .limit(limit)
            .all()
        )

        return [StatusService._to_response(row) for row in rows]

    @staticmethod
    def get_service_history(db: Session, service_name: str, limit: int = 100):
        rows = (
            db.query(ServiceMetricSnapshot)
            .filter(ServiceMetricSnapshot.service_name == service_name)
            .order_by(ServiceMetricSnapshot.created_at.desc())
            .limit(limit)
            .all()
        )

        return [StatusService._to_response(row) for row in rows]