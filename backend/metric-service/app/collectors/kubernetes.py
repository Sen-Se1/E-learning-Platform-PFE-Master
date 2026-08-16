from app.collectors.prometheus import PrometheusCollector


class KubernetesCollector:
    def __init__(self):
        self.prom = PrometheusCollector()

    def collect_service_stats(self):
        total = self.prom.query(f'count(kube_pod_info{{pod=~"({self.prom.regex}).*"}})')

        running = self.prom.query(
            f'count(kube_pod_status_phase{{phase="Running", pod=~"({self.prom.regex}).*"}} == 1)'
        )

        down = max(0, int(total) - int(running))

        return {
            "total_services": int(total),
            "running_services": int(running),
            "down_services": down,
        }

    def _query_one(self, promql: str) -> float:
        try:
            return float(self.prom.query(promql))
        except Exception:
            return 0.0

    def collect_service_list(self):
        services = []

        for service in self.prom.services:
            running_query = f'count(kube_pod_status_phase{{phase="Running", pod=~".*{service}.*"}} == 1)'
            is_running = self._query_one(running_query) > 0

            cpu_query = f"""
            sum(
              rate(container_cpu_usage_seconds_total{{
                container="{service}"
              }}[1m])
            ) * 100
            """

            ram_query = f"""
            sum(
              container_memory_working_set_bytes{{
                container="{service}"
              }}
            ) / 1024 / 1024
            """

            # approximate per service disk usage
            disk_usage_query = f"""
            sum(
              container_fs_usage_bytes{{
                container="{service}"
              }}
            ) / 1024 / 1024
            """

            disk_read_query = f"""
            sum(
              container_fs_reads_bytes_total{{
                container="{service}"
              }}
            ) / 1024 / 1024
            """

            disk_write_query = f"""
            sum(
              container_fs_writes_bytes_total{{
                container="{service}"
              }}
            ) / 1024 / 1024
            """

            rx_query = f"""
            sum(
              increase(container_network_receive_bytes_total{{
                pod=~".*{service}.*",
                interface!="lo"
              }}[5m])
            ) / 1024 / 1024
            """

            tx_query = f"""
            sum(
              increase(container_network_transmit_bytes_total{{
                pod=~".*{service}.*",
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