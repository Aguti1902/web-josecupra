import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { clients } from "../data/mockData";

const AuthContext = createContext(null);

// ── Fallback mock cuando Supabase no está configurado ──────────
const SUPABASE_READY =
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_URL !== "" &&
  !import.meta.env.VITE_SUPABASE_URL.includes("placeholder");

const ADMIN_MOCK = {
  id: 0, name: "Jose (Admin)", email: "jose@admin.com",
  password: "admin123", role: "admin", avatar: "JA",
};

// ── Helpers ────────────────────────────────────────────────────
function buildUser(authUser, profile) {
  // Si hay fila en profiles la usamos; si no, construimos un usuario mínimo
  if (profile) {
    return { ...profile, email: authUser.email };
  }
  // Fallback: el email es jose@depro.es → rol admin
  const meta = authUser.user_metadata ?? {};
  return {
    id: authUser.id,
    email: authUser.email,
    name: meta.name ?? authUser.email.split("@")[0],
    avatar: (meta.name ?? authUser.email)[0].toUpperCase(),
    role: meta.role ?? (authUser.email === "jose@depro.es" ? "admin" : "player"),
    club: null,
    team: null,
  };
}
async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id, name, avatar, role, team_role, plan,
      position, level, training_days, objective, age,
      club:clubs(id, name, abbreviation, login_code),
      team:teams(id, name)
    `)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.warn("fetchProfile error:", error.message);
    return null;
  }
  return data;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!SUPABASE_READY) {
      // Modo mock: leer del localStorage
      const stored = localStorage.getItem("footballapp_user");
      if (stored) {
        try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem("footballapp_user"); }
      }
      setLoading(false);
      return;
    }

    // Modo Supabase real
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(buildUser(session.user, profile));
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(buildUser(session.user, profile));
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Login ──────────────────────────────────────────────────
  const login = async (email, password) => {
    if (!SUPABASE_READY) {
      // Fallback mock
      if (email === ADMIN_MOCK.email && password === ADMIN_MOCK.password) {
        const u = { ...ADMIN_MOCK }; delete u.password;
        setUser(u); localStorage.setItem("footballapp_user", JSON.stringify(u));
        return { success: true };
      }
      const found = clients.find((c) => c.email === email && c.password === password);
      if (found) {
        const u = { ...found }; delete u.password;
        setUser(u); localStorage.setItem("footballapp_user", JSON.stringify(u));
        return { success: true };
      }
      return { success: false, error: "Email o contraseña incorrectos" };
    }

    // Supabase real
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    // onAuthStateChange se encargará de setUser, pero forzamos aquí también
    // por si el evento llega tarde (ej. primera carga en Vercel)
    if (data?.user) {
      const profile = await fetchProfile(data.user.id);
      setUser(buildUser(data.user, profile));
    }
    return { success: true };
  };

  // ── Logout ─────────────────────────────────────────────────
  const logout = async () => {
    if (!SUPABASE_READY) {
      setUser(null);
      localStorage.removeItem("footballapp_user");
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
  };

  // ── Register (jugador nuevo desde /comprar) ─────────────────
  const register = async ({ email, password, name, role = "player", metadata = {} }) => {
    if (!SUPABASE_READY) return { success: false, error: "Supabase no configurado" };

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role, ...metadata },
      },
    });
    if (error) return { success: false, error: error.message };
    return { success: true, user: data.user };
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, supabaseReady: SUPABASE_READY }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
