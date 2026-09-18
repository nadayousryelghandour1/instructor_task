from sqlalchemy.orm import Session
from infrastructure.models import DocumentModel
from domain.document import Document


class DocumentRepository:
    def __init__(self, session: Session):
        self.session = session

    def add_document(self, document: Document):
        document_model = DocumentModel(id=document.id, title=document.title, tenant_id=document.tenant_id, specialization=document.specialization, status=document.status)
        self.session.add(document_model)
        self.session.commit()

    def get_documents_by_tenant_id(self, tenant_id):
        document_models = self.session.query(DocumentModel).filter(DocumentModel.tenant_id == tenant_id).all()
        return [Document(id=d.id, title=d.title, tenant_id=d.tenant_id, specialization=d.specialization, status=d.status) for d in document_models]
    
    def get_by_id(self, document_id, tenant_id):
        document_model = (
        self.session.query(DocumentModel)
        .filter(
            DocumentModel.id == document_id,
            DocumentModel.tenant_id == tenant_id
        )
        .first()
        )

        if document_model is None:
            return None

        return Document(
            id=document_model.id,
            title=document_model.title,
            tenant_id=document_model.tenant_id,
            specialization=document_model.specialization,
            status=document_model.status
        )
        
    def update_status(
    self,
    document_id: str,
    tenant_id: str,
    status: str,
    ) -> None:
        document_model = (
        self.session.query(DocumentModel)
        .filter(
            DocumentModel.id == document_id,
            DocumentModel.tenant_id == tenant_id,
        )
        .first()
    )
        if document_model is not None:
            document_model.status = status
            self.session.commit()