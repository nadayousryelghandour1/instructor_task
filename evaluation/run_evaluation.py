import json
from pathlib import Path

from application.search_documents_use_case import SearchDocumentsUseCase
from api.dependencies import get_search_documents_use_case


GOLDEN_SET_PATH = Path("evaluation/golden_set.json")


def load_golden_set():
    with open(
        GOLDEN_SET_PATH,
        "r",
        encoding="utf-8",
    ) as file:
        return json.load(file)


def evaluate_retrieval(
    search_documents: SearchDocumentsUseCase,
    case: dict,
):
    results = search_documents.execute(
        tenant_id=case["tenant_id"],
        question=case["question"],
        top_k=5,
    )

    retrieved_chunk_ids = {
        chunk.chunk_id
        for score, chunk in results
    }

    expected_chunk_ids = {
        source["chunk_id"]
        for source in case["expected_sources"]
    }

    hit = bool(
        retrieved_chunk_ids.intersection(
            expected_chunk_ids
        )
    )

    return {
        "question_id": case["id"],
        "question": case["question"],
        "type": case["type"],
        "hit": hit,
        "expected_chunks": list(expected_chunk_ids),
        "retrieved_chunks": list(retrieved_chunk_ids),
    }


def main():
    golden_set = load_golden_set()

    search_documents = get_search_documents_use_case()

    results = []

    for case in golden_set:
        result = evaluate_retrieval(
            search_documents=search_documents,
            case=case,
        )

        results.append(result)

        print(
            f"{case['id']}: "
            f"{'PASS' if result['hit'] else 'FAIL'}"
        )

    total = len(results)
    hits = sum(
        1
        for result in results
        if result["hit"]
    )

    hit_rate = hits / total if total else 0

    print()
    print("Evaluation Results")
    print("------------------")
    print(f"Total cases: {total}")
    print(f"Hits: {hits}")
    print(f"Misses: {total - hits}")
    print(f"Retrieval Hit Rate: {hit_rate:.2%}")


if __name__ == "__main__":
    main()