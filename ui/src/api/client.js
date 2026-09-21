export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export const tokenStorage = {
  get: () => localStorage.getItem("access_token"),
  set: (token) => localStorage.setItem("access_token", token),
  clear: () => localStorage.removeItem("access_token"),
};

const url = (path) => `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

// FastAPI returns `detail` as a string, or as a list of objects for validation errors.
function toMessage(data, fallback) {
  const detail = data?.detail ?? data?.message;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => `${item.loc?.slice(1).join(".")}: ${item.msg}`).join(", ");
  }
  return fallback;
}

function buildError(status, data, fallback) {
  const message =
    typeof data === "string" ? data || fallback : toMessage(data, fallback);
  const error = new Error(message);
  error.status = status;
  return error;
}

// A 401 with a token means the session expired. Without a token it is just a failed login.
function expireSession() {
  tokenStorage.clear();
  window.dispatchEvent(new Event("auth:logout"));
}

export async function api(path, { method = "GET", body, headers = {}, signal } = {}) {
  const token = tokenStorage.get();
  const isForm = body instanceof FormData;

  const response = await fetch(url(path), {
    method,
    signal,
    headers: {
      ...(body !== undefined && !isForm ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  });

  if (response.status === 401 && token) expireSession();
  if (response.status === 204) return null;

  const isJson = (response.headers.get("content-type") || "").includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) throw buildError(response.status, data, "Request failed");
  return data;
}

// fetch() cannot report upload progress, so file uploads use XMLHttpRequest.
// Same token, base URL and error shape as api(), so callers handle both the same way.
export function upload(path, formData, { onProgress, signal } = {}) {
  return new Promise((resolve, reject) => {
    const token = tokenStorage.get();
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url(path));
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      const isJson = (xhr.getResponseHeader("content-type") || "").includes("application/json");
      let data = xhr.responseText;
      if (isJson) {
        try {
          data = JSON.parse(xhr.responseText);
        } catch {
          // keep the raw text
        }
      }
      if (xhr.status === 401 && token) expireSession();
      if (xhr.status >= 200 && xhr.status < 300) resolve(data);
      else reject(buildError(xhr.status, data, "Upload failed"));
    };
    xhr.onerror = () => reject(new Error("Cannot reach the server"));
    xhr.onabort = () => reject(new DOMException("Aborted", "AbortError"));
    signal?.addEventListener("abort", () => xhr.abort(), { once: true });

    xhr.send(formData);
  });
}
