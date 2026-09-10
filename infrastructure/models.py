from sqlalchemy import Column, String, Integer,ForeignKey
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class DocumentModel(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True)
    title = Column(String)
    tenant_id = Column(String, ForeignKey("tenants.id"))
    specialization = Column(String)
    status = Column(String)
    
class TenantModel(Base):
    __tablename__ = "tenants"

    id = Column(String, primary_key=True)
    name = Column(String)

class UserModel(Base):
    __tablename__ = "users"
    
    id = Column(String , primary_key=True)
    name = Column(String)
    tenant_id = Column(String, ForeignKey("tenants.id"))
    role = Column(String)
    
    
class DocumentChunkModel(Base):
    __tablename__ = "document_chunks"
    
    document_id = Column(String, ForeignKey("documents.id"))
    chunk_id= Column(String, primary_key=True)
    page_number = Column(Integer)
    text= Column(String)