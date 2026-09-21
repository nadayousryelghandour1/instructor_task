import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, tokenStorage } from "../api/client";

const AuthContext = createContext(null);

function decodeToken(token) {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const data = JSON.parse(atob(payload));
    if (data.exp && data.exp * 1000 < Date.now()) return null; // انتهت صلاحيته
    return data; // user_id, tenant_id, role, exp
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(tokenStorage.get());
  const user = token ? decodeToken(token) : null;

  const login = useCallback(async (email, password) => {
    const data = await api("/login", { method: "POST", body: { email, password } });
    tokenStorage.set(data.access_token);
    setToken(data.access_token);
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setToken(null);
  }, []);

  // الـ api client بيبعت الحدث ده لما السيرفر يرجّع 401
  useEffect(() => {
    window.addEventListener("auth:logout", logout);
    return () => window.removeEventListener("auth:logout", logout);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);