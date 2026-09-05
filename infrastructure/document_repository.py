from sqlalchemy.orm import Session
from infrastructure.models import DocumentModel
from domain.document import Document


class DocumentRepository:
    def __init__(self, session: Session):
        self.session = session

    def addDocument(self, document: Document):
        document_model = DocumentModel(id=document.id, title=document.title, tenant_id=document.tenant_id, specialization=document.specialization, status=document.status)
        self.session.add(document_model)
        self.session.commit()

    def getAll_documents_by_tenant_id(self, tenant_id):
        document_models = self.session.query(DocumentModel).filter(DocumentModel.tenant_id == tenant_id).all()
        return [Document(id=d.id, title=d.title, tenant_id=d.tenant_id, specialization=d.specialization, status=d.status) for d in document_models]