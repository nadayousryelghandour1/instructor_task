// The API can open a run by id but cannot list runs, so the runs started in this browser are
// remembered locally (per organisation) to make them easy to reopen. Nothing sensitive is stored.
const MAX_RUNS = 20;
const keyFor = (tenantId) => `recent_runs:${tenantId ?? "unknown"}`;

export function listRecentRuns(tenantId) {
  try {
    const parsed = JSON.parse(localStorage.getItem(keyFor(tenantId)) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Adds a run, or updates it if the id is already there. Newest first.
export function rememberRun(tenantId, run) {
  if (!run?.runId) return;
  try {
    const others = listRecentRuns(tenantId).filter((item) => item.runId !== run.runId);
    const previous = listRecentRuns(tenantId).find((item) => item.runId === run.runId);
    const entry = { startedAt: new Date().toISOString(), ...previous, ...run };
    localStorage.setItem(keyFor(tenantId), JSON.stringify([entry, ...others].slice(0, MAX_RUNS)));
  } catch {
    // storage full or blocked: the feature is a convenience, so ignore it
  }
}
