from infrastructure.file_reader import FileReader
from application.chunker import Chunker
from infrastructure.document_chunk_repository import DocumentChunkRepository
from infrastructure.document_repository import DocumentRepository
from infrastructure.embedding_generator import generate_embedding


class ProcessDocumentUseCase:

    def __init__(
        self,
        file_reader: FileReader,
        chunker: Chunker,
        chunk_repository: DocumentChunkRepository,
        document_repository: DocumentRepository,
    ):
        self.file_reader = file_reader
        self.chunker = chunker
        self.chunk_repository = chunk_repository
        self.document_repository = document_repository

    def execute(
        self,
        tenant_id: str,
        document_id: str,
        file_path: str,
        content_type: str,
    ) -> None:

        try:
            pages = self.file_reader.read(file_path, content_type)
            chunks = self.chunker.chunk_pages(tenant_id, document_id, pages)

            if not chunks:
                # The file was read successfully but no usable text came out
                # of it (e.g. a scanned/image-only PDF with no text layer).
                # This is NOT the same as a processing failure - the pipeline
                # ran fine - so it gets its own status rather than being
                # silently reported as "processed" (FR-1: per-document
                # status and failure reporting). OCR for this case is out of
                # scope for this variant's twist; see SYSTEM-DESIGN.md.
                self.document_repository.update_status(
                    document_id, "no_extractable_text"
                )
                return

            for chunk in chunks:
                chunk.embedding = generate_embedding(chunk.text)

            self.chunk_repository.add_many(chunks)

            self.document_repository.update_status(document_id, "processed")

        except Exception:
            self.document_repository.update_status(document_id, "failed")
            raise