/**
 * Mapea el catálogo compartido (exerciseCatalog.EXERCISES) al shape de la
 * biblioteca del motor coach (coachEngine / CMS coach-library).
 */
import { EXERCISES } from "./exerciseCatalog.js";
import { CATEGORY_PROTOCOLS, BLOQUES } from "../data/coachExerciseLibrary.js";

const TODOS_BLOQUES = BLOQUES;

/** carpeta del catálogo → categoría de slots del coach */
function carpetaToCategoria(ex) {
  const carpeta = ex.carpeta || "";
  const patrons = ex.etiquetas?.patron || [];

  switch (carpeta) {
    case "movilidad":
      return "Movilidad";
    case "core":
      return "Core";
    case "fuerza_tren_inferior":
    case "fuerza_tren_superior":
      return "Fuerza";
    case "pliometria":
      return "Pliometría";
    case "prevencion":
      return "Compensatorio";
    case "velocidad": {
      if (patrons.includes("aceleracion") || patrons.includes("velocidad_pura")) return "Aceleración";
      if (patrons.includes("COD") || patrons.includes("reaccion")) return "Técnica carrera";
      return "Coordinación";
    }
    default:
      return "Fuerza";
  }
}

function categoriaToObjetivo(categoria) {
  const map = {
    Movilidad: "movilidad",
    Compensatorio: "compensatorio",
    Core: "core",
    Fuerza: "fuerza",
    Pliometría: "pliometria",
    Aceleración: "aceleracion",
    "Técnica carrera": "velocidad",
    Coordinación: "coordinacion",
    Activación: "fuerza",
    Respiración: "recuperacion",
    COD: "cambio_direccion",
    Reacción: "reaccion",
    Sprint: "velocidad",
  };
  return map[categoria] || "fuerza";
}

function defaultSetsRepsRest(categoria) {
  if (categoria === "Sprint" || categoria === "Aceleración") {
    return { sets: "3", reps: "3-4 reps", rest: "90s" };
  }
  if (categoria === "Pliometría") {
    return { sets: "3", reps: "6-8", rest: "90s" };
  }
  if (categoria === "Movilidad" || categoria === "Compensatorio") {
    return { sets: "2", reps: "8-10", rest: "30s" };
  }
  return { sets: "3", reps: "10-12", rest: "45s" };
}

function mapMaterial(et) {
  const mats = et?.material || ["sin_material"];
  return mats.length ? mats : ["sin_material"];
}

/**
 * Convierte un ejercicio del catálogo V2 al shape coach.
 */
export function mapCatalogExerciseToCoach(ex) {
  const categoria = carpetaToCategoria(ex);
  const protocolos = CATEGORY_PROTOCOLS[categoria] || ["A", "B", "C"];
  const { sets, reps, rest } = defaultSetsRepsRest(categoria);
  const et = ex.etiquetas || {};
  const descripcion = Array.isArray(ex.tips) && ex.tips.length
    ? ex.tips.join(" ")
    : `Ejercicio: ${ex.nombre}.`;
  const id = `catalog_${ex.id}`;

  return {
    id,
    nombre: ex.nombre,
    name: ex.nombre,
    video: ex.videoUrl || "",
    gif: "",
    videoUrl: ex.videoUrl || "",
    descripcion,
    description: descripcion,
    objetivo: (et.objetivo && et.objetivo[0]) || categoriaToObjetivo(categoria),
    categoria,
    subcategoria: ex.carpeta || "",
    protocolos,
    protocolosPermitidos: protocolos,
    bloque: TODOS_BLOQUES,
    bloquesPermitidos: TODOS_BLOQUES,
    sets,
    reps,
    rest,
    material: mapMaterial(et),
    duracion: 6,
    complejidad: et.intensidad === "alta" ? "alta" : et.intensidad === "baja" ? "baja" : "media",
    progresion: null,
    regresion: null,
    etiquetas: [
      categoria.toLowerCase(),
      ex.carpeta,
      et.grupo_principal,
      ...(et.patron || []),
    ].filter(Boolean),
    gruposMusculares: et.grupo_muscular || (et.grupo_principal ? [et.grupo_principal] : []),
    capacidadFisica: (et.objetivo && et.objetivo[0]) || categoriaToObjetivo(categoria),
    espacioNecesario: "reducido",
    numeroJugadores: "individual",
    tiempoRecomendado: "6 min",
    notas: "",
    estado: "aprobado",
    catalogId: ex.id,
    source: "exercise_catalog",
  };
}

/** Biblioteca coach sembrada desde el catálogo completo */
export function getCoachLibraryFromCatalog() {
  return EXERCISES.map(mapCatalogExerciseToCoach);
}
