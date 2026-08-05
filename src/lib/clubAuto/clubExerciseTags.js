/**
 * Capa paralela club_* — NO la lee el motor individual.
 * El motor club puede importar getClubTagsForExercise / buildClubExerciseTagIndex.
 */
import { EXERCISES } from "../exerciseCatalog.js";

/** Slots club alineados con protocolos Campo/Gym A-B-C */
const SLOT_RULES = [
  { slot: "club_slot_movilidad_cadera", match: (e) => e.carpeta === "movilidad" && ["cadera"].includes(e.etiquetas?.grupo_principal) },
  { slot: "club_slot_movilidad_tobillo", match: (e) => e.carpeta === "movilidad" && e.etiquetas?.grupo_principal === "tobillo" },
  { slot: "club_slot_movilidad_toracica", match: (e) => e.carpeta === "movilidad" && /torac|escapular|hombro/i.test(e.nombre) },
  { slot: "club_slot_activacion_cadena_posterior", match: (e) => (e.etiquetas?.patron || []).includes("cadena_posterior") && e.etiquetas?.grupo_principal !== "biceps" },
  { slot: "club_slot_core_control", match: (e) => e.carpeta === "core" && (e.etiquetas?.patron || []).includes("isometrico") },
  { slot: "club_slot_equilibrio", match: (e) => (e.etiquetas?.accion_secundaria || []).includes("equilibrio") || /equilibrio|unipodal/i.test(e.nombre) },
  { slot: "club_slot_desplazamiento_controlado", match: (e) => /lateral walk|monster walk|desplazamiento|marcha a/i.test(e.nombre) },
  { slot: "club_slot_fuerza_bilateral_anterior", match: (e) => e.carpeta === "fuerza_tren_inferior" && (e.etiquetas?.patron || []).includes("cadena_anterior") && !/unilateral|split|zancada|step/i.test(e.nombre) },
  { slot: "club_slot_fuerza_unilateral", match: (e) => e.carpeta === "fuerza_tren_inferior" && /zancada|split|step-up|unilateral|búlgara|bulgara/i.test(e.nombre) },
  { slot: "club_slot_cadena_posterior", match: (e) => (e.etiquetas?.patron || []).includes("cadena_posterior") },
  { slot: "club_slot_core_estabilidad", match: (e) => e.carpeta === "core" },
  { slot: "club_slot_pliometria", match: (e) => e.carpeta === "pliometria" },
  { slot: "club_slot_aceleracion", match: (e) => (e.etiquetas?.patron || []).includes("aceleracion") },
  { slot: "club_slot_coordinacion_pies", match: (e) => /pies|skipping|escalera|coordin/i.test(e.nombre) },
  { slot: "club_slot_reaccion", match: (e) => (e.etiquetas?.patron || []).includes("reaccion") || /reacci[oó]n/i.test(e.nombre) },
  { slot: "club_slot_COD", match: (e) => (e.etiquetas?.patron || []).includes("COD") || /cod|slalom|zig.?zag|t-test/i.test(e.nombre) },
  { slot: "club_slot_fuerza_principal_anterior", match: (e) => e.carpeta === "fuerza_tren_inferior" && (e.etiquetas?.patron || []).includes("cadena_anterior") && e.etiquetas?.rol === "basico" },
  { slot: "club_slot_fuerza_principal_posterior", match: (e) => e.carpeta === "fuerza_tren_inferior" && (e.etiquetas?.patron || []).includes("cadena_posterior") && e.etiquetas?.rol === "basico" },
  { slot: "club_slot_fuerza_rapida", match: (e) => (e.etiquetas?.patron || []).includes("fuerza_explosiva") || e.carpeta === "pliometria" },
  { slot: "club_slot_locomocion_tecnica", match: (e) => /marcha a|skipping|t[eé]cnica de carrera|farmer/i.test(e.nombre) },
];

function entornoFor(ex) {
  const mats = ex.etiquetas?.material || [];
  const gym = mats.some((m) => String(m).startsWith("maquina") || m === "barra");
  return gym ? ["club_gym", "club_campo"] : ["club_campo", "club_gym"];
}

function protocoloHints(ex) {
  const out = [];
  if (ex.carpeta === "movilidad" || ex.carpeta === "core" || (ex.etiquetas?.accion_secundaria || []).includes("equilibrio")) {
    out.push("club_protocolo_A");
  }
  if (ex.carpeta === "fuerza_tren_inferior" || ex.carpeta === "fuerza_tren_superior" || ex.carpeta === "pliometria") {
    out.push("club_protocolo_B");
  }
  if (ex.carpeta === "velocidad" || (ex.etiquetas?.patron || []).some((p) => ["COD", "reaccion", "aceleracion"].includes(p))) {
    out.push("club_protocolo_C");
  }
  return out.length ? out : ["club_protocolo_B"];
}

function intensidadDia(ex) {
  if (ex.carpeta === "movilidad" || ex.carpeta === "core") return ["club_regenerativo"];
  if (ex.carpeta === "velocidad" && (ex.etiquetas?.patron || []).includes("COD")) return ["club_prepartido"];
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
  club_slot: SLOT_RULES.map((r) => r.slot),
};
