import requests
from app.core.config import settings


class PrometheusCollector:
    def __init__(self):
        self.base_url = settings.PROMETHEUS_URL
        self.services = [
            service.strip()
            for service in settings.TRACKED_SERVICES.split(",")
            if service.strip()
        ]
        self.regex = "|".join(self.services)

    def query_raw(self, promql: str):
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/query",
                params={"query": promql},
                timeout=5
            )
            response.raise_for_status()
            return response.json()["data"]["result"]
        except Exception as e:
            print(f"[PROMETHEUS ERROR] {promql} -> {e}")
            return []

    def query(self, promql: str) -> float:
        result = self.query_raw(promql)

        if not result:
            return 0.0

        try:
            value = result[0]["value"][1]
            return float(value)
        except Exception:
            return 0.0

    def collect_common_metrics(self):
        if not self.regex:
            return {
                "cpu_percent": 0,
                "ram_percent": 0,
                "disk_percent": 0,
                "network_rx_mb": 0,
                "network_tx_mb": 0,
                "disk_read_mb": 0,
                "disk_write_mb": 0,
            }

        label = "container" if settings.PLATFORM == "kubernetes" else "container_label_com_docker_compose_service"

        cpu_query = f"""
        sum(
          rate(container_cpu_usage_seconds_total{{
            {label}=~"{self.regex}"
          }}[1m])
        ) * 100
        """

        ram_query = f"""
        sum(container_memory_working_set_bytes{{
          {label}=~"{self.regex}"
        }}) / 1024 / 1024
        """

        # Docker Desktop Windows / Kubernetes generic disk usage
        disk_query = """
        sum(container_fs_usage_bytes{id="/"})
        / 1024 / 1024
        """

        # Network metrics on Kubernetes are attached to the pod/pause container, not the app container
        network_label = "pod" if settings.PLATFORM == "kubernetes" else "container_label_com_docker_compose_service"
        # In kubernetes, the pod name is e.g. user-service-xyz, so regex must match anywhere
        network_regex = f".*({self.regex}).*" if settings.PLATFORM == "kubernetes" else self.regex

        rx_query = f"""
        sum(
          increase(container_network_receive_bytes_total{{
            {network_label}=~"{network_regex}",
            interface!="lo"
          }}[5m])
        ) / 1024 / 1024
        """

        tx_query = f"""
        sum(
          increase(container_network_transmit_bytes_total{{
            {network_label}=~"{network_regex}",
            interface!="lo"
          }}[5m])
        ) / 1024 / 1024
        """

        disk_read_query = f"""
        sum(
          container_fs_reads_bytes_total{{
            {label}=~"{self.regex}"
          }}
        ) / 1024 / 1024
        """

        disk_write_query = f"""
        sum(
          container_fs_writes_bytes_total{{
            {label}=~"{self.regex}"
          }}
        ) / 1024 / 1024
        """

        return {
            "cpu_percent": round(self.query(cpu_query), 2),
            "ram_percent": round(self.query(ram_query), 2),
            "disk_percent": round(self.query(disk_query), 2),
            "network_rx_mb": round(self.query(rx_query), 2),
            "network_tx_mb": round(self.query(tx_query), 2),
            "disk_read_mb": round(self.query(disk_read_query), 2),
            "disk_write_mb": round(self.query(disk_write_query), 2),
        }