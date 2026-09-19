# Domain Copilot — TeachPilot

An agentic RAG platform for the **Education (D3)** domain pack with the
**Multi-tenancy (T0)** twist. It ingests a corpus of lecture material,
answers questions with verifiable citations, and runs a 3-agent workflow
(Standards Mapper → Curriculum Designer → Item Generator) that drafts
assessment items for a **Lead Instructor** to approve, reject, or edit
before they count as real output.

Built for the ITI Technical Instructor assessment. See
[`docs/BRD.md`](docs/BRD.md) for the variant derivation
(Domain = D3, Twist = T0) and [`docs/SYSTEM-DESIGN.md`](docs/SYSTEM-DESIGN.md)
for the full architecture and scope decisions.

---

## 1. Prerequisites

- **Python 3.12**
- **conda** (recommended) — [Miniconda](https://docs.conda.io/en/latest/miniconda.html), *or* plain `venv` (the setup script falls back to this automatically on Linux/macOS if conda isn't found)
- A **free Groq API key** (no credit card required) — see step 3 below
- ~200 MB free disk space (SQLite database + local embedding model)

No GPU, no paid subscription, and no Docker required to run this locally
(Docker packaging is tracked as a known gap — see
[`docs/SYSTEM-DESIGN.md`](docs/SYSTEM-DESIGN.md), Part B gap table).

---

## 2. Quick start (one command)

**Windows (PowerShell / Anaconda Prompt):**
```powershell
powershell -ExecutionPolicy Bypass -File scripts\setup.ps1
```

**Linux / macOS:**
```bash
bash scripts/setup.sh
```

This single command:
1. Creates (or reuses) the `domain-copilot` conda environment (or a `.venv` if conda isn't available)
2. Installs all pinned dependencies from `requirements.txt`
3. Copies `.env.example` → `.env` (only if `.env` doesn't already exist — safe to re-run)
4. Seeds two tenants, three role-based demo users per tenant, and ingests the full corpus (33+ documents)

Re-running the script is safe — every step is idempotent.

**⚠️ Before your first real question**, open `.env` and set `GROQ_API_KEY`
(see step 3). The seed step above will still run and ingest documents
without a key — only asking questions (`/chat`) needs one.

Once setup finishes:
```bash
conda activate domain-copilot
uvicorn main:app --reload
```
Then open **http://127.0.0.1:8000/docs** — the interactive Swagger UI for
every endpoint below.

---

## 3. Getting a free API key

The system runs entirely on **Groq's free tier** (OpenAI-compatible API,
no card required):

1. Go to <https://console.groq.com/keys>
2. Sign up / log in, click **"Create API Key"**
3. Paste it into `.env` as `GROQ_API_KEY=gsk_...`

**Free-tier limit to know about:** Groq's free tier caps usage at **8,000
tokens per minute**. Running the full 33-question evaluation harness back
to back can hit this limit mid-run (you'll see a `500` on one question with
a `RateLimitError` in the server log). This is expected — see
**Troubleshooting** below for how the evaluation harness handles it.

**Running without any key at all:** embeddings run **locally** via
`sentence-transformers` (no key needed, ~90 MB model downloaded once on
first run) — ingestion works with zero API keys. Only the `/chat` and
`/workflow/runs` endpoints (which call the LLM for generation) require
`GROQ_API_KEY`.

> **Known limitation:** the brief's provider-abstraction requirement asks
> for ≥2 working LLM implementations (a hosted API + a local/offline
> model) behind one interface, so swapping providers is a config change,
> not a code change. Today only the Groq-hosted path (`infrastructure/llm_service.py`)
> is implemented; a local-model fallback (e.g. via Ollama) is documented
> as a deferred item in `docs/SYSTEM-DESIGN.md` rather than silently
> skipped.

---

## 4. Every environment variable

All variables live in `.env` (copied from `.env.example` by the setup
script). None of these are committed — `.env` is gitignored.

| Variable | Required? | Default | Purpose |
|---|---|---|---|
| `GROQ_API_KEY` | Yes, for `/chat` and `/workflow/*` | — | Free key from console.groq.com |
| `OPENAI_API_KEY` | No | empty | Reserved for an alternative provider (not yet wired up — see limitation above) |
| `LLM_MODEL` | No | `openai/gpt-oss-120b` | Groq model id used for generation |
| `EMBEDDING_MODEL` | No | `all-MiniLM-L6-v2` | Local sentence-transformers model for embeddings |
| `SIMILARITY_THRESHOLD` | No | `0.03` | Minimum retrieval score before the system refuses instead of guessing |
| `JWT_SECRET_KEY` | Yes | — | Signing key for auth tokens. Generate your own: `python -c "import secrets; print(secrets.token_urlsafe(48))"` |
| `JWT_ALGORITHM` | No | `HS256` | JWT signing algorithm |
| `JWT_EXPIRE_HOURS` | No | `8` | Access token lifetime |
| `DATABASE_URL` | No | `sqlite:///domain_copilot.db` | SQLite connection string |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | No | see `.env.example` | Demo admin account created by `scripts/seed.py` |
| `SEED_LEAD_EMAIL` / `SEED_LEAD_PASSWORD` | No | see `.env.example` | Demo lead-instructor account (can approve items) |
| `SEED_INSTRUCTOR_EMAIL` / `SEED_INSTRUCTOR_PASSWORD` | No | see `.env.example` | Demo instructor account (cannot approve items — used to verify role enforcement) |

---

## 5. Seeded demo accounts

`scripts/seed.py` creates **two tenants** (to demonstrate multi-tenant
isolation, T0) with these accounts on the primary tenant:

| Email | Password | Role | Can approve assessment items? |
|---|---|---|---|
| `admin@teachpilot.local` | `ChangeMe123!` | `admin` | Yes |
| `lead@teachpilot.local` | `ChangeMe123!` | `lead_instructor` | Yes |
| `instructor@teachpilot.local` | `ChangeMe123!` | `instructor` | **No** — gets `403 Forbidden` |

Plus one account on a **second, isolated tenant** (`Alexandria Technical
Academy`) — `rival@other-tenant.local` — used to verify that its
documents and workflow runs are never visible to the first tenant.

(Passwords match `.env.example`'s `SEED_*_PASSWORD` values — change them
there before seeding if you want different credentials.)

---

## 6. The 5-minute demo path

A numbered script hitting every core capability, using the Swagger UI at
`/docs`.

1. **Log in.** `POST /login` with `lead@teachpilot.local` /
   `ChangeMe123!`. Copy the `access_token` from the response, then click
   **Authorize** (top right of `/docs`) and paste it in.
2. **See the ingested corpus.** `GET /tenantdocs` — confirms 33+ documents
   are ingested with per-document status (`processed` /
   `no_extractable_text` / `failed` — see Troubleshooting).
3. **Ask a grounded question with citations.** `POST /chat` with
   `question=What is coherence bandwidth?` — the answer cites the exact
   source document and page number.
4. **Watch a correct refusal.** `POST /chat` with
   `question=What is the current price of Bitcoin?` — the system responds
   that it doesn't have enough information, rather than guessing.
5. **Run the multi-agent workflow.** `POST /workflow/runs` with
   `{"learning_goal": "Understand the basics of digital communication systems"}`.
   Note the returned `run_id` and `status: "awaiting_approval"` — the
   Standards Mapper, Curriculum Designer, and Item Generator agents ran in
   sequence (visible in `steps`), and the drafted items are **not** final
   yet.
6. **Inspect the run.** `GET /workflow/runs/{run_id}` — every step is
   timestamped and inspectable, and the draft items are listed with
   `status: "pending_approval"`.
7. **Exercise the human approval gate.** `POST
   /workflow/items/{item_id}/review` with `{"decision": "approve"}` — only
   works because you're logged in as `lead_instructor`. Log in as
   `instructor@teachpilot.local` instead and repeat this step to see it
   correctly rejected with `403 Forbidden`.
8. **Confirm multi-tenant isolation.** Log in as
   `rival@other-tenant.local` and repeat step 2 — you'll see a completely
   different, non-overlapping document set.

---

## 7. Running tests

```bash
pytest
```

Covers:
- `tests/test_orchestrator.py` — the 3-agent pipeline's happy path,
  no-evidence degradation, and failure/retry handling (using fakes, no
  live LLM calls)
- `tests/test_hybrid_search.py` — dense + keyword fusion retrieval
- `tests/test_multitenancy.py` — data isolation between tenants at the
  repository layer

---

## 8. Running the evaluation harness

```bash
python evaluation/run_evaluation.py
```

Runs the 33-question golden set (`evaluation/golden_set.json` — 27
in-corpus + 6 adversarial) against the live `/chat` endpoint and writes
`evaluation/evaluation_report.json`. Requires the API server to be running
(`uvicorn main:app --reload`) and `GROQ_API_KEY` to be set.

**This takes a few minutes** — it makes one live LLM call per question. If
you hit Groq's free-tier rate limit partway through, the harness retries
each request with backoff automatically; if it still exhausts retries,
re-run it (it's read-only and safe to re-run).

Latest recorded baseline (see `docs/EVALUATION.md` for full failure
analysis):

| Metric | Score |
|---|---|
| Retrieval hit rate | 81.5% (22/27) |
| Groundedness | 100% |
| Refusal correctness | 100% |
| False refusal rate (answerable questions) | 14.8% |

---

## 9. Troubleshooting

**`ModuleNotFoundError` when running `pytest` directly.**
Run `python -m pytest` instead — this ensures the project root is on
`sys.path`. (Happens if you're used to bare `pytest` from a different
project layout.)

**Mixing conda and a `venv` at the same time.**
If your prompt shows `(venv) (domain-copilot)`, you have both active —
`pip install` may go into the wrong one. Run `deactivate` until only
`(domain-copilot)` remains, then reinstall: `pip install -r
requirements.txt`.

**`openai.RateLimitError: 429` in the server log, surfaced as a `500` on
`/chat`.**
This is Groq's free-tier limit (8,000 tokens/minute), not a bug. It
typically only shows up when firing many questions back-to-back (e.g. the
evaluation harness). The harness itself retries with backoff; if you hit
it interactively, just wait ~10 seconds and retry the request.

**A document shows `status: "no_extractable_text"` in `GET /tenantdocs`.**
This means the file was read successfully but contained no extractable
text layer — typically a scanned or image-only PDF (e.g. slides exported
as images). This is a known, documented gap: OCR is the T6 twist, not T0
(this project's assigned twist), so it's explicitly out of scope rather
than silently failing. See the gap table in `docs/SYSTEM-DESIGN.md`.

**`retrieval_hit_rate` looks unexpectedly low after an evaluation run.**
Check `evaluation/golden_set.json`'s `acceptable_sources` against the
`sources` actually returned in `evaluation/evaluation_report.json` for
`grounded: true` questions — a golden-set entry can reference the wrong
source document/page even when the system's answer is correct. Run
`python evaluation/fix_golden_set_sources.py` to auto-correct entries
that are already verified as grounded (it flags anything it can't safely
auto-fix for manual review, and backs up the original file first).

---

## 10. Project structure

```
domain/             # Entities and business rules (no framework/SDK imports)
application/        # Use cases and agents (Standards Mapper, Curriculum
                     #   Designer, Item Generator, orchestrator)
infrastructure/      # DB models/repositories, LLM client, embeddings,
                     #   text extraction, security
api/                 # FastAPI routers, dependency wiring, schemas
evaluation/          # Golden set, evaluation harness, fix scripts
tests/               # Unit/integration tests
scripts/             # One-command setup + idempotent seed script
docs/                # BRD, SYSTEM-DESIGN, ARCHITECTURE, SECURITY, EVALUATION,
                     #   AGENTIC-WORKFLOW, AI-USAGE-LOG
teaching/            # Teaching pack (slides, lab sheet, assessment map)
```

This follows Clean Architecture: `domain/` and `application/` never import
an LLM SDK, vector-store SDK, or web framework directly — swapping the LLM
provider or embedding model is a change in `infrastructure/` plus
configuration, not a change to business logic.