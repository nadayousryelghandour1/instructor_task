// Add an extension here only if the backend can really extract text from it.
export const ACCEPTED_EXTENSIONS = [".pdf", ".pptx", ".docx"];

// ⚠️ Keep this equal to the limit the server enforces. The check here is only a courtesy.
export const MAX_UPLOAD_MB = 50;

// While any document is still being processed the list refreshes on this interval.
export const POLL_INTERVAL_MS = 4000;
export const MAX_POLLS = 150; // stops after ~10 minutes so a stuck status can't poll forever

export const CHUNKS_PAGE_SIZE = 50;
