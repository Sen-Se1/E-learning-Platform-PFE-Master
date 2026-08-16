from sqlalchemy.orm import Session
from app.core.config import settings
from app.collectors.prometheus import PrometheusCollector
from app.collectors.docker import DockerCollector
from app.collectors.kubernetes import KubernetesCollector
from app.services.snapshot_service import SnapshotService
from app.services.status_service import StatusService
from app.services.alert_service import AlertService


class MetricService:
    def __init__(self):
        self.prom = PrometheusCollector()

        if settings.PLATFORM == "kubernetes":
            self.platform_collector = KubernetesCollector()
        else:
            self.platform_collector = DockerCollector()

    def collect(self):
        common = self.prom.collect_common_metrics()
        services = self.platform_collector.collect_service_stats()

        return {
            "platform": settings.PLATFORM,
            **common,
            **services,
        }

    def collect_and_save(self, db: Session):
        data = self.collect()
        snapshot = SnapshotService.save_snapshot(db, data)

        services = self.platform_collector.collect_service_list()
        StatusService.save_many(db, services)

        # ── Alerting ──────────────────────────────────────────────────────────
        # Evaluate thresholds and send notifications to admins when any service
        # is down, or when CPU / RAM exceeds the configured limits.
        AlertService.check_and_notify(services)

        return snapshot