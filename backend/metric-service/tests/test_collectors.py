import pytest
from unittest.mock import patch, MagicMock
from app.collectors.prometheus import PrometheusCollector
from app.collectors.docker import DockerCollector

@patch("app.collectors.prometheus.requests.get")
def test_prometheus_query_success(mock_get):
    mock_response = MagicMock()
    mock_response.json.return_value = {
        "data": {
            "result": [
                {"value": [12345.67, "85.5"]}
            ]
        }
    }
    mock_response.raise_for_status = MagicMock()
    mock_get.return_value = mock_response

    collector = PrometheusCollector()
    val = collector.query("some_query")
    assert val == 85.5

@patch("app.collectors.prometheus.requests.get")
def test_prometheus_query_failure(mock_get):
    mock_get.side_effect = Exception("HTTP Error")
    
    collector = PrometheusCollector()
    val = collector.query("some_query")
    assert val == 0.0

@patch("app.collectors.prometheus.requests.get")
def test_prometheus_collect_common_metrics(mock_get):
    mock_response = MagicMock()
    mock_response.json.return_value = {
        "data": {
            "result": [
                {"value": [12345.67, "10.0"]}
            ]
        }
    }
    mock_get.return_value = mock_response

    collector = PrometheusCollector()
    # Force self.regex to be a valid string for query execution
    collector.regex = "user-service"
    metrics = collector.collect_common_metrics()
    
    assert metrics["cpu_percent"] == 10.0
    assert metrics["ram_percent"] == 10.0
    assert metrics["disk_percent"] == 10.0
    assert metrics["disk_read_mb"] == 10.0
    assert metrics["disk_write_mb"] == 10.0

@patch("app.collectors.docker.PrometheusCollector")
def test_docker_collector_service_stats(mock_prom_class):
    mock_prom = MagicMock()
    mock_prom.query.return_value = 1.0
    mock_prom_class.return_value = mock_prom

    with patch("app.core.config.settings.TRACKED_SERVICES", "service-a,service-b"):
        collector = DockerCollector()
        assert collector.services == ["service-a", "service-b"]
        
        stats = collector.collect_service_stats()
        assert stats["total_services"] == 2
        assert stats["running_services"] == 2
        assert stats["down_services"] == 0

@patch("app.collectors.docker.PrometheusCollector")
def test_docker_collector_service_list(mock_prom_class):
    mock_prom = MagicMock()
    mock_prom.query.side_effect = [
        1.0,  # is_running check
        12.5, # cpu_percent
        64.0, # ram_mb
        100.0,# disk_usage_mb
        10.0, # disk_read_mb
        5.0,  # disk_write_mb
        2.0,  # network_rx_mb
        1.0,  # network_tx_mb
    ]
    mock_prom_class.return_value = mock_prom

    with patch("app.core.config.settings.TRACKED_SERVICES", "service-a"):
        collector = DockerCollector()
        services = collector.collect_service_list()
        
        assert len(services) == 1
        svc = services[0]
        assert svc["service_name"] == "service-a"
        assert svc["status"] == "running"
        assert svc["cpu_percent"] == 12.5
        assert svc["ram_mb"] == 64.0
        assert svc["disk_usage_mb"] == 100.0
        assert svc["disk_read_mb"] == 10.0
        assert svc["disk_write_mb"] == 5.0
        assert svc["network_rx_mb"] == 2.0
        assert svc["network_tx_mb"] == 1.0
