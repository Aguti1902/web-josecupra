import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

// Carga los datos completos del club (incluyendo identity: logo, colores, slogan)
function loadClubDataFromStorage(meta) {
  try {
    const clubId = meta?.clubId;
    const teamId = meta?.teamId;
    const teamRole = meta?.teamRole;
    if (!clubId) return { club: null, team: null, teamRole: null };

    const clubs = JSON.parse(localStorage.getItem("depro_clubs") || "[]");
    const baseClub = clubs.find((c) => c.id === clubId) || null;

    // Cargar detalles enriquecidos (logo, colores, equipos, planes)
    const clubDetail = JSON.parse(localStorage.getItem(`depro_club_${clubId}`) || "null");

    // Unir datos base + identity desde clubDetail
    const club = baseClub
      ? {
          ...baseClub,
          logo:           clubDetail?.logo           ?? baseClub.logo,
          banner:         clubDetail?.banner         ?? baseClub.banner,
          primaryColor:   clubDetail?.primaryColor   ?? baseClub.primaryColor,
          secondaryColor: clubDetail?.secondaryColor ?? baseClub.secondaryColor,
          slogan:         clubDetail?.slogan          ?? baseClub.slogan,
          plans:          clubDetail?.plans           ?? [],
          teams:          clubDetail?.teams           ?? baseClub.teams ?? [],
          status:         clubDetail?.status          ?? baseClub.status ?? "activo",
        }
      : null;

    // Buscar el equipo dentro de los datos combinados
    const ext = JSON.parse(localStorage.getItem("depro_clubs_ext") || "{}");
    const allTeams = club?.teams || (ext[clubId] || {}).teams || [];
    const team = allTeams.find((t) => t.id === teamId) || null;

    return { club, team, teamRole };
  } catch {
    return { club: null, team: null, teamRole: null };
  }
}

// Carga el club de un jugador si ha introducido un código de club
function loadPlayerClubFromStorage(userId) {
  try {
    const clubId = localStorage.getItem(`depro_player_club_${userId}`);
    if (!clubId) return null;

    const clubs = JSON.parse(localStorage.getItem("depro_clubs") || "[]");
    const baseClub = clubs.find((c) => c.id === clubId) || null;
    if (!baseClub) return null;

    const clubDetail = JSON.parse(localStorage.getItem(`depro_club_${clubId}`) || "null");

    return {
      ...baseClub,
      logo:           clubDetail?.logo          ?? baseClub.logo,
      primaryColor:   clubDetail?.primaryColor  ?? baseClub.primaryColor,
      secondaryColor: clubDetail?.secondaryColor ?? baseClub.secondaryColor,
      slogan:         clubDetail?.slogan         ?? baseClub.slogan,
    };
  } catch {
    return null;
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
  const detectedRole = meta.role ?? (email === "jose@depro.es" ? "admin" : "player");
  const { club, team, teamRole } = loadClubDataFromStorage(meta);

  // Para jugadores: cargar club asociado por código si lo tienen
  const playerClub = (detectedRole === "player" && !club)
    ? loadPlayerClubFromStorage(authUser.id)
    : null;

  return {
    id: authUser.id,
    email,
    name: meta.name ?? email.split("@")[0],
    avatar: (meta.name ?? email)[0]?.toUpperCase() ?? "U",
    role: detectedRole,
    team_role: meta.teamRole ?? null,
    club: club ?? playerClub,
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

  // ── Refresh user (recargar datos sin nuevo login) ──────────
  const refreshUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const basic = buildUser(session.user, null);
        setUser(basic);
        fetchProfile(session.user.id).then((profile) => {
          if (profile) setUser(buildUser(session.user, profile));
        });
      }
    } catch {}
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
    <AuthContext.Provider value={{ user, loading, login, logout, register, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
