# ---------------------------------------------------------------------------
# TeachPilot — one-command setup (Windows / conda)
#
#   powershell -ExecutionPolicy Bypass -File scripts\setup.ps1
#
# Creates the conda environment, installs dependencies, prepares .env,
# seeds two tenants + demo users, and ingests the corpus.
# Re-running is safe: every step is idempotent.
# ---------------------------------------------------------------------------

$ErrorActionPreference = "Stop"

$EnvName = "domain-copilot"
$PythonVersion = "3.12"

Push-Location (Split-Path $PSScriptRoot -Parent)

try {
    Write-Host ""
    Write-Host "== 1/5  conda environment ==" -ForegroundColor Cyan

    if (-not (Get-Command conda -ErrorAction SilentlyContinue)) {
        throw "conda not found on PATH. Run this from an Anaconda Prompt, or install Miniconda."
    }

    $existing = conda env list | Select-String -Pattern "^\s*$EnvName\s"

    if ($existing) {
        Write-Host "   environment '$EnvName' already exists - reusing it"
    }
    else {
        Write-Host "   creating '$EnvName' (python $PythonVersion)"
        conda create -y -n $EnvName "python=$PythonVersion" | Out-Null
    }

    Write-Host ""
    Write-Host "== 2/5  dependencies ==" -ForegroundColor Cyan
    conda run -n $EnvName python -m pip install --upgrade pip --quiet
    conda run -n $EnvName python -m pip install -r requirements.txt

    Write-Host ""
    Write-Host "== 3/5  configuration ==" -ForegroundColor Cyan

    if (Test-Path ".env") {
        Write-Host "   .env already exists - leaving it untouched"
    }
    else {
        Copy-Item ".env.example" ".env"
        Write-Host "   created .env from .env.example" -ForegroundColor Yellow
        Write-Host "   -> open .env and set GROQ_API_KEY before asking any question." -ForegroundColor Yellow
        Write-Host "      Free key: https://console.groq.com/keys" -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Host "== 4/5  database + corpus ==" -ForegroundColor Cyan
    Write-Host "   (first run downloads the embedding model, ~90 MB)"
    conda run -n $EnvName --no-capture-output python scripts/seed.py

    Write-Host ""
    Write-Host "== 5/5  ready ==" -ForegroundColor Green
    Write-Host ""
    Write-Host "   Start the API:"
    Write-Host "     conda activate $EnvName"
    Write-Host "     uvicorn main:app --reload"
    Write-Host ""
    Write-Host "   Then open http://127.0.0.1:8000/docs"
    Write-Host ""
    Write-Host "   Run the tests:            pytest"
    Write-Host "   Run the evaluation:       python evaluation/run_evaluation.py"
    Write-Host ""
}
finally {
    Pop-Location
}
