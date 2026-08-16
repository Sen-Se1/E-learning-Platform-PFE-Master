from fastapi import FastAPI
from app.database.database import Base, engine
from app.api.metrics import router as metrics_router
from app.api.services import router as services_router
from app.api.health import router as health_router
from app.core.scheduler import start_scheduler, stop_scheduler
from app.core.config import settings

Base.metadata.create_all(bind=engine)

# Run simple migration for ServiceMetricSnapshot new columns
from sqlalchemy import inspect, text
try:
    inspector = inspect(engine)
    columns = [col['name'] for col in inspector.get_columns('service_metric_snapshots')]
    with engine.begin() as conn:
        if 'disk_read_mb' not in columns:
            conn.execute(text("ALTER TABLE service_metric_snapshots ADD COLUMN disk_read_mb FLOAT DEFAULT 0"))
        if 'disk_write_mb' not in columns:
            conn.execute(text("ALTER TABLE service_metric_snapshots ADD COLUMN disk_write_mb FLOAT DEFAULT 0"))
except Exception as e:
    print(f"[MIGRATION ERROR] Failed to run migrations: {e}")

app = FastAPI(title=settings.APP_NAME)

app.include_router(health_router)
app.include_router(metrics_router)
app.include_router(services_router)


@app.on_event("startup")
def startup_event():
    start_scheduler()


@app.on_event("shutdown")
def shutdown_event():
    stop_scheduler()