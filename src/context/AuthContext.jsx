import { createContext, useContext, useState, useEffect } from "react";
import { clients } from "../data/mockData";

const ADMIN_USER = {
  id: 0,
  name: "Jose (Admin)",
  email: "jose@admin.com",
  password: "admin123",
  role: "admin",
  avatar: "JA",
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("footballapp_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("footballapp_user");
      }
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Check admin first
    if (email === ADMIN_USER.email && password === ADMIN_USER.password) {
      const safeAdmin = { ...ADMIN_USER };
      delete safeAdmin.password;
      setUser(safeAdmin);
      localStorage.setItem("footballapp_user", JSON.stringify(safeAdmin));
      return { success: true };
    }
    const found = clients.find(
      (c) => c.email === email && c.password === password
    );
    if (found) {
      const safeUser = { ...found };
      delete safeUser.password;
      setUser(safeUser);
      localStorage.setItem("footballapp_user", JSON.stringify(safeUser));
      return { success: true };
    }
    return { success: false, error: "Invalid email or password" };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("footballapp_user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
