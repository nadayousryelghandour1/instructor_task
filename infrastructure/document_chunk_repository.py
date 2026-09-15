from sqlalchemy.orm import Session
from infrastructure.models import DocumentChunkModel
from domain.document_chunk import DocumentChunk
from application.similarity import cosine_similarity
import json
import re


class DocumentChunkRepository:
    def __init__(self, session: Session):
        self.session = session

    def add_many(self, document_chunks: list[DocumentChunk]) -> None:
        models = [
            DocumentChunkModel(
                document_id=chunk.document_id,
                tenant_id=chunk.tenant_id,
                page_number=chunk.page_number,
                text=chunk.text,
                embedding=json.dumps(chunk.embedding),
                chunk_id=chunk.chunk_id,
            )
            for chunk in document_chunks
        ]

        self.session.add_all(models)
        self.session.commit()

    def get_chunk_by_id(self, tenant_id, document_id, chunk_id):
        document_chunk_model = (
            self.session.query(DocumentChunkModel)
            .filter(
                DocumentChunkModel.tenant_id == tenant_id,
                DocumentChunkModel.document_id == document_id,
                DocumentChunkModel.chunk_id == chunk_id,
            )
            .first()
        )

        if document_chunk_model is None:
            return None

        return DocumentChunk(
            document_id=document_chunk_model.document_id,
            tenant_id=document_chunk_model.tenant_id,
            page_number=document_chunk_model.page_number,
            text=document_chunk_model.text,
            embedding=json.loads(document_chunk_model.embedding),
            chunk_id=document_chunk_model.chunk_id,
        )

    def get_chunks_by_document_id(self, tenant_id, document_id):
        document_chunk_models = (
            self.session.query(DocumentChunkModel)
            .filter(
                DocumentChunkModel.tenant_id == tenant_id,
                DocumentChunkModel.document_id == document_id,
            )
            .all()
        )

        return [
            DocumentChunk(
                document_id=d.document_id,
                tenant_id=d.tenant_id,
                page_number=d.page_number,
                text=d.text,
                embedding=json.loads(d.embedding),
                chunk_id=d.chunk_id,
            )
            for d in document_chunk_models
        ]

    def get_chunk_by_tenant_id(
        self,
        tenant_id: str,
    ) -> list[DocumentChunk]:

        document_chunk_models = (
            self.session.query(DocumentChunkModel)
            .filter(DocumentChunkModel.tenant_id == tenant_id)
            .all()
        )

        return [
            DocumentChunk(
                document_id=chunk.document_id,
                tenant_id=chunk.tenant_id,
                page_number=chunk.page_number,
                text=chunk.text,
                embedding=json.loads(chunk.embedding),
                chunk_id=chunk.chunk_id,
            )
            for chunk in document_chunk_models
        ]

    def search_similar(
        self,
        tenant_id: str,
        query_embedding: list[float],
        top_k: int = 5,
    ) -> list[tuple[float, DocumentChunk]]:

        chunks = self.get_chunk_by_tenant_id(tenant_id)

        scored_chunks = []

        for chunk in chunks:
            score = cosine_similarity(
                query_embedding,
                chunk.embedding,
            )

            scored_chunks.append((score, chunk))

        scored_chunks.sort(
            key=lambda item: item[0],
            reverse=True,
        )

        return scored_chunks[:top_k]

    def search_by_keyword(
        self,
        tenant_id: str,
        question: str,
        top_k: int = 5,
    ) -> list[tuple[int, DocumentChunk]]:

        chunks = self.get_chunk_by_tenant_id(tenant_id)

        keywords = re.findall(r"\b\w+\b", question.lower())

        scored_chunks = []

        for chunk in chunks:
            chunk_words = set(
                re.findall(r"\b\w+\b", chunk.text.lower())
            )

            score = sum(
                1
                for keyword in keywords
                if keyword in chunk_words
            )

            if score > 0:
                scored_chunks.append((score, chunk))

        scored_chunks.sort(
            key=lambda item: item[0],
            reverse=True,
        )

        return scored_chunks[:top_k]