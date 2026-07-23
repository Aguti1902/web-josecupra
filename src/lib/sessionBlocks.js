/** Utilidades compartidas para bloques de sesión (admin ↔ entrenador) */

export const BLOCK_TYPES = ["calentamiento", "principal", "complementario", "vuelta_calma"];

/** Bloques editables en el panel admin (sin complementario ni vuelta a la calma) */
export const ADMIN_BLOCK_TYPES = ["calentamiento", "principal"];

export const BLOCK_LABELS = {
  calentamiento:  "Calentamiento",
  principal:      "Principal",
  complementario: "Complementario",
  vuelta_calma:   "Vuelta a la calma",
};

export const BLOCK_COLORS = {
  calentamiento:  "#F59E0B",
  principal:      "#3B82F6",
  complementario: "#8B5CF6",
  vuelta_calma:   "#10B981",
};

const DEFAULT_DURATIONS = {
  calentamiento:  "10 min",
  principal:      "30 min",
  complementario: "15 min",
  vuelta_calma:   "5 min",
};

export function emptyExercise() {
  return {
    id: `ex_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    name: "", sets: "3", reps: "10-12", rest: "60s", duration: "",
    videoUrl: "", description: "", tips: "",
  };
}

export function emptySubSession(title = "Parte 1") {
  return { id: `sub_${Date.now()}_${Math.random().toString(36).slice(2)}`, title, exercises: [] };
}

/** Normaliza un bloque: migra exercises[] plano → subSessions[] */
export function normalizeBlock(block) {
  const type = block.type;
  const base = { guideItems: block.guideItems };
  if (block.subSessions?.length) {
    return {
      ...block,
      ...base,
      type,
      label: block.label || BLOCK_LABELS[type],
      exercises: block.subSessions.flatMap((ss) => ss.exercises || []),
    };
  }
  const exercises = block.exercises || [];
  return {
    ...block,
    ...base,
    type,
    label: block.label || BLOCK_LABELS[type],
    subSessions: exercises.length
      ? [{ id: `sub_${type}_default`, title: "Parte 1", exercises }]
      : [emptySubSession("Parte 1")],
    exercises,
  };
}

export function defaultBlocks() {
  return BLOCK_TYPES.map((type) => ({
    type,
    label: BLOCK_LABELS[type],
    duration: DEFAULT_DURATIONS[type],
    videoUrl: type === "calentamiento" || type === "vuelta_calma" ? "" : undefined,
    subSessions: type === "principal" ? [emptySubSession("Parte 1")] : [emptySubSession("Parte 1")],
    exercises: type === "principal" ? [emptyExercise()] : [],
  })).map(normalizeBlock);
}

export function adminDefaultBlocks() {
  return ADMIN_BLOCK_TYPES.map((type) => ({
    type,
    label: BLOCK_LABELS[type],
    duration: DEFAULT_DURATIONS[type],
    videoUrl: type === "calentamiento" ? "" : undefined,
    subSessions: [emptySubSession("Parte 1")],
    exercises: type === "principal" ? [emptyExercise()] : [],
  })).map(normalizeBlock);
}

/** Normaliza bloques de sesión para el editor admin (solo calentamiento + principal) */
export function adminSessionBlocks(existingBlocks) {
  return ADMIN_BLOCK_TYPES.map((type) => {
    const found = (existingBlocks || []).find((b) => b.type === type);
    return found
      ? normalizeBlock(found)
      : normalizeBlock({ type, exercises: [], subSessions: [emptySubSession("Parte 1")] });
  });
}

/** Obtiene bloques de una sesión guardada (blocks o legacy exercises) */
export function getSessionBlocks(session) {
  if (session?.blocks?.length) {
    return BLOCK_TYPES.map((type) => {
      const found = session.blocks.find((b) => b.type === type);
      return found ? normalizeBlock(found) : normalizeBlock({ type, exercises: [] });
    });
  }
  const all = session?.exercises || [];
  if (all.some((ex) => ex.blockType)) {
    return BLOCK_TYPES.map((type) => normalizeBlock({
      type,
      exercises: all.filter((ex) => ex.blockType === type),
    }));
  }
  // Legacy sin blockType: reparto aproximado
  return BLOCK_TYPES.map((type, i) => normalizeBlock({
    type,
    exercises: i === 0 ? all.slice(0, 2) : i === 1 ? all.slice(2, 6) : i === 2 ? all.slice(6, 8) : all.slice(8, 10),
  }));
}

export function flattenBlocksToExercises(blocks) {
  return (blocks || []).flatMap((b) =>
    (b.subSessions || [{ exercises: b.exercises || [] }]).flatMap((ss) =>
      (ss.exercises || []).map((ex) => ({
        ...ex,
        blockType: b.type,
        subSessionId: ss.id,
        subSessionTitle: ss.title,
        tips: Array.isArray(ex.tips) ? ex.tips : (ex.tips ? String(ex.tips).split("\n").filter(Boolean) : []),
      }))
    )
  );
}

export function sessionPlanUrl(session, { tab = "resumen", date, week } = {}) {
  const params = new URLSearchParams();
  if (session?.id) params.set("session", session.id);
  if (tab) params.set("tab", tab);
  if (date) params.set("date", date);
  if (week != null && week !== "") params.set("week", String(week));
  if (session?.assignedDay) params.set("day", session.assignedDay);
  const qs = params.toString();
  return `/dashboard/plan${qs ? `?${qs}` : ""}`;
}

export function sessionMatchesTarget(session, targetId) {
  if (!targetId || !session) return false;
  const tid = String(targetId);
  return tid === String(session.id) || tid === String(session._sourceTemplateId);
}

export function getExercisesForBlock(session, blockType) {
  const block = getSessionBlocks(session).find((b) => b.type === blockType);
  return block?.exercises || [];
}

export const WEEK_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const DAY_ORDER = WEEK_DAYS;

export function getTodayName() {
  return DAY_ORDER[(new Date().getDay() + 6) % 7];
}

/** Próxima sesión según días de entreno del equipo */
export function findNextSession(weekSessions, trainingDays) {
  if (!weekSessions?.length) return null;
  const todayIdx = DAY_ORDER.indexOf(getTodayName());
  const sorted = [...(trainingDays || [])]
    .filter((d) => DAY_ORDER.includes(d))
    .sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));

  for (const day of sorted) {
    if (DAY_ORDER.indexOf(day) >= todayIdx) {
      const found = weekSessions.find((s) => s.assignedDay === day);
      if (found) return found;
    }
  }
  return weekSessions.find((s) => s.assignedDay === sorted[0]) || weekSessions[0];
}

export function getNonEmptyBlocks(session) {
  return getSessionBlocks(session).filter((b) => (b.exercises?.length || 0) > 0);
}

export function previewExercises(session, limit = 3) {
  return getSessionBlocks(session).flatMap((b) => b.exercises || []).slice(0, limit);
}
