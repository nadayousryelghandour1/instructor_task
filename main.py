from fastapi import FastAPI
from sqlalchemy.orm import sessionmaker
from infrastructure.database import engine
from infrastructure.tenant_repository import TenantRepository

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