from fastapi import APIRouter, Depends
from infrastructure.user_repository import UserRepository
from api.dependencies import get_user_repository

router = APIRouter()

@router.get("/tenantusers/{tenant_id}")
def get_users_by_tenant_id(
    tenant_id: str,
    user_repository: UserRepository = Depends(get_user_repository),
):
    return user_repository.get_users_by_tenant(tenant_id=tenant_id)