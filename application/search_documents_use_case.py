from infrastructure.embedding_generator import generate_embedding


class SearchDocumentsUseCase:

    def __init__(self, dochunk_chunk_repository):
        self.dochunk_chunk_repository = dochunk_chunk_repository

    def execute(
        self,
        tenant_id: str,
        question: str,
        top_k: int = 5
    ):

        query_embedding = generate_embedding(question)

        chunks = self.dochunk_chunk_repository.search_similar(
            tenant_id=tenant_id,
            query_embedding=query_embedding,
            top_k=top_k
        )

        return chunks