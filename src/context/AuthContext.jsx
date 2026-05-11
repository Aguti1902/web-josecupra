import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

// ── Construye el objeto user desde datos de Supabase ──────────
function buildUser(authUser, profile) {
  if (profile) return { ...profile, email: authUser.email };
  const meta = authUser.user_metadata ?? {};
  const email = authUser.email ?? "";
  return {
    id: authUser.id,
    email,
    name: meta.name ?? email.split("@")[0],
    avatar: (meta.name ?? email)[0]?.toUpperCase() ?? "U",
    role: meta.role ?? (email === "jose@depro.es" ? "admin" : "player"),
    club: null,
    team: null,
  };
}

// ── Obtiene perfil extendido (puede ser null) ─────────────────
async function fetchProfile(userId) {
  try {
    const { data } = await supabase
      .from("profiles")
      .select(`
        id, name, avatar, role, team_role, plan,
        position, level, training_days, objective, age,
        club:clubs(id, name, abbreviation, login_code),
        team:teams(id, name)
      `)
      .eq("id", userId)
      .maybeSingle();
    return data ?? null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // Timeout de seguridad: si Supabase tarda más de 6s, desbloquea la app
    const timeout = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 6000);

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (cancelled) return;
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          if (!cancelled) setUser(buildUser(session.user, profile));
        }
      } catch (e) {
        console.error("Auth init error:", e);
      } finally {
        if (!cancelled) {
          clearTimeout(timeout);
          setLoading(false);
        }
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          const profile = await fetchProfile(session.user.id);
          setUser(buildUser(session.user, profile));
          setLoading(false);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }
      }
    );

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  // ── Login ──────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        // Mensajes de error más claros en español
        const msg =
          error.message.includes("Invalid login") ||
          error.message.includes("invalid_credentials")
            ? "Email o contraseña incorrectos"
            : error.message.includes("Email not confirmed")
            ? "Confirma tu email antes de entrar"
            : error.message;
        return { success: false, error: msg };
      }

      if (data?.user) {
        const profile = await fetchProfile(data.user.id);
        const u = buildUser(data.user, profile);
        setUser(u);
        return { success: true, role: u.role };
      }

      return { success: false, error: "No se pudo obtener el usuario" };
    } catch (e) {
      return { success: false, error: "Error de conexión. Inténtalo de nuevo." };
    }
  };

  // ── Logout ─────────────────────────────────────────────────
  const logout = async () => {
    try { await supabase.auth.signOut(); } catch {}
    setUser(null);
  };

  // ── Register ───────────────────────────────────────────────
  const register = async ({ email, password, name, role = "player", metadata = {} }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, role, ...metadata } },
      });
      if (error) return { success: false, error: error.message };
      return { success: true, user: data.user };
    } catch (e) {
      return { success: false, error: "Error al registrar" };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
