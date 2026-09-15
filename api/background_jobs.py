from infrastructure.database import SessionLocal
from infrastructure.document_chunk_repository import DocumentChunkRepository
from infrastructure.file_reader import FileReader
from application.chunker import Chunker
from application.process_document import ProcessDocumentUseCase


def process_document_background(document_id: str, file_path: str, content_type: str, tenant_id: str):
    session = SessionLocal()
    try:
        chunk_repository = DocumentChunkRepository(session)
        process_use_case = ProcessDocumentUseCase(
            file_reader=FileReader(),
            chunker=Chunker(),
            chunk_repository=chunk_repository,
        )
        process_use_case.execute(
            tenant_id=tenant_id,        # <-- ضيفي السطر ده
            document_id=document_id,
            file_path=file_path,
            content_type=content_type,
        )
    finally:
        session.close()