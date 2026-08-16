from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.service import ServiceStatusResponse
from app.services.status_service import StatusService

router = APIRouter(prefix="/api/v1/services", tags=["Services"])


@router.get("/count", response_model=int)
def get_services_count(db: Session = Depends(get_db)):
    """Retourne le nombre total de services récupérés"""
    services = StatusService.get_latest_all(db)
    return len(services)


@router.get("/latest", response_model=list[ServiceStatusResponse])
def get_services(db: Session = Depends(get_db)):
    return StatusService.get_latest_all(db)


@router.get("/history", response_model=list[ServiceStatusResponse])
def get_services_history(limit: int = 200, db: Session = Depends(get_db)):
    return StatusService.get_history(db, limit)


@router.get("/history/{service_name}", response_model=list[ServiceStatusResponse])
def get_one_service_history(
    service_name: str,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return StatusService.get_service_history(db, service_name, limit)