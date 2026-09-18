from infrastructure.embedding_generator import generate_embedding
from application.hybrid_search import reciprocal_rank_fusion
from application.similarity import cosine_similarity

class SearchDocumentsUseCase:

    def __init__(self, dochunk_chunk_repository):
        self.dochunk_chunk_repository = dochunk_chunk_repository

    def execute(
        self,
        tenant_id: str,
        question: str,
        top_k: int = 5,
    ):

        # Dense Retrieval
        query_embedding = generate_embedding(question)

        dense_results = self.dochunk_chunk_repository.search_similar(
            tenant_id=tenant_id,
            query_embedding=query_embedding,
            top_k=top_k,
        )
        all_chunks = self.dochunk_chunk_repository.get_chunk_by_tenant_id(tenant_id)

        for chunk in all_chunks:
            score = cosine_similarity(
                query_embedding,
                chunk.embedding,
            )

        print("DENSE RESULTS")
        for rank, (score, chunk) in enumerate(dense_results, start=1):
            print(
                rank,
                "score=",score,
                "page=",chunk.page_number,
                "chunk_id=",chunk.chunk_id,
        )


        # Keyword Retrieval
        keyword_results = self.dochunk_chunk_repository.search_by_keyword(
            tenant_id=tenant_id,
            question=question,
            top_k=top_k,
        )
        
        
        print("KEYWORD RESULTS")
        for rank, (score, chunk) in enumerate(keyword_results, start=1):
            print(
                rank,
                 "score=",score,
                 "page=",chunk.page_number,
                "chunk_id=",chunk.chunk_id,
       )

        # Fusion
        hybrid_results = reciprocal_rank_fusion(
            dense_results=dense_results,
            keyword_results=keyword_results,
            top_k=top_k,
        )

        return hybrid_results