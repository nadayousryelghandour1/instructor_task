class AnswerQuestionUseCase:

    def __init__(
        self,
        search_documents,
        prompt_builder,
        llm_service,
    ):
        self.search_documents = search_documents
        self.prompt_builder = prompt_builder
        self.llm_service = llm_service

    def execute(
        self,
        tenant_id: str,
        question: str,
        top_k: int = 5,
    ):

        chunks = self.search_documents.execute(
            tenant_id=tenant_id,
            question=question,
            top_k=top_k,
        )

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