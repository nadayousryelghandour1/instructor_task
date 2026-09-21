class AnswerQuestionUseCase:

    def __init__(
        self,
        search_documents,
        prompt_builder,
        llm_service,
        document_repository,
    ):
        self.search_documents = search_documents
        self.prompt_builder = prompt_builder
        self.llm_service = llm_service
        self.document_repository = document_repository

    def execute(
        self,
        tenant_id: str,
        question: str,
        top_k: int = 5,
        history: list[str] | None = None,
    ):
        scored_chunks = self.search_documents.execute(
            tenant_id=tenant_id,
            question=question,
            top_k=top_k,
        )

        if not scored_chunks:
            return {
                "answer": (
                    "I couldn't find enough information in the provided "
                    "documents to answer this question."
                ),
                "sources": [],
            }

        top_score = scored_chunks[0][0]
        MIN_RRF_SCORE = 0.02

        if top_score < MIN_RRF_SCORE:
            return {
                "answer": (
                    "I couldn't find enough information in the provided "
                    "documents to answer this question."
                ),
                "sources": [],
            }

        chunks = [chunk for score, chunk in scored_chunks]

        prompt = self.prompt_builder.build(
            question=question,
            chunks=chunks,
            history=history,
        )
        answer = self.llm_service.generate(prompt)

        sources = []
        for chunk in chunks:
            document = self.document_repository.get_by_id(
                document_id=chunk.document_id,
                tenant_id=tenant_id,
            )

            sources.append({
                "document_id": chunk.document_id,
                "document_title": document.title if document else None,
                "page_number": chunk.page_number,
            })

        return {"answer": answer, "sources": sources}