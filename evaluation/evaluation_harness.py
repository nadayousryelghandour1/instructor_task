import argparse
import json
from pathlib import Path

import requests


BASE_URL = "http://127.0.0.1:8000"
GOLDEN_SET_PATH = Path(__file__).parent / "golden_set.json"
RESULTS_PATH = Path(__file__).parent / "evaluation_results.json"


def load_golden_set():
    with open(GOLDEN_SET_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


def login(email: str, password: str):
    response = requests.post(
        f"{BASE_URL}/login",
        json={
            "email": email,
            "password": password,
        },
    )

    response.raise_for_status()

    return response.json()["access_token"]


def ask_question(token: str, question: str):
    response = requests.post(
        f"{BASE_URL}/chat",
        params={
            "question": question,
        },
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    response.raise_for_status()

    return response.json()


def source_matches(source: dict, acceptable_source: dict):
    return (
        source.get("document_title")
        == acceptable_source["document_title"]
        and source.get("page_number")
        in acceptable_source["pages"]
    )


def evaluate_retrieval(
    token: str,
    case: dict,
):
    response = ask_question(
        token=token,
        question=case["question"],
    )

    sources = response.get("sources", [])

    if case["type"] == "adversarial":
        return {
            "hit": False,
            "retrieved_sources": sources,
        }

    acceptable_sources = case["acceptable_sources"]

    hit = any(
        source_matches(source, acceptable_source)
        for source in sources
        for acceptable_source in acceptable_sources
    )

    return {
        "hit": hit,
        "retrieved_sources": sources,
    }


def is_refusal(answer: str):
    refusal_phrases = [
        "couldn't find enough information",
        "not available in the provided documents",
        "not available in the provided document",
        "information is not available",
    ]

    answer_lower = answer.lower()

    return any(
        phrase in answer_lower
        for phrase in refusal_phrases
    )


def evaluate_case(
    token: str,
    case: dict,
):
    response = ask_question(
        token=token,
        question=case["question"],
    )

    answer = response.get("answer", "")
    sources = response.get("sources", [])

    acceptable_sources = case["acceptable_sources"]

    if case["type"] == "adversarial":
        refusal_correct = is_refusal(answer)

        return {
            "id": case["id"],
            "type": case["type"],
            "question": case["question"],
            "retrieval_hit": None,
            "citation_hit": None,
            "refusal_correct": refusal_correct,
            "answer": answer,
            "retrieved_sources": sources,
        }

    retrieval_hit = any(
        source_matches(source, acceptable_source)
        for source in sources
        for acceptable_source in acceptable_sources
    )

    citation_hit = retrieval_hit

    return {
        "id": case["id"],
        "type": case["type"],
        "question": case["question"],
        "retrieval_hit": retrieval_hit,
        "citation_hit": citation_hit,
        "refusal_correct": None,
        "answer": answer,
        "retrieved_sources": sources,
    }


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--email",
        required=True,
    )

    parser.add_argument(
        "--password",
        required=True,
    )

    args = parser.parse_args()

    golden_set = load_golden_set()

    print("Logging in...")

    token = login(
        email=args.email,
        password=args.password,
    )

    print(f"Loaded {len(golden_set)} evaluation cases.")
    print()

    results = []

    for case in golden_set:
        try:
            result = evaluate_case(
                token=token,
                case=case,
            )

            results.append(result)

            if case["type"] == "adversarial":
                status = (
                    "PASS"
                    if result["refusal_correct"]
                    else "FAIL"
                )

                print(
                    f"{case['id']}: "
                    f"{status} "
                    f"(refusal)"
                )

            else:
                status = (
                    "PASS"
                    if result["retrieval_hit"]
                    else "FAIL"
                )

                print(
                    f"{case['id']}: "
                    f"{status} "
                    f"(retrieval)"
                )

        except Exception as error:
            print(
                f"{case['id']}: ERROR - {error}"
            )

            results.append(
                {
                    "id": case["id"],
                    "type": case["type"],
                    "question": case["question"],
                    "error": str(error),
                }
            )

    answerable_results = [
        result
        for result in results
        if result.get("type") == "in_corpus"
    ]

    adversarial_results = [
        result
        for result in results
        if result.get("type") == "adversarial"
    ]

    retrieval_hits = sum(
        result.get("retrieval_hit") is True
        for result in answerable_results
    )

    citation_hits = sum(
        result.get("citation_hit") is True
        for result in answerable_results
    )

    refusal_hits = sum(
        result.get("refusal_correct") is True
        for result in adversarial_results
    )

    retrieval_hit_rate = (
        retrieval_hits / len(answerable_results)
        if answerable_results
        else 0
    )

    citation_rate = (
        citation_hits / len(answerable_results)
        if answerable_results
        else 0
    )

    refusal_correctness = (
        refusal_hits / len(adversarial_results)
        if adversarial_results
        else 0
    )

    evaluation = {
        "summary": {
            "total_cases": len(results),
            "in_corpus_cases": len(answerable_results),
            "adversarial_cases": len(adversarial_results),
            "retrieval_hit_rate": retrieval_hit_rate,
            "citation_rate": citation_rate,
            "refusal_correctness": refusal_correctness,
        },
        "results": results,
    }

    with open(
        RESULTS_PATH,
        "w",
        encoding="utf-8",
    ) as file:
        json.dump(
            evaluation,
            file,
            indent=2,
            ensure_ascii=False,
        )

    print()
    print("=" * 40)
    print("Evaluation Results")
    print("=" * 40)

    print(
        f"Retrieval Hit Rate: "
        f"{retrieval_hit_rate:.2%}"
    )

    print(
        f"Citation Rate: "
        f"{citation_rate:.2%}"
    )

    print(
        f"Refusal Correctness: "
        f"{refusal_correctness:.2%}"
    )

    print()
    print(
        f"Results saved to: {RESULTS_PATH}"
    )


if __name__ == "__main__":
    main()