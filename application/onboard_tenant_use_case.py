from domain.tenant import Tenant
from domain.user import User
from infrastructure.security import hash_password


class OnboardTenantUseCase:
    def __init__(self, tenant_repository, user_repository):
        self.tenant_repository = tenant_repository
        self.user_repository = user_repository

    def execute(self, tenant_name: str, admin_name: str, admin_email: str, admin_password: str):
        existing_admin = self.user_repository.get_user_by_email(admin_email)
        if existing_admin is not None:
            return None

        new_tenant = Tenant(name=tenant_name)
        saved_tenant = self.tenant_repository.add_tanent(new_tenant)

        hashed_password = hash_password(admin_password)
        new_admin = User(
            name=admin_name,
            email=admin_email,
            hashed_password=hashed_password,
            tenant_id=saved_tenant.id,
            role="admin",
        )
        saved_admin = self.user_repository.add_user(new_admin)

        return {"tenant": saved_tenant, "admin": saved_admin}