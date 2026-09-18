"""
Evaluation harness for TeachPilot RAG system.

Runs the golden set (evaluation/golden_set.json) against the live
/chat endpoint and reports:
  - Retrieval hit-rate  (did we retrieve the expected source chunk?)
  - Groundedness        (is the answer actually based on retrieved context,
                          checked via keyword overlap with expected_answer)
  - Refusal correctness (did adversarial/out-of-corpus questions get
                          correctly refused, and did answerable ones NOT
                          get refused?)

Usage:
    python evaluation/run_evaluation.py
"""

import json
import sys
import requests

BASE_URL = "http://127.0.0.1:8000"
LOGIN_EMAIL = "ali@gmail.com"
LOGIN_PASSWORD = "123456789"
GOLDEN_SET_PATH = "evaluation/golden_set.json"
REPORT_PATH = "evaluation/evaluation_report.json"

# FIX: a single exact phrase was too brittle - the model refuses using several
# valid phrasings (e.g. "the information needed ... is not available").
# We match on any of several refusal signals instead of one literal string.
REFUSAL_PHRASES = [
    "couldn't find enough information",
    "could not find enough information",
    "not enough information",
    "don't have enough information",
    "do not have enough information",
    "is not available in the provided documents",
    "are not available in the provided documents",
    "not available in the provided documents",
    "no information available in the provided documents",
    "the provided documents do not",
    "not mentioned in the provided documents",
]


def login():
    resp = requests.post(
        f"{BASE_URL}/login",
        json={"email": LOGIN_EMAIL, "password": LOGIN_PASSWORD},
    )
    if resp.status_code != 200:
        print(f"LOGIN FAILED: {resp.status_code} {resp.text}")
        sys.exit(1)
    return resp.json()["access_token"]


def ask(question: str, token: str):
    resp = requests.post(
        f"{BASE_URL}/chat",
        params={"question": question},
        headers={"Authorization": f"Bearer {token}"},
    )
    if resp.status_code != 200:
        return {"answer": f"[ERROR {resp.status_code}] {resp.text}", "sources": []}
    return resp.json()


def is_refusal(answer: str) -> bool:
    answer_lower = answer.lower()
    return any(phrase in answer_lower for phrase in REFUSAL_PHRASES)


def check_retrieval_hit(sources, acceptable_sources) -> bool:
    """A hit if any returned source matches any acceptable source
    on (document_title, page-in-pages-list)."""
    if not acceptable_sources:
        return None  # not applicable (adversarial question has no gold source)
    expected_pairs = set()
    for s in acceptable_sources:
        title = s.get("document_title")
        for page in s.get("pages", []):
            expected_pairs.add((title, page))
    actual_pairs = {
        (s.get("document_title"), s.get("page_number")) for s in sources
    }
    return len(expected_pairs & actual_pairs) > 0


def check_groundedness(answer: str, expected_answer: str) -> bool:
    """Rough groundedness proxy: keyword overlap between the model's
    answer and the expected answer. Not a perfect measure, but catches
    obvious hallucination (answer talking about something unrelated)."""
    if not expected_answer:
        return None
    expected_words = {
        w.strip(".,()").lower()
        for w in expected_answer.split()
        if len(w) > 4
    }
    answer_lower = answer.lower()
    if not expected_words:
        return None
    matches = sum(1 for w in expected_words if w in answer_lower)
    overlap_ratio = matches / len(expected_words)
    return overlap_ratio >= 0.15  # at least 15% of key terms present


def main():
    print("Logging in...")
    token = login()
    print("Logged in successfully.\n")

    with open(GOLDEN_SET_PATH, "r", encoding="utf-8") as f:
        golden_set = json.load(f)

    results = []
    retrieval_hits = 0
    retrieval_applicable = 0
    grounded_count = 0
    grounded_applicable = 0
    refusal_correct = 0
    refusal_total = 0
    non_adversarial_wrongly_refused = 0
    non_adversarial_total = 0

    for i, item in enumerate(golden_set, start=1):
        question = item["question"]
        item_type = item.get("type", "")
        is_adversarial = item_type in ("adversarial", "out_of_corpus")
        expected_sources = item.get("acceptable_sources", [])
        expected_answer = item.get("expected_answer_summary", "")

        print(f"[{i}/{len(golden_set)}] {question}")
        response = ask(question, token)
        answer = response.get("answer", "")
        sources = response.get("sources", [])

        refused = is_refusal(answer)

        row = {
            "id": item.get("id", i),
            "question": question,
            "adversarial": is_adversarial,
            "answer": answer,
            "sources": sources,
            "refused": refused,
        }

        if is_adversarial:
            refusal_total += 1
            if refused:
                refusal_correct += 1
            row["refusal_correct"] = refused
        else:
            non_adversarial_total += 1
            if refused:
                non_adversarial_wrongly_refused += 1
            row["wrongly_refused"] = refused

            hit = check_retrieval_hit(sources, expected_sources)
            if hit is not None:
                retrieval_applicable += 1
                if hit:
                    retrieval_hits += 1
                row["retrieval_hit"] = hit

            if not refused:
                grounded = check_groundedness(answer, expected_answer)
                if grounded is not None:
                    grounded_applicable += 1
                    if grounded:
                        grounded_count += 1
                    row["grounded"] = grounded

        results.append(row)

    # ---- Compute final metrics ----
    retrieval_hit_rate = (
        retrieval_hits / retrieval_applicable if retrieval_applicable else None
    )
    groundedness_rate = (
        grounded_count / grounded_applicable if grounded_applicable else None
    )
    refusal_correctness_rate = (
        refusal_correct / refusal_total if refusal_total else None
    )
    false_refusal_rate = (
        non_adversarial_wrongly_refused / non_adversarial_total
        if non_adversarial_total
        else None
    )

    summary = {
        "total_questions": len(golden_set),
        "adversarial_questions": refusal_total,
        "answerable_questions": non_adversarial_total,
        "retrieval_hit_rate": retrieval_hit_rate,
        "groundedness_rate": groundedness_rate,
        "refusal_correctness_rate": refusal_correctness_rate,
        "false_refusal_rate_on_answerable": false_refusal_rate,
    }

    print("\n" + "=" * 60)
    print("EVALUATION SUMMARY")
    print("=" * 60)
    for k, v in summary.items():
        print(f"{k}: {v}")

    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump({"summary": summary, "results": results}, f, indent=2, ensure_ascii=False)

    print(f"\nFull report written to {REPORT_PATH}")


if __name__ == "__main__":
    main()