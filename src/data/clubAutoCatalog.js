/**
 * Catálogo de la rama automática clubs/entrenadores.
 * Capa separada: no modifica exerciseCatalog ni etiquetas del motor individual.
 *
 * Sin balón: el admin sube vídeos numerados (Calentamiento 1, 2…).
 * Con balón: carpetas vacías; el admin añade las tareas a mano.
 */
import {
  coerceContentList,
  mergeListsPreferVideo,
  countListVideos,
  fetchMetaClub,
  saveMetaClub,
} from "../lib/contentRestore.js";

/** Texto que ve el entrenador en calentamiento sin balón (movilidad general). */
export const CLUB_SIN_BALON_INTRO = {
  titulo: "Calentamiento sin balón",
  descripcion:
    "Movilidad general sin balón: articular cadera, tobillo/bisagra y cadena posterior/glúteo, con activación suave antes de la tarea con balón. Todas las variantes son del mismo tipo (movilidad general); el vídeo concreto se elige al generar la sesión.",
};

export const CUSTOM_WARMUPS_KEY = "depro_club_custom_warmups";
export const CUSTOM_TASKS_KEY = "depro_club_custom_tasks";
const LEGACY_WARMUPS_KEY = "depro_club_warmup_overrides";
const LEGACY_TASKS_KEY = "depro_club_task_overrides";

function readJson(key, fallback) {
  try {
    if (typeof localStorage === "undefined") return fallback;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* ignore */ }
}

function loadListWithLegacy(currentKey, legacyKey) {
  const current = coerceContentList(readJson(currentKey, []));
  if (current.length) return current;
  const legacy = coerceContentList(readJson(legacyKey, []));
  if (legacy.length) {
    writeJson(currentKey, legacy);
    return legacy;
  }
  return [];
}

function persistCloud(id, name, detail) {
  if (typeof fetch !== "function") return;
  saveMetaClub(id, name, detail).catch(() => {});
}

export function loadCustomWarmups() {
  return loadListWithLegacy(CUSTOM_WARMUPS_KEY, LEGACY_WARMUPS_KEY);
}

export function saveCustomWarmups(list) {
  const numbered = (list || []).map((w, i) => ({
    ...w,
    nombre: `Calentamiento ${i + 1}`,
    carpeta: "/calentamientos_sin_balon",
  }));
  writeJson(CUSTOM_WARMUPS_KEY, numbered);
  persistCloud("GLOBAL_CLUB_WARMUPS", "Club Warmups", { warmups: numbered });
  return numbered;
}

export function loadCustomTasks() {
  return loadListWithLegacy(CUSTOM_TASKS_KEY, LEGACY_TASKS_KEY);
}

export function saveCustomTasks(list) {
  const next = list || [];
  writeJson(CUSTOM_TASKS_KEY, next);
  persistCloud("GLOBAL_CLUB_TASKS", "Club Tasks", { tasks: next });
  return next;
}

async function hydrateList({ local, cloudId, cloudField, saveLocal }) {
  const cloud = await fetchMetaClub(cloudId);
  if (!cloud) return local;
  const cloudList = coerceContentList(cloud[cloudField]);
  const merged = mergeListsPreferVideo(local, cloudList);
  if (merged.length) saveLocal(merged, { skipCloud: true });
  if (countListVideos(local) > 0 && countListVideos(cloudList) === 0) {
    persistCloud(cloudId, cloud.name || cloudId, { [cloudField]: local });
  }
  return merged.length ? merged : local;
}

function writeLocalOnly(key, value) {
  writeJson(key, value);
}

export async function hydrateCustomWarmups() {
  const local = loadCustomWarmups();
  await hydrateList({
    local,
    cloudId: "GLOBAL_CLUB_WARMUPS",
    cloudField: "warmups",
    saveLocal: (list) => {
      const numbered = (list || []).map((w, i) => ({
        ...w,
        nombre: `Calentamiento ${i + 1}`,
        carpeta: "/calentamientos_sin_balon",
      }));
      writeLocalOnly(CUSTOM_WARMUPS_KEY, numbered);
    },
  });
  return loadCustomWarmups();
}

