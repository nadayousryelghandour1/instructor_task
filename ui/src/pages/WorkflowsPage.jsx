import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Link, Paper, Typography } from "@mui/material";
import { startRun } from "../api/workflow";
import { isSuccessStatus } from "../config/statuses";
import { useDocuments } from "../hooks/useDocuments";
import { useAuth } from "../provider/useAuth";
import { rememberRun } from "../utils/recentRuns";
import PageHeader from "../components/PageHeader";
import TextField from "../components/TextField";
import Button from "../components/Button";
import Alert from "../components/Alert";
import EmptyState from "../components/EmptyState";
import RunTrace from "../features/runs/RunTrace";

export default function WorkflowsPage() {
  const { user } = useAuth();
  const { documents, status: documentsStatus } = useDocuments();
  const [goal, setGoal] = useState("");
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState("");
  const [runId, setRunId] = useState(null);

  const processedCount = documents.filter((doc) => isSuccessStatus(doc.status)).length;
  const canRun = goal.trim() !== "" && processedCount > 0 && !starting;

  async function handleStart(event) {
    event.preventDefault();
    setStartError("");
    setRunId(null);
    setStarting(true);
    try {
      // The API answers only when the whole pipeline has finished, so this can take a while.
      const run = await startRun({ learningGoal: goal.trim() });
      if (!run.runId) {
        setStartError("The server did not return a run ID.");
        return;
      }
      rememberRun(user?.tenant_id, { runId: run.runId, goal: goal.trim(), status: run.status });
      setRunId(run.runId);
    } catch (err) {
      setStartError(err.status ? err.message : "Cannot reach the server");
    } finally {
      setStarting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Workflows"
        description="Run the multi-agent pipeline on your documents. A reviewer approves what it generates."
      />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "380px minmax(0, 1fr)" }, gap: 3, alignItems: "start" }}>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
            New run
          </Typography>

          <Box component="form" onSubmit={handleStart} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Target role or learning goal"
              multiline
              minRows={4}
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
              helperText="Who is the curriculum for, and what should they be able to do? Example: Junior Data Analyst, Python and SQL fundamentals."
            />

            {documentsStatus === "ready" && processedCount === 0 ? (
              <Alert variant="warning">
                No processed documents yet.{" "}
                <Link component={RouterLink} to="/documents">
                  Upload documents
                </Link>{" "}
                and wait for them to finish processing.
              </Alert>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {documentsStatus === "loading"
                  ? "Checking your documents…"
                  : `${processedCount} processed ${processedCount === 1 ? "document" : "documents"} in your corpus.`}
              </Typography>
            )}

            {starting && (
              <Alert variant="info">The agents are working. This can take a minute, so keep this page open.</Alert>
            )}
            {startError && <Alert variant="error">{startError}</Alert>}

            <Button type="submit" disabled={!canRun} loading={starting} loadingText="Running...">
              Run workflow
            </Button>
          </Box>
        </Paper>

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, minHeight: 240 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
            Run status
          </Typography>
          {runId ? (
            <RunTrace key={runId} runId={runId} />
          ) : (
            <EmptyState title="No run yet" description="Start a run on the left. What it produced appears here." />
          )}
        </Paper>
      </Box>
    </>
  );
}
