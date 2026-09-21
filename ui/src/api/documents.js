import { api, upload, API_BASE_URL } from "./client";
import { STATUSES, normalizeStatus } from "../config/statuses";
import { fileExtension } from "../utils/files";

// Routes from documents_router.py (the tenant always comes from the token, never from the client):
//   GET  /tenantdocs                 -> [{ id, title | filename, specialization, status }]
//   POST /upload                     -> multipart, field "file"  ->  { message, document }
//   GET  /documents/{id}/chunks      -> chunks of one document
// ⚠️ The chunk field names below are tolerant guesses. Check /openapi.json.
const UPLOAD_FIELD = "file";

const toItems = (data, key) => (Array.isArray(data) ? data : (data?.items ?? data?.[key] ?? []));

// The backend's document statuses aren't guaranteed to match our keys exactly
// (e.g. "no_extractable_text", "FAILED: ..."), so match the exact key first, then by keyword.
function normalizeDocumentStatus(value) {
  const key = normalizeStatus(value);
  if (!key || STATUSES[key]) return key;
  if (key.includes("fail")) return "failed";
  if (key.includes("no_extractable")) return "no_extractable_text";
  if (key.includes("processed")) return "processed";
  if (key.includes("process") || key.includes("upload") || key.includes("queue") || key.includes("pending")) {
    return "processing";
  }
  return key;
}

function normalizeDocument(raw) {
  const title = raw.title ?? raw.filename ?? "Untitled document";
  return {
    id: raw.id ?? raw.document_id,
    title,
    type: fileExtension(title).slice(1),
    specialization: raw.specialization || "",
    status: normalizeDocumentStatus(raw.status),
    pages: Number.isFinite(raw.page_count ?? raw.pages) ? (raw.page_count ?? raw.pages) : null,
    createdAt: raw.created_at ?? raw.uploaded_at ?? null,
    error: raw.error ?? raw.error_message ?? "",
  };
}

function normalizeChunk(raw, position) {
  return {
    id: raw.id ?? raw.chunk_id ?? position,
    index: raw.chunk_index ?? raw.index ?? position + 1,
    page: raw.page ?? raw.page_number ?? null,
    section: raw.section ?? raw.section_title ?? "",
    text: raw.text ?? raw.content ?? raw.chunk_text ?? "",
  };
}

export async function listDocuments({ signal } = {}) {
  return toItems(await api("/tenantdocs", { signal }), "documents").map(normalizeDocument);
}

export function uploadDocument(file, { onProgress, signal } = {}) {
  const form = new FormData();
  form.append(UPLOAD_FIELD, file);
  return upload("/upload", form, { onProgress, signal });
}

export async function listChunks({ documentId, signal } = {}) {
  const data = await api(`/documents/${documentId}/chunks`, { signal });
  return toItems(data, "chunks").map(normalizeChunk);
}

// ⚠️ Files are served from a static /uploads path with NO login check, so anyone who can
// guess "{id}_{filename}" can open another organisation's file. Replace this with an
// authenticated endpoint that checks the tenant (see the security note in the hand-over).
export function documentFileUrl(doc) {
  return `${API_BASE_URL}/uploads/${doc.id}_${encodeURIComponent(doc.title)}`;
}