export async function hydrateCustomTasks() {
  const local = loadCustomTasks();
  await hydrateList({
    local,
    cloudId: "GLOBAL_CLUB_TASKS",
    cloudField: "tasks",
    saveLocal: (list) => writeLocalOnly(CUSTOM_TASKS_KEY, list || []),
  });
  return loadCustomTasks();
}

/**
 * Seed vacío a propósito: José sube los vídeos desde admin.
 * El selector lee loadCustomWarmups().
 */
export const CLUB_GENERAL_WARMUPS = [];

/** Ya no hay activaciones técnicas inventadas; las tareas viven en carpetas. */
export const CLUB_BALL_WARMUPS = [];

/**
 * Carpetas de calentamiento / tarea con balón.
 * tipos_sesion = en qué dinámicas se puede usar esa carpeta.
 */
export const CLUB_TASK_FOLDERS = [
  {
    id: "rondo",
    label: "Rondo",
    carpeta: "/calentamiento_balon/rondo",
    tipos_sesion: ["extensiva", "intensiva"],
    nota: "Sirve en dinámica extensiva e intensiva.",
  },
  {
    id: "posesion",
    label: "Posesión",
    carpeta: "/calentamiento_balon/posesion",
    tipos_sesion: ["intensiva"],
    nota: "Mejor en dinámica intensiva.",
  },
  {
    id: "partido",
    label: "Partido",
    carpeta: "/calentamiento_balon/partido",
    tipos_sesion: ["intensiva"],
    nota: "Mejor en dinámica intensiva.",
  },
  {
    id: "circuito",
    label: "Circuito",
    carpeta: "/calentamiento_balon/circuito",
    tipos_sesion: ["extensiva", "intensiva"],
    nota: "Se puede usar en extensiva e intensiva.",
  },
  {
    id: "oleadas",
    label: "Oleadas",
    carpeta: "/calentamiento_balon/oleadas",
    tipos_sesion: ["intensiva", "reactiva"],
    nota: "Carga alta o prepartido.",
  },
  {
    id: "finalizacion",
    label: "Finalización",
    carpeta: "/calentamiento_balon/finalizacion",
    tipos_sesion: ["extensiva", "intensiva"],
    nota: "Extensiva e intensiva.",
  },
  {
    id: "transiciones",
    label: "Transiciones",
    carpeta: "/calentamiento_balon/transiciones",
    tipos_sesion: ["intensiva", "reactiva"],
    nota: "Mejor en intensiva o reactiva.",
  },
  {
    id: "rueda_pases",
    label: "Rueda de pases",
    carpeta: "/calentamiento_balon/rueda_pases",
    tipos_sesion: ["extensiva"],
    nota: "Mejor en dinámica extensiva.",
  },
];

export function folderById(id) {
  return CLUB_TASK_FOLDERS.find((f) => f.id === id) || null;
}

