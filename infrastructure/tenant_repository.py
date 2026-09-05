from sqlalchemy.orm import Session
from infrastructure.models import TenantModel
from domain.tenant import Tenant


class TenantRepository:
    def __init__(self, session: Session):
        self.session = session

    def add(self, tenant: Tenant):
        tenant_model = TenantModel(id=tenant.id, name=tenant.name)
        self.session.add(tenant_model)
        self.session.commit()

    def get_all(self):
        tenant_models = self.session.query(TenantModel).all()
        return [Tenant(id=t.id, name=t.name) for t in tenant_models]