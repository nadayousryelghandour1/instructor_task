import { useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Link, Skeleton, Typography } from "@mui/material";
import { useRun } from "../../hooks/useRun";
import { useAuth } from "../../provider/useAuth";
import { rememberRun } from "../../utils/recentRuns";
import Alert from "../../components/Alert";
import Button from "../../components/Button";
import JsonDetails from "../../components/JsonDetails";
import StatusBadge from "../../components/StatusBadge";

const MONO = "ui-monospace, Menlo, Consolas, monospace";

function Section({ title, children }) {
  return (
    <Box>
      <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 700, mb: 1 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

// Everything the API knows about one run: its status, each agent step, and the items it generated.
// Render with key={runId} so switching runs starts from a clean state.
export default function RunTrace({ runId }) {
  const { user } = useAuth();
  const tenantId = user?.tenant_id;
  const { status, run, error, retry } = useRun(runId);

  // Keep the "recent runs" list showing the latest known status.
  const runStatus = run?.status;
  const goal = run?.learningGoal;
  useEffect(() => {
    if (runStatus !== undefined) rememberRun(tenantId, { runId, status: runStatus, ...(goal ? { goal } : {}) });
  }, [tenantId, runId, runStatus, goal]);

  if (status === "loading" && !run) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Skeleton variant="rounded" height={32} />
        <Skeleton variant="rounded" height={96} />
      </Box>
    );
  }

  const pendingItems = run?.items.filter((item) => item.status === "pending_approval").length ?? 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {status === "error" && (
        <Alert
          variant="error"
          action={
            <Button variant="secondary" size="small" onClick={retry}>
              Try again
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {run && (
        <>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
              <Typography color="text.secondary">Run ID</Typography>
              <Typography sx={{ fontFamily: MONO, fontWeight: 600, overflowWrap: "anywhere" }}>{run.runId}</Typography>
              {run.status && <StatusBadge status={run.status} />}
            </Box>
            {run.learningGoal && (
              <Typography sx={{ mt: 1, overflowWrap: "anywhere" }}>{run.learningGoal}</Typography>
            )}
          </Box>

          <Section title="Agent steps">
            {run.steps.length === 0 ? (
              <Typography color="text.secondary">No steps were recorded for this run.</Typography>
            ) : (
              <Box component="ol" sx={{ m: 0, p: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 1.5 }}>
                {run.steps.map((step) => (
                  <Box component="li" key={step.id}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                      <Typography sx={{ fontWeight: 600 }}>{step.name}</Typography>
                      {step.status && <StatusBadge status={step.status} />}
                    </Box>
                    {step.error && (
                      <Typography variant="body2" color="error" sx={{ mt: 0.5, overflowWrap: "anywhere" }}>
                        {step.error}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Section>

          <Section title={`Generated items (${run.items.length})`}>
            {run.items.length === 0 ? (
              <Typography color="text.secondary">This run has not produced any items.</Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {run.items.map((item) => (
                  <Box key={item.id} sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5, flexWrap: "wrap", mb: 0.5 }}>
                      <Typography sx={{ fontWeight: 600 }}>{item.moduleTitle || "Assessment item"}</Typography>
                      <StatusBadge status={item.status} />
                    </Box>
                    <Typography sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{item.question}</Typography>
                    {item.documentTitle && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {item.documentTitle}
                        {item.page != null ? ` · p. ${item.page}` : ""}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            )}
            {pendingItems > 0 && (
              <Typography sx={{ mt: 1.5 }}>
                {pendingItems} {pendingItems === 1 ? "item is" : "items are"} waiting for review.{" "}
                <Link component={RouterLink} to="/approvals">
                  Open approvals
                </Link>
              </Typography>
            )}
          </Section>

          <JsonDetails data={run.raw} />
        </>
      )}
    </Box>
  );
}
