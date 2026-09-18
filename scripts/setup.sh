#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# TeachPilot — one-command setup (Linux / macOS)
#
#   bash scripts/setup.sh
#
# Uses conda if available, otherwise falls back to a plain venv.
# Re-running is safe: every step is idempotent.
# ---------------------------------------------------------------------------

set -euo pipefail

ENV_NAME="domain-copilot"
PYTHON_VERSION="3.12"

cd "$(dirname "$0")/.."

echo
echo "== 1/5  python environment =="

if command -v conda >/dev/null 2>&1; then
    if conda env list | grep -qE "^${ENV_NAME}\s"; then
        echo "   conda environment '${ENV_NAME}' already exists - reusing it"
    else
        echo "   creating conda environment '${ENV_NAME}'"
        conda create -y -n "${ENV_NAME}" "python=${PYTHON_VERSION}" >/dev/null
    fi
    RUN="conda run -n ${ENV_NAME} --no-capture-output"
    ACTIVATE="conda activate ${ENV_NAME}"
else
    if [ ! -d ".venv" ]; then
        echo "   conda not found - creating .venv instead"
        python3 -m venv .venv
    else
        echo "   .venv already exists - reusing it"
    fi
    RUN=".venv/bin/python -m"
    RUN=".venv/bin/python"
    ACTIVATE="source .venv/bin/activate"
fi

echo
echo "== 2/5  dependencies =="
if command -v conda >/dev/null 2>&1; then
    conda run -n "${ENV_NAME}" python -m pip install --upgrade pip --quiet
    conda run -n "${ENV_NAME}" python -m pip install -r requirements.txt
else
    .venv/bin/python -m pip install --upgrade pip --quiet
    .venv/bin/python -m pip install -r requirements.txt
fi

echo
echo "== 3/5  configuration =="
if [ -f ".env" ]; then
    echo "   .env already exists - leaving it untouched"
else
    cp .env.example .env
    echo "   created .env from .env.example"
    echo "   -> set GROQ_API_KEY in .env before asking any question."
    echo "      Free key: https://console.groq.com/keys"
fi

echo
echo "== 4/5  database + corpus =="
echo "   (first run downloads the embedding model, ~90 MB)"
${RUN} python scripts/seed.py 2>/dev/null || ${RUN} scripts/seed.py

echo
echo "== 5/5  ready =="
echo
echo "   Start the API:"
echo "     ${ACTIVATE}"
echo "     uvicorn main:app --reload"
echo
echo "   Then open http://127.0.0.1:8000/docs"
echo
echo "   Run the tests:       pytest"
echo "   Run the evaluation:  python evaluation/run_evaluation.py"
echo
