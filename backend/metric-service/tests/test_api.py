from datetime import datetime, timedelta
from app.database.models import MetricSnapshot, ServiceMetricSnapshot

def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["service"] == "metric-service"

def test_latest_metrics_empty(client):
    response = client.get("/api/v1/metrics/latest")
    assert response.status_code == 200
    assert response.json() == {}

def test_latest_metrics(client, db_session):
    # Seed a metric snapshot
    snapshot = MetricSnapshot(
        platform="docker",
        cpu_percent=12.5,
        ram_percent=128.0,
        disk_percent=3000.0,
        network_rx_mb=5.0,
        network_tx_mb=2.5,
        disk_read_mb=10.0,
        disk_write_mb=5.0,
        total_services=5,
        running_services=4,
        down_services=1,
        created_at=datetime.utcnow()
    )
    db_session.add(snapshot)
    db_session.commit()

    response = client.get("/api/v1/metrics/latest")
    assert response.status_code == 200
    data = response.json()
    assert data["cpu_percent"] == 12.5
    assert data["ram_percent"] == 128.0
    assert data["disk_read_mb"] == 10.0
    assert data["disk_write_mb"] == 5.0
    assert data["total_services"] == 5

def test_metrics_history(client, db_session):
    # Seed two snapshot entries
    s1 = MetricSnapshot(
        platform="docker", cpu_percent=10.0, ram_percent=100.0, disk_percent=1000.0,
        network_rx_mb=1.0, network_tx_mb=1.0, disk_read_mb=1.0, disk_write_mb=1.0,
        total_services=1, running_services=1, down_services=0,
        created_at=datetime.utcnow() - timedelta(minutes=10)
    )
    s2 = MetricSnapshot(
        platform="docker", cpu_percent=20.0, ram_percent=200.0, disk_percent=2000.0,
        network_rx_mb=2.0, network_tx_mb=2.0, disk_read_mb=2.0, disk_write_mb=2.0,
        total_services=2, running_services=2, down_services=0,
        created_at=datetime.utcnow()
    )
    db_session.add_all([s1, s2])
    db_session.commit()

    response = client.get("/api/v1/metrics/history?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["cpu_percent"] == 20.0
    assert data[1]["cpu_percent"] == 10.0

def test_metrics_summary(client, db_session):
    snapshot = MetricSnapshot(
        platform="docker", cpu_percent=15.0, ram_percent=150.0, disk_percent=3500.0,
        network_rx_mb=8.0, network_tx_mb=4.0, disk_read_mb=12.0, disk_write_mb=6.0,
        total_services=2, running_services=2, down_services=0,
        created_at=datetime.utcnow()
    )
    svc1 = ServiceMetricSnapshot(
        platform="docker", service_name="user-service", status="running",
        cpu_percent=5.0, ram_percent=50.0, disk_percent=10.0,
        disk_read_mb=4.0, disk_write_mb=2.0, network_rx_mb=2.0, network_tx_mb=1.0,
        created_at=datetime.utcnow()
    )
    svc2 = ServiceMetricSnapshot(
        platform="docker", service_name="course-service", status="running",
        cpu_percent=10.0, ram_percent=100.0, disk_percent=20.0,
        disk_read_mb=8.0, disk_write_mb=4.0, network_rx_mb=6.0, network_tx_mb=3.0,
        created_at=datetime.utcnow()
    )
    db_session.add_all([snapshot, svc1, svc2])
    db_session.commit()

    response = client.get("/api/v1/metrics/summary")
    assert response.status_code == 200
    data = response.json()
    
    assert "appSummary" in data
    assert "containers" in data
    
    summary = data["appSummary"]
    assert summary["cpuPercent"] == 15.0
    assert summary["ramMB"] == 150.0
    assert summary["diskReadMB"] == 12.0
    assert summary["diskWriteMB"] == 6.0
    
    containers = data["containers"]
    assert len(containers) == 2
    
    user_svc = next(c for c in containers if c["name"] == "user-service")
    assert user_svc["status"] == "running"
    assert user_svc["cpuPercent"] == 5.0
    assert user_svc["ramMB"] == 50.0
    assert user_svc["diskReadMB"] == 4.0
    assert user_svc["diskWriteMB"] == 2.0
    assert user_svc["networkRxMB"] == 2.0

def test_services_endpoints(client, db_session):
    svc = ServiceMetricSnapshot(
        platform="docker", service_name="user-service", status="running",
        cpu_percent=5.0, ram_percent=50.0, disk_percent=10.0,
        disk_read_mb=4.0, disk_write_mb=2.0, network_rx_mb=2.0, network_tx_mb=1.0,
        created_at=datetime.utcnow()
    )
    db_session.add(svc)
    db_session.commit()

    response = client.get("/api/v1/services/count")
    assert response.status_code == 200
    assert response.json() == 1

    response = client.get("/api/v1/services/latest")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["service_name"] == "user-service"
    assert data[0]["disk_read_mb"] == 4.0

    response = client.get("/api/v1/services/history")
    assert response.status_code == 200
    assert len(response.json()) == 1

    response = client.get("/api/v1/services/history/user-service")
    assert response.status_code == 200
    assert len(response.json()) == 1
