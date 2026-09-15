from application.hybrid_search import reciprocal_rank_fusion
from domain.document_chunk import DocumentChunk


def make_chunk(chunk_id: str) -> DocumentChunk:
    return DocumentChunk(
        document_id="doc-1",
        tenant_id="tenant-1",
        page_number=1,
        text=f"chunk {chunk_id}",
        embedding=[],
        chunk_id=chunk_id,
    )


def test_reciprocal_rank_fusion():
    chunk_a = make_chunk("a")
    chunk_b = make_chunk("b")
    chunk_c = make_chunk("c")

    dense_results = [
        (0.9, chunk_a),
        (0.8, chunk_b),
        (0.7, chunk_c),
    ]

    keyword_results = [
        (3, chunk_b),
        (2, chunk_c),
        (1, chunk_a),
    ]

    results = reciprocal_rank_fusion(
        dense_results=dense_results,
        keyword_results=keyword_results,
        top_k=3,
    )

    result_ids = [
        chunk.chunk_id
        for score, chunk in results
    ]

    assert result_ids == ["b", "a", "c"]