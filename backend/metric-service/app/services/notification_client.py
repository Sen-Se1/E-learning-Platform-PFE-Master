"""
notification_client.py
----------------------
Thin HTTP client that POSTs alert notifications to the notification-service.

All errors are caught and logged so that a unreachable notification-service
never crashes or blocks the metric collection loop.
"""

import logging

import requests

from app.core.config import settings

logger = logging.getLogger(__name__)

# POST /api/notifications
_NOTIFY_URL = f"{settings.NOTIFICATION_SERVICE_URL.rstrip('/')}/api/notifications"

# How long (seconds) to wait for the notification-service to respond
_REQUEST_TIMEOUT = 5


def send_alert(
    title: str,
    message: str,
    priority: str,
    metadata: dict | None = None,
) -> bool:
    """
    Send a METRICS_ALERT notification to all connected admins.

    Parameters
    ----------
    title    : Short notification title shown in the UI.
    message  : Longer description with metric details.
    priority : One of LOW | MEDIUM | HIGH | CRITICAL.
    metadata : Optional dict with raw metric values (stored as-is in MongoDB).

    Returns
    -------
    True if the notification-service accepted the request, False otherwise.
    """
    payload = {
        "recipientType": "ADMIN",
        "title": title,
        "message": message,
        "type": "METRICS_ALERT",
        "priority": priority,
        "metadata": metadata or {},
    }

    try:
        resp = requests.post(_NOTIFY_URL, json=payload, timeout=_REQUEST_TIMEOUT)
        resp.raise_for_status()
        logger.info("[AlertClient] Sent alert '%s' (priority=%s)", title, priority)
        return True

    except requests.exceptions.ConnectionError:
        logger.warning(
            "[AlertClient] Could not reach notification-service at %s — alert dropped.",
            _NOTIFY_URL,
        )
    except requests.exceptions.Timeout:
        logger.warning(
            "[AlertClient] notification-service timed out after %ss — alert dropped.",
            _REQUEST_TIMEOUT,
        )
    except requests.exceptions.HTTPError as exc:
        logger.error(
            "[AlertClient] notification-service returned %s — alert dropped. Body: %s",
            exc.response.status_code,
            exc.response.text[:200],
        )
    except Exception as exc:  # noqa: BLE001
        logger.error("[AlertClient] Unexpected error sending alert: %s", exc)

    return False
