from sqlalchemy import Column, Integer, Float, String, DateTime
from datetime import datetime
from app.database.database import Base


class MetricSnapshot(Base):
    __tablename__ = "metric_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String, nullable=False)

    cpu_percent = Column(Float, default=0)
    ram_percent = Column(Float, default=0)
    disk_percent = Column(Float, default=0)
    
    network_rx_mb = Column(Float, default=0)
    network_tx_mb = Column(Float, default=0)
    disk_read_mb = Column(Float, default=0)
    disk_write_mb = Column(Float, default=0)
    total_services = Column(Integer, default=0)
    running_services = Column(Integer, default=0)
    down_services = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)


class ServiceMetricSnapshot(Base):
    __tablename__ = "service_metric_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String, nullable=False)
    service_name = Column(String, nullable=False)
    status = Column(String, default="unknown")

    cpu_percent = Column(Float, default=0)
    ram_percent = Column(Float, default=0)

    disk_percent = Column(Float, default=0)
    disk_read_mb = Column(Float, default=0)
    disk_write_mb = Column(Float, default=0)

    network_rx_mb = Column(Float, default=0)
    network_tx_mb = Column(Float, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)