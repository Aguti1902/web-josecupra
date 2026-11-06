/**
 * Biblioteca completa de ejercicios para la elección manual.
 * No filtra por etiquetas, material ni criterios del motor.
 */
import { EXERCISES, CATALOG_CARPETAS } from "./exerciseCatalog.js";

export const LIBRARY_FOLDERS = [
  { id: "fuerza_tren_inferior", label: "Fuerza · Tren inferior" },
  { id: "fuerza_tren_superior", label: "Fuerza · Tren superior" },
  { id: "velocidad", label: "Velocidad" },
  { id: "resistencia", label: "Resistencia" },
  { id: "pliometria", label: "Pliometría" },
  { id: "core", label: "Core" },
  { id: "prevencion", label: "Prevención" },
  { id: "movilidad", label: "Movilidad" },
];

function fold(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function listLibraryExercises({ carpeta = "", query = "" } = {}) {
  const q = fold(query).trim();
  const folder = String(carpeta || "");
  return EXERCISES
    .filter((ex) => {
      if (folder && ex.carpeta !== folder) return false;
      if (!q) return true;
      return fold(ex.nombre).includes(q) || fold(ex.carpeta).includes(q);
    })
    .slice()
    .sort((a, b) => String(a.nombre || "").localeCompare(String(b.nombre || ""), "es"));
}

export function libraryFolderLabel(carpeta) {
  return LIBRARY_FOLDERS.find((f) => f.id === carpeta)?.label || carpeta || "Sin carpeta";
}

export const LIBRARY_SIZE = EXERCISES.length;
export { CATALOG_CARPETAS };
