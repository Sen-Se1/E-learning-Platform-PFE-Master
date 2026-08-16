from apscheduler.schedulers.background import BackgroundScheduler
from app.database.database import SessionLocal
from app.services.metric_service import MetricService
from app.core.config import settings

scheduler = BackgroundScheduler()


def collect_job():
    db = SessionLocal()
    try:
        service = MetricService()
        service.collect_and_save(db)
    finally:
        db.close()


def start_scheduler():
    scheduler.add_job(
        collect_job,
        "interval",
        seconds=settings.COLLECT_INTERVAL_SECONDS,
        id="collect_metrics_job",
        replace_existing=True
    )

    scheduler.start()


def stop_scheduler():
    scheduler.shutdown()