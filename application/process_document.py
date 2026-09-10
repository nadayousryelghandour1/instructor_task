from infrastructure.file_reader import FileReader
from application.chunker import Chunker
from infrastructure.document_chunk_repository import DocumentChunkRepository


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
        document_id: str,
        file_path: str,
        content_type: str,
    ) -> None:

        pages = self.file_reader.read(file_path, content_type)

        chunks = self.chunker.chunk_pages(document_id, pages)

        self.chunk_repository.add_many(chunks)