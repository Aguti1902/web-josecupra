import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

// Carga los datos del club y equipo desde localStorage usando los IDs guardados en user_metadata
function loadClubDataFromStorage(meta) {
  try {
    const clubId = meta?.clubId;
    const teamId = meta?.teamId;
    const teamRole = meta?.teamRole;
    if (!clubId) return { club: null, team: null, teamRole: null };

    const clubs = JSON.parse(localStorage.getItem("depro_clubs") || "[]");
    const club = clubs.find((c) => c.id === clubId) || null;

    // Buscar equipo dentro del club (en clubs_ext o en el propio club)
    const ext = JSON.parse(localStorage.getItem("depro_clubs_ext") || "{}");
    const clubExt = ext[clubId] || {};
    const teams = club?.teams || clubExt.teams || [];
    const team = teams.find((t) => t.id === teamId) || null;

    // Cargar planificación del club
    const clubDetail = JSON.parse(localStorage.getItem(`depro_club_${clubId}`) || "null");
    const plans = clubDetail?.plans || [];

    return { club: club ? { ...club, plans } : null, team, teamRole };
  } catch {
    return { club: null, team: null, teamRole: null };
  }
}

function buildUser(authUser, profile) {
  const meta = authUser.user_metadata ?? {};
  const email = authUser.email ?? "";

  if (profile) {
    // Si el perfil de Supabase no tiene club vinculado, buscar en localStorage
    let club = profile.club;
    let team = profile.team;
    let teamRole = profile.team_role;

    if (!club && meta.clubId) {
      const stored = loadClubDataFromStorage(meta);
      club = stored.club;
      team = stored.team;
      teamRole = stored.teamRole || teamRole;
    }

    return { ...profile, email, club, team, team_role: teamRole };
  }

  // Usuario sin perfil en Supabase todavía — usar metadata
  const { club, team, teamRole } = loadClubDataFromStorage(meta);
  return {
    id: authUser.id,
    email,
    name: meta.name ?? email.split("@")[0],
    avatar: (meta.name ?? email)[0]?.toUpperCase() ?? "U",
    role: meta.role ?? (email === "jose@depro.es" ? "admin" : "player"),
    team_role: meta.teamRole ?? null,
    club,
    team,
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
