from fastapi import FastAPI
from sqlalchemy.orm import sessionmaker
from infrastructure.database import engine
from infrastructure.tenant_repository import TenantRepository
from infrastructure.user_repository import UserRepository


app = FastAPI()

Session = sessionmaker(bind=engine)

@app.get("/")
def read_root():
    return {"message": "Domain Copilot is alive!"}

@app.get("/tenants")
def get_tenants():
    session = Session()
    repository = TenantRepository(session)
    tenants = repository.get_all()
    return tenants

@app.get("/tenantusers/{tenant_id}")
def get_users_by_tenant_id(tenant_id: str):
    session = Session()
    repository = UserRepository(session)
    users = repository.getUsers_by_tenant(tenant_id=tenant_id)
    return users