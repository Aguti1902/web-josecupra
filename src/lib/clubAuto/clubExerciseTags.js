/**
 * Capa paralela de etiquetas club_* para ejercicios.
 * NO muta exerciseCatalog ni las etiquetas del motor individual.
 * El motor club lee estas etiquetas; el motor individual las ignora.
 */
import { EXERCISES } from "../exerciseCatalog.js";
import { CLUB_SLOT_EXERCISE_NAMES } from "../../data/clubAutoCatalog.js";

function normalizeName(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Slots que tipicamente son gym-heavy */
const GYM_HEAVY_SLOTS = new Set([
  "fuerza_principal_anterior",
  "fuerza_principal_posterior",
  "fuerza_rapida",
]);

/**
 * Construye mapa id → etiquetas club_* a partir del mapeo de slots.
 * @returns {Record<string, {
 *   club_slot: string[],
 *   club_entorno: ("campo"|"gym")[],
 *   club_protocolo?: ("A"|"B"|"C")[],
 * }>}
 */
export function buildClubExerciseTagIndex() {
  const index = {};

  for (const [slot, names] of Object.entries(CLUB_SLOT_EXERCISE_NAMES)) {
    for (const name of names) {
      const target = normalizeName(name);
      const match = EXERCISES.find((ex) => {
        const n = normalizeName(ex.nombre);
        return n.includes(target) || target.includes(n) || n.startsWith(target.slice(0, 12));
      });
      if (!match) continue;
      if (!index[match.id]) {
        index[match.id] = {
          club_slot: [],
          club_entorno: GYM_HEAVY_SLOTS.has(slot) ? ["gym"] : ["campo", "gym"],
        };
      }
      if (!index[match.id].club_slot.includes(slot)) {
        index[match.id].club_slot.push(slot);
      }
    }
  }

  return index;
}

let _cache = null;

export function getClubTagsForExercise(exerciseId) {
  if (!_cache) _cache = buildClubExerciseTagIndex();
  return _cache[exerciseId] || null;
}

/** Etiquetas de día/protocolo (no van en el ejercicio, sino en la sesión). */
export const CLUB_DAY_TAG_VALUES = {
  club_nivel: ["A", "B", "C"],
  club_entorno: ["campo", "gym"],
  club_protocolo: ["A", "B", "C"],
  club_intensidad_dia: ["regenerativo", "carga_alta", "prepartido"],
};
