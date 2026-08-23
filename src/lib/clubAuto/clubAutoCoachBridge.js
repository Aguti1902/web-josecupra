/**
 * Puente entre el panel DEPRO Coach y el motor club automático.
 * No modifica coachEngine ni playerPlanEngine.
 */
import {
  generateClubAutoMicrociclo,
  validateCoachQuestionnaire,
  TRAIN_DAYS,
  monthKeyFromDate,
  weekOffsetInMonth,
  weekIndexInMonth,
  variantIndexForWeek,
  monthBounds,
  isoWeekStartsInMonth,
  startOfIsoWeek,
  addDaysIso,
  gymAccessFromMaterials,
} from "./clubAutoEngine.js";

export {
  TRAIN_DAYS,
  validateCoachQuestionnaire,
  gymAccessFromMaterials,
  monthKeyFromDate,
  weekOffsetInMonth,
  weekIndexInMonth,
  variantIndexForWeek,
  monthBounds,
  isoWeekStartsInMonth,
  startOfIsoWeek,
  addDaysIso,
};

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
  "Sin material",
  "Gomas",
  "Mancuernas",
  "Barra",
  "Gimnasio completo",
];

/** Club o ProCoach con planificación manual («Llevado por mí»). */
export function isManualPlanningClub(club) {
  if (!club || typeof club !== "object") return false;
  return club.planningMode === "manual"
    || club.origen === "manual"
    || club.mode === "personalizado"
    || club.coachConfig?.engine === "manual"
    || club.coachConfig?.mode === "personalizado";
}

/**
 * True si este club/entrenador usa el motor automático del documento.
 * Respeta modo «Llevado por mí» / planningMode manual para no mezclar motores.
 */
export function usesClubAutoEngine(clubOrConfig) {
  if (!clubOrConfig) return false;

  // Config suelta del cuestionario (engine/nivel) — comprobar ANTES de la heurística club.
  // questionnaireToCoachConfig escribe mode:"depro" + engine:"club_auto"; si tratamos
  // mode!=null como "club" sin coachConfig anidado, cfg queda {} y el motor nunca corre.
  if (clubOrConfig.engine === "club_auto") return true;
  if (
    clubOrConfig.nivel
    && ["A", "B", "C"].includes(String(clubOrConfig.nivel).toUpperCase())
    && clubOrConfig.coachConfig == null
    && clubOrConfig.origen == null
    && clubOrConfig.planningMode == null
    && clubOrConfig.isSoloCoach == null
  ) {
    return clubOrConfig.mode !== "personalizado" && clubOrConfig.engine !== "manual";
  }

  const looksLikeClub =
    clubOrConfig.coachConfig != null
    || clubOrConfig.planningMode != null
    || clubOrConfig.origen != null
    || clubOrConfig.isSoloCoach != null
    || (clubOrConfig.mode != null && clubOrConfig.coachConfig != null);
  const club = looksLikeClub ? clubOrConfig : null;
  const cfg = (club?.coachConfig || (!looksLikeClub ? clubOrConfig : {}) || {});

  // Campo origen explícito (PDF §10) — manda sobre deducciones
  if (club?.origen === "manual") return false;
  if (club?.mode === "personalizado" || club?.planningMode === "manual") return false;
  if (cfg.mode === "personalizado" || cfg.engine === "manual") return false;

  if (club?.origen === "automatico") return true;
  if (cfg.engine === "club_auto") return true;
  if (club?.planningMode === "auto" && (club.isSoloCoach || cfg.nivel)) return true;
  if (!club && cfg.nivel && ["A", "B", "C"].includes(String(cfg.nivel).toUpperCase())) return true;
  return false;
}

const ONBOARDING_DRAFT_KEY = "depro_onboarding_draft_v1";

/** True si este usuario es DEPRO Coach / entrenador individual (ProCoach). */
export function isProCoachUser(user) {
  if (!user) return false;
  const club = user.club;
  return !!(
    user.isSoloCoach
    || club?.isSoloCoach
    || club?.metadata?.isSoloCoach
    || user.role === "coach"
    || String(user.clubId || club?.id || "").startsWith("coach_")
    || String(user.plan || "").startsWith("coach-")
  );
}

/** Compacta el cuestionario para metadata Stripe (~500 chars). */
export function serializeCoachAutoForMeta(q = {}) {
  if (!q || typeof q !== "object") return "";
  try {
    const packed = {
      nivel: q.nivel || "",
      dias: Array.isArray(q.dias_exactos_entrenamiento) ? q.dias_exactos_entrenamiento.join(",") : "",
      partido: q.dia_partido || "",
      gym: gymAccessFromMaterials(q.material)
        || q.acceso_gimnasio === true
        || q.acceso_gimnasio === "si"
        ? "si"
        : "no",
      material: Array.isArray(q.material) ? q.material.join(",") : "",
      duracion: q.duracion_sesion || "",
      jugadores: q.num_jugadores || "",
    };
    return JSON.stringify(packed).slice(0, 490);
  } catch {
    return "";
  }
}

export function parseCoachAutoFromMeta(raw) {
  if (!raw) return null;
  try {
    const o = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!o || typeof o !== "object") return null;
    const days = String(o.dias || "").split(",").map((s) => s.trim()).filter(Boolean);
    return {
      nivel: o.nivel || "B",
      dias_exactos_entrenamiento: days,
      dias_entrenamiento_semana: days.length || Number(o.dias_entrenamiento_semana) || 3,
      dia_partido: o.partido || o.dia_partido || "sabado",
      acceso_gimnasio: o.gym || o.acceso_gimnasio || "no",
      material: String(o.material || "").split(",").map((s) => s.trim()).filter(Boolean),
      duracion_sesion: o.duracion || o.duracion_sesion || "75",
      num_jugadores: o.jugadores || o.num_jugadores || "14-18",
    };
  } catch {
    return null;
  }
}

export function loadCoachAutoDraftFromStorage() {
  try {
    const raw = localStorage.getItem(ONBOARDING_DRAFT_KEY);
    const state = raw ? JSON.parse(raw) : null;
    if (state?.form?.coachAuto && typeof state.form.coachAuto === "object") {
      return state.form.coachAuto;
    }
  } catch { /* ignore */ }
  return null;
}

/** Huella del cuestionario para invalidar microciclos congelados. */
export function coachConfigFingerprint(config = {}) {
  const q = coachConfigToQuestionnaire(config);
  const auto = usesClubAutoEngine(config) || usesClubAutoEngine({ coachConfig: config });
  const monthKey = monthKeyFromDate(new Date());
  return JSON.stringify({
    engine: auto ? "club_auto" : "legacy",
    nivel: q.nivel,
    dias: q.dias_entrenamiento_semana,
    days: [...(q.dias_exactos_entrenamiento || [])].sort(),
    match: q.dia_partido,
    gym: q.acceso_gimnasio === true || q.acceso_gimnasio === "si" ? "si" : "no",
    material: [...(q.material || [])].map(String).sort(),
    duration: q.duracion_sesion || "",
    jugadores: q.num_jugadores || "",
    monthKey,
  });
}

/** Duración de sesión para el resumen (igual que planificación manual). */
export function durationLabelFromQuestionnaire(q = {}) {
  const id = String(q.duracion_sesion || "75");
  const found = CLUB_AUTO_DURATIONS.find((d) => d.id === id);
  if (found) return found.label;
  if (/min/i.test(id)) return id;
  return `${id} min`;
}

/** cuestionario → coachConfig (misma forma que el onboarding / perfil). */
export function questionnaireToCoachConfig(q) {
  const v = validateCoachQuestionnaire(q);
  if (!v.ok) return { ok: false, errors: v.errors, config: null };
  const n = v.normalized;
  return {
    ok: true,
    errors: [],
    config: {
      engine: "club_auto",
      nivel: n.nivel,
      dias_entrenamiento_semana: n.dias_entrenamiento_semana,
      dias_exactos_entrenamiento: n.dias_exactos_entrenamiento,
      dia_partido: q.dia_partido || "sabado",
      duracion_sesion: n.duracion_sesion,
      num_jugadores: n.num_jugadores,
      material: n.material,
      gymAccess: gymAccessFromMaterials(n.material) || !!n.acceso_gimnasio,
      acceso_gimnasio: (gymAccessFromMaterials(n.material) || n.acceso_gimnasio) ? "si" : "no",
      trainingsPerWeek: n.dias_entrenamiento_semana,
      trainingDays: n.dias_exactos_entrenamiento,
      matchDay: q.dia_partido || "sabado",
      mode: "depro",
    },
  };
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
    gymAccess: gymAccessFromMaterials(config.material)
      || config.gymAccess === true
      || config.acceso_gimnasio === "si"
      || config.acceso_gimnasio === true,
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
    description: ex.descripcion || ex.description || "",
    descripcion: ex.descripcion || ex.description || "",
    tips: ex.tips || "",
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
  const duration = durationLabelFromQuestionnaire(result.questionnaire || {});
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
      framework: s.protocol,
      templateKey: `${s.protocol || "A"}${s.sessionVariant || 1}`,
      intensity: s.protocol === "A" ? "Media" : s.protocol === "B" ? "Alta" : "Máxima",
      duration,
      duracionEstimada: duration,
      exercises: flattenProtocolExercises(s),
      observaciones: s.structure?.find((b) => b.type === "observaciones")?.item?.observaciones || "",
      objetivos: [s.protocolLabel].filter(Boolean),
    })),
  };
}

export function generateClubAutoWeekForCoach(config, { weekStart, weekOffset, monthKey: monthKeyOpt } = {}) {
  const q = coachConfigToQuestionnaire(config);
  const monthKey = monthKeyOpt || monthKeyFromDate(weekStart || new Date());
  const offset = weekOffset ?? weekIndexInMonth(weekStart);
  const variant = variantIndexForWeek(offset);
  const result = generateClubAutoMicrociclo(q, {
    weekOffset: offset,
    monthKey,
    variant,
    weekStart,
    seed: `${monthKey}|v${variant}|${q.nivel}`,
  });
  const adapted = adaptClubAutoWeek(result, weekStart);
  return { ...adapted, weekOffset: offset, monthKey };
}

export function generateClubAutoMesocicloForCoach(config, { startDate, endDate, numWeeks } = {}) {
  const q = coachConfigToQuestionnaire(config);
  const bounds = monthBounds(startDate || new Date());
  const monthStart = startDate || bounds.startDate;
  const monthEnd = endDate || bounds.endDate;
  const monthKey = monthKeyFromDate(monthStart);
  const weekStarts = isoWeekStartsInMonth(monthStart);
  const usedStarts = Number.isFinite(numWeeks) && numWeeks > 0
    ? weekStarts.slice(0, numWeeks)
    : weekStarts;
  const nivelLabel = CLUB_AUTO_NIVELES.find((n) => n.id === q.nivel)?.label || q.nivel;
  return {
    engine: "club_auto",
    startDate: monthStart,
    endDate: monthEnd,
    monthKey,
    numWeeks: usedStarts.length,
    objetivoLabel: `Planificación mensual · Nivel ${nivelLabel}`,
    weeks: usedStarts.map((weekStart, i) => {
      const adapted = adaptClubAutoWeek(
        generateClubAutoMicrociclo(q, {
          weekOffset: i,
          monthKey,
          variant: variantIndexForWeek(i),
          weekStart,
          seed: `${monthKey}|w${i}|v${variantIndexForWeek(i)}|${q.nivel}`,
        }),
        weekStart,
      );
      const sessions = adapted.sessions || [];
      return {
        weekNumber: i + 1,
        weekStart,
        label: `Semana ${i + 1}`,
        summary: adapted.summary,
        sessions,
        microciclo: { sessions, weekStart, engine: "club_auto", summary: adapted.summary, weekOffset: i },
        focus: adapted.summary,
      };
    }),
  };
}

/** Mapeo nivel → categoría de equipo para plantilla/UI. */
export function categoryForNivel(nivel) {
  return CLUB_AUTO_NIVELES.find((n) => n.id === nivel)?.category || "Sub-14";
}
