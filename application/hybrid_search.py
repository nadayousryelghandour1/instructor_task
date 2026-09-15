def reciprocal_rank_fusion(
    dense_results,
    keyword_results,
    top_k: int = 5,
    k: int = 60,
):
    scores = {}

    chunks = {}

    for rank, (score, chunk) in enumerate(dense_results, start=1):
        chunk_id = chunk.chunk_id
        scores[chunk_id] = scores.get(chunk_id, 0) + 1 / (k + rank)
        chunks[chunk_id] = chunk

    for rank, (score, chunk) in enumerate(keyword_results, start=1):
        chunk_id = chunk.chunk_id
        scores[chunk_id] = scores.get(chunk_id, 0) + 1 / (k + rank)
        chunks[chunk_id] = chunk

    ranked_chunks = sorted(
        scores.items(),
        key=lambda item: item[1],
        reverse=True,
    )

    return [
        (fusion_score, chunks[chunk_id])
        for chunk_id, fusion_score in ranked_chunks[:top_k]
    ]