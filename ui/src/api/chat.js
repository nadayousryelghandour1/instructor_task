import { api } from "./client";

// POST /chat  body { question, history }  ->  { answer, sources: [{ document_title | document_id, page_number, snippet }] }
// `history` is a list of strings such as "User: ..." and "Assistant: ...".
// ⚠️ The answer/source field names are the ones the UI was first built against. Check /openapi.json.
function normalizeSource(raw, position) {
  return {
    id: raw.chunk_id ?? raw.id ?? position,
    title: raw.document_title || raw.document_id || "Source document",
    page: raw.page_number ?? raw.page ?? null,
    snippet: raw.snippet ?? raw.text ?? raw.content ?? "",
  };
}

export async function askQuestion({ question, history = [], signal } = {}) {
  const data = await api("/chat", { method: "POST", body: { question, history }, signal });
  return {
    answer: data?.answer ?? "",
    sources: (Array.isArray(data?.sources) ? data.sources : []).map(normalizeSource),
  };
}
