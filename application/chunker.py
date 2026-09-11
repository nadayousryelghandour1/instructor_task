from domain.document_chunk import DocumentChunk


class Chunker:

    def __init__(self, chunk_size: int = 1000):
        self.chunk_size = chunk_size

    def chunk_pages(
        self,
        tenant_id: str,
        document_id: str,
        pages: list[dict]
    ) -> list[DocumentChunk]:

        chunks = []

        for page in pages:
            page_number = page["page_number"]
            text = page["text"]

            for i in range(0, len(text), self.chunk_size):
                chunk_text = text[i:i + self.chunk_size]

                chunk = DocumentChunk(
                    document_id=document_id,
                    tenant_id = tenant_id,
                    page_number=page_number,
                    text=chunk_text
                )

                chunks.append(chunk)

        return chunks