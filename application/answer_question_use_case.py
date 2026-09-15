class AnswerQuestionUseCase:

    def __init__(
        self,
        search_documents,
        prompt_builder,
        llm_service,
        similarity_threshold: float,
    ):
        self.search_documents = search_documents
        self.prompt_builder = prompt_builder
        self.llm_service = llm_service
        self.similarity_threshold = similarity_threshold

    def execute(
        self,
        tenant_id: str,
        question: str,
        top_k: int = 5,
    ):

        scored_chunks = self.search_documents.execute(
            tenant_id=tenant_id,
            question=question,
            top_k=top_k,
        )

        if not scored_chunks:
            return {
                "answer": "I couldn't find enough information in the provided documents to answer this question.",
                "sources": [],
            }

        best_score = scored_chunks[0][0]

        if best_score < self.similarity_threshold:
            return {
                "answer": "I couldn't find enough information in the provided documents to answer this question.",
                "sources": [],
            }

        chunks = [
            chunk
            for score, chunk in scored_chunks
        ]

        prompt = self.prompt_builder.build(
            question=question,
            chunks=chunks,
        )

        answer = self.llm_service.generate(prompt)

        return {
            "answer": answer,
            "sources": [
                {
                    "document_id": chunk.document_id,
                    "page_number": chunk.page_number,
                }
                for chunk in chunks
            ],
        }