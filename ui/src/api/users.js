import { api } from "./client";
import { normalizeRole } from "../config/roles";

// POST /signup body: { name, email, password, tenant_id, role }.
const REGISTER_PATH = "/signup";

function normalizeUser(raw) {
  return {
    id: raw.id ?? raw.user_id,
    name: raw.full_name ?? raw.name ?? raw.email ?? "",
    email: raw.email ?? "",
    role: normalizeRole(raw.role),
    createdAt: raw.created_at ?? raw.createdAt ?? null,
  };
}

export async function listUsers({ tenantId, signal } = {}) {
  if (tenantId == null) {
    const error = new Error("Your session has no organisation. Sign out and sign in again.");
    error.status = 400;
    throw error;
  }
  const data = await api(`/tenantusers/${tenantId}`, { signal });
  const items = Array.isArray(data) ? data : (data?.items ?? data?.users ?? []);
  return items.map(normalizeUser);
}

export async function createUser({ fullName, email, password, role, tenantId }) {
  await api(REGISTER_PATH, {
    method: "POST",
    body: { name: fullName, email, password, tenant_id: tenantId, role },
  });
  // The signup response shape isn't guaranteed, so the table refreshes from GET instead.
  return { name: fullName, email };
}
