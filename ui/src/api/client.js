const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const tokenStorage = {
  get() {
    return localStorage.getItem("access_token");
  },
  set(token) {
    localStorage.setItem("access_token", token);
  },
  clear() {
    localStorage.removeItem("access_token");
  },
};

export async function api(path, { method = "GET", body, headers = {} } = {}) {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const token = tokenStorage.get();

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.detail || data?.message || "Request failed";

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}
