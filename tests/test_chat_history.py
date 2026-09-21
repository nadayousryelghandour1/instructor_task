from application.prompt_builder import PromptBuilder
from domain.document_chunk import DocumentChunk


def test_prompt_builder_includes_previous_chat_history():
    builder = PromptBuilder()
    chunks = [
        DocumentChunk(
            chunk_id="c1",
            document_id="doc-1",
            tenant_id="tenant-1",
            page_number=1,
            text="Python basics and SQL joins.",
            embedding=[],
        )
    ]

    prompt = builder.build(
        question="What is the next topic?",
        chunks=chunks,
        history=[
            "User: What is Python?",
            "Assistant: Python is a programming language.",
        ],
    )

    assert "Previous conversation:" in prompt
    assert "What is Python?" in prompt
    assert "Python is a programming language." in prompt
