import { useCallback, useEffect, useState } from "react";
import { getRun } from "../api/workflow";
import { MAX_RUN_POLLS, RUN_POLL_INTERVAL_MS } from "../config/workflow";
import { isActiveStatus } from "../config/statuses";

// Loads one run and keeps re-reading it while its status is "in progress".
// Render the component that uses it with key={runId} so switching runs starts fresh.
export function useRun(runId) {
  const [state, setState] = useState({ status: "loading", run: null, error: "" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!runId) return undefined;
    const controller = new AbortController();
    let timer;
    let polls = 0;

    async function tick() {
      try {
        const run = await getRun(runId, { signal: controller.signal });
        setState({ status: "ready", run, error: "" });
        polls += 1;
        if (isActiveStatus(run.status) && polls < MAX_RUN_POLLS) {
          timer = setTimeout(tick, RUN_POLL_INTERVAL_MS);
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        setState((current) => ({
          status: "error",
          run: current.run,
          error: err.status === 404 ? "Run not found" : err.status ? err.message : "Cannot reach the server",
        }));
      }
    }

    tick();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [runId, attempt]);

  const retry = useCallback(() => {
    setState((current) => ({ ...current, status: "loading" }));
    setAttempt((current) => current + 1);
  }, []);

  return { ...state, retry };
}
