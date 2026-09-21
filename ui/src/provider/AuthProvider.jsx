import { useCallback, useEffect, useMemo, useState } from "react";
import { api, tokenStorage } from "../api/client";
import { normalizeRole } from "../config/roles";
import { AuthContext } from "./useAuth";

// Reads the JWT payload for display only. The server is what enforces permissions.
function decodeToken(token) {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const claims = JSON.parse(atob(payload));
    if (claims.exp && claims.exp * 1000 < Date.now()) return null;
    return { ...claims, role: normalizeRole(claims.role) };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(tokenStorage.get());
  const user = useMemo(() => (token ? decodeToken(token) : null), [token]);

  const login = useCallback(async (email, password) => {
    const data = await api("/login", { method: "POST", body: { email, password } });
    tokenStorage.set(data.access_token);
    setToken(data.access_token);
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setToken(null);
  }, []);

  useEffect(() => {
    window.addEventListener("auth:logout", logout);
    return () => window.removeEventListener("auth:logout", logout);
  }, [logout]);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
