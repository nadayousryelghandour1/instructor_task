// One place that maps a status value to its label and badge colour.
// `active: true` means "still in progress", so screens keep refreshing until it changes.
export const STATUSES = {
  uploading: { label: "Uploading", tone: "info", active: true },
  uploaded: { label: "Uploaded", tone: "info", active: true },
  queued: { label: "Queued", tone: "neutral", active: true },
  pending: { label: "Pending", tone: "warning", active: true },
  processing: { label: "Processing", tone: "warning", active: true },
  running: { label: "Running", tone: "warning", active: true },
  in_progress: { label: "In progress", tone: "warning", active: true },
  waiting: { label: "Waiting", tone: "neutral" },
  processed: { label: "Processed", tone: "success" },
  completed: { label: "Completed", tone: "success" },
  done: { label: "Done", tone: "success" },
  approved: { label: "Approved", tone: "success" },
  pending_approval: { label: "Pending approval", tone: "warning" },
  awaiting_approval: { label: "Awaiting approval", tone: "warning" },
  no_extractable_text: { label: "No text extracted", tone: "neutral" },
  failed: { label: "Failed", tone: "error" },
  error: { label: "Error", tone: "error" },
  rejected: { label: "Rejected", tone: "error" },
};

// "In Progress", "in-progress" and "in_progress" all become "in_progress".
export function normalizeStatus(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

export const isActiveStatus = (status) => Boolean(STATUSES[normalizeStatus(status)]?.active);
export const isErrorStatus = (status) => STATUSES[normalizeStatus(status)]?.tone === "error";
export const isSuccessStatus = (status) => STATUSES[normalizeStatus(status)]?.tone === "success";

export function statusLabel(status) {
  const key = normalizeStatus(status);
  if (STATUSES[key]) return STATUSES[key].label;
  return key ? key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ") : "Unknown";
}
