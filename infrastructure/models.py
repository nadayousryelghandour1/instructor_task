from sqlalchemy import Column, String, Integer
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class DocumentModel(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True)
    title = Column(String)
    num_of_pages = Column(Integer)
    tenant_id = Column(String)
    specialization = Column(String)
    status = Column(String)
    
class TenantModel(Base):
    __tablename__ = "tenants"

    id = Column(String, primary_key=True)
    name = Column(String)
