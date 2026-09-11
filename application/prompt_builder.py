from domain.document_chunk import DocumentChunk


class PromptBuilder:

    def build(
        self,
        question: str,
        chunks: list[DocumentChunk]
    ) -> str:

        context = "\n\n".join(
            f"[Page {chunk.page_number}]\n{chunk.text}"
            for chunk in chunks
        )

        prompt = f"""
                You are an education assistant.
                Answer the user's question using only the provided context.
                
                If the answer is not available in the context,
                say that the information is not available in the provided documents.

                User question:
                {question}

                Context:
                {context}
                """

        return prompt.strip()