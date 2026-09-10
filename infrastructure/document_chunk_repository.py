from sqlalchemy.orm import Session
from infrastructure.models import DocumentChunkModel
from domain.document_chunk import DocumentChunk


class DocumentChunkRepository:
    def __init__(self, session: Session):
        self.session = session

    def add_many(self, document_chunks: list[DocumentChunk]) -> None:
        models = [
            DocumentChunkModel(
                document_id=chunk.document_id,
                page_number=chunk.page_number,
                text=chunk.text,
                chunk_id=chunk.chunk_id,
            )
            for chunk in document_chunks
        ]
        self.session.add_all(models)
        self.session.commit()

    def get_chunk_by_id(self, document_id, chunk_id):
            document_chunk_model = (
            self.session.query(DocumentChunkModel)
            .filter(
                DocumentChunkModel.document_id == document_id,
                DocumentChunkModel.chunk_id == chunk_id
            )
            .first()
            )
    
            if document_chunk_model is None:
                return None
    
            return DocumentChunk(
                document_id=document_chunk_model.document_id,
                page_number=document_chunk_model.page_number,
                text=document_chunk_model.text,
                chunk_id=document_chunk_model.chunk_id,
            )
            
    def get_chunks_by_document_id(self, document_id):
            document_chunk_models = self.session.query(DocumentChunkModel).filter(DocumentChunkModel.document_id == document_id).all()
            return [
                DocumentChunk(
                    document_id=d.document_id,
                    page_number=d.page_number,
                    text=d.text,
                    chunk_id=d.chunk_id,
                )
                for d in document_chunk_models
            ]        