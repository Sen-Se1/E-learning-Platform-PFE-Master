# Metric Service

FastAPI service that collects metrics from Prometheus and saves snapshots in SQLite.

## Architecture

Docker/Kubernetes -> Exporters -> Prometheus -> Metric Service -> SQLite -> Admin Website

## Features

- CPU usage
- RAM usage
- Disk usage
- Network RX/TX
- Number of services
- Running services
- Down services
- SQLite history
- Docker and Kubernetes mode

## Run locally

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Service health root |
| GET | `/health` | Health check |
| GET | `/api/v1/metrics/summary` | Latest metrics summary (cpu, ram, disk, network) |
| GET | `/api/v1/metrics/summary/history` | Historical metrics (`?range=day\|week`) |
| GET | `/api/v1/metrics/latest` | Latest raw snapshot |
| GET | `/api/v1/metrics/history` | Raw snapshots list |
| POST | `/api/v1/metrics/collect` | Trigger manual collection |
| GET | `/api/v1/services/latest` | All service statuses |
| GET | `/api/v1/services/count` | Number of services |