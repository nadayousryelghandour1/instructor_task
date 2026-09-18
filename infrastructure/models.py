from sqlalchemy import Column, String, Integer,ForeignKey, Text
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
    hashed_password = Column(String)
    email= Column(String)
    
class DocumentChunkModel(Base):
    __tablename__ = "document_chunks"
    
    document_id = Column(String, ForeignKey("documents.id"))
    tenant_id = Column(String, ForeignKey("tenants.id"))
    chunk_id= Column(String, primary_key=True)
    page_number = Column(Integer)
    text= Column(String)
    embedding = Column(Text, nullable=False)


class AgentRunModel(Base):
    __tablename__ = "agent_runs"

    id = Column(String, primary_key=True)
    tenant_id = Column(String, ForeignKey("tenants.id"))
    learning_goal = Column(Text)
    status = Column(String)
    steps_json = Column(Text)
    created_at = Column(String)


class AssessmentItemModel(Base):
    __tablename__ = "assessment_items"

    id = Column(String, primary_key=True)
    tenant_id = Column(String, ForeignKey("tenants.id"))
    run_id = Column(String, ForeignKey("agent_runs.id"))
    module_title = Column(String)
    question = Column(Text)
    answer_key = Column(Text)
    standard = Column(String)
    document_title = Column(String)
    page_number = Column(Integer)
    status = Column(String)
    reviewed_by = Column(String, nullable=True)
    review_comment = Column(Text, nullable=True)