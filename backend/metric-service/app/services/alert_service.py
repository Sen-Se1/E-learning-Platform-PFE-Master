"""
alert_service.py
----------------
Evaluates collected service metrics against configured thresholds and sends
notifications to admins via the notification-service when thresholds are breached.

Design decisions
~~~~~~~~~~~~~~~~
* **In-memory cooldown** — A dict keeps track of the last time each
  (service_name, alert_type) pair triggered an alert.  The metric-service
  process is long-lived (runs as a daemon), so in-memory state is sufficient.
  On restart the cooldown resets, which is acceptable.

* **Silent failures** — If the notification-service is down, the error is
  logged but the metric loop continues unaffected.

* **No DB writes** — Alerts are fire-and-forget HTTP calls; we don't persist
  them here because the notification-service already stores them in MongoDB.
"""

import logging
import time
from typing import Literal

from app.core.config import settings
from app.services import notification_client

logger = logging.getLogger(__name__)

# ── Types ─────────────────────────────────────────────────────────────────────

AlertKind = Literal["down", "cpu", "ram"]

# Cooldown state: { (service_name, alert_kind): last_sent_timestamp }
_cooldown: dict[tuple[str, AlertKind], float] = {}


# ── Helpers ───────────────────────────────────────────────────────────────────

def _is_cooling_down(service: str, kind: AlertKind) -> bool:
    """Return True if we already sent this alert recently (within the cooldown window)."""
    last = _cooldown.get((service, kind), 0.0)
    return (time.monotonic() - last) < settings.ALERT_COOLDOWN_SECONDS


def _mark_sent(service: str, kind: AlertKind) -> None:
    _cooldown[(service, kind)] = time.monotonic()


# ── Alert rules ───────────────────────────────────────────────────────────────

def _check_down(svc: dict) -> bool:
    """Trigger a CRITICAL alert when the service/container/pod is down."""
    name = svc.get("service_name", "unknown")
    status = svc.get("status", "unknown")

    if status != "down":
        return False

    if _is_cooling_down(name, "down"):
        logger.debug("[AlertService] Cooldown active for '%s' (down)", name)
        return False

    sent = notification_client.send_alert(
        title=f"🔴 Service Down: {name}",
        message=(
            f"The service '{name}' is unreachable or has crashed. "
            "Immediate attention required."
        ),
        priority="CRITICAL",
        metadata={"service": name, "status": status},
    )

    if sent:
        _mark_sent(name, "down")
        logger.warning("[AlertService] Service DOWN alert sent for '%s'", name)

    return sent


def _check_cpu(svc: dict) -> bool:
    """Trigger a HIGH alert when CPU usage exceeds the configured threshold."""
    name = svc.get("service_name", "unknown")
    cpu = svc.get("cpu_percent", 0.0) or 0.0

    if cpu <= settings.CPU_ALERT_THRESHOLD:
        return False

    if _is_cooling_down(name, "cpu"):
        logger.debug("[AlertService] Cooldown active for '%s' (cpu)", name)
        return False

    sent = notification_client.send_alert(
        title=f"⚠️ High CPU: {name}",
        message=(
            f"Service '{name}' is using {cpu:.1f}% CPU "
            f"(threshold: {settings.CPU_ALERT_THRESHOLD}%). "
            "Consider scaling up or investigating the workload."
        ),
        priority="HIGH",
        metadata={
            "service": name,
            "cpu_percent": cpu,
            "threshold": settings.CPU_ALERT_THRESHOLD,
        },
    )

    if sent:
        _mark_sent(name, "cpu")
        logger.warning(
            "[AlertService] High CPU alert sent for '%s' (%.1f%%)", name, cpu
        )

    return sent


def _check_ram(svc: dict) -> bool:
    """Trigger a HIGH alert when RAM usage exceeds the configured threshold (MB)."""
    name = svc.get("service_name", "unknown")

    # Both collectors return ram_mb; StatusService stores it as ram_percent in the DB
    # but the raw service dict still has ram_mb.
    ram_mb = svc.get("ram_mb", 0.0) or 0.0

    if ram_mb <= settings.RAM_ALERT_THRESHOLD_MB:
        return False

    if _is_cooling_down(name, "ram"):
        logger.debug("[AlertService] Cooldown active for '%s' (ram)", name)
        return False

    sent = notification_client.send_alert(
        title=f"⚠️ High RAM: {name}",
        message=(
            f"Service '{name}' is using {ram_mb:.0f} MB of RAM "
            f"(threshold: {settings.RAM_ALERT_THRESHOLD_MB:.0f} MB). "
            "Consider restarting or scaling the service."
        ),
        priority="HIGH",
        metadata={
            "service": name,
            "ram_mb": ram_mb,
            "threshold_mb": settings.RAM_ALERT_THRESHOLD_MB,
        },
    )

    if sent:
        _mark_sent(name, "ram")
        logger.warning(
            "[AlertService] High RAM alert sent for '%s' (%.0f MB)", name, ram_mb
        )

    return sent


# ── Public API ────────────────────────────────────────────────────────────────

class AlertService:
    """
    Stateless entry point called after every metric collection cycle.

    Usage
    -----
    AlertService.check_and_notify(services)

    Parameters
    ----------
    services : list of service dicts produced by DockerCollector / KubernetesCollector
               Each dict has keys: service_name, status, cpu_percent, ram_mb, …
    """

    @staticmethod
    def check_and_notify(services: list[dict]) -> None:
        """Evaluate all collected services and dispatch alerts as needed."""
        if not services:
            return

        for svc in services:
            _check_down(svc)
            _check_cpu(svc)
            _check_ram(svc)
