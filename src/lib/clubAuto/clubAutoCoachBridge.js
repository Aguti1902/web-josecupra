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

/** True si este club/entrenador usa el motor automático del documento. */
export function usesClubAutoEngine(clubOrConfig) {
  const cfg = clubOrConfig?.coachConfig || clubOrConfig || {};
  if (cfg.engine === "club_auto") return true;
  if (clubOrConfig?.planningMode === "auto" && clubOrConfig?.isSoloCoach) return true;
  // Config nueva con nivel A/B/C del cuestionario corto
  if (cfg.nivel && ["A", "B", "C"].includes(String(cfg.nivel).toUpperCase())) return true;
  return false;
}

/** coachConfig → cuestionario del motor */
export function coachConfigToQuestionnaire(config = {}) {
  return {
    nivel: config.nivel || "B",
    dias_entrenamiento_semana: Number(config.dias_entrenamiento_semana || config.trainingsPerWeek || 3),
    dias_exactos_entrenamiento: config.dias_exactos_entrenamiento || config.trainingDays || [],
    dia_partido: config.dia_partido || config.matchDay || "sabado",
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
  return {
    engine: "club_auto",
    startDate,
    numWeeks,
    objetivoLabel: `Motor automático · Nivel ${nivelLabel}`,
    weeks: weeksRaw.map((w, i) => {
      const adapted = adaptClubAutoWeek(w, startDate);
      return {
        weekNumber: i + 1,
        label: w.label || `Semana ${i + 1}`,
        summary: w.summary || adapted.summary,
        sessions: adapted.sessions,
        focus: adapted.summary,
      };
    }),
  };
}

/** Mapeo nivel → categoría de equipo para plantilla/UI. */
export function categoryForNivel(nivel) {
  return CLUB_AUTO_NIVELES.find((n) => n.id === nivel)?.category || "Sub-14";
}
