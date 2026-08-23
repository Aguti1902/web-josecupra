/**
 * Capa paralela club_* — NO la lee el motor individual.
 * Etiquetas alineadas con los slots de plantilla club (Campo/Gym A-B-C).
 */
import { EXERCISES } from "../exerciseCatalog.js";

function pats(e) {
  return e.etiquetas?.patron || [];
}
function secs(e) {
  return e.etiquetas?.accion_secundaria || [];
}
function nameOf(e) {
  return String(e.nombre || "");
}

/** Slots club alineados con protocolos Campo/Gym A-B-C */
export const SLOT_RULES = [
  {
    slot: "club_slot_movilidad_cadera",
    label: "Movilidad de cadera",
    match: (e) => e.carpeta === "movilidad" && (e.etiquetas?.grupo_principal === "cadera" || /cadera/i.test(nameOf(e))),
  },
  {
    slot: "club_slot_movilidad_tobillo",
    label: "Movilidad de tobillo o bisagra",
    match: (e) =>
      (e.carpeta === "movilidad" && (e.etiquetas?.grupo_principal === "tobillo" || /tobillo|bisagra|hinge/i.test(nameOf(e))))
      || /bisagra|good morning|buenos d[ií]as/i.test(nameOf(e)),
  },
  {
    slot: "club_slot_movilidad_toracica",
    label: "Movilidad torácica",
    match: (e) => e.carpeta === "movilidad" && /torac|escapular|hombro|rotaci[oó]n/i.test(nameOf(e)),
  },
  {
    slot: "club_slot_activacion_gluteo",
    label: "Activación cadena posterior / glúteo",
    match: (e) => /glute|puente|hip thrust|bridge/i.test(nameOf(e)),
  },
  {
    slot: "club_slot_activacion_cadena_posterior",
    label: "Activación cadena posterior / glúteo",
    match: (e) => pats(e).includes("cadena_posterior") && e.etiquetas?.grupo_principal !== "biceps",
  },
  {
    slot: "club_slot_core_control",
    label: "Core control",
    match: (e) => e.carpeta === "core" && (pats(e).includes("isometrico") || /dead bug|bird dog|hollow|plancha/i.test(nameOf(e))),
  },
  {
    slot: "club_slot_equilibrio",
    label: "Equilibrio / propiocepción",
    match: (e) => secs(e).includes("equilibrio") || /equilibrio|unipodal|propiocep/i.test(nameOf(e)),
  },
  {
    slot: "club_slot_desplazamiento_controlado",
    label: "Desplazamiento controlado",
    match: (e) => /lateral walk|monster walk|desplazamiento|marcha a|zancada lateral/i.test(nameOf(e)),
  },
  {
    slot: "club_slot_fuerza_bilateral_anterior",
    label: "Fuerza bilateral anterior",
    match: (e) => e.carpeta === "fuerza_tren_inferior" && pats(e).includes("cadena_anterior") && !/unilateral|split|zancada|step|b[uú]lgara/i.test(nameOf(e)),
  },
  {
    slot: "club_slot_fuerza_unilateral",
    label: "Fuerza unilateral",
    match: (e) => e.carpeta === "fuerza_tren_inferior" && /zancada|split|step-up|unilateral|b[uú]lgara/i.test(nameOf(e)),
  },
  {
    slot: "club_slot_cadena_posterior",
    label: "Cadena posterior",
    match: (e) => pats(e).includes("cadena_posterior"),
  },
  {
    slot: "club_slot_core_estabilidad",
    label: "Core / estabilidad",
    match: (e) => e.carpeta === "core",
  },
  {
    slot: "club_slot_pliometria",
    label: "Pliometría",
    match: (e) => e.carpeta === "pliometria",
  },
  {
    slot: "club_slot_aceleracion",
    label: "Aceleración / sprint corto",
    match: (e) => pats(e).includes("aceleracion") || /acelerac|sprint|salidas/i.test(nameOf(e)),
  },
  {
    slot: "club_slot_coordinacion_pies",
    label: "Coordinación de pies",
    match: (e) => /pies|skipping|escalera|coordin/i.test(nameOf(e)),
  },
  {
    slot: "club_slot_reaccion",
    label: "Reacción",
    match: (e) => pats(e).includes("reaccion") || /reacci[oó]n/i.test(nameOf(e)),
  },
  {
    slot: "club_slot_COD",
    label: "COD / sprint corto + frenada",
    match: (e) => !e.esTest && (pats(e).includes("COD") || /cod|slalom|zig.?zag|frenada/i.test(nameOf(e))),
  },
  {
    slot: "club_slot_fuerza_principal_anterior",
    label: "Fuerza principal anterior",
    match: (e) => e.carpeta === "fuerza_tren_inferior" && pats(e).includes("cadena_anterior") && e.etiquetas?.rol === "basico",
  },
  {
    slot: "club_slot_fuerza_principal_posterior",
    label: "Fuerza principal posterior",
    match: (e) => e.carpeta === "fuerza_tren_inferior" && pats(e).includes("cadena_posterior") && e.etiquetas?.rol === "basico",
  },
  {
    slot: "club_slot_fuerza_rapida",
    label: "Fuerza rápida / técnica",
    match: (e) => pats(e).includes("fuerza_explosiva") || e.carpeta === "pliometria",
  },
  {
    slot: "club_slot_locomocion_tecnica",
    label: "Locomoción / aceleración suave",
    match: (e) => /marcha a|skipping|t[eé]cnica de carrera|farmer/i.test(nameOf(e)),
  },
];

