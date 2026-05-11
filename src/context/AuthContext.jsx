import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

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
    // ── Patrón recomendado Supabase v2: onAuthStateChange maneja TODO,
    //    incluido INITIAL_SESSION que restaura la sesión al recargar.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // No hacemos await de fetchProfile aquí para no bloquear el evento;
          // primero ponemos el usuario básico y luego enriquecemos con el perfil.
          const basic = buildUser(session.user, null);
          setUser(basic);
          setLoading(false);

          // Enriquecer con datos de la tabla profiles (no bloquea la UI)
          fetchProfile(session.user.id).then((profile) => {
            if (profile) setUser(buildUser(session.user, profile));
          });
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    // Safety net: si Supabase tarda más de 5s en emitir INITIAL_SESSION
    const timeout = setTimeout(() => setLoading(false), 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
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
        const msg =
          error.message.includes("Invalid login") ||
          error.message.includes("invalid_credentials")
            ? "Email o contraseña incorrectos"
            : error.message.includes("Email not confirmed")
            ? "Confirma tu email antes de entrar"
            : error.message;
        return { success: false, error: msg };
      }

      // onAuthStateChange → SIGNED_IN disparará setUser automáticamente
      const role =
        data?.user?.email === "jose@depro.es"
          ? "admin"
          : (data?.user?.user_metadata?.role ?? "player");

      return { success: true, role };
    } catch {
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
    } catch {
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
