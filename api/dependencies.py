from fastapi import Depends
from sqlalchemy.orm import Session

from infrastructure.database import SessionLocal
from infrastructure.document_repository import DocumentRepository
from infrastructure.document_chunk_repository import DocumentChunkRepository
from infrastructure.file_reader import FileReader
from application.chunker import Chunker
from application.upload_document import UploadDocumentUseCase
from application.process_document import ProcessDocumentUseCase
from application.get_document import GetDocument
from infrastructure.user_repository import UserRepository
from infrastructure.tenant_repository import TenantRepository


def get_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def get_document_repository(session: Session = Depends(get_session)):
    return DocumentRepository(session)


def get_upload_use_case(
    document_repository: DocumentRepository = Depends(get_document_repository),
):
    return UploadDocumentUseCase(document_repository)


def get_document_use_case(
    document_repository: DocumentRepository = Depends(get_document_repository),
):
    return GetDocument(document_repository)


def get_chunk_repository(session: Session = Depends(get_session)):
    return DocumentChunkRepository(session)


def get_user_repository(session: Session = Depends(get_session)):
    return UserRepository(session)


def get_tenants_repository(session: Session = Depends(get_session)):
    return TenantRepository(session)