from fastapi import APIRouter ,UploadFile
from sqlalchemy.orm import sessionmaker
from infrastructure.database import engine
from infrastructure.document_repository import DocumentRepository
from application.upload_document import UploadDocumentUseCase

router = APIRouter()

Session = sessionmaker(bind=engine)


@router.get("/tenantdocs/{tenant_id}")
def get_docs_by_tenant_id(tenant_id: str):
    session = Session()
    repository = DocumentRepository(session)
    documents = repository.getAll_documents_by_tenant_id(tenant_id=tenant_id)
    return documents


@router.post("/upload")
def upload_document(file: UploadFile, tenant_id: str):
    session = Session()
    repo = DocumentRepository(session)
    use_case = UploadDocumentUseCase(repo)
    new_doc = use_case.execute(file, tenant_id)
    return {"message": "File uploaded successfully", "document": new_doc}
