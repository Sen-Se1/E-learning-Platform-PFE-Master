from app.core.config import settings
from app.collectors.prometheus import PrometheusCollector


class DockerCollector:
    def __init__(self):
        self.prom = PrometheusCollector()
        self.services = [
            service.strip()
            for service in settings.TRACKED_SERVICES.split(",")
            if service.strip()
        ]
        self.regex = "|".join(self.services)

    def collect_service_stats(self):
        total = len(self.services)

        if total == 0:
            return {
                "total_services": 0,
                "running_services": 0,
                "down_services": 0,
            }

        running = 0

        for service in self.services:
            query = f'count(container_last_seen{{name=~".*{service}.*"}})'
            value = self.prom.query(query)

            if value > 0:
                running += 1

        return {
            "total_services": total,
            "running_services": running,
            "down_services": max(total - running, 0),
        }

    def _query_one(self, promql: str) -> float:
        try:
            return float(self.prom.query(promql))
        except Exception:
            return 0.0

    def collect_service_list(self):
        services = []

        for service in self.services:
            name_filter = f'.*{service}.*'

            running_query = f'count(container_last_seen{{name=~"{name_filter}"}})'
            is_running = self._query_one(running_query) > 0

            cpu_query = f"""
            sum(
              rate(container_cpu_usage_seconds_total{{
                name=~"{name_filter}",
                image!="",
                container!="POD"
              }}[1m])
            ) * 100
            """

            ram_query = f"""
            sum(
              container_memory_working_set_bytes{{
                name=~"{name_filter}",
                image!="",
                container!="POD"
              }}
            ) / 1024 / 1024
            """

            disk_usage_query = f"""
            sum(
              container_fs_usage_bytes{{
                name=~"{name_filter}",
                image!="",
                container!="POD"
              }}
            ) / 1024 / 1024
            """

            disk_read_query = f"""
            sum(
              container_fs_reads_bytes_total{{
                name=~"{name_filter}",
                image!="",
                container!="POD"
              }}
            ) / 1024 / 1024
            """

            disk_write_query = f"""
            sum(
              container_fs_writes_bytes_total{{
                name=~"{name_filter}",
                image!="",
                container!="POD"
              }}
            ) / 1024 / 1024
            """

            rx_query = f"""
            sum(
              increase(container_network_receive_bytes_total{{
                name=~"{name_filter}",
                image!="",
                interface!="lo"
              }}[5m])
            ) / 1024 / 1024
            """

            tx_query = f"""
            sum(
              increase(container_network_transmit_bytes_total{{
                name=~"{name_filter}",
                image!="",
                interface!="lo"
              }}[5m])
            ) / 1024 / 1024
            """

            services.append({
                "service_name": service,
                "status": "running" if is_running else "down",
                "cpu_percent": round(self._query_one(cpu_query), 2),
                "ram_mb": round(self._query_one(ram_query), 2),
                "disk_usage_mb": round(self._query_one(disk_usage_query), 2),
                "disk_read_mb": round(self._query_one(disk_read_query), 2),
                "disk_write_mb": round(self._query_one(disk_write_query), 2),
                "network_rx_mb": round(self._query_one(rx_query), 2),
                "network_tx_mb": round(self._query_one(tx_query), 2),
            })

        return services