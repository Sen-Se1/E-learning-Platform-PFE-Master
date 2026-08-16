from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database.database import get_db
from app.schemas.metric import MetricSnapshotResponse
from app.services.metric_service import MetricService
from app.services.snapshot_service import SnapshotService
from app.services.status_service import StatusService
from app.collectors.prometheus import PrometheusCollector

router = APIRouter(prefix="/api/v1/metrics", tags=["Metrics"])


@router.get("/debug/containers", response_model=dict)
def debug_containers():
    """Liste tous les containers disponibles dans Prometheus"""
    prom = PrometheusCollector()
    containers = prom.query_raw('group by (container_name) (container_last_seen)')
    return {
        "containers": [item["metric"].get("container_name") for item in containers if item["metric"].get("container_name")]
    }


@router.get("/debug/test-queries", response_model=dict)
def test_queries():
    """Test les métriques network avec le bon label"""
    from app.core.config import settings
    
    try:
        import requests
        prom_url = settings.PROMETHEUS_URL
        
        # Test network qui devrait avoir le label
        query = 'container_network_receive_bytes_total'
        resp = requests.get(f"{prom_url}/api/v1/query", params={"query": query}, timeout=5)
        results = resp.json().get("data", {}).get("result", [])
        
        # Vérifier les labels
        services = set()
        for result in results:
            metric = result.get("metric", {})
            service = metric.get("container_label_com_docker_compose_service")
            if service:
                services.add(service)
        
        # Test avec agrégation
        agg_query = 'sum by (container_label_com_docker_compose_service) (rate(container_network_receive_bytes_total[5m]))'
        agg_resp = requests.get(f"{prom_url}/api/v1/query", params={"query": agg_query}, timeout=5)
        agg_results = agg_resp.json().get("data", {}).get("result", [])
        
        return {
            "raw_results": len(results),
            "aggregated_results": len(agg_results),
            "services_found": list(services)[:5],
            "agg_results_with_labels": [{
                "service": r.get("metric", {}).get("container_label_com_docker_compose_service"),
                "value": r.get("value", [None, None])[1]
            } for r in agg_results[:3]]
        }
    except Exception as e:
        return {"error": str(e)}


@router.post("/collect", response_model=MetricSnapshotResponse)
def collect_metrics(db: Session = Depends(get_db)):
    service = MetricService()
    return service.collect_and_save(db)


@router.get("/latest", response_model=MetricSnapshotResponse | dict)
def latest_metrics(db: Session = Depends(get_db)):
    latest = SnapshotService.get_latest(db)
    return latest if latest else {}


@router.get("/history", response_model=list[MetricSnapshotResponse])
def metrics_history(limit: int = 50, db: Session = Depends(get_db)):
    return SnapshotService.get_history(db, limit)


@router.get("/summary", response_model=dict)
def get_summary(db: Session = Depends(get_db)):
    """
    Endpoint compatible avec l'AdminFront.
    Retourne { appSummary, containers } dans le même format que l'ancien metricsService Node.js.
    """
    latest = SnapshotService.get_latest(db)
    services = StatusService.get_latest_all(db)

    # Build appSummary from the latest MetricSnapshot
    if latest:
        app_summary = {
            "cpuPercent": round(latest.cpu_percent or 0, 2),
            "ramPercent": round(latest.ram_percent or 0, 2),
            # ram_percent in DB stores MB (from collector), so expose it as ramMB too
            "ramMB": round(latest.ram_percent or 0, 2),
            "diskPercent": round(latest.disk_percent or 0, 2),
            "diskReadMB": round(latest.disk_read_mb or 0, 2),
            "diskWriteMB": round(latest.disk_write_mb or 0, 2),
            "networkRxMB": round(latest.network_rx_mb or 0, 2),
            "networkTxMB": round(latest.network_tx_mb or 0, 2),
            "containersCount": latest.total_services or 0,
            "runningContainers": latest.running_services or 0,
            "downContainers": latest.down_services or 0,
            "clusterLoadPercent": round(latest.cpu_percent or 0, 2),
            "timestamp": latest.created_at.isoformat() if latest.created_at else None,
        }
    else:
        app_summary = {
            "cpuPercent": 0, "ramPercent": 0, "ramMB": 0,
            "diskPercent": 0, "diskReadMB": 0, "diskWriteMB": 0,
            "networkRxMB": 0, "networkTxMB": 0,
            "containersCount": 0, "runningContainers": 0, "downContainers": 0,
            "clusterLoadPercent": 0, "timestamp": None,
        }

    # Build containers list from the latest ServiceMetricSnapshots
    containers = [
        {
            "name": svc.get("service_name", "unknown"),
            "status": svc.get("status", "unknown"),
            "cpuPercent": round(svc.get("cpu_percent", 0), 2),
            "ramMB": round(svc.get("ram_mb", 0), 2),
            "diskReadMB": round(svc.get("disk_read_mb", 0), 2),
            "diskWriteMB": round(svc.get("disk_write_mb", 0), 2),
            "networkRxMB": round(svc.get("network_rx_mb", 0), 2),
            "networkTxMB": round(svc.get("network_tx_mb", 0), 2),
            "uptimeSeconds": 0,      # not tracked by this collector
            "restartCount": 0,       # not tracked by this collector
            "image": "",
        }
        for svc in services
    ]

    return {
        "appSummary": app_summary,
        "containers": containers,
        "timestamp": app_summary["timestamp"],
    }


@router.get("/summary/history", response_model=list)
def get_summary_history(range: str = Query("day"), db: Session = Depends(get_db)):
    """
    History compatible avec l'AdminFront (range=day → dernières 24h, range=week → 7j).
    Retourne une liste de { timestamp, appSummary }.
    """
    if range == "week":
        limit = 336   # ~7j à 1 collecte / 30min
    else:
        limit = 48    # ~24h à 1 collecte / 30min

    snapshots = SnapshotService.get_history(db, limit)

    history = []
    for s in snapshots:
        history.append({
            "timestamp": s.created_at.isoformat() if s.created_at else None,
            "appSummary": {
                "cpuPercent": round(s.cpu_percent or 0, 2),
                "ramPercent": round(s.ram_percent or 0, 2),
                "ramMB": round(s.ram_percent or 0, 2),
                "networkRxMB": round(s.network_rx_mb or 0, 2),
                "networkTxMB": round(s.network_tx_mb or 0, 2),
                "clusterLoadPercent": round(s.cpu_percent or 0, 2),
                "diskReadMB": round(s.disk_read_mb or 0, 2),
                "diskWriteMB": round(s.disk_write_mb or 0, 2),
            },
        })

    return history