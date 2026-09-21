import { useEffect, useRef, useState } from "react";
import { Box, List, ListItemButton, ListItemText, Paper, Typography } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { askQuestion } from "../api/chat";
import PageHeader from "../components/PageHeader";
import TextField from "../components/TextField";
import Button from "../components/Button";
import Alert from "../components/Alert";
import EmptyState from "../components/EmptyState";

const MONO = "ui-monospace, Menlo, Consolas, monospace";

// Only the most recent turns are sent as context, so a long chat can't grow the request without limit.
const MAX_HISTORY_TURNS = 6;

export default function AskPage() {
  const [turns, setTurns] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState("");
  const turnId = useRef(0);
  const abortRef = useRef(null);
  const bottomRef = useRef(null);

  const busy = turns.some((turn) => turn.status === "loading");
  const selected = turns.find((turn) => turn.id === selectedId) ?? turns[turns.length - 1];

  useEffect(() => {
    bottomRef.current?.scrollIntoView?.({ behavior: "smooth", block: "end" });
  }, [turns.length]);

  useEffect(() => () => abortRef.current?.abort(), []);

  function patchTurn(id, patch) {
    setTurns((current) => current.map((turn) => (turn.id === id ? { ...turn, ...patch } : turn)));
  }

  async function handleSend() {
    const question = draft.trim();
    if (!question || busy) return;

    // Earlier finished turns, then the new question, as the strings the API expects.
    const history = [
      ...turns
        .filter((turn) => turn.status === "done")
        .slice(-MAX_HISTORY_TURNS)
        .flatMap((turn) => [`User: ${turn.question}`, `Assistant: ${turn.answer}`]),
      `User: ${question}`,
    ];

    const id = ++turnId.current;
    const controller = new AbortController();
    abortRef.current = controller;
    setTurns((current) => [...current, { id, question, status: "loading", answer: "", sources: [], error: "" }]);
    setSelectedId(id);
    setDraft("");

    try {
      const result = await askQuestion({ question, history, signal: controller.signal });
      patchTurn(id, { status: "done", answer: result.answer, sources: result.sources });
    } catch (err) {
      if (err.name === "AbortError") patchTurn(id, { status: "stopped" });
      else patchTurn(id, { status: "error", error: err.status ? err.message : "Cannot reach the server" });
    }
  }

  function handleNewChat() {
    abortRef.current?.abort();
    setTurns([]);
    setSelectedId(null);
    setDraft("");
  }

  return (
    <>
      <PageHeader
        title="Ask"
        description="Ask a question about your documents. Answers come with the passages they are based on."
        action={
          <Button variant="secondary" onClick={handleNewChat} disabled={turns.length === 0}>
            New chat
          </Button>
        }
      />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "240px minmax(0, 1fr) 320px" }, gap: 3, alignItems: "start" }}>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
            This session
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Conversations are not saved yet.
          </Typography>
          {turns.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Your questions will be listed here.
            </Typography>
          ) : (
            <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {turns.map((turn) => (
                <ListItemButton
                  key={turn.id}
                  selected={turn.id === selected?.id}
                  onClick={() => setSelectedId(turn.id)}
                  sx={{ borderRadius: 2 }}
                >
                  <ListItemText primary={turn.question} slotProps={{ primary: { noWrap: true, fontWeight: 600 } }} />
                </ListItemButton>
              ))}
            </List>
          )}
        </Paper>

        <Paper variant="outlined" sx={{ borderRadius: 3, display: "flex", flexDirection: "column", minHeight: 520 }}>
          <Box sx={{ flex: 1, p: 3, display: "flex", flexDirection: "column", gap: 3, overflowY: "auto", maxHeight: "60vh" }}>
            {turns.length === 0 && (
              <EmptyState title="Ask your first question" description="For example: which prerequisites does Module 3 assume?" />
            )}

            {turns.map((turn) => (
              <Box key={turn.id} sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box
                  sx={{ alignSelf: "flex-end", maxWidth: "85%", px: 2, py: 1.25, borderRadius: 2, bgcolor: "primary.main", color: "primary.contrastText", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
                >
                  {turn.question}
                </Box>

                {turn.status === "loading" && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography color="text.secondary">Searching your documents…</Typography>
                    <Button variant="secondary" size="small" onClick={() => abortRef.current?.abort()}>
                      Stop
                    </Button>
                  </Box>
                )}

                {turn.status === "stopped" && <Typography color="text.secondary">Stopped.</Typography>}

                {turn.status === "error" && <Alert variant="error">{turn.error}</Alert>}

                {turn.status === "done" &&
                  (turn.sources.length > 0 ? (
                    <Typography sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{turn.answer}</Typography>
                  ) : (
                    <Alert variant="info" title="No supporting sources found">
                      {turn.answer || "There is not enough information in your documents to answer this."}
                    </Alert>
                  ))}
              </Box>
            ))}
            <div ref={bottomRef} />
          </Box>

          <Box
            component="form"
            onSubmit={(event) => {
              event.preventDefault();
              handleSend();
            }}
            sx={{ p: 2, borderTop: 1, borderColor: "divider", display: "flex", gap: 1.5, alignItems: "flex-end" }}
          >
            <TextField
              placeholder="Ask about your documents"
              multiline
              maxRows={5}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              slotProps={{ htmlInput: { "aria-label": "Your question" } }}
            />
            <Button type="submit" startIcon={<SendIcon />} disabled={!draft.trim() || busy} sx={{ flexShrink: 0 }}>
              Send
            </Button>
          </Box>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 700, mb: 1 }}>
            Sources
          </Typography>
          {!selected || selected.sources.length === 0 ? (
            <EmptyState
              title="No sources to show"
              description="Sources appear here when an answer is based on your documents."
              sx={{ py: 3, px: 1 }}
            />
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {selected.sources.map((source) => (
                <Box key={source.id} sx={{ p: 1.5, border: 1, borderColor: "divider", borderRadius: 2 }}>
                  <Typography sx={{ fontWeight: 600, overflowWrap: "anywhere" }}>{source.title}</Typography>
                  {source.page != null && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: MONO }}>
                      p. {source.page}
                    </Typography>
                  )}
                  {source.snippet && (
                    <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                      {source.snippet}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      </Box>
    </>
  );
}
