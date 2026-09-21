import { api } from "./client";
import { normalizeStatus } from "../config/statuses";

// Routes from workflow_router.py (prefix /workflow). The tenant always comes from the token.
//   POST /workflow/runs               body { learning_goal }  -> { run_id, status, steps }   (runs the whole pipeline before answering)
//   GET  /workflow/runs/{run_id}      -> { run_id, status, learning_goal, steps, items }
//   GET  /workflow/items/pending      -> [item]
//   POST /workflow/items/{id}/review  body { decision, comment?, edited_question?, edited_answer_key? } -> item
//        decision: "approve" | "reject" | "edit_and_approve"; 403 = role not allowed, 400 = bad request
// ⚠️ A step's fields (`step.__dict__`) are not known, so steps are read tolerantly and kept in `raw`.

export const DECISIONS = { approve: "approve", reject: "reject", editAndApprove: "edit_and_approve" };

function normalizeStep(raw, position) {
  return {
    id: raw.id ?? position,
    name: raw.agent_name ?? raw.agent ?? raw.name ?? raw.step_name ?? raw.step ?? `Step ${position + 1}`,
    status: normalizeStatus(raw.status),
    error: raw.error ?? raw.error_message ?? "",
    raw,
  };
}

export function normalizeItem(raw) {
  return {
    id: raw.id,
    runId: raw.run_id ?? null,
    moduleTitle: raw.module_title ?? "",
    question: raw.question ?? "",
    answerKey: raw.answer_key ?? "",
    documentTitle: raw.document_title ?? "",
    page: raw.page_number ?? null,
    standard: raw.standard ?? "",
    status: normalizeStatus(raw.status) || "pending_approval",
    reviewComment: raw.review_comment ?? "",
    reviewedBy: raw.reviewed_by ?? "",
    raw,
  };
}

function normalizeRun(data, fallbackId) {
  return {
    runId: data?.run_id ?? data?.id ?? fallbackId ?? null,
    status: normalizeStatus(data?.status),
    learningGoal: data?.learning_goal ?? "",
    steps: (Array.isArray(data?.steps) ? data.steps : []).map(normalizeStep),
    items: (Array.isArray(data?.items) ? data.items : []).map(normalizeItem),
    raw: data,
  };
}

export async function startRun({ learningGoal, signal } = {}) {
  const data = await api("/workflow/runs", {
    method: "POST",
    body: { learning_goal: learningGoal },
    signal,
  });
  return normalizeRun(data);
}

export async function getRun(runId, { signal } = {}) {
  return normalizeRun(await api(`/workflow/runs/${encodeURIComponent(runId)}`, { signal }), runId);
}

export async function listPendingItems({ signal } = {}) {
  const data = await api("/workflow/items/pending", { signal });
  return (Array.isArray(data) ? data : []).map(normalizeItem);
}

export async function reviewItem({ itemId, decision, comment, editedQuestion, editedAnswerKey }) {
  const data = await api(`/workflow/items/${encodeURIComponent(itemId)}/review`, {
    method: "POST",
    // Fields left undefined are dropped from the JSON, which is what the API expects.
    body: {
      decision,
      comment: comment || undefined,
      edited_question: editedQuestion || undefined,
      edited_answer_key: editedAnswerKey || undefined,
    },
  });
  return normalizeItem(data);
}
