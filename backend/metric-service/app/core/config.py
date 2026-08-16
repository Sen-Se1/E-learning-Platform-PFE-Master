from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "metrics-service"
    PLATFORM: str = "docker"
    PROMETHEUS_URL: str = "http://prometheus:9090"
    DB_URL: str = "sqlite:///./data/metrics.db"
    COLLECT_INTERVAL_SECONDS: int = 60

    TRACKED_SERVICES: str = ""

    # ── Alerting ──────────────────────────────────────────────────────────────
    # URL of the notification-service REST API
    NOTIFICATION_SERVICE_URL: str = "http://notification-service:8011"

    # CPU threshold in percent (0–100). Alert when a service exceeds this.
    CPU_ALERT_THRESHOLD: float = 80.0

    # RAM threshold in megabytes. Alert when a service exceeds this.
    RAM_ALERT_THRESHOLD_MB: float = 512.0

    # Minimum seconds between repeated alerts for the same service + alert type.
    # Prevents notification spam during a sustained overload.
    ALERT_COOLDOWN_SECONDS: int = 300

    class Config:
        env_file = ".env"


settings = Settings()