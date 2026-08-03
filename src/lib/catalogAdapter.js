/**
 * Adapta ejercicios multi-eje al formato legacy del admin/catálogo.
 */
import { EXERCISES as V2_EXERCISES } from "./exerciseCatalog.js";

function mapLesiones(contraindicado = []) {
  return contraindicado.map((l) => String(l).replace(/^lesion_/, ""));
}

function deriveTags(et = {}) {
  const tags = new Set();
  (et.objetivo || []).forEach((o) => tags.add(o));
  if (et.segmento) tags.add(et.segmento);
  (et.patron || []).forEach((p) => tags.add(p));
  (et.grupo_muscular || []).forEach((g) => tags.add(g));
  if (et.rol) tags.add(et.rol);
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
    etiquetas: deriveTags(et),
    etiquetasMulti: et,
    material: (et.material || ["sin_material"])[0],
    materiales: et.material || ["sin_material"],
    contraindicado: mapLesiones(et.contraindicado || ex.lesionesContra || []),
    lesionesContra: et.contraindicado || ex.lesionesContra || [],
    tips: ex.tips,
    videoUrl: ex.videoUrl,
    edadMinima: ex.edadMinima,
    description: `Ejercicio: ${ex.nombre}.`,
  };
}

export function getLegacyCatalogFromV2() {
  return V2_EXERCISES.map(v2ToLegacyExercise);
}

export function getV2ExerciseById(id) {
  const num = typeof id === "string" ? parseInt(id.replace(/^v2_/, ""), 10) : id;
  return V2_EXERCISES.find((e) => e.id === num) || null;
}

/** Vistas filtradas por objetivo (carpetas del panel). */
export function getExercisesByObjectiveView(objetivo) {
  const key = String(objetivo || "").toLowerCase();
  return V2_EXERCISES.filter((ex) => (ex.etiquetas?.objetivo || []).includes(key));
}