/** Mapeo paralelo club_* → nombres del catálogo individual (fallback del selector). */
export const CLUB_SLOT_EXERCISE_NAMES = {
  movilidad_cadera: ["Movilidad de cadera 90/90", "Movilidad de cadera en círculos", "Movilidad de cadera maripeda", "Movilidad de cadera estocada + rotación torácica", "Pase pierna por encima"],
  movilidad_tobillo: ["Movilidad de tobillo en flexión", "Movilidad de tobillo en círculos", "Movilidad de tobillo dorsiflexión con banda"],
  movilidad_toracica: ["Rotación torácica en cuadrupedia", "Rotación torácica en decúbito lateral", "Movilidad de hombro Y-T-W con banda"],
  activacion_gluteo: ["Puente de glúteo 2 piernas", "Glute bridge con goma", "Hip thrust unilateral", "Isometría puente de glúteo"],
  core_control: ["Dead bug", "Bird dog", "Antiextensión lumbar", "Hollow hold"],
  equilibrio: ["Equilibrio unipodal en línea", "Equilibrio unipodal con ojos cerrados", "Estabilidad tobillo", "Caminata talón-punta línea recta"],
  desplazamiento_controlado: ["Lateral walk con banda elástica", "Monster walk", "Zancada lateral", "Skipping técnico en sitio"],
  fuerza_bilateral_anterior: ["Sentadilla clásica", "Sentadilla goblet", "Sentadilla con mancuernas", "Sentadilla brazos arriba", "Split squat"],
  fuerza_unilateral: ["Zancada atrás", "Zancada adelante", "Step-up en banco", "Sentadilla búlgara con mancuernas", "Zancada con mancuernas"],
  cadena_posterior: ["Puente de glúteo 2 piernas", "Peso muerto rumano con mancuernas", "Hip thrust con mancuerna", "Buenos días con mancuernas", "Extensión isquios tumbado con banda"],
  core_estabilidad: ["Plancha frontal", "Plancha lateral", "Anti-rotación con banda", "Pallof press con banda", "Bird dog"],
  pliometria: ["Mini saltos pogos", "Saltos verticales simples", "Saltos laterales sobre línea", "Saltos adelante cortos", "Salto caja baja"],
  aceleracion: ["Aceleraciones 10 m", "Aceleraciones 15 m", "Aceleración jogging → sprint", "Salidas desde rodilla"],
  coordinacion_pies: ["Saltos en escalera tipo quick feet", "Skipping técnico en sitio", "Mini saltos pogos"],
  reaccion: ["Reacción visual", "Reacción auditiva", "COD reacción"],
  COD: ["COD 3 conos", "COD 5-10-5", "Sprint + frenada", "Zig-zag 6 conos", "COD planta-pivote"],
  fuerza_principal_anterior: ["Sentadilla con barra trasera", "Sentadilla multipower", "Sentadilla máquina", "Sentadilla goblet", "Prensa inclinada"],
  fuerza_principal_posterior: ["Peso muerto convencional con barra", "Peso muerto rumano con mancuernas", "Hip thrust con mancuerna", "Curl femoral tumbado en máquina"],
  fuerza_rapida: ["Sentadilla goblet", "Sentadilla multipower", "Saltos verticales simples", "Aceleraciones 10 m"],
  locomocion_tecnica: ["Skipping técnico en sitio", "Farmer walk corto", "Aceleraciones 10 m", "Técnica de carrera"],
};

/** Mapeo grupo microciclo → tipo de sesión. */
export const GRUPO_TO_SESION = {
  regenerativo: "extensiva",
  carga_alta: "intensiva",
  prepartido: "reactiva",
};

/** Nivel A/B/C → bloque de edad 1/2/3. */
export const NIVEL_TO_BLOQUE = { A: "1", B: "2", C: "3" };

/** No mostrar «Bloque 1» a secas: la IA y el admin necesitan la edad. */
export const AGE_BLOCK_LABELS = {
  "1": "A · 9–12 años",
  "2": "B · 12–15 años",
  "3": "C · 16+ años",
};

export function ageBlockLabel(blockOrNivel) {
  const key = NIVEL_TO_BLOQUE[String(blockOrNivel || "").toUpperCase()] || String(blockOrNivel || "");
  return AGE_BLOCK_LABELS[key] || `Nivel ${blockOrNivel}`;
}

/** Catálogo sistema vacío: las tareas las sube el admin. */
export const CLUB_MAIN_TASKS = [];
export const CLUB_MAIN_TASKS_COUNT = 0;

export const CLUB_AUTO_OBSERVACIONES = {
  A: "Día regenerativo/control: priorizar calidad de ejecución, bajo impacto y recuperación.",
  B: "Día de carga: estímulo de fuerza/potencia/aceleración. Vigilar volumen total.",
  C: "Día prepartido/activación: velocidad corta, coordinación y frescura neuromuscular.",
};
