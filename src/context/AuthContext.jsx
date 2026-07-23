import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { getCachedSubscription, isInTrial } from "../lib/subscription";
import { clearTrialLoadLogs } from "../lib/loadLogs";

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
  const cached = getCachedSubscription(authUser.id);

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
      // clubId "en crudo": disponible de forma síncrona (metadata), a diferencia de
      // `club` que depende de la sincronización async con localStorage/API. Se usa
      // para detectar altas de club pendientes sin falsos positivos por timing.
      clubId: meta.clubId || club?.id || null,
      clubName: meta.clubName || null,
      plan:      profile.plan      ?? meta.plan      ?? cached?.plan ?? null,
      objetivo:  profile.objetivo  ?? meta.objetivo  ?? null,
      objetivoSecundario: profile.objetivoSecundario ?? meta.objetivoSecundario ?? null,
      objetivos: profile.objetivos ?? meta.objetivos ?? (meta.objetivoSecundario ? [meta.objetivo, meta.objetivoSecundario].filter(Boolean) : meta.objetivo ? [meta.objetivo] : []),
      deporte:   profile.deporte   ?? meta.deporte   ?? null,
      frecuencia: profile.frecuencia ?? meta.frecuencia ?? null,
      material:  profile.material  ?? meta.material  ?? null,
      lesion:    profile.lesion    ?? meta.lesion    ?? [],
      lesionSubtipo: profile.lesionSubtipo ?? meta.lesionSubtipo ?? [],
      experiencia: profile.experiencia ?? meta.experiencia ?? null,
      diaCompeticion: profile.diaCompeticion ?? meta.diaCompeticion ?? null,
      disponibles: profile.disponibles ?? meta.disponibles ?? [],
      managedTeamIds: meta.managedTeamIds ?? profile.managedTeamIds ?? [],
      edad: profile.age ?? meta.edad ?? null,
      posicion: profile.position ?? meta.posicion ?? null,
      subscriptionStatus: meta.subscriptionStatus ?? cached?.status ?? null,
      subscriptionCancelAt: meta.subscriptionCancelAt ?? null,
      trialEndsAt: meta.trialEndsAt ?? cached?.trialEndsAt ?? null,
      billingSource: meta.billingSource ?? cached?.billingSource ?? null,
      stripeSubscriptionId: meta.stripeSubscriptionId ?? cached?.stripeSubscriptionId ?? null,
      stripeCustomerId: meta.stripeCustomerId ?? null,
      purchasedAddons: meta.purchasedAddons ?? cached?.purchasedAddons ?? [],
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
    plan:      meta.plan      ?? cached?.plan ?? null,
    objetivo:  meta.objetivo  ?? null,
    objetivoSecundario: meta.objetivoSecundario ?? null,
    objetivos: meta.objetivos ?? (meta.objetivoSecundario ? [meta.objetivo, meta.objetivoSecundario].filter(Boolean) : meta.objetivo ? [meta.objetivo] : []),
    deporte:   meta.deporte   ?? null,
    frecuencia: meta.frecuencia ?? null,
    material:  meta.material  ?? null,
    lesion:    meta.lesion    ?? [],
    lesionSubtipo: meta.lesionSubtipo ?? [],
    experiencia: meta.experiencia ?? null,
    diaCompeticion: meta.diaCompeticion ?? null,
    disponibles: meta.disponibles ?? [],
    edad:      meta.edad      ?? null,
    posicion:  meta.posicion  ?? null,
    managedTeamIds: meta.managedTeamIds ?? [],
    // Club
    team_role: meta.teamRole  ?? null,
    club:      club ?? playerClub,
    team,
    clubId:    meta.clubId || club?.id || playerClub?.id || null,
    clubName:  meta.clubName || null,
    subscriptionStatus: meta.subscriptionStatus ?? cached?.status ?? null,
    subscriptionCancelAt: meta.subscriptionCancelAt ?? null,
    trialEndsAt: meta.trialEndsAt ?? cached?.trialEndsAt ?? null,
    billingSource: meta.billingSource ?? cached?.billingSource ?? null,
    stripeSubscriptionId: meta.stripeSubscriptionId ?? cached?.stripeSubscriptionId ?? null,
    stripeCustomerId: meta.stripeCustomerId ?? null,
    purchasedAddons: meta.purchasedAddons ?? cached?.purchasedAddons ?? [],
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

            if (builtUser.role === "player") {
              import("../lib/playerPlanEngine").then(({ ensurePlayerPlan }) => {
                const pending = sessionStorage.getItem("depro_pending_plan_user");
                if (pending === builtUser.id) {
                  localStorage.removeItem(`depro_plan_${builtUser.id}`);
                  sessionStorage.removeItem("depro_pending_plan_user");
                }
                ensurePlayerPlan(builtUser);
              }).catch(() => {});
            }

            // Si es usuario de club, sincronizar datos del club desde la API
            // para garantizar que teams/sesiones estén siempre actualizados (cross-device)
            const isClubUser = builtUser.role === "club" ||
              (session.user.user_metadata?.role === "club");
            if (isClubUser) {
              try {
                const res = await fetch("/api/admin-clubs");
                if (res.ok) {
                  const data = await res.json();
                  const clubs = (data.clubs || []).filter(
                    (c) => c.id && !["GLOBAL_PLANS","GLOBAL_TESTS","CATALOG_OVERRIDES"].includes(c.id)
                  );
                  if (clubs.length > 0) {
                    // Fusionar con localStorage preservando logo/colores locales si la API no los tiene
                    const existingLocal = JSON.parse(localStorage.getItem("depro_clubs") || "[]");
                    const mergedSummaries = clubs.map((remote) => {
                      const local = existingLocal.find((c) => c.id === remote.id);
                      const base = local ? { ...local, ...remote } : remote;
                      return {
                        id: base.id, name: base.name, abbreviation: base.abbreviation,
                        login_code: base.login_code, coordinator: base.coordinator,
                        status: base.status, plan: base.plan, city: base.city,
                        country: base.country,
                        primaryColor:   remote.primaryColor   ?? local?.primaryColor   ?? null,
                        secondaryColor: remote.secondaryColor ?? local?.secondaryColor ?? null,
                        slogan:         remote.slogan         ?? local?.slogan         ?? null,
                        logo:           remote.logo           ?? local?.logo           ?? null,
                        banner:         remote.banner         ?? local?.banner         ?? null,
                      };
                    });
                    localStorage.setItem("depro_clubs", JSON.stringify(mergedSummaries));
                    for (const c of clubs) {
                      const localDetail = JSON.parse(localStorage.getItem(`depro_club_${c.id}`) || "null");
                      // Fusionar: la API es fuente de verdad, pero preservar logo/banner/colores locales
                      const merged = localDetail
                        ? {
                            ...localDetail, ...c,
                            logo:           c.logo           ?? localDetail.logo           ?? null,
                            banner:         c.banner         ?? localDetail.banner         ?? null,
                            primaryColor:   c.primaryColor   ?? localDetail.primaryColor   ?? null,
                            secondaryColor: c.secondaryColor ?? localDetail.secondaryColor ?? null,
                            slogan:         c.slogan         ?? localDetail.slogan         ?? null,
                            teams:          (c.teams?.length > 0 ? c.teams : null) ?? localDetail.teams ?? [],
                          }
                        : c;
                      localStorage.setItem(`depro_club_${c.id}`, JSON.stringify(merged));
                    }
                    const freshUser = buildUser(session.user, profile || null);
                    setUser(freshUser);
                    return;
                  }
                }
                // Si la API falla o está vacía, intentar construir usuario con meta.clubId aunque
                // no haya datos en localStorage (muestra UI sin datos pero con rol correcto)
                const meta = session.user.user_metadata ?? {};
                if (meta.clubId && !builtUser.club) {
                  const minimalClub = { id: meta.clubId, name: "Mi Club", teams: [], plans: [] };
                  localStorage.setItem(`depro_club_${meta.clubId}`, JSON.stringify(minimalClub));
                  const local = JSON.parse(localStorage.getItem("depro_clubs") || "[]");
                  if (!local.find((c) => c.id === meta.clubId)) {
                    local.unshift(minimalClub);
                    localStorage.setItem("depro_clubs", JSON.stringify(local));
                  }
                  const fallbackUser = buildUser(session.user, profile || null);
                  setUser(fallbackUser);
                }
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

  // ── Login con Google (OAuth) ───────────────────────────────
  const loginWithGoogle = async (redirectTo) => {
    try {
      const target = redirectTo || `${window.location.origin}/login`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: target,
          queryParams: { access_type: "online", prompt: "select_account" },
        },
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch {
      return { success: false, error: "Error al conectar con Google. Comprueba que Google OAuth esté activado en Supabase." };
    }
  };

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
      await supabase.auth.refreshSession();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const basic = buildUser(session.user, null);
      setUser(basic);
      const profile = await fetchProfile(session.user.id);
      if (profile) setUser(buildUser(session.user, profile));
    } catch {}
  };

  // ── Recuperación de contraseña ─────────────────────────────
  const resetPasswordForEmail = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/restablecer-contrasena`,
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch {
      return { success: false, error: "Error de red. Inténtalo de nuevo." };
    }
  };

  const updatePassword = async (password) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch {
      return { success: false, error: "No se pudo actualizar la contraseña" };
    }
  };

  const recoverSessionFromHash = async () => {
    try {
      if (window.location.hash.includes("access_token") || window.location.hash.includes("type=recovery")) {
        await new Promise((r) => setTimeout(r, 300));
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          window.history.replaceState(null, "", window.location.pathname);
          return true;
        }
      }
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch {
      return false;
    }
  };

  // ── Logout ─────────────────────────────────────────────────
  const logout = async () => {
    try {
      if (user?.id && isInTrial(user)) {
        clearTrialLoadLogs(user.id);
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith(`depro_progress_${user.id}`) || key.startsWith(`depro_chat_${user.id}`)) {
            localStorage.removeItem(key);
          }
        });
      }
      await supabase.auth.signOut();
    } catch {}
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
    <AuthContext.Provider value={{
      user, loading, login, loginWithGoogle, logout, register, refreshUser,
      resetPasswordForEmail, updatePassword, recoverSessionFromHash,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
