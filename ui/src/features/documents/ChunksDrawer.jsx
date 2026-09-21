import { useEffect, useState } from "react";
import { Box, Drawer, IconButton, Skeleton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { listChunks } from "../../api/documents";
import { CHUNKS_PAGE_SIZE } from "../../config/documents";
import Alert from "../../components/Alert";
import Button from "../../components/Button";
import EmptyState from "../../components/EmptyState";

// Shows exactly what the retriever sees for one document: its chunks, with page and section.
// Chunk text is rendered as plain text, never as HTML.
export default function ChunksDrawer({ open, document, onClose }) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: "100%", sm: 520 }, bgcolor: "background.default" } } }}
    >
      {document && <ChunksList key={document.id} document={document} onClose={onClose} />}
    </Drawer>
  );
}

// Mounted per document (see `key`), so it always starts in the loading state.
function ChunksList({ document, onClose }) {
  const [state, setState] = useState({ status: "loading", chunks: [], error: "" });
  const [attempt, setAttempt] = useState(0);
  const [visible, setVisible] = useState(CHUNKS_PAGE_SIZE);

  useEffect(() => {
    const controller = new AbortController();
    listChunks({ documentId: document.id, signal: controller.signal })
      .then((chunks) => setState({ status: "ready", chunks, error: "" }))
      .catch((err) => {
        if (err.name === "AbortError") return;
        setState({
          status: "error",
          chunks: [],
          error: err.status ? err.message : "Cannot reach the server",
        });
      });
    return () => controller.abort();
  }, [document.id, attempt]);

  function retry() {
    setState({ status: "loading", chunks: [], error: "" });
    setAttempt((current) => current + 1);
  }

  const { status, chunks, error } = state;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, mb: 2 }}>
        <Box>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 700, overflowWrap: "anywhere" }}>
            {document.title}
          </Typography>
          <Typography color="text.secondary">
            {status === "ready" ? `${chunks.length} chunks` : "Chunks"}
          </Typography>
        </Box>
        <IconButton aria-label="Close chunks" onClick={onClose} edge="end">
          <CloseIcon />
        </IconButton>
      </Box>

      {status === "loading" && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} variant="rounded" height={96} />
          ))}
        </Box>
      )}

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

      {status === "ready" && chunks.length === 0 && (
        <EmptyState
          title="No chunks stored"
          description="This document has no chunks yet. If it is still processing, check back shortly."
        />
      )}

      {status === "ready" && chunks.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {chunks.slice(0, visible).map((chunk) => (
            <Box
              key={chunk.id}
              sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 2, bgcolor: "background.paper" }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontFamily: "ui-monospace, Menlo, Consolas, monospace", mb: 0.5 }}
              >
                {chunk.page != null ? `p. ${chunk.page} · ` : ""}chunk {chunk.index}
                {chunk.section ? ` · ${chunk.section}` : ""}
              </Typography>
              <Typography sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{chunk.text}</Typography>
            </Box>
          ))}
          {chunks.length > visible && (
            <Button variant="secondary" onClick={() => setVisible((current) => current + CHUNKS_PAGE_SIZE)}>
              Show more ({chunks.length - visible} left)
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}
