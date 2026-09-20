from fastapi import APIRouter, Depends
from api.dependencies import get_current_user, get_tenants_repository
from infrastructure.tenant_repository import TenantRepository

router = APIRouter()

@router.get("/tenants")
def get_tenants(
    tenants_repository: TenantRepository = Depends(get_tenants_repository),
    current_user: dict = Depends(get_current_user)
):
    return tenants_repository.get_all_tanents()