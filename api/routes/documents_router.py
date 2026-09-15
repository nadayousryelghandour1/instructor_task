from fastapi import APIRouter, UploadFile, BackgroundTasks, Depends

from application.upload_document import UploadDocumentUseCase
from application.get_document import GetDocument
from infrastructure.document_chunk_repository import DocumentChunkRepository
from infrastructure.document_repository import DocumentRepository

from api.dependencies import (
    get_chunk_repository,
    get_current_user,
    get_document_repository,
    get_upload_use_case,
    get_document_use_case,
)
from api.background_jobs import process_document_background

router = APIRouter()


@router.get("/tenantdocs")
def get_docs_by_tenant_id(
    document_repository: DocumentRepository = Depends(get_document_repository),
    current_user: dict = Depends(get_current_user)
):
    tenant_id = current_user["tenant_id"]
    return document_repository.get_documents_by_tenant_id(tenant_id=tenant_id)


@router.post("/upload")
def upload_document(
    file: UploadFile,
    background_tasks: BackgroundTasks,
    upload_use_case: UploadDocumentUseCase = Depends(get_upload_use_case),
    current_user: dict = Depends(get_current_user)
):
    tenant_id = current_user["tenant_id"]

    new_doc, file_path, content_type = upload_use_case.execute(file, tenant_id)

    background_tasks.add_task(
        process_document_background,
        document_id=new_doc.id,
        file_path=file_path,
        content_type=content_type,
        tenant_id=tenant_id,   # <-- ضيفي السطر ده
    )

    return {"message": "File uploaded successfully", "document": new_doc}


@router.get("/documents/{document_id}")
def get_document(
    document_id: str,
    use_case: GetDocument = Depends(get_document_use_case),
    current_user: dict = Depends(get_current_user)
):
    tenant_id = current_user["tenant_id"]
    return use_case.execute(document_id, tenant_id)


@router.get("/documents/{document_id}/chunks")
def get_document_chunks(
    document_id: str,
    chunk_repository: DocumentChunkRepository = Depends(get_chunk_repository),
    current_user: dict = Depends(get_current_user)
):
    tenant_id = current_user["tenant_id"]
    return chunk_repository.get_chunks_by_document_id(tenant_id, document_id)