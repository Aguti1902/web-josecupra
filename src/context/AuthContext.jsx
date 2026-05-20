import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

// Carga los datos completos del club (incluyendo identity: logo, colores, slogan)
function loadClubDataFromStorage(meta, userEmail) {
  try {
    const clubId   = meta?.clubId;
    const teamId   = meta?.teamId;
    const teamRole = meta?.teamRole;
    if (!clubId && !userEmail) return { club: null, team: null, teamRole: null };

    const clubs = JSON.parse(localStorage.getItem("depro_clubs") || "[]");
    let baseClub = clubs.find((c) => c.id === clubId) || null;

    // Fallback: si el ID no coincide (bug de IDs desfasados), buscar por email
    // Solo para usuarios de club (tienen teamRole o role=club en meta)
    const isClubUser = !!teamRole || meta?.role === "club";
    if (!baseClub && userEmail && isClubUser) {
      const lc = userEmail.toLowerCase();
      if (!teamRole || teamRole === "coordinador") {
        // Buscar por email del coordinador
        baseClub = clubs.find((c) =>
          c.coordinator?.email?.toLowerCase() === lc
        ) || null;
      }
      if (!baseClub) {
        // Buscar por email de entrenador: primero en depro_clubs, luego en detalles
        baseClub = clubs.find((c) =>
          (c.teams || []).some((t) => t.coach?.email?.toLowerCase() === lc)
        ) || null;

        // Buscar en detalles de clubs (depro_club_*) en caso de que teams no estén sincronizados
        if (!baseClub) {
          for (const c of clubs) {
            try {
              const det = JSON.parse(localStorage.getItem(`depro_club_${c.id}`) || "null");
              if (det?.teams?.some((t) => t.coach?.email?.toLowerCase() === lc)) {
                baseClub = c;
                break;
              }
            } catch { /* ignore */ }
          }
        }
      }
    }

    const effectiveClubId = baseClub?.id || clubId;

    // Detalles enriquecidos: logo, colores, equipos, planes, status
    const clubDetail = JSON.parse(localStorage.getItem(`depro_club_${effectiveClubId}`) || "null");

    // Si no está en depro_clubs pero sí en el detalle, usamos el detalle como base
    const effectiveBase = baseClub || (clubDetail ? { id: effectiveClubId, ...clubDetail } : null);
    if (!effectiveBase) return { club: null, team: null, teamRole: null };

    const club = {
      ...effectiveBase,
      // Identidad visual — siempre prioriza el detalle (más actualizado)
      logo:           clubDetail?.logo           ?? effectiveBase.logo           ?? null,
      banner:         clubDetail?.banner         ?? effectiveBase.banner         ?? null,
      primaryColor:   clubDetail?.primaryColor   ?? effectiveBase.primaryColor   ?? "#0A36F7",
      secondaryColor: clubDetail?.secondaryColor ?? effectiveBase.secondaryColor ?? "#ffffff",
      slogan:         clubDetail?.slogan         ?? effectiveBase.slogan         ?? null,
      plans:          clubDetail?.plans          ?? [],
      teams:          clubDetail?.teams          ?? effectiveBase.teams          ?? [],
      status:         clubDetail?.status         ?? effectiveBase.status         ?? "activo",
    };

    // Buscar el equipo dentro de los datos combinados
    // Si el teamId no coincide, buscar también por email del coach en el equipo
    const ext      = JSON.parse(localStorage.getItem("depro_clubs_ext") || "{}");
    const allTeams = club.teams.length > 0 ? club.teams : ((ext[effectiveClubId] || {}).teams || []);
    let   team     = allTeams.find((t) => t.id === teamId) || null;
    if (!team && userEmail && teamRole && teamRole !== "coordinador") {
      const lc = userEmail.toLowerCase();
      team = allTeams.find((t) => t.coach?.email?.toLowerCase() === lc) || null;
    }

    return { club, team, teamRole };
  } catch {
    return { club: null, team: null, teamRole: null };
  }
}

// Carga el club de un jugador si ha introducido un código de club
function loadPlayerClubFromStorage(userId) {
  try {
    const raw = localStorage.getItem(`depro_player_club_${userId}`);
    if (!raw) return null;
    // Soportar formato antiguo (string) y nuevo ({ clubId, teamId })
    let clubId, teamId;
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "object") { clubId = parsed.clubId; teamId = parsed.teamId; }
      else clubId = parsed;
    } catch { clubId = raw; }
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
    let club = profile.club;   // Supabase solo devuelve: id, name, abbreviation, login_code
    let team = profile.team;
    let teamRole = profile.team_role;

    // Siempre enriquecer con la identidad visual guardada en localStorage
    // (logo, banner, primaryColor, secondaryColor, slogan, teams…)
    const clubId = club?.id || meta.clubId;
    if (clubId) {
      const stored = loadClubDataFromStorage({
        ...meta,
        clubId,
        teamId:   team?.id  || meta.teamId,
        teamRole: teamRole  || meta.teamRole,
      }, email);
      if (stored.club) {
        // Prioridad: localStorage para identidad visual (logo, colores, banner, slogan, teams)
        // Supabase para datos básicos (id, name, login_code, abbreviation)
        club = {
          ...club,       // base Supabase
          ...stored.club, // identidad localStorage (sobrescribe si existe)
          ...(club?.id   && { id:   club.id }),
          ...(club?.name && { name: club.name }),
        };
        team     = stored.team  || team;
        teamRole = stored.teamRole || teamRole;
      }
    }

    return {
      ...profile,
      email,
      club,
      team,
      team_role: teamRole,
      plan:      profile.plan      ?? meta.plan      ?? null,
      objetivo:  profile.objetivo  ?? meta.objetivo  ?? null,
      deporte:   profile.deporte   ?? meta.deporte   ?? null,
      frecuencia: profile.frecuencia ?? meta.frecuencia ?? null,
      material:  profile.material  ?? meta.material  ?? null,
      lesion:    profile.lesion    ?? meta.lesion    ?? [],
    };
  }

  // Usuario sin perfil en Supabase todavía — usar metadata
  const detectedRole = meta.role ?? (email === "jose@depro.es" ? "admin" : "player");
  const { club, team, teamRole } = loadClubDataFromStorage(meta, email);

  // Para jugadores: cargar club asociado por código si lo tienen
  const playerClub = (detectedRole === "player" && !club)
    ? loadPlayerClubFromStorage(authUser.id)
    : null;

  return {
    id: authUser.id,
    email,
    name:      meta.name      ?? email.split("@")[0],
    avatar:    (meta.name ?? email)[0]?.toUpperCase() ?? "U",
    role:      detectedRole,
    // Plan y datos del formulario de onboarding
    plan:      meta.plan      ?? null,
    objetivo:  meta.objetivo  ?? null,
    deporte:   meta.deporte   ?? null,
    frecuencia: meta.frecuencia ?? null,
    material:  meta.material  ?? null,
    lesion:    meta.lesion    ?? [],
    // Club
    team_role: meta.teamRole  ?? null,
    club:      club ?? playerClub,
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
          // Primero ponemos el usuario básico sin bloquear la UI
          const basic = buildUser(session.user, null);
          setUser(basic);
          setLoading(false);

          // Enriquecer con perfil de Supabase
          fetchProfile(session.user.id).then(async (profile) => {
            const builtUser = buildUser(session.user, profile || null);
            setUser(builtUser);

            // Si es usuario de club, sincronizar datos del club desde la API
            // para garantizar que teams/sesiones estén siempre actualizados (cross-device)
            const isClubUser = builtUser.role === "club" ||
              (session.user.user_metadata?.role === "club");
            if (isClubUser) {
              try {
                const res = await fetch("/api/admin-clubs");
                if (!res.ok) return;
                const data = await res.json();
                const clubs = (data.clubs || []).filter(
                  (c) => c.id && !["GLOBAL_PLANS","GLOBAL_TESTS","CATALOG_OVERRIDES"].includes(c.id)
                );
                if (!clubs.length) return;

                // Guardar en localStorage con las claves que usa AuthContext
                const summaries = clubs.map(({ id, name, abbreviation, login_code, coordinator, status, plan, city, country, primaryColor, secondaryColor, slogan, logo, banner }) =>
                  ({ id, name, abbreviation, login_code, coordinator, status, plan, city, country, primaryColor, secondaryColor, slogan, logo: logo ?? null, banner: banner ?? null })
                );
                localStorage.setItem("depro_clubs", JSON.stringify(summaries));
                for (const c of clubs) {
                  localStorage.setItem(`depro_club_${c.id}`, JSON.stringify(c));
                }

                // Reconstruir el usuario con los datos frescos
                const freshUser = buildUser(session.user, profile || null);
                setUser(freshUser);
              } catch { /* silencioso */ }
            }
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
      if (!session?.user) return;
      const basic = buildUser(session.user, null);
      setUser(basic);
      const profile = await fetchProfile(session.user.id);
      if (profile) setUser(buildUser(session.user, profile));
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
