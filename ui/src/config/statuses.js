// One place that maps a status value to its label and badge colour.
export const STATUSES = {
  uploaded: { label: "Uploaded", tone: "info" },
  processing: { label: "Processing", tone: "warning" },
  processed: { label: "Processed", tone: "success" },
  failed: { label: "Failed", tone: "error" },
  waiting: { label: "Waiting", tone: "neutral" },
  running: { label: "Running", tone: "warning" },
  done: { label: "Done", tone: "success" },
  pending: { label: "Pending", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "error" },
};
