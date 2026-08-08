/**
 * tipo_registro por ejercicio — Control de cargas / Progresión (PDF §1).
 * Se deriva de carpeta/rol/objetivo; se puede overridear con exercise.tipo_registro.
 */

export const TIPOS_REGISTRO = [
  "fuerza",
  "velocidad",
  "resistencia",
  "pliometria",
  "no_registrable",
];

const NO_REG_ROLES = new Set(["calentamiento", "vuelta_calma", "core"]);
const NO_REG_CARPETAS = new Set(["movilidad", "prevencion"]);
const NO_REG_OBJ = new Set(["movilidad", "prevencion", "prevención"]);

/** Deriva tipo_registro coherente para un ejercicio del catálogo. */
export function getTipoRegistro(exercise) {
  if (!exercise) return "no_registrable";
  if (exercise.tipo_registro && TIPOS_REGISTRO.includes(exercise.tipo_registro)) {
    return exercise.tipo_registro;
  }

  const carpeta = String(exercise.carpeta || "").toLowerCase();
  const rol = String(exercise.etiquetas?.rol || exercise.slotConstraints?.rol || "").toLowerCase();
  const objetivos = [
    ...(exercise.etiquetas?.objetivo || []),
    exercise.slotConstraints?.objetivo,
  ]
    .flat()
    .filter(Boolean)
    .map((o) => String(o).toLowerCase());

  const blockType = String(exercise.blockType || "").toLowerCase();
  if (blockType === "calentamiento" || blockType === "vuelta_calma") return "no_registrable";
  if (NO_REG_ROLES.has(rol) && rol !== "core") return "no_registrable";
  if (NO_REG_CARPETAS.has(carpeta)) return "no_registrable";
  if (objetivos.some((o) => NO_REG_OBJ.has(o))) return "no_registrable";

  // Core de control / activación → no registrable (PDF §1.3)
  if (rol === "core" || carpeta === "core") {
    if (objetivos.includes("fuerza") || objetivos.includes("hipertrofia")) return "fuerza";
    return "no_registrable";
  }

  if (carpeta === "velocidad" || objetivos.includes("velocidad")) return "velocidad";
  if (carpeta === "pliometria" || objetivos.includes("pliometria") || objetivos.includes("pliometría")) {
    return "pliometria";
  }
  if (objetivos.includes("resistencia") || carpeta === "resistencia") return "resistencia";
  if (
    carpeta.includes("fuerza")
    || objetivos.includes("fuerza")
    || objetivos.includes("hipertrofia")
  ) {
    return "fuerza";
  }

  // Por defecto: si es principal/basico/complementario de fuerza → fuerza; si no, no registrable
  if (rol === "basico" || rol === "complementario" || rol === "principal") return "fuerza";
  return "no_registrable";
}

/** Campos editables según tipo_registro. */
export function fieldsForTipoRegistro(tipo) {
  switch (tipo) {
    case "fuerza":
      return ["weight", "sets", "reps", "rest", "rpe", "notes"];
    case "velocidad":
      return ["distance", "time", "reps", "rpe", "notes"];
    case "resistencia":
      return ["time", "distance", "heartRate", "intensity", "rpe", "notes"];
    case "pliometria":
      return ["reps", "distance", "rpe", "notes"];
    case "no_registrable":
    default:
      return ["completed"];
  }
}

export function isLoadRegistrable(exercise) {
  return getTipoRegistro(exercise) !== "no_registrable";
}

export default {
  getTipoRegistro,
  fieldsForTipoRegistro,
  isLoadRegistrable,
  TIPOS_REGISTRO,
};
