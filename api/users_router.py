from fastapi import APIRouter
from sqlalchemy.orm import sessionmaker
from infrastructure.database import engine
from infrastructure.user_repository import UserRepository

router = APIRouter()

Session = sessionmaker(bind=engine)


@router.get("/tenantusers/{tenant_id}")
def get_users_by_tenant_id(tenant_id: str):
    session = Session()
    repository = UserRepository(session)
    users = repository.getUsers_by_tenant(tenant_id=tenant_id)
    return users
