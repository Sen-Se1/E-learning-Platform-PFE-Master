from pydantic import BaseModel
from datetime import datetime


class MetricSnapshotResponse(BaseModel):
    id: int
    platform: str
    cpu_percent: float
    ram_percent: float
    disk_percent: float
    network_rx_mb: float
    network_tx_mb: float
    disk_read_mb: float
    disk_write_mb: float
    total_services: int
    running_services: int
    down_services: int
    created_at: datetime

    class Config:
        from_attributes = True