from fastapi import APIRouter, Depends, HTTPException
from api.schemas import TenantOnboardRequest
from api.dependencies import get_onboard_use_case
from application.onboard_tenant_use_case import OnboardTenantUseCase


router = APIRouter()

@router.post("/onboard")
def onboard_tenant(
    data: TenantOnboardRequest,
    onboard_use_case: OnboardTenantUseCase = Depends(get_onboard_use_case),
):
    result = onboard_use_case.execute(
        tenant_name=data.tenant_name,
        admin_name=data.admin_name,
        admin_email=data.admin_email,
        admin_password=data.admin_password,
    )

    if result is None:
        raise HTTPException(status_code=409, detail="Admin email already registered")

    return {
        "message": "Tenant and admin created successfully",
        "tenant_id": result["tenant"].id,
        "admin_id": result["admin"].id,
    }