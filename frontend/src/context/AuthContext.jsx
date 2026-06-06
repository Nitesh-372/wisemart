import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("wisemart_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("wisemart_token");
    if (!token) {
      setBooting(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem("wisemart_user", JSON.stringify(res.data.user));
      })
      .catch(() => logout())
      .finally(() => setBooting(false));
  }, []);

  async function login(email, password) {
    const res = await api.post("/auth/login", { email, password });
    persistSession(res.data.token, res.data.user);
    return res.data.user;
  }

  async function register(name, email, password) {
    const res = await api.post("/auth/register", { name, email, password });
    persistSession(res.data.token, res.data.user);
    return res.data.user;
  }

  function persistSession(token, nextUser) {
    localStorage.setItem("wisemart_token", token);
    localStorage.setItem("wisemart_user", JSON.stringify(nextUser));
    setUser(nextUser);
  }

  function logout() {
    localStorage.removeItem("wisemart_token");
    localStorage.removeItem("wisemart_user");
    setUser(null);
  }

  const value = useMemo(() => ({ user, booting, login, register, logout, isAuthenticated: Boolean(user) }), [user, booting]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
