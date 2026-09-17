from infrastructure.database import SessionLocal
from infrastructure.document_chunk_repository import DocumentChunkRepository
from infrastructure.document_repository import DocumentRepository
from infrastructure.file_reader import FileReader
from application.chunker import Chunker
from application.process_document import ProcessDocumentUseCase


def process_document_background(document_id: str, file_path: str, content_type: str, tenant_id: str):
    session = SessionLocal()
    try:
        process_use_case = ProcessDocumentUseCase(
            file_reader=FileReader(),
            chunker=Chunker(),
            chunk_repository=DocumentChunkRepository(session),
            document_repository=DocumentRepository(session),
        )
        process_use_case.execute(
            tenant_id=tenant_id,
            document_id=document_id,
            file_path=file_path,
            content_type=content_type,
        )
    finally:
        session.close()