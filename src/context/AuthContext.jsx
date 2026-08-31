import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { getCachedSubscription, isInTrial } from "../lib/subscription";
import { shouldBlockAccountLogin } from "../lib/adminAccountStatus";
import { clearTrialLoadLogs } from "../lib/loadLogs";
import { clearWellnessLogs } from "../lib/wellnessLogs";
import {
  normalizeStringList,
  resolveObjetivos,
  resolveEdad,
  normalizeFrecuencia,
} from "../lib/playerTrainingProfile";
import { getImpersonationSnapshot, stopImpersonation, isRealAdminUser } from "../lib/adminImpersonation";
import { parseCoachAutoFromMeta, isProCoachUser } from "../lib/clubAuto/clubAutoCoachBridge";
import { isSessionPresenceEvent, isSignedOutEvent } from "../lib/authSession";
import { applyPurgedPlayersToStorage, filterPurgedFromList } from "../lib/clubPlayerPurge";
import { reclaimLocalStorage, isQuotaError } from "../lib/storageQuota";
import { isMetaClubId } from "../lib/adminGlobalBlobs";

const AuthContext = createContext(null);

function mergeClubTeams(remoteTeams, localTeams, purgedPlayers = []) {
  const local = Array.isArray(localTeams) ? localTeams : [];
  const remote = Array.isArray(remoteTeams) && remoteTeams.length ? remoteTeams : null;
  const base = remote || local;
  return base.map((rt) => {
    const lt = local.find((t) => t.id === rt.id);
    const squad = Array.isArray(rt.squad) ? rt.squad : (lt?.squad || []);
    return {
      ...lt,
      ...rt,
      squad: filterPurgedFromList(squad, purgedPlayers),
    };
  });
}

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
    const isClubUser = !!teamRole || meta?.role === "club" || meta?.role === "coach" || meta?.isSoloCoach;
    if (!baseClub && userEmail && isClubUser) {
      const lc = userEmail.toLowerCase();
      if (!teamRole || teamRole === "coordinador" || teamRole === "administrador") {
        // Buscar por email del administrador/coordinador
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
      ...(clubDetail || {}),
      id: effectiveBase.id,
      // Identidad visual — siempre prioriza el detalle (más actualizado)
      logo:           clubDetail?.logo           ?? effectiveBase.logo           ?? null,
      banner:         clubDetail?.banner         ?? effectiveBase.banner         ?? null,
      primaryColor:   clubDetail?.primaryColor   ?? effectiveBase.primaryColor   ?? "#0A36F7",
      secondaryColor: clubDetail?.secondaryColor ?? effectiveBase.secondaryColor ?? "#ffffff",
      slogan:         clubDetail?.slogan         ?? effectiveBase.slogan         ?? null,
      plans:          clubDetail?.plans          ?? effectiveBase.plans          ?? [],
      teams:          clubDetail?.teams          ?? effectiveBase.teams          ?? [],
      status:         clubDetail?.status         ?? effectiveBase.status         ?? "activo",
      coachConfig:    clubDetail?.coachConfig    ?? effectiveBase.coachConfig    ?? null,
      planningMode:   clubDetail?.planningMode   ?? effectiveBase.planningMode   ?? null,
      origen:         clubDetail?.origen         ?? effectiveBase.origen         ?? null,
      mode:           clubDetail?.mode           ?? effectiveBase.mode           ?? null,
      isSoloCoach: !!(
        clubDetail?.isSoloCoach
        || effectiveBase.isSoloCoach
        || meta?.isSoloCoach
        || String(effectiveClubId || "").startsWith("coach_")
      ),
      manualPrice:    clubDetail?.manualPrice    ?? effectiveBase.manualPrice    ?? null,
    };

    // Buscar el equipo dentro de los datos combinados
    // Si el teamId no coincide, buscar también por email del coach en el equipo
    const ext      = JSON.parse(localStorage.getItem("depro_clubs_ext") || "{}");
    const allTeams = club.teams.length > 0 ? club.teams : ((ext[effectiveClubId] || {}).teams || []);
    let   team     = allTeams.find((t) => t.id === teamId) || null;
    if (!team && userEmail && teamRole && !["coordinador", "administrador"].includes(teamRole)) {
      const lc = userEmail.toLowerCase();
      team = allTeams.find((t) => t.coach?.email?.toLowerCase() === lc) || null;
    }
    if (!team && allTeams.length > 0 && club.isSoloCoach) {
      team = allTeams[0];
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
      logo:           clubDetail?.logo           ?? baseClub.logo           ?? null,
      banner:         clubDetail?.banner         ?? baseClub.banner         ?? null,
      primaryColor:   clubDetail?.primaryColor   ?? baseClub.primaryColor,
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

    const resolvedRole =
      email === "jose@depro.es" || meta.role === "admin" || profile.role === "admin"
        ? "admin"
        : (profile.role ?? meta.role ?? "player");

    return {
      ...profile,
      email,
      role: resolvedRole,
      club,
      team,
      team_role: teamRole,
      // clubId "en crudo": disponible de forma síncrona (metadata), a diferencia de
      // `club` que depende de la sincronización async con localStorage/API. Se usa
      // para detectar altas de club pendientes sin falsos positivos por timing.
      clubId: meta.clubId || club?.id || null,
      clubName: meta.clubName || null,
      plan:      profile.plan      ?? meta.plan      ?? cached?.plan ?? null,
      objetivo:  profile.objetivo ?? profile.objective ?? meta.objetivo ?? null,
      objetivoSecundario: profile.objetivoSecundario ?? meta.objetivoSecundario ?? null,
      objetivos: resolveObjetivos({
        objetivos: profile.objetivos ?? meta.objetivos,
        objetivo: profile.objetivo ?? profile.objective ?? meta.objetivo,
        objective: profile.objective,
        objetivoSecundario: profile.objetivoSecundario ?? meta.objetivoSecundario,
      }),
      deporte:   profile.deporte   ?? meta.deporte   ?? null,
      frecuencia: normalizeFrecuencia(profile.frecuencia ?? meta.frecuencia) || (profile.frecuencia ?? meta.frecuencia ?? null),
      material:  normalizeStringList(profile.material ?? meta.material),
      lesion:    normalizeStringList(profile.lesion ?? meta.lesion),
      lesionSubtipo: normalizeStringList(profile.lesionSubtipo ?? meta.lesionSubtipo),
      experiencia: profile.experiencia ?? meta.experiencia ?? null,
      diaCompeticion: profile.diaCompeticion ?? meta.diaCompeticion ?? null,
      disponibles: normalizeStringList(profile.disponibles ?? meta.disponibles),
      managedTeamIds: meta.managedTeamIds ?? profile.managedTeamIds ?? [],
      edad: resolveEdad({ edad: profile.edad ?? meta.edad, age: profile.age }) || null,
      phone: profile.phone ?? meta.phone ?? meta.telefono ?? null,
      telefono: profile.telefono ?? meta.telefono ?? meta.phone ?? null,
      posicion: profile.position ?? meta.posicion ?? null,
      subscriptionStatus: meta.subscriptionStatus ?? cached?.status ?? null,
      subscriptionCancelAt: meta.subscriptionCancelAt ?? null,
      trialEndsAt: meta.trialEndsAt ?? cached?.trialEndsAt ?? null,
      billingSource: meta.billingSource ?? cached?.billingSource ?? null,
      stripeSubscriptionId: meta.stripeSubscriptionId ?? cached?.stripeSubscriptionId ?? null,
      stripeCustomerId: meta.stripeCustomerId ?? null,
      purchasedAddons: meta.purchasedAddons ?? cached?.purchasedAddons ?? [],
      pendingPayment: meta.pendingPayment === true
        && !["active", "trialing"].includes(String(meta.subscriptionStatus || "")),
      manualPrice: meta.manualPrice ?? cached?.manualPrice ?? null,
      coachAuto: parseCoachAutoFromMeta(meta.coachAuto),
      isSoloCoach: isProCoachUser({
        ...profile,
        role: resolvedRole,
        club,
        clubId: meta.clubId || club?.id || null,
        plan: profile.plan ?? meta.plan ?? cached?.plan ?? null,
        isSoloCoach: meta.isSoloCoach || club?.isSoloCoach,
      }),
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
    objetivos: resolveObjetivos(meta),
    deporte:   meta.deporte   ?? null,
    frecuencia: normalizeFrecuencia(meta.frecuencia) || meta.frecuencia || null,
    material:  normalizeStringList(meta.material),
    lesion:    normalizeStringList(meta.lesion),
    lesionSubtipo: normalizeStringList(meta.lesionSubtipo),
    experiencia: meta.experiencia ?? null,
    diaCompeticion: meta.diaCompeticion ?? null,
    disponibles: normalizeStringList(meta.disponibles),
    edad:      resolveEdad(meta) || null,
    phone:     meta.phone ?? meta.telefono ?? null,
    telefono:  meta.telefono ?? meta.phone ?? null,
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
    pendingPayment: meta.pendingPayment === true
      && !["active", "trialing"].includes(String(meta.subscriptionStatus || "")),
    manualPrice: meta.manualPrice ?? cached?.manualPrice ?? null,
    coachAuto: parseCoachAutoFromMeta(meta.coachAuto),
    isSoloCoach: isProCoachUser({
      role: detectedRole,
      club,
      clubId: meta.clubId || club?.id || playerClub?.id || null,
      plan: meta.plan ?? cached?.plan ?? null,
      isSoloCoach: meta.isSoloCoach || club?.isSoloCoach,
    }),
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

function minimalUserFromAuth(authUser) {
  const meta = authUser?.user_metadata || {};
  const email = authUser?.email || "";
  return {
    id: authUser?.id,
    email,
    name: meta.name || email.split("@")[0] || "Usuario",
    avatar: (meta.name || email || "U")[0]?.toUpperCase() || "U",
    role: email === "jose@depro.es" ? "admin" : (meta.role || "player"),
    plan: meta.plan || null,
    phone: meta.phone || meta.telefono || null,
    telefono: meta.telefono || meta.phone || null,
    subscriptionStatus: meta.subscriptionStatus || null,
    hasAssignedPlan: meta.hasAssignedPlan === true,
  };
}

function hydrateUserFromAuth(authUser) {
  try {
    return withImpersonation(buildUser(authUser, null));
  } catch (err) {
    console.error("[auth] buildUser failed", err);
    if (isQuotaError(err)) {
      try { reclaimLocalStorage({ aggressive: true }); } catch { /* cupo */ }
      try {
        return withImpersonation(buildUser(authUser, null));
      } catch { /* fallback mínimo */ }
    }
    return withImpersonation(minimalUserFromAuth(authUser));
  }
}

function sessionIsDraftBlocked(authUser) {
  if (!authUser) return false;
  if (getImpersonationSnapshot()) return false;
  const meta = authUser.user_metadata || {};
  const role = meta.role || (String(authUser.email || "").toLowerCase() === "jose@depro.es" ? "admin" : "player");
  return shouldBlockAccountLogin({
    role,
    email: authUser.email,
    subscriptionStatus: meta.subscriptionStatus,
  });
}

function snapshotToAuthUser(snap) {
  const isCoach = snap.type === "coach" || snap.type === "coach_pending" || snap.isSoloCoach || String(snap.clubId || "").startsWith("coach_");
  const role = snap.role
    || (snap.type === "player" ? "player" : isCoach ? "coach" : "club");
  return {
    id: snap.id,
    email: snap.email,
    user_metadata: {
      name: snap.name,
      role,
      teamRole: snap.teamRole,
      clubId: snap.clubId,
      clubName: snap.clubName,
      plan: snap.plan,
      subscriptionStatus: snap.subscriptionStatus,
      billingSource: snap.billingSource,
      purchasedAddons: snap.purchasedAddons || [],
      trialEndsAt: snap.trialEndsAt,
      stripeSubscriptionId: snap.stripeSubscriptionId,
      stripeCustomerId: snap.stripeCustomerId,
      posicion: snap.posicion,
      deporte: snap.deporte,
      objetivo: snap.objetivo,
      objetivos: snap.objetivos,
      frecuencia: snap.frecuencia,
      material: snap.material,
      experiencia: snap.experiencia,
      diaCompeticion: snap.diaCompeticion,
      disponibles: snap.disponibles,
      lesion: snap.lesion,
      lesionSubtipo: snap.lesionSubtipo,
      edad: snap.edad,
      phone: snap.phone,
      telefono: snap.telefono,
      isSoloCoach: isCoach,
      managedTeamIds: snap.managedTeamIds || [],
      teamId: snap.teamId,
      coachAuto: snap.coachAuto || "",
      pendingPayment: false,
    },
  };
}

function withImpersonation(realUser) {
  const snap = getImpersonationSnapshot();
  if (!snap || !realUser || !isRealAdminUser(realUser)) return realUser;
  const built = buildUser(snapshotToAuthUser(snap), null);
  const isCoach = snap.type === "coach" || snap.isSoloCoach || String(snap.clubId || "").startsWith("coach_");
  const clubId = snap.clubId || built.clubId || built.club?.id;
  let club = built.club;
  if (clubId && !club) {
    try {
      const stored = JSON.parse(localStorage.getItem(`depro_club_${clubId}`) || "null");
      club = stored || {
        id: clubId,
        name: snap.clubName || (isCoach ? "DEPRO Coach" : "Club"),
        teams: snap.teamId ? [{ id: snap.teamId, name: "Mi equipo" }] : [],
      };
    } catch {
      club = {
        id: clubId,
        name: snap.clubName || (isCoach ? "DEPRO Coach" : "Club"),
        teams: snap.teamId ? [{ id: snap.teamId, name: "Mi equipo" }] : [],
      };
    }
  }
  if (isCoach) {
    const base = club || { id: clubId, name: snap.clubName || "DEPRO Coach", teams: [] };
    const teams = base.teams?.length
      ? base.teams
      : (snap.teamId ? [{ id: snap.teamId, name: "Mi equipo" }] : []);
    club = { ...base, teams, isSoloCoach: true };
  }
  return {
    ...built,
    club,
    clubId: clubId || built.clubId || null,
    pendingPayment: false,
    impersonating: true,
    impersonatedFrom: { id: realUser.id, email: realUser.email, name: realUser.name },
  };
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let enrichForId = "";
    let hasLiveSession = false;

    const applySession = (session, { signedOut = false, enrich = true } = {}) => {
      if (cancelled) return;
      if (signedOut) {
        hasLiveSession = false;
        enrichForId = "";
        setUser(null);
        setLoading(false);
        return;
      }
      if (!session?.user) {
        // getSession() a veces llega vacío un instante antes de INITIAL_SESSION.
        // No borres una sesión ya restaurada.
        if (!hasLiveSession) setLoading(false);
        return;
      }
      hasLiveSession = true;
      if (sessionIsDraftBlocked(session.user)) {
        setUser(null);
        setLoading(false);
        // Fuera del callback de auth: await signOut() bloquea el lock de supabase-js.
        setTimeout(() => { supabase.auth.signOut().catch(() => {}); }, 0);
        return;
      }
      setUser(hydrateUserFromAuth(session.user));
      setLoading(false);
      if (enrich) enrichUser(session);
    };

    const enrichUser = (session) => {
      const userId = session.user.id;
      if (enrichForId === userId) return;
      enrichForId = userId;

      fetchProfile(userId).then(async (profile) => {
        if (cancelled) return;
        const builtUser = withImpersonation(buildUser(session.user, profile || null));
        setUser(builtUser);

        if (builtUser.role === "player") {
          import("../lib/playerPlanEngine").then(({ hydratePlayerPlan }) => {
            const pending = sessionStorage.getItem("depro_pending_plan_user");
            if (pending === builtUser.id) {
              localStorage.removeItem(`depro_plan_${builtUser.id}`);
              sessionStorage.removeItem("depro_pending_plan_user");
            }
            return hydratePlayerPlan(builtUser);
          }).catch(() => {});
        }

        const isClubUser = builtUser.role === "club"
          || session.user.user_metadata?.role === "club"
          || builtUser.isSoloCoach
          || isProCoachUser(builtUser);
        if (!isClubUser) return;

        try {
          let clubId = builtUser.clubId || session.user.user_metadata?.clubId;
          if (isProCoachUser(builtUser) && !getImpersonationSnapshot() && session.access_token) {
            const needsClub = !clubId || !builtUser.club?.teams?.length || !builtUser.club?.coachConfig;
            if (needsClub) {
              try {
                const ens = await fetch("/api/ensure-coach-club", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                  },
                });
                if (ens.ok) {
                  const payload = await ens.json();
                  if (payload.clubId) clubId = payload.clubId;
                  if (payload.club?.id) {
                    try {
                      localStorage.setItem(`depro_club_${payload.club.id}`, JSON.stringify(payload.club));
                    } catch { /* cupo */ }
                  }
                }
              } catch { /* Microciclo reintenta */ }
            }
          }
          const url = clubId
            ? `/api/admin-clubs?id=${encodeURIComponent(clubId)}`
            : "/api/admin-clubs";
          const res = await fetch(url);
          if (cancelled) return;
          if (res.ok) {
            const data = await res.json();
            const clubs = (data.clubs || []).filter(
              (c) => c.id && !isMetaClubId(c.id)
            );
            if (clubs.length > 0) {
              const existingLocal = JSON.parse(localStorage.getItem("depro_clubs") || "[]");
              const mergedSummaries = clubs.map((remote) => {
                const local = existingLocal.find((c) => c.id === remote.id);
                const base = local ? { ...local, ...remote } : remote;
                return {
                  id: base.id, name: base.name, abbreviation: base.abbreviation,
                  login_code: base.login_code, coordinator: base.coordinator,
                  status: base.status, plan: base.plan, city: base.city,
                  country: base.country,
                  isSoloCoach: remote.isSoloCoach ?? local?.isSoloCoach ?? false,
                  planningMode: remote.planningMode || local?.planningMode || null,
                  origen: remote.origen || local?.origen || null,
                  mode: remote.mode || local?.mode || null,
                  manualPrice: remote.manualPrice ?? local?.manualPrice ?? null,
                  coachConfig: remote.coachConfig || local?.coachConfig || null,
                  primaryColor:   remote.primaryColor   ?? local?.primaryColor   ?? null,
                  secondaryColor: remote.secondaryColor ?? local?.secondaryColor ?? null,
                  slogan:         remote.slogan         ?? local?.slogan         ?? null,
                  logo:           remote.logo           ?? local?.logo           ?? null,
                  banner:         remote.banner         ?? local?.banner         ?? null,
                };
              });
              const keepOthers = clubId
                ? existingLocal.filter((c) => !mergedSummaries.some((m) => m.id === c.id))
                : [];
              try {
                localStorage.setItem("depro_clubs", JSON.stringify([...mergedSummaries, ...keepOthers]));
              } catch { /* cupo */ }
              for (const c of clubs) {
                const localDetail = JSON.parse(localStorage.getItem(`depro_club_${c.id}`) || "null");
                const merged = localDetail
                  ? {
                      ...localDetail, ...c,
                      logo:           c.logo           ?? localDetail.logo           ?? null,
                      banner:         c.banner         ?? localDetail.banner         ?? null,
                      primaryColor:   c.primaryColor   ?? localDetail.primaryColor   ?? null,
                      secondaryColor: c.secondaryColor ?? localDetail.secondaryColor ?? null,
                      slogan:         c.slogan         ?? localDetail.slogan         ?? null,
                      teams: mergeClubTeams(c.teams, localDetail.teams, c.purgedPlayers || localDetail.purgedPlayers),
                      purgedPlayers: c.purgedPlayers || localDetail.purgedPlayers || [],
                      coachConfig:    (c.coachConfig?.nivel || c.coachConfig?.engine)
                        ? c.coachConfig
                        : (localDetail.coachConfig || c.coachConfig || null),
                      planningMode:   c.planningMode || localDetail.planningMode || null,
                      origen:         c.origen || localDetail.origen || null,
                      mode:           c.mode || localDetail.mode || null,
                      isSoloCoach:    c.isSoloCoach ?? localDetail.isSoloCoach ?? false,
                      manualPrice:    c.manualPrice ?? localDetail.manualPrice ?? null,
                    }
                  : c;
                delete merged.coachWeeks;
                delete merged.coachMesociclo;
                delete merged.plans;
                try {
                  localStorage.setItem(`depro_club_${c.id}`, JSON.stringify(merged));
                } catch { /* cupo: no tumbar el login */ }
                applyPurgedPlayersToStorage(c.id, merged.purgedPlayers || []);
              }
              if (cancelled) return;
              setUser(withImpersonation(buildUser(session.user, profile || null)));
              return;
            }
          }
          const meta = builtUser.impersonating
            ? { clubId: builtUser.clubId }
            : (session.user.user_metadata ?? {});
          if (meta.clubId && !builtUser.club) {
            const teamId = session.user.user_metadata?.teamId;
            const minimalClub = {
              id: meta.clubId,
              name: builtUser.clubName || "Mi Club",
              teams: teamId ? [{ id: teamId, name: "Mi equipo", squad: [] }] : [],
              plans: [],
              isSoloCoach: String(meta.clubId).startsWith("coach_"),
            };
            try { localStorage.setItem(`depro_club_${meta.clubId}`, JSON.stringify(minimalClub)); } catch { /* cupo */ }
            try {
              const local = JSON.parse(localStorage.getItem("depro_clubs") || "[]");
              if (!local.find((c) => c.id === meta.clubId)) {
                local.unshift(minimalClub);
                localStorage.setItem("depro_clubs", JSON.stringify(local));
              }
            } catch { /* cupo */ }
            if (!cancelled) setUser(withImpersonation(buildUser(session.user, profile || null)));
          }
        } catch { /* silencioso */ }
      }).catch(() => {});
    };

    // Callback SÍNCRONO: un async aquí bloquea el lock de supabase-js y al recargar
    // no se refresca el token → SIGNED_OUT / salto al login.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (isSignedOutEvent(event)) {
        applySession(null, { signedOut: true });
        return;
      }
      if (event === "TOKEN_REFRESHED") {
        applySession(session, { enrich: false });
        return;
      }
      if (isSessionPresenceEvent(event) || !event) {
        applySession(session);
      }
    });

    supabase.auth.getSession()
      .then(({ data }) => {
        if (data?.session) {
          applySession(data.session);
          return;
        }
        // Vacío: espera a INITIAL_SESSION antes de mostrar el login.
        setTimeout(() => {
          if (!cancelled && !hasLiveSession) applySession(null, { signedOut: true });
        }, 800);
      })
      .catch(() => { if (!cancelled) setLoading(false); });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
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
    const creds = { email: email.trim().toLowerCase(), password };
    try {
      try { reclaimLocalStorage(); } catch { /* cupo: dejar sitio al token */ }
      let data;
      let error;
      try {
        ({ data, error } = await supabase.auth.signInWithPassword(creds));
      } catch (signErr) {
        if (isQuotaError(signErr)) {
          try { reclaimLocalStorage({ aggressive: true }); } catch { /* cupo */ }
          ({ data, error } = await supabase.auth.signInWithPassword(creds));
        } else {
          throw signErr;
        }
      }

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

      if (sessionIsDraftBlocked(data?.user)) {
        await supabase.auth.signOut();
        return {
          success: false,
          error: "Esta cuenta está en borrador. Solo el administrador puede verla.",
        };
      }

      if (data?.user) {
        setUser(hydrateUserFromAuth(data.user));
      }

      const role =
        data?.user?.email === "jose@depro.es"
          ? "admin"
          : (data?.user?.user_metadata?.role ?? "player");

      return { success: true, role };
    } catch (err) {
      console.error("[auth] login failed", err);
      if (isQuotaError(err)) {
        return {
          success: false,
          error: "El navegador no tiene espacio suficiente. Cierra pestañas o borra datos del sitio e inténtalo de nuevo.",
        };
      }
      const msg = String(err?.message || "");
      if (/fetch|network|failed to fetch|load failed|connection/i.test(msg)) {
        return { success: false, error: "Error de conexión. Inténtalo de nuevo." };
      }
      return {
        success: false,
        error: msg || "No se pudo iniciar sesión. Inténtalo de nuevo.",
      };
    }
  };

  // ── Refresh user (recargar datos sin nuevo login) ──────────
  const refreshUser = useCallback(async () => {
    try {
      await supabase.auth.refreshSession();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const basic = withImpersonation(buildUser(session.user, null));
      setUser(basic);
      const profile = await fetchProfile(session.user.id);
      if (profile) setUser(withImpersonation(buildUser(session.user, profile)));
    } catch { /* ignore */ }
  }, []);

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
    stopImpersonation();
    try {
      if (user?.id && isInTrial(user)) {
        clearTrialLoadLogs(user.id);
        clearWellnessLogs(user.id);
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
