/**
 * Adapta ejercicios v2 (pool-based) al formato legacy del admin/catálogo.
 */
import { POOLS } from "./poolDefinitions.js";
import { EXERCISES as V2_EXERCISES } from "./exerciseCatalog.js";

const FAMILY_TAGS = {
  empuje: ["fuerza", "tren_superior", "empuje"],
  traccion: ["fuerza", "tren_superior", "traccion"],
  rodilla: ["fuerza", "tren_inferior"],
  cadera: ["fuerza", "tren_inferior", "gluteo"],
  gluteo: ["fuerza", "gluteo"],
  gemelo: ["fuerza", "tren_inferior"],
  core: ["core"],
  prevencion: ["prevencion"],
  movilidad: ["movilidad"],
  velocidad: ["velocidad", "fuerza_explosiva"],
  pliometria: ["pliometria", "fuerza_explosiva"],
  isometrico: ["isometrico", "fuerza"],
  funcional: ["fuerza", "core"],
};

function mapLesiones(lesionesContra = []) {
  return lesionesContra.map((l) => {
    if (l.includes("rodilla")) return "rodilla";
    if (l.includes("tobillo")) return "tobillo";
    if (l.includes("hombro")) return "hombro";
    if (l.includes("espalda")) return "espalda";
    if (l.includes("pubalgia")) return "pubalgia";
    if (l.includes("isquio")) return "isquios";
    return l.replace("_agudo", "").replace("_inestable", "");
  });
}

function deriveTags(pool) {
  if (!pool) return ["fuerza"];
  const tags = new Set(FAMILY_TAGS[pool.familia] || ["fuerza"]);
  if (pool.funcion === "prevencion") tags.add("prevencion");
  if (pool.tipo === "movilidad") tags.add("movilidad");
  if (pool.tipo === "pliometria") tags.add("pliometria");
  if (pool.patron === "isometrico") tags.add("isometrico");
  if (pool.familia === "velocidad") tags.add("velocidad");
  if (pool.material === "barra" || pool.material === "maquina") tags.add("fuerza_maxima");
  return [...tags];
}

export function v2ToLegacyExercise(ex) {
  const pool = POOLS[ex.pool];
  return {
    id: `v2_${ex.id}`,
    v2Id: ex.id,
    nombre: ex.nombre,
    pool: ex.pool,
    etiquetas: deriveTags(pool),
    material: pool?.material || "sin_material",
    contraindicado: mapLesiones(ex.lesionesContra),
    lesionesContra: ex.lesionesContra || [],
    tips: ex.tips,
    videoUrl: ex.videoUrl,
    edadMinima: ex.edadMinima,
    description: pool?.nombre ? `Ejercicio de ${pool.nombre}.` : "",
  };
}

export function getLegacyCatalogFromV2() {
  return V2_EXERCISES.map(v2ToLegacyExercise);
}

export function getV2ExerciseById(id) {
  const num = typeof id === "string" ? parseInt(id.replace(/^v2_/, ""), 10) : id;
  return V2_EXERCISES.find((e) => e.id === num) || null;
}
