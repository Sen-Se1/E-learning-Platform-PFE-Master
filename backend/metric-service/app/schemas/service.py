from pydantic import BaseModel
from datetime import datetime


class ServiceStatusResponse(BaseModel):
    id: int
    platform: str
    service_name: str
    status: str

    cpu_percent: float
    ram_mb: float

    disk_usage_mb: float
    disk_read_mb: float
    disk_write_mb: float

    network_rx_mb: float
    network_tx_mb: float

    created_at: datetime

    class Config:
        from_attributes = True