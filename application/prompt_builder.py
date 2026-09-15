from domain.document_chunk import DocumentChunk


class PromptBuilder:

    def build(
        self,
        question: str,
        chunks: list[DocumentChunk]
    ) -> str:

        context = "\n\n".join(
            f"[Source {i+1} — Page {chunk.page_number}]\n{chunk.text}"
            for i, chunk in enumerate(chunks)
        )

        prompt = f"""
                You are an education assistant.
                Answer the user's question using only the provided context.

                You MUST cite your sources inline using [Source N] right after
                each claim you make, where N matches the source number below.
                If the answer is not available in the context,
                say that the information is not available in the provided documents.

                User question:
                {question}

                Context:
                {context}
                """

        return prompt.strip()