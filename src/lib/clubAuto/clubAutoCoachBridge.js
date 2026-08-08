/**
 * Puente entre el panel DEPRO Coach y el motor club automático.
 * No modifica coachEngine ni playerPlanEngine.
 */
import {
  generateClubAutoMicrociclo,
  generateClubAutoFourWeeks,
  validateCoachQuestionnaire,
  TRAIN_DAYS,
} from "./clubAutoEngine.js";

export { TRAIN_DAYS, validateCoachQuestionnaire };

export const CLUB_AUTO_NIVELES = [
  { id: "A", label: "A · 9–12 años", category: "Sub-11" },
  { id: "B", label: "B · 12–15 años", category: "Sub-14" },
  { id: "C", label: "C · 16+ años", category: "Juvenil" },
];

export const CLUB_AUTO_MATCH_DAYS = [
  { id: "sabado", label: "Sábado" },
  { id: "domingo", label: "Domingo" },
  { id: "entre_semana", label: "Entre semana" },
];

export const CLUB_AUTO_DURATIONS = [
  { id: "45", label: "45 min" },
  { id: "60", label: "60 min" },
  { id: "75", label: "75 min" },
  { id: "90", label: "90 min" },
  { id: "90+", label: "Más de 90 min" },
];

export const CLUB_AUTO_PLAYER_COUNTS = [
  { id: "6-10", label: "6-10" },
  { id: "10-14", label: "10-14" },
  { id: "14-18", label: "14-18" },
  { id: "18-24", label: "18-24" },
  { id: "24+", label: "Más de 24" },
];

export const CLUB_AUTO_MATERIALS = [
  "Conos",
  "Picas",
  "Mini vallas",
  "Gomas",
  "Balones",
  "Porterías",
];

/**
 * True si este club/entrenador usa el motor automático del documento.
 * Respeta modo «Llevado por mí» / planningMode manual para no mezclar motores.
 */
export function usesClubAutoEngine(clubOrConfig) {
  if (!clubOrConfig) return false;
  const looksLikeClub =
    clubOrConfig.coachConfig != null
    || clubOrConfig.planningMode != null
    || clubOrConfig.mode != null
    || clubOrConfig.origen != null
    || clubOrConfig.isSoloCoach != null;
  const club = looksLikeClub ? clubOrConfig : null;
  const cfg = (club?.coachConfig || (!looksLikeClub ? clubOrConfig : {}) || {});

  // Campo origen explícito (PDF §10) — manda sobre deducciones
  if (club?.origen === "manual") return false;
  if (club?.mode === "personalizado" || club?.planningMode === "manual") return false;
  if (cfg.mode === "personalizado" || cfg.engine === "manual") return false;

  if (club?.origen === "automatico") return true;
  if (cfg.engine === "club_auto") return true;
  if (club?.planningMode === "auto" && (club.isSoloCoach || cfg.nivel)) return true;
  // Config suelta (tests / llamadas con solo coachConfig)
  if (!club && cfg.nivel && ["A", "B", "C"].includes(String(cfg.nivel).toUpperCase())) return true;
  return false;
}

/** Huella del cuestionario para invalidar microciclos congelados. */
export function coachConfigFingerprint(config = {}) {
  const q = coachConfigToQuestionnaire(config);
  const auto = usesClubAutoEngine(config) || usesClubAutoEngine({ coachConfig: config });
  return JSON.stringify({
    engine: auto ? "club_auto" : "legacy",
    nivel: q.nivel,
    dias: q.dias_entrenamiento_semana,
    days: [...(q.dias_exactos_entrenamiento || [])].sort(),
    match: q.dia_partido,
    gym: q.acceso_gimnasio === true || q.acceso_gimnasio === "si" ? "si" : "no",
  });
}

/** coachConfig → cuestionario del motor */
export function coachConfigToQuestionnaire(config = {}) {
  const days = config.dias_exactos_entrenamiento || config.trainingDays || [];
  return {
    nivel: config.nivel || "B",
    dias_entrenamiento_semana: Number(config.dias_entrenamiento_semana || config.trainingsPerWeek || days.length || 3),
    dias_exactos_entrenamiento: days,
    dia_partido: config.dia_partido || config.matchDay || "sabado",
    duracion_sesion: config.duracion_sesion || "75",
    num_jugadores: config.num_jugadores || "14-18",
    material: Array.isArray(config.material) ? config.material : [],
    acceso_gimnasio: config.acceso_gimnasio ?? (config.gymAccess ? "si" : "no"),
    gymAccess: config.gymAccess === true || config.acceso_gimnasio === "si" || config.acceso_gimnasio === true,
  };
}

/** Flatten protocol exercises for UIs that still expect `exercises[]`. */
function flattenProtocolExercises(session) {
  const proto = (session.structure || []).find((b) => b.type === "protocolo");
  return (proto?.exercises || []).map((ex, i) => ({
    id: `club_auto_ex_${session.id}_${i}`,
    exerciseId: ex.catalogId,
    name: ex.nombre,
    nombre: ex.nombre,
    slot: ex.slot,
    slotIndex: i,
    label: ex.label,
    sets: ex.sets,
    rest: ex.rest,
    duration: ex.sets,
    videoUrl: ex.videoUrl || "",
    club_slot: ex.club_slot || ex.slot,
    club_protocolo: ex.club_protocolo,
    club_entorno: ex.club_entorno,
    missing: !!ex.missing,
  }));
}

/** Adapta resultado del motor a formato consumible por el panel coach. */
export function adaptClubAutoWeek(result, weekStart) {
  if (!result?.ok) {
    return {
      engine: "club_auto",
      weekStart,
      sessions: [],
      errors: result?.errors || ["No se pudo generar el microciclo"],
      summary: "",
      questionnaire: result?.questionnaire || null,
    };
  }
  return {
    engine: "club_auto",
    weekStart,
    summary: result.summary,
    questionnaire: result.questionnaire,
    sessions: (result.sessions || []).map((s) => ({
      ...s,
      date: null,
      weekStart,
      engine: "club_auto",
      exercises: flattenProtocolExercises(s),
      duracionEstimada: "75–90 min",
      observaciones: s.structure?.find((b) => b.type === "observaciones")?.item?.observaciones || "",
      objetivos: [s.protocolLabel].filter(Boolean),
    })),
  };
}

export function generateClubAutoWeekForCoach(config, { weekStart, weekOffset = 0 } = {}) {
  const q = coachConfigToQuestionnaire(config);
  const result = generateClubAutoMicrociclo(q, {
    weekOffset,
    seed: `${weekStart || "w"}|${weekOffset}|${q.nivel}`,
  });
  return adaptClubAutoWeek(result, weekStart);
}

export function generateClubAutoMesocicloForCoach(config, { startDate, numWeeks = 4 } = {}) {
  const q = coachConfigToQuestionnaire(config);
  const weeksRaw = generateClubAutoFourWeeks(q);
  const nivelLabel = CLUB_AUTO_NIVELES.find((n) => n.id === q.nivel)?.label || q.nivel;
  const base = startDate ? new Date(`${startDate}T00:00:00`) : new Date();
  return {
    engine: "club_auto",
    startDate,
    numWeeks,
    objetivoLabel: `Planificación mensual · Nivel ${nivelLabel}`,
    weeks: weeksRaw.map((w, i) => {
      const weekStartDate = new Date(base);
      weekStartDate.setDate(base.getDate() + i * 7);
      const weekStart = weekStartDate.toISOString().slice(0, 10);
      const adapted = adaptClubAutoWeek(w, weekStart);
      const sessions = adapted.sessions || [];
      return {
        weekNumber: i + 1,
        weekStart,
        label: w.label || `Semana ${i + 1}`,
        summary: w.summary || adapted.summary,
        sessions,
        // Compat con UI manual (CoachPlanning espera microciclo.sessions)
        microciclo: { sessions, weekStart, engine: "club_auto", summary: adapted.summary },
        focus: adapted.summary,
      };
    }),
  };
}

/** Mapeo nivel → categoría de equipo para plantilla/UI. */
export function categoryForNivel(nivel) {
  return CLUB_AUTO_NIVELES.find((n) => n.id === nivel)?.category || "Sub-14";
}
