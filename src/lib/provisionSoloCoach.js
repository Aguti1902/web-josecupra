/**
 * Crea el club/equipo de un DEPRO Coach a partir del cuestionario del checkout.
 * IDs estables por usuario para no duplicar al reintentar el pago.
 */
import {
  parseCoachAutoFromMeta,
  questionnaireToCoachConfig,
  categoryForNivel,
} from "./clubAuto/clubAutoCoachBridge.js";

const DEFAULT_DAYS = ["Lunes", "Miércoles", "Viernes"];

export function stableCoachClubIds(userId) {
  const slug = String(userId || "anon").replace(/[^a-zA-Z0-9]/g, "").slice(0, 16) || "anon";
  return {
    clubId: `coach_club_${slug}`,
    teamId: `coach_team_${slug}`,
  };
}

export function normalizeCoachAutoInput(raw) {
  const parsed = parseCoachAutoFromMeta(raw)
    || (raw && typeof raw === "object" && !Array.isArray(raw) ? raw : null)
    || {};
  const days = Array.isArray(parsed.dias_exactos_entrenamiento) && parsed.dias_exactos_entrenamiento.length
    ? parsed.dias_exactos_entrenamiento
    : DEFAULT_DAYS;
  return {
    nivel: parsed.nivel || "B",
    dias_exactos_entrenamiento: days,
    dias_entrenamiento_semana: days.length,
    dia_partido: parsed.dia_partido || parsed.partido || "sabado",
    acceso_gimnasio: parsed.acceso_gimnasio || parsed.gym || "no",
    material: Array.isArray(parsed.material) && parsed.material.length
      ? parsed.material
      : ["Sin material", "Gomas"],
    duracion_sesion: parsed.duracion_sesion || parsed.duracion || "75",
    num_jugadores: parsed.num_jugadores || parsed.jugadores || "14-18",
  };
}

export function buildSoloCoachClub({
  userId,
  name,
  email,
  plan,
  coachAuto,
  primaryColor,
  secondaryColor,
  clubName,
} = {}) {
  const q = normalizeCoachAutoInput(coachAuto);
  const packed = questionnaireToCoachConfig(q);
  const cfg = packed.ok
    ? packed.config
    : {
      engine: "club_auto",
      nivel: q.nivel,
      dias_entrenamiento_semana: q.dias_entrenamiento_semana,
      dias_exactos_entrenamiento: q.dias_exactos_entrenamiento,
      dia_partido: q.dia_partido,
      duracion_sesion: q.duracion_sesion,
      num_jugadores: q.num_jugadores,
      material: q.material,
      gymAccess: false,
      acceso_gimnasio: "no",
      trainingsPerWeek: q.dias_entrenamiento_semana,
      trainingDays: q.dias_exactos_entrenamiento,
      matchDay: q.dia_partido,
      mode: "depro",
    };
  const { clubId, teamId } = stableCoachClubIds(userId);
  const category = categoryForNivel(cfg.nivel);
  const club = {
    id: clubId,
    name: clubName || `${name || "Entrenador"} · DEPRO Coach`,
    abbreviation: String(name || "EC").trim().slice(0, 2).toUpperCase() || "EC",
    city: "",
    country: "",
    status: "activo",
    plan: plan || "coach-starter",
    isSoloCoach: true,
    origen: "automatico",
    planningMode: "auto",
    mode: "depro",
    coachConfig: cfg,
    logo: null,
    primaryColor: primaryColor || "#0A36F7",
    secondaryColor: secondaryColor || "#ffffff",
    coordinator: email ? { name: name || "", email } : null,
    teams: [
      {
        id: teamId,
        name: "Mi equipo",
        category,
        season: "2025/2026",
        trainingDays: cfg.dias_exactos_entrenamiento,
        coach: { name: name || "", email: email || "" },
        squad: [],
      },
    ],
    plans: [],
    created_at: new Date().toISOString(),
  };
  return { club, clubId, teamId, config: cfg };
}