export const CLUB_SLOT_LABELS = Object.fromEntries(SLOT_RULES.map((r) => [r.slot, r.label]));

function entornoFor(ex) {
  const mats = ex.etiquetas?.material || [];
  const gym = mats.some((m) => String(m).startsWith("maquina") || m === "barra" || m === "gym_completo");
  return gym ? ["club_gym", "club_campo"] : ["club_campo", "club_gym"];
}

function protocoloHints(ex) {
  const out = [];
  if (ex.carpeta === "movilidad" || ex.carpeta === "core" || secs(ex).includes("equilibrio")) {
    out.push("club_protocolo_A");
  }
  if (ex.carpeta === "fuerza_tren_inferior" || ex.carpeta === "fuerza_tren_superior" || ex.carpeta === "pliometria") {
    out.push("club_protocolo_B");
  }
  if (ex.carpeta === "velocidad" || pats(ex).some((p) => ["COD", "reaccion", "aceleracion"].includes(p))) {
    out.push("club_protocolo_C");
  }
  return out.length ? out : ["club_protocolo_B"];
}

function intensidadDia(ex) {
  if (ex.carpeta === "movilidad" || ex.carpeta === "core") return ["club_regenerativo"];
  if (ex.carpeta === "velocidad" && pats(ex).includes("COD")) return ["club_prepartido"];
  if (ex.carpeta === "pliometria" || ex.etiquetas?.intensidad === "alta") return ["club_carga_alta"];
  return ["club_carga_alta"];
}

/**
 * Índice id → etiquetas club_* (capa paralela).
 */
export function buildClubExerciseTagIndex() {
  const index = {};
  for (const ex of EXERCISES) {
    const slots = SLOT_RULES.filter((r) => r.match(ex)).map((r) => r.slot);
    if (!slots.length) continue;
    index[ex.id] = {
      club_slot: slots,
      club_entorno: entornoFor(ex),
      club_protocolo: protocoloHints(ex),
      club_intensidad_dia: intensidadDia(ex),
      club_nivel: ["club_nivel_A", "club_nivel_B", "club_nivel_C"],
    };
  }
  return index;
}

let _cache = null;

export function getClubTagsForExercise(exerciseId) {
  if (!_cache) _cache = buildClubExerciseTagIndex();
  return _cache[exerciseId] || null;
}

/** Catálogo de valores válidos club_* (documentación / admin). */
export const CLUB_TAG_VALUES = {
  club_nivel: ["club_nivel_A", "club_nivel_B", "club_nivel_C"],
  club_entorno: ["club_campo", "club_gym"],
  club_protocolo: ["club_protocolo_A", "club_protocolo_B", "club_protocolo_C"],
  club_intensidad_dia: ["club_regenerativo", "club_carga_alta", "club_prepartido"],
  club_material: [
    "club_material_sin_material",
    "club_material_gomas",
    "club_material_mancuernas",
    "club_material_barra",
    "club_material_gym_completo",
  ],
  club_slot: SLOT_RULES.map((r) => r.slot),
};

/** Mapeo UI cuestionario (igual que planificaciones individuales) → tags club_material_* */
export const CLUB_MATERIAL_TAG_MAP = {
  "Sin material": "club_material_sin_material",
  Gomas: "club_material_gomas",
  Mancuernas: "club_material_mancuernas",
  Barra: "club_material_barra",
  "Gimnasio completo": "club_material_gym_completo",
  sin_material: "club_material_sin_material",
  gomas: "club_material_gomas",
  mancuernas: "club_material_mancuernas",
  barra: "club_material_barra",
  gym_completo: "club_material_gym_completo",
};

export function materialsToClubTags(materials = []) {
  return (materials || [])
    .map((m) => CLUB_MATERIAL_TAG_MAP[m] || null)
    .filter(Boolean);
}
