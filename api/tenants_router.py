from fastapi import APIRouter
from sqlalchemy.orm import sessionmaker
from infrastructure.database import engine
from infrastructure.tenant_repository import TenantRepository

router = APIRouter()

Session = sessionmaker(bind=engine)


@router.get("/tenants")
def get_tenants():
    session = Session()
    repository = TenantRepository(session)
    tenants = repository.get_all()
    return tenants

