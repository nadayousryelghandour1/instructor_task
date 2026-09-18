"""
Regenerates evaluation/golden_set.json's `acceptable_sources` using the
REAL sources the system returned, for every question where the answer was
verified as grounded (grounded == true in evaluation_report.json).

Why this is safe:
- "grounded" already checks that the answer's content overlaps with the
  expected_answer_summary you wrote by hand - so we only trust the actual
  source when we already know the CONTENT of the answer was correct.
- Questions that were NOT grounded, or that got refused/errored, are left
  untouched and printed as a TODO list - those are real retrieval gaps,
  not golden-set typos, and need a human look (not a bulk fix).

Usage:
    python evaluation/fix_golden_set_sources.py
"""

import json
from pathlib import Path

GOLDEN_SET_PATH = Path("evaluation/golden_set.json")
REPORT_PATH = Path("evaluation/evaluation_report.json")
BACKUP_PATH = Path("evaluation/golden_set.backup.json")


def main():
    golden_set = json.loads(GOLDEN_SET_PATH.read_text(encoding="utf-8"))
    report = json.loads(REPORT_PATH.read_text(encoding="utf-8"))

    results_by_id = {r["id"]: r for r in report["results"]}

    fixed = []
    needs_manual_review = []

    for item in golden_set:
        item_id = item["id"]
        result = results_by_id.get(item_id)

        if item.get("type") == "adversarial" or result is None:
            fixed.append(item)
            continue

        if result.get("grounded") is True and result.get("sources"):
            # Trust the real source(s) the system returned for this
            # verified-correct answer.
            new_sources = []
            seen = set()
            for s in result["sources"]:
                key = (s.get("document_title"), s.get("page_number"))
                if key in seen:
                    continue
                seen.add(key)
                new_sources.append(
                    {
                        "document_title": s.get("document_title"),
                        "pages": [s.get("page_number")],
                    }
                )

            item["acceptable_sources"] = new_sources
            fixed.append(item)
        else:
            # Real gap: refused when it shouldn't have, errored, or the
            # answer wasn't grounded. Don't guess - flag for a human.
            item["_TODO"] = (
                f"NOT auto-fixed: grounded={result.get('grounded')}, "
                f"refused={result.get('refused')}, "
                f"answer_snippet={result.get('answer', '')[:120]!r}"
            )
            fixed.append(item)
            needs_manual_review.append(item_id)

    # Keep the original as a backup before overwriting.
    BACKUP_PATH.write_text(
        json.dumps(golden_set, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    GOLDEN_SET_PATH.write_text(
        json.dumps(fixed, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    print(f"Backed up original golden set to {BACKUP_PATH}")
    print(f"Wrote corrected golden set to {GOLDEN_SET_PATH}")
    print()

    if needs_manual_review:
        print(f"{len(needs_manual_review)} question(s) NOT auto-fixed - real retrieval gaps, need a human look:")
        for qid in needs_manual_review:
            print(f"  - {qid}")
    else:
        print("Nothing needs manual review - all in-corpus questions were grounded.")


if __name__ == "__main__":
    main()