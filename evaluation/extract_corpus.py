import json

from infrastructure.database import SessionLocal
from infrastructure.document_repository import DocumentRepository
from infrastructure.document_chunk_repository import DocumentChunkRepository


TENANT_ID = "1085f5c2-1ed6-4f0c-9bdf-99e0f1b29932"


def main():
    session = SessionLocal()

    document_repository = DocumentRepository(session)
    chunk_repository = DocumentChunkRepository(session)

    documents = document_repository.get_documents_by_tenant_id(TENANT_ID)

    corpus = []

    for document in documents:
        chunks = chunk_repository.get_chunks_by_document_id(
            tenant_id=TENANT_ID,
            document_id=document.id,
        )

        for chunk in chunks:
            corpus.append(
                {
                    "document_id": chunk.document_id,
                    "document_title": document.title,
                    "page_number": chunk.page_number,
                    "chunk_id": chunk.chunk_id,
                    "text": chunk.text,
                }
            )

    with open("evaluation/corpus.json", "w", encoding="utf-8") as file:
        json.dump(corpus, file, ensure_ascii=False, indent=2)

    print(f"Saved {len(corpus)} chunks to evaluation/corpus.json")

    session.close()


if __name__ == "__main__":
    main()