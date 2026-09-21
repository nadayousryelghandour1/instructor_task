from domain.document_chunk import DocumentChunk


class PromptBuilder:

    def build(
        self,
        question: str,
        chunks: list[DocumentChunk],
        history: list[str] | None = None,
    ) -> str:

        context = "\n\n".join(
            f"[Source {i+1} — Page {chunk.page_number}]\n{chunk.text}"
            for i, chunk in enumerate(chunks)
        )

        history_text = ""
        if history:
            cleaned_history = [item.strip() for item in history if item and item.strip()]
            if cleaned_history:
                history_text = """
                Previous conversation:
                """ + "\n".join(cleaned_history) + "\n\n"

        prompt = f"""
                You are an education assistant.
                Answer the user's question using only the provided context.

                You MUST cite your sources inline using [Source N] right after
                each claim you make, where N matches the source number below.
                If the answer is not available in the context,
                say that the information is not available in the provided documents.

                {history_text}
                User question:
                {question}

                Context:
                {context}
                """

        return prompt.strip()