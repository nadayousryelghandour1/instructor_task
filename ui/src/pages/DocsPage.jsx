import { useMemo, useRef, useState } from "react";
import {
  Box,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Paper,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FolderOutlined from "@mui/icons-material/FolderOutlined";
import OpenInNewOutlined from "@mui/icons-material/OpenInNewOutlined";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import { documentFileUrl, uploadDocument } from "../api/documents";
import { ACCEPTED_EXTENSIONS, MAX_UPLOAD_MB } from "../config/documents";
import { isSuccessStatus, statusLabel } from "../config/statuses";
import { useDocuments } from "../hooks/useDocuments";
import { formatDate } from "../utils/format";
import { validateFile } from "../utils/files";
import PageHeader from "../components/PageHeader";
import FileDropzone from "../components/FileDropzone";
import DataTable from "../components/DataTable";
import EmptyState from "../components/EmptyState";
import Badge from "../components/Badge";
import TextField from "../components/TextField";
import Button from "../components/Button";
import Alert from "../components/Alert";
import DocumentTitleCell from "../features/documents/DocumentTitleCell";
import DocumentStatusCell from "../features/documents/DocumentStatusCell";
import UploadStatusList from "../features/documents/UploadStatusList";
import ChunksDrawer from "../features/documents/ChunksDrawer";

const ACCEPT = ACCEPTED_EXTENSIONS.join(",");
const HINT = `${ACCEPTED_EXTENSIONS.map((ext) => ext.slice(1).toUpperCase()).join(", ")} · up to ${MAX_UPLOAD_MB} MB per file`;
const UNSPECIFIED = "Unspecified";

function openFile(doc) {
  window.open(documentFileUrl(doc), "_blank", "noopener,noreferrer");
}

function downloadFile(doc) {
  const link = document.createElement("a");
  link.href = documentFileUrl(doc);
  link.download = doc.title;
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function DocsPage() {
  const { status, documents, error, reload, retry } = useDocuments();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [specialization, setSpecialization] = useState("all");
  const [uploads, setUploads] = useState([]);
  const [rejections, setRejections] = useState([]);
  const [progress, setProgress] = useState(null);
  const [chunkTarget, setChunkTarget] = useState(null);
  const [chunksOpen, setChunksOpen] = useState(false);
  const uploadId = useRef(0);

  function patchUpload(id, patch) {
    setUploads((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  async function handleFiles(files) {
    const accepted = [];
    const refused = [];
    for (const file of files) {
      const problem = validateFile(file, { extensions: ACCEPTED_EXTENSIONS, maxMb: MAX_UPLOAD_MB });
      if (problem) refused.push({ name: file.name, problem });
      else accepted.push(file);
    }
    setRejections(refused);
    if (accepted.length === 0) return;

    const queue = accepted.map((file) => ({ id: ++uploadId.current, file }));
    setUploads((current) => [
      ...queue.map(({ id, file }) => ({ id, name: file.name, status: "uploading", message: "" })),
      ...current,
    ]);

    // One at a time, so the server is never handed a burst of large files at once.
    for (const { id, file } of queue) {
      setProgress(0);
      try {
        await uploadDocument(file, { onProgress: setProgress });
        patchUpload(id, { status: "uploaded", message: "Processing continues on the server." });
      } catch (err) {
        patchUpload(id, {
          status: "failed",
          message: err.status ? err.message : "Cannot reach the server",
        });
      }
    }
    setProgress(null);
    reload();
  }

  function openChunks(doc) {
    setChunkTarget(doc);
    setChunksOpen(true);
  }

  // Groups for the left panel: how many documents per specialization.
  const groups = useMemo(() => {
    const counts = new Map();
    for (const doc of documents) {
      const key = doc.specialization || UNSPECIFIED;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()];
  }, [documents]);

  const statusOptions = useMemo(
    () => [...new Set(documents.map((doc) => doc.status).filter(Boolean))],
    [documents]
  );

  const visibleDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return documents.filter((doc) => {
      const group = doc.specialization || UNSPECIFIED;
      return (
        (statusFilter === "all" || doc.status === statusFilter) &&
        (specialization === "all" || group === specialization) &&
        (!query || doc.title.toLowerCase().includes(query))
      );
    });
  }, [documents, search, statusFilter, specialization]);

  // Columns that depend on what the API returns only show when at least one row has a value.
  const columns = useMemo(() => {
    const cols = [
      { key: "title", header: "Document", render: (doc) => <DocumentTitleCell document={doc} /> },
      { key: "type", header: "Type", width: 90, render: (doc) => <Badge label={doc.type ? doc.type.toUpperCase() : "—"} /> },
      { key: "specialization", header: "Specialization", width: 170, render: (doc) => doc.specialization || "—" },
      { key: "status", header: "Status", width: 200, render: (doc) => <DocumentStatusCell document={doc} /> },
    ];
    if (documents.some((doc) => doc.pages != null)) {
      cols.splice(3, 0, { key: "pages", header: "Pages", width: 80, render: (doc) => doc.pages ?? "—" });
    }
    if (documents.some((doc) => doc.createdAt)) {
      cols.splice(cols.length, 0, { key: "createdAt", header: "Uploaded", width: 130, render: (doc) => formatDate(doc.createdAt) });
    }
    cols.push({
      key: "actions",
      header: "Actions",
      width: 300,
      align: "right",
      render: (doc) => (
        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <Button variant="secondary" size="small" onClick={() => openChunks(doc)} disabled={!isSuccessStatus(doc.status)}>
            Chunks
          </Button>
          <Button variant="secondary" size="small" startIcon={<OpenInNewOutlined />} onClick={() => openFile(doc)}>
            View
          </Button>
          <Button variant="secondary" size="small" startIcon={<DownloadOutlined />} onClick={() => downloadFile(doc)}>
            Download
          </Button>
        </Box>
      ),
    });
    return cols;
  }, [documents]);

  const uploading = uploads.some((item) => item.status === "uploading");
  const hasFilters = search.trim() !== "" || statusFilter !== "all" || specialization !== "all";

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "260px minmax(0, 1fr)" }, gap: 3, alignItems: "start" }}>
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 700, mb: 1 }}>
          Sources
        </Typography>
        <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <ListItemButton selected={specialization === "all"} onClick={() => setSpecialization("all")} sx={{ borderRadius: 2 }}>
            <ListItemText primary="All documents" secondary={`${documents.length} files`} slotProps={{ primary: { fontWeight: 600 } }} />
          </ListItemButton>
          {groups.map(([name, count]) => (
            <ListItemButton key={name} selected={specialization === name} onClick={() => setSpecialization(name)} sx={{ borderRadius: 2, gap: 1.5 }}>
              <FolderOutlined fontSize="small" />
              <ListItemText primary={name} secondary={`${count} file${count > 1 ? "s" : ""}`} slotProps={{ primary: { fontWeight: 600 } }} />
            </ListItemButton>
          ))}
        </List>
      </Paper>

      <Box sx={{ minWidth: 0 }}>
        <PageHeader title="Documents" description="Upload the files the copilot answers from, and check that each one was processed." />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
          <FileDropzone accept={ACCEPT} hint={HINT} onFiles={handleFiles} disabled={uploading} progress={uploading ? progress : null} />

          {rejections.length > 0 && (
            <Alert variant="warning" title="Some files were not uploaded">
              {rejections.map((item) => (
                <Box key={item.name} component="span" sx={{ display: "block" }}>
                  {item.name}: {item.problem}
                </Box>
              ))}
            </Alert>
          )}

          <UploadStatusList items={uploads} onClear={() => setUploads((current) => current.filter((item) => item.status === "uploading"))} />
        </Box>

        {status === "error" && (
          <Alert
            variant="error"
            sx={{ mb: 2 }}
            action={
              <Button variant="secondary" size="small" onClick={retry}>
                Try again
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
          <TextField
            placeholder="Search by document title"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{ maxWidth: 320 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
              htmlInput: { "aria-label": "Search documents" },
            }}
          />
          <TextField select label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} sx={{ maxWidth: 220 }} size="small">
            <MenuItem value="all">All statuses</MenuItem>
            {statusOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {statusLabel(option)}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <DataTable
          columns={columns}
          rows={visibleDocuments}
          getRowKey={(doc) => doc.id ?? doc.title}
          loading={status === "loading"}
          emptyState={
            status === "error" && documents.length === 0 ? null : hasFilters ? (
              <EmptyState
                title="No documents match your filters"
                description="Try a different search, status or specialization."
                action={
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("all");
                      setSpecialization("all");
                    }}
                  >
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <EmptyState title="No documents yet" description="Drop your first file above to get started." />
            )
          }
        />

        {documents.length > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            Showing {visibleDocuments.length} of {documents.length} documents
          </Typography>
        )}
      </Box>

      <ChunksDrawer open={chunksOpen} document={chunkTarget} onClose={() => setChunksOpen(false)} />
    </Box>
  );
}
