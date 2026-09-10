from fastapi import APIRouter,Depends
from infrastructure.tenant_repository import TenantRepository
from api.dependencies import get_tenants_repository
router = APIRouter()



@router.get("/tenants")
def get_tenants(
    tenants_repository : TenantRepository =Depends(get_tenants_repository)
    ):return tenants_repository.get_all

