import { useCallback, useEffect, useState } from "react";
import { listDocuments } from "../api/documents";
import { MAX_POLLS, POLL_INTERVAL_MS } from "../config/documents";
import { isActiveStatus } from "../config/statuses";

// Loads the tenant's documents and keeps refreshing while any of them is still processing.
// Shared by every screen that needs the document list, so the fetching logic exists once.
export function useDocuments() {
  const [state, setState] = useState({ status: "loading", documents: [], error: "" });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    listDocuments({ signal: controller.signal })
      .then((documents) => setState({ status: "ready", documents, error: "" }))
      .catch((err) => {
        if (err.name === "AbortError") return;
        // Keep what is already on screen if a background refresh fails.
        setState((current) => ({
          status: "error",
          documents: current.documents,
          error: err.status ? err.message : "Cannot reach the server",
        }));
      });
    return () => controller.abort();
  }, [reloadKey]);

  const hasActive = state.documents.some((doc) => isActiveStatus(doc.status));
  useEffect(() => {
    if (!hasActive) return undefined;
    let polls = 0;
    const timer = setInterval(() => {
      polls += 1;
      if (polls > MAX_POLLS) {
        clearInterval(timer);
        return;
      }
      if (!document.hidden) setReloadKey((key) => key + 1);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [hasActive]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);
  const retry = useCallback(() => {
    setState((current) => ({ ...current, status: "loading" }));
    setReloadKey((key) => key + 1);
  }, []);

  return { ...state, hasActive, reload, retry };
}
