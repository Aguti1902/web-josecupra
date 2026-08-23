/**
 * Adapta ejercicios multi-eje al formato legacy del admin/catálogo.
 */
import { EXERCISES as V2_EXERCISES } from "./exerciseCatalog.js";

function mapLesiones(contraindicado = []) {
  return contraindicado.map((l) => String(l).replace(/^lesion_/, ""));
}

function deriveTags(et = {}, carpeta) {
  const tags = new Set();
  (et.objetivo || []).forEach((o) => tags.add(o));
  if (et.segmento) tags.add(et.segmento);
  (et.patron || []).forEach((p) => tags.add(p));
  if (et.grupo_principal) tags.add(et.grupo_principal);
  (et.grupo_muscular || []).forEach((g) => tags.add(g));
  (et.accion_secundaria || []).forEach((a) => tags.add(a));
  if (et.rol) tags.add(et.rol);
  if (carpeta) tags.add(carpeta);
  if (!tags.size) tags.add("fuerza");
  return [...tags];
}

export function v2ToLegacyExercise(ex) {
  const et = ex.etiquetas || {};
  return {
    id: `v2_${ex.id}`,
    v2Id: ex.id,
    nombre: ex.nombre,
    pool: ex.pool,
    carpeta: ex.carpeta || null,
    etiquetas: deriveTags(et, ex.carpeta),
    etiquetasMulti: et,
    material: (et.material || ["sin_material"])[0],
    materiales: et.material || ["sin_material"],
    contraindicado: mapLesiones(et.contraindicado || ex.lesionesContra || []),
    lesionesContra: et.contraindicado || ex.lesionesContra || [],
    tips: ex.tips,
    descripcion: ex.descripcion || "",
    description: ex.descripcion || `Ejercicio: ${ex.nombre}.`,
    videoUrl: ex.videoUrl,
    videoGroup: ex.videoGroup || null,
    edadMinima: ex.edadMinima,
    esTest: !!ex.esTest,
  };
}

export function getLegacyCatalogFromV2() {
  return V2_EXERCISES.map(v2ToLegacyExercise);
}

export function getV2ExerciseById(id) {
  const num = typeof id === "string" ? parseInt(id.replace(/^v2_/, ""), 10) : id;
  return V2_EXERCISES.find((e) => e.id === num) || null;
}

/** Vistas filtradas por objetivo (legacy). */
export function getExercisesByObjectiveView(objetivo) {
  const key = String(objetivo || "").toLowerCase();
  return V2_EXERCISES.filter((ex) => (ex.etiquetas?.objetivo || []).includes(key));
}

/** Vistas por carpeta funcional (taxonomía actual). */
export function getExercisesByCarpeta(carpeta) {
  const key = String(carpeta || "").toLowerCase();
  return V2_EXERCISES.filter((ex) => String(ex.carpeta || "").toLowerCase() === key);
}
