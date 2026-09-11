from infrastructure.file_reader import FileReader
from application.chunker import Chunker
from infrastructure.document_chunk_repository import DocumentChunkRepository
from infrastructure.embedding_generator import generate_embedding


class ProcessDocumentUseCase:

    def __init__(
        self,
        file_reader: FileReader,
        chunker: Chunker,
        chunk_repository: DocumentChunkRepository,
    ):
        self.file_reader = file_reader
        self.chunker = chunker
        self.chunk_repository = chunk_repository

    def execute(
        self,
        tenant_id: str,
        document_id: str,
        file_path: str,
        content_type: str,
    ) -> None:

        pages = self.file_reader.read(file_path, content_type)

        chunks = self.chunker.chunk_pages(
            tenant_id,
            document_id,
            pages
        )

        for chunk in chunks:
            chunk.embedding = generate_embedding(chunk.text)

        self.chunk_repository.add_many(chunks)