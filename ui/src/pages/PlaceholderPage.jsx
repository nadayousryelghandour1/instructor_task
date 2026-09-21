import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Add,
  ArrowForwardOutlined,
  ChatBubbleOutlineOutlined,
  DescriptionOutlined,
  SearchOutlined,
} from "@mui/icons-material";
import { api } from "../api/client";

const SAMPLE_QUESTION = "What specific pandas and SQL competencies are required before introducing time-series forecasting in Module 3?";

function formatSourceTitle(source) {
  return source?.document_title || source?.document_id || "Source document";
}

export default function PlaceholderPage({ title }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [conversation, setConversation] = useState([]);

  async function handleSend() {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    const nextConversation = [
      ...conversation,
      { role: "user", content: trimmed },
    ];

    try {
      setLoading(true);
      setError("");
      setQuestion("");

      const response = await api(`/chat`, {
        method: "POST",
        body: {
          question: trimmed,
          history: nextConversation.map((item) => `${item.role === "user" ? "User" : "Assistant"}: ${item.content}`),
        },
      });

      const nextAnswer = response?.answer || "I could not find enough information in the provided documents to answer this question.";
      const nextSources = Array.isArray(response?.sources) ? response.sources : [];

      setAnswer(nextAnswer);
      setSources(nextSources);
      setConversation([
        ...nextConversation,
        { role: "assistant", content: nextAnswer },
      ]);
    } catch (err) {
      setError(err.message || "Unable to fetch answer.");
    } finally {
      setLoading(false);
    }
  }

  function handleNewChat() {
    setQuestion("");
    setAnswer("");
    setSources([]);
    setError("");
    setConversation([]);
  }

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", xl: "295px minmax(0, 1fr) 320px" }, gap: 2.5, minHeight: "100%" }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          background: "#f3f7ff",
          border: "1px solid rgba(148,163,184,0.2)",
          p: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>Recent conversations</Typography>
          <Button variant="outlined" size="small" sx={{ minWidth: 0, px: 1.2, py: 0.6, borderRadius: 2 }}>
            New
          </Button>
        </Box>

        <Stack spacing={1.2}>
          {conversation.length === 0 ? (
            <Box sx={{ color: "#64748b", p: 1.2, borderRadius: 2, border: "1px dashed rgba(148,163,184,0.4)" }}>
              No active conversation yet.
            </Box>
          ) : (
            conversation
              .filter((item) => item.role === "user")
              .slice(-4)
              .map((item, index, arr) => (
                <Box
                  key={`${item.content}-${index}`}
                  sx={{
                    borderRadius: 2,
                    p: 1.4,
                    background: index === arr.length - 1 ? "rgba(37,99,235,0.08)" : "transparent",
                    border: index === arr.length - 1 ? "1px solid rgba(37,99,235,0.12)" : "1px solid transparent",
                    color: index === arr.length - 1 ? "#0f172a" : "#475569",
                    fontWeight: index === arr.length - 1 ? 700 : 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.content}
                </Box>
              ))
          )}
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          background: "#ffffff",
          border: "1px solid rgba(148,163,184,0.2)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2.5, py: 1.5, borderBottom: "1px solid rgba(148,163,184,0.18)" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip label={title || "Ask"} color="primary" size="small" sx={{ borderRadius: 2, fontWeight: 700 }} />
            <Typography variant="body2" color="text.secondary">Agentic Education Copilot</Typography>
          </Box>
          <Button variant="outlined" size="small" sx={{ borderRadius: 2 }} onClick={handleNewChat}>
            New chat
          </Button>
        </Box>

        <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>{question || "Write your question"}</Typography>
            <Stack direction="row" spacing={1}>
              <Chip label="Answer" size="small" sx={{ background: "#eef2ff", color: "#4338ca", borderRadius: 1.5, fontWeight: 700 }} />
              <Chip label="Refusal" size="small" sx={{ background: "#f1f5f9", color: "#475569", borderRadius: 1.5, fontWeight: 700 }} />
              <Chip label="State" size="small" sx={{ background: "#f1f5f9", color: "#475569", borderRadius: 1.5, fontWeight: 700 }} />
            </Stack>
          </Box>

          <Box sx={{ background: "#f8fafc", borderRadius: 2.5, border: "1px solid rgba(148,163,184,0.2)", p: 2.5 }}>
            <Typography sx={{ fontWeight: 600, color: "#0f172a", lineHeight: 1.8 }}>
              {question || SAMPLE_QUESTION}
            </Typography>
            <Typography variant="caption" sx={{ mt: 1.5, display: "block", color: "#64748b" }}>
              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • Instructor
            </Typography>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 2, mt: 1 }}>
            <Box sx={{ background: "#f8fafc", borderRadius: 2.5, border: "1px solid rgba(148,163,184,0.2)", p: 2.5 }}>
              <Typography sx={{ color: "#0f172a", fontWeight: 700, mb: 1.2 }}>TeachPilot Assistant</Typography>
              <Typography sx={{ color: "#334155", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                {loading ? "Thinking..." : answer}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
              <Button size="small" variant="contained" startIcon={<ChatBubbleOutlineOutlined />} sx={{ whiteSpace: "nowrap" }}>
                Balanced
              </Button>
              <Button size="small" variant="outlined" startIcon={<DescriptionOutlined />} sx={{ whiteSpace: "nowrap" }}>
                Open document
              </Button>
            </Box>
          </Box>

          {error && (
            <Box sx={{ p: 1.25, borderRadius: 2, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", color: "#b91c1c" }}>
              {error}
            </Box>
          )}

          <Box sx={{ mt: "auto", display: "flex", gap: 1.5, alignItems: "center", background: "#e9edf5", borderRadius: 2.5, p: 1.5, border: "1px solid rgba(148,163,184,0.2)" }}>
            <Button variant="text" startIcon={<Add />} sx={{ minWidth: 0, color: "#0f172a" }}>
              Add
            </Button>
            <Button variant="text" startIcon={<SearchOutlined />} sx={{ minWidth: 0, color: "#0f172a" }}>
              Search
            </Button>
            <Box sx={{ flex: 1 }} />
            <Button variant="contained" endIcon={<ArrowForwardOutlined />} sx={{ borderRadius: 2 }} onClick={handleSend} disabled={loading || !question.trim()}>
              Send
            </Button>
          </Box>

          <TextField
            multiline
            minRows={2}
            maxRows={4}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask a question about your documents..."
            sx={{ mt: 0.5 }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
          />
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          background: "#ffffff",
          border: "1px solid rgba(148,163,184,0.2)",
          p: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>Sources</Typography>
          <Button variant="text" size="small" sx={{ minWidth: 0, color: "#475569" }}>
            Filter
          </Button>
        </Box>

        <Stack spacing={1.5}>
          {sources.length === 0 ? (
            <Box sx={{ border: "1px dashed rgba(148,163,184,0.5)", borderRadius: 2, p: 2, color: "#64748b" }}>
              No sources yet.
            </Box>
          ) : (
            sources.map((source, index) => (
              <Box key={`${formatSourceTitle(source)}-${index}`} sx={{ borderRadius: 2, border: "1px solid rgba(148,163,184,0.2)", background: "#f8fafc", p: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <DescriptionOutlined sx={{ color: "#1d4ed8", fontSize: 18 }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a" }}>
                      {formatSourceTitle(source)}
                    </Typography>
                  </Box>
                  <Chip
                    label={source?.page_number ? `p. ${source.page_number}` : "Source"}
                    size="small"
                    sx={{ background: "rgba(34,197,94,0.12)", color: "#15803d", borderRadius: 999, fontWeight: 700 }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: "#64748b", lineHeight: 1.6 }}>
                  {source?.snippet || "Retrieved from the corpus based on this question."}
                </Typography>
              </Box>
            ))
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
