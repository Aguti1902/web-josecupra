/**
 * coachEngine — motor de reglas de DEPRO Coach.
 *
 * Nunca genera contenido libre ni usa Math.random para la generación
 * automática: clasifica → filtra → selecciona de la biblioteca de forma
 * determinista (rotación por hash de fecha/slot, igual espíritu que
 * `playerPlanEngine`). Las sustituciones manuales rotan de forma
 * determinista sobre la lista de candidatos filtrada.
 */
import { PROTOCOL_STRUCTURE, CATEGORY_PROTOCOLS } from "../data/coachExerciseLibrary";
import { getCachedCoachLibrary } from "./coachLibraryStorage";

export { PROTOCOL_STRUCTURE, CATEGORY_PROTOCOLS };

/* ═══════════════════════════════════════════════════════════
   1. CLASIFICACIÓN
   ═══════════════════════════════════════════════════════════ */

/** Clasifica la edad del equipo/jugador en uno de los 3 bloques de trabajo */
export function classifyAgeBlock(age) {
  const n = Number(age);
  if (!Number.isFinite(n)) return "Bloque 2";
  if (n <= 12) return "Bloque 1";
  if (n <= 16) return "Bloque 2";
  return "Bloque 3";
}

// Mismas categorías que el resto de la app (AppLayout/CargasPage/MesocyclePage)
const CATEGORY_BLOCK_MAP = {
  "sub-9": "Bloque 1", "sub-10": "Bloque 1", "sub-11": "Bloque 1", "sub-12": "Bloque 1",
  "sub-13": "Bloque 2", "sub-14": "Bloque 2", "sub-15": "Bloque 2",
  "sub-16": "Bloque 3", "juvenil": "Bloque 3", "amateur": "Bloque 3", "senior": "Bloque 3",
};

/** Clasifica a partir de una etiqueta de categoría (ej. "Alevín", "Cadete") */
export function classifyBlockFromCategory(categoryLabel) {
  const key = String(categoryLabel || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const [k, block] of Object.entries(CATEGORY_BLOCK_MAP)) {
    if (key.includes(k)) return block;
  }
  return "Bloque 2";
}

export function getProtocolStructure(protocol) {
  return PROTOCOL_STRUCTURE[protocol] || null;
}

/* ═══════════════════════════════════════════════════════════
   2. FILTROS
   ═══════════════════════════════════════════════════════════ */

/**
 * Filtra la biblioteca según bloque, protocolo, categoría (slot), material
 * disponible, acceso a gimnasio y exclusiones (lesiones/ejercicios recientes).
 */
export function filterLibrary({
  library,
  block,
  protocol,
  categoria,
  material,
  gymAccess = true,
  excludeIds = [],
  excludeTags = [],
} = {}) {
  const lib = library || getCachedCoachLibrary();
  const materialSet = material?.length ? new Set(material) : null;

  return lib.filter((e) => {
    if (e.estado !== "aprobado") return false;
    if (block && !e.bloquesPermitidos?.includes(block)) return false;
    if (protocol && !e.protocolosPermitidos?.includes(protocol)) return false;
    if (categoria && e.categoria !== categoria) return false;
    if (excludeIds.includes(e.id)) return false;
    if (excludeTags.length && e.etiquetas?.some((t) => excludeTags.includes(t))) return false;
    if (!gymAccess && e.material?.includes("gimnasio")) return false;
    if (materialSet) {
      const needsUnavailable = e.material?.some((m) => m !== "sin_material" && !materialSet.has(m));
      if (needsUnavailable) return false;
    }
    return true;
  });
}

/* ═══════════════════════════════════════════════════════════
   3. SELECCIÓN DETERMINISTA
   ═══════════════════════════════════════════════════════════ */

/** Hash simple (djb2) para convertir una clave de texto en un índice estable */
function stableIndex(key, length) {
  if (length <= 0) return 0;
  let hash = 5381;
  const s = String(key);
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) + hash + s.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % length;
}

/**
 * Selecciona un ejercicio para un slot concreto (categoría) de forma
 * determinista, evitando repetir ejercicios ya usados en la misma sesión.
 * Aplica relajación progresiva de filtros si no hay candidatos.
 */
export function selectExerciseForSlot({
  library, block, protocol, categoria, material, gymAccess, seedKey, usedIds = [],
}) {
  const lib = library || getCachedCoachLibrary();

  const attempts = [
    { block, protocol, categoria, material, gymAccess },          // filtros completos
    { block, protocol, categoria, gymAccess },                     // ignora material
    { protocol, categoria, gymAccess },                             // ignora bloque
    { categoria },                                                  // solo categoría (último recurso)
  ];

  for (const filters of attempts) {
    const candidates = filterLibrary({ library: lib, ...filters, excludeIds: usedIds });
    if (candidates.length > 0) {
      const idx = stableIndex(seedKey, candidates.length);
      return candidates[idx];
    }
  }
  return null;
}

/**
 * Sustituye un ejercicio manteniendo objetivo/material/nivel/bloque/protocolo.
 * Rota de forma determinista por el nº de sustituciones ya realizadas.
 */
export function substituteExercise(exercise, { library, config, excludeIds = [], attempt = 1 } = {}) {
  const lib = library || getCachedCoachLibrary();
  const block = config?.ageBlock;
  const gymAccess = config?.gymAccess !== false;
  const material = config?.material;

  const candidates = filterLibrary({
    library: lib,
    block,
    protocol: exercise.protocolosPermitidos?.[0],
    categoria: exercise.categoria,
    material,
    gymAccess,
    excludeIds: [exercise.id, ...excludeIds],
  });
  if (!candidates.length) return exercise;
  const idx = attempt % candidates.length;
  return candidates[idx];
}

/* ═══════════════════════════════════════════════════════════
   4. GENERACIÓN DE SESIÓN / MICROCICLO / MESOCICLO
   ═══════════════════════════════════════════════════════════ */

export function toSessionExercise(libEx, slotIndex) {
  return {
    id: `sess_ex_${libEx.id}_${slotIndex}_${Date.now().toString(36)}`,
    exerciseId: libEx.id,
    name: libEx.nombre,
    categoria: libEx.categoria,
    sets: libEx.complejidad === "alta" ? "4" : libEx.complejidad === "baja" ? "2" : "3",
    reps: libEx.categoria === "Sprint" || libEx.categoria === "Aceleración" ? "3-4 reps" : "10-12",
    rest: libEx.categoria === "Sprint" || libEx.categoria === "Pliometría" ? "90s" : "45s",
    duration: `${libEx.duracion} min`,
    videoUrl: libEx.video || "",
    gif: libEx.gif || "",
    description: libEx.descripcion,
    tips: libEx.notas ? [libEx.notas] : [],
    material: libEx.material,
    slotIndex,
    coachNotes: "",
  };
}

/**
 * Genera una sesión completa para un protocolo (A/B/C) y una fecha dada.
 * Devuelve una estructura de tarjetas de ejercicio lista para renderizar.
 */
export function generateSession({ config, protocol, date, library, title } = {}) {
  const lib = library || getCachedCoachLibrary();
  const structure = getProtocolStructure(protocol);
  if (!structure) return null;

  const block = config?.ageBlock || "Bloque 2";
  const material = config?.material;
  const gymAccess = config?.gymAccess !== false;
  const usedIds = [];

  const exercises = structure.slots.map((categoria, i) => {
    const seedKey = `${date || "seed"}_${protocol}_${i}_${categoria}`;
    const picked = selectExerciseForSlot({
      library: lib, block, protocol, categoria, material, gymAccess, seedKey, usedIds,
    });
    if (picked) usedIds.push(picked.id);
    return picked ? toSessionExercise(picked, i) : null;
  }).filter(Boolean);

  const totalMin = exercises.reduce((acc, e) => acc + (parseInt(e.duration, 10) || 0), 0);

  return {
    id: `coach_sess_${protocol}_${date || Date.now()}`,
    title: title || `Sesión ${structure.label}`,
    protocol,
    protocolLabel: structure.label,
    objetivos: structure.objetivos,
    date: date || null,
    exercises,
    duracionEstimada: `${totalMin} min`,
    observaciones: "",
  };
}

/** Plantillas de reparto semanal (nº entrenamientos → días + protocolo preferente) */
export const WEEK_TEMPLATES = {
  1: [{ day: "Miércoles", protocol: "B" }],
  2: [{ day: "Martes", protocol: "B" }, { day: "Viernes", protocol: "C" }],
  3: [{ day: "Lunes", protocol: "A" }, { day: "Miércoles", protocol: "B" }, { day: "Viernes", protocol: "C" }],
  4: [{ day: "Lunes", protocol: "A" }, { day: "Martes", protocol: "B" }, { day: "Jueves", protocol: "B" }, { day: "Viernes", protocol: "C" }],
  5: [{ day: "Lunes", protocol: "A" }, { day: "Martes", protocol: "B" }, { day: "Miércoles", protocol: "B" }, { day: "Jueves", protocol: "C" }, { day: "Viernes", protocol: "C" }],
};

const DAY_ORDER = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

function dateForDay(weekStart, dayName) {
  if (!weekStart) return null;
  const idx = DAY_ORDER.indexOf(dayName);
  if (idx < 0) return null;
  const d = new Date(weekStart + "T00:00:00");
  d.setDate(d.getDate() + idx);
  return d.toISOString().slice(0, 10);
}

/** Genera el microciclo (semana) completo a partir de la config del entrenador */
export function generateMicrociclo({ config, weekStart, library } = {}) {
  const lib = library || getCachedCoachLibrary();
  const n = Math.min(Math.max(config?.trainingsPerWeek || 3, 1), 5);
  const template = WEEK_TEMPLATES[n] || WEEK_TEMPLATES[3];

  const sessions = template.map(({ day, protocol }) => {
    const date = dateForDay(weekStart, day);
    const session = generateSession({ config, protocol, date, library: lib });
    return { ...session, assignedDay: day };
  });

  return { weekStart: weekStart || null, trainingsPerWeek: n, sessions };
}

const PHASE_OBJECTIVES = {
  "pretemporada": "Base física general · Fuerza y resistencia",
  "fuerza": "Desarrollo de fuerza · Bloque B predominante",
  "velocidad": "Velocidad y potencia · Bloque C predominante",
  "mantenimiento": "Mantenimiento de forma · Reparto equilibrado A/B/C",
  "recuperacion": "Recuperación y prevención · Bloque A predominante",
};

/** Genera un mesociclo de N semanas con metadata editable por fase */
export function generateMesociclo({ config, startDate, numWeeks = 4, library } = {}) {
  const lib = library || getCachedCoachLibrary();
  const objetivoFase = PHASE_OBJECTIVES[config?.phaseObjective] || PHASE_OBJECTIVES.mantenimiento;

  const weeks = [];
  for (let w = 0; w < numWeeks; w++) {
    let weekStart = null;
    if (startDate) {
      const d = new Date(startDate + "T00:00:00");
      d.setDate(d.getDate() + w * 7);
      weekStart = d.toISOString().slice(0, 10);
    }
    weeks.push({
      weekNumber: w + 1,
      weekStart,
      objetivo: objetivoFase,
      microciclo: generateMicrociclo({ config, weekStart, library: lib }),
    });
  }

  return {
    startDate: startDate || null,
    numWeeks,
    phaseObjective: config?.phaseObjective || "mantenimiento",
    objetivoLabel: objetivoFase,
    weeks,
  };
}
