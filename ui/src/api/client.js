const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export const tokenStorage = {
  get: () => localStorage.getItem("access_token"),
  set: (token) => localStorage.setItem("access_token", token),
  clear: () => localStorage.removeItem("access_token"),
};

// FastAPI returns `detail` as a string, or as a list of objects for validation errors.
function toMessage(data, fallback) {
  const detail = data?.detail ?? data?.message;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((item) => item.msg).join(", ");
  return fallback;
}

export async function api(path, { method = "GET", body, headers = {}, signal } = {}) {
  const token = tokenStorage.get();
  const isForm = body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`, {
    method,
    signal,
    headers: {
      ...(body !== undefined && !isForm ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  });

  // A 401 with a token means the session expired. Without a token it is just a failed login.
  if (response.status === 401 && token) {
    tokenStorage.clear();
    window.dispatchEvent(new Event("auth:logout"));
  }

  if (response.status === 204) return null;

  const isJson = (response.headers.get("content-type") || "").includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "string" ? data || response.statusText : toMessage(data, "Request failed");
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return data;
}
