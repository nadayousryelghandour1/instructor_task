import { useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { DECISIONS } from "../../api/workflow";
import Alert from "../../components/Alert";
import Button from "../../components/Button";
import JsonDetails from "../../components/JsonDetails";
import StatusBadge from "../../components/StatusBadge";
import TextField from "../../components/TextField";

const MONO = "ui-monospace, Menlo, Consolas, monospace";

function Field({ label, children }) {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
        {label}
      </Typography>
      {children}
    </Box>
  );
}

// One assessment item awaiting review: read it, then approve, reject, or edit and approve.
// Render with key={item.id} so the edit fields and comment reset when another item is chosen.
export default function ItemReviewPanel({ item, submitting, onReview }) {
  const [editing, setEditing] = useState(false);
  const [comment, setComment] = useState("");
  const [question, setQuestion] = useState(item.question);
  const [answerKey, setAnswerKey] = useState(item.answerKey);
  const [problem, setProblem] = useState("");

  const decide = (decision, extra = {}) => onReview({ decision, comment: comment.trim(), ...extra });

  function handleEditAndApprove() {
    if (!question.trim() || !answerKey.trim()) {
      setProblem("The question and the answer key can't be empty.");
      return;
    }
    setProblem("");
    decide(DECISIONS.editAndApprove, { editedQuestion: question.trim(), editedAnswerKey: answerKey.trim() });
  }

  const source = [item.documentTitle, item.page != null ? `p. ${item.page}` : "", item.standard]
    .filter(Boolean)
    .join(" · ");

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
        <Box>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
            {item.moduleTitle || "Assessment item"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: MONO, overflowWrap: "anywhere" }}>
            item {String(item.id).slice(0, 8)}
            {item.runId ? ` · run ${String(item.runId).slice(0, 8)}` : ""}
          </Typography>
        </Box>
        <StatusBadge status={item.status} />
      </Box>

      {source && (
        <Field label="Source">
          <Typography sx={{ overflowWrap: "anywhere" }}>{source}</Typography>
        </Field>
      )}

      <Field label="Question">
        {editing ? (
          <TextField multiline minRows={3} value={question} onChange={(event) => setQuestion(event.target.value)} slotProps={{ htmlInput: { "aria-label": "Edited question" } }} />
        ) : (
          <Typography sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{item.question}</Typography>
        )}
      </Field>

      <Field label="Answer key">
        {editing ? (
          <TextField multiline minRows={3} value={answerKey} onChange={(event) => setAnswerKey(event.target.value)} slotProps={{ htmlInput: { "aria-label": "Edited answer key" } }} />
        ) : (
          <Typography sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{item.answerKey}</Typography>
        )}
      </Field>

      <TextField
        label="Comment (optional)"
        multiline
        minRows={2}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        helperText="Saved with your decision in the audit trail."
      />

      {problem && <Alert variant="warning">{problem}</Alert>}

      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
        {editing ? (
          <>
            <Button onClick={handleEditAndApprove} disabled={submitting}>
              Edit and approve
            </Button>
            <Button variant="secondary" onClick={() => setEditing(false)} disabled={submitting}>
              Cancel editing
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => decide(DECISIONS.approve)} disabled={submitting}>
              Approve
            </Button>
            <Button variant="secondary" onClick={() => setEditing(true)} disabled={submitting}>
              Edit
            </Button>
            <Button variant="danger" onClick={() => decide(DECISIONS.reject)} disabled={submitting}>
              Reject
            </Button>
          </>
        )}
      </Box>

      <JsonDetails data={item.raw} label="all fields" />
    </Paper>
  );
}
