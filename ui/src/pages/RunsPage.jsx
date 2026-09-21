import { useState } from "react";
import { useNavigate, useParams, Link as RouterLink } from "react-router-dom";
import { Box, Link, Paper, Typography } from "@mui/material";
import { useAuth } from "../provider/useAuth";
import { formatDateTime } from "../utils/format";
import { listRecentRuns } from "../utils/recentRuns";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import TextField from "../components/TextField";
import Button from "../components/Button";
import RunTrace from "../features/runs/RunTrace";

const MONO = "ui-monospace, Menlo, Consolas, monospace";

export default function RunsPage() {
  const { runId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const tenantId = user?.tenant_id;
  const [lookup, setLookup] = useState("");

  // Remembered on this browser only: the API can open a run by id but has no "list runs" route yet.
  const recent = listRecentRuns(tenantId);

  function handleLookup(event) {
    event.preventDefault();
    const id = lookup.trim();
    if (id) navigate(`/runs/${encodeURIComponent(id)}`);
  }

  if (runId) {
    return (
      <>
        <PageHeader
          title="Run trace"
          description="Every agent step and every item this run produced."
          action={
            <Button variant="secondary" component={RouterLink} to="/runs">
              All runs
            </Button>
          }
        />
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <RunTrace key={runId} runId={runId} />
        </Paper>
      </>
    );
  }

  const columns = [
    { key: "goal", header: "Learning goal", render: (run) => run.goal || "—" },
    {
      key: "runId",
      header: "Run ID",
      width: 140,
      render: (run) => <Typography sx={{ fontFamily: MONO }}>{String(run.runId).slice(0, 8)}</Typography>,
    },
    { key: "startedAt", header: "Started", width: 170, render: (run) => formatDateTime(run.startedAt) },
    { key: "status", header: "Status", width: 170, render: (run) => (run.status ? <StatusBadge status={run.status} /> : "—") },
    {
      key: "open",
      header: "",
      width: 100,
      align: "right",
      render: (run) => (
        <Button variant="secondary" size="small" component={RouterLink} to={`/runs/${encodeURIComponent(run.runId)}`}>
          Open
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Runs" description="Open a run to see what each agent did and what it produced." />

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Box component="form" onSubmit={handleLookup} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", flexWrap: "wrap" }}>
          <TextField
            label="Run ID"
            value={lookup}
            onChange={(event) => setLookup(event.target.value)}
            sx={{ maxWidth: 420 }}
            helperText="Paste a run ID to open its trace."
          />
          <Button type="submit" disabled={!lookup.trim()} sx={{ mt: 0.5 }}>
            Open trace
          </Button>
        </Box>
      </Paper>

      <Typography variant="h6" component="h2" sx={{ fontWeight: 700, mb: 0.5 }}>
        Runs started in this browser
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Only runs you started here are listed. Start one from{" "}
        <Link component={RouterLink} to="/workflows">
          Workflows
        </Link>
        .
      </Typography>
      <DataTable
        columns={columns}
        rows={recent}
        getRowKey={(run) => run.runId}
        emptyState={<EmptyState title="No runs yet" description="Runs you start appear here." />}
      />
    </>
  );
}
