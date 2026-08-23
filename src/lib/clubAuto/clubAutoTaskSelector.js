/**
 * Selectores de calentamiento general, tarea con balón y tarea principal.
 * Filtros: bloque de edad → tipo de sesión (carpeta) → selección.
 */
import {
  CLUB_SIN_BALON_INTRO,
  CLUB_TASK_FOLDERS,
  folderById,
  GRUPO_TO_SESION,
  NIVEL_TO_BLOQUE,
  loadCustomWarmups,
  loadCustomTasks,
} from "../../data/clubAutoCatalog.js";
import { PROTOCOL_DAY_META } from "./clubAutoTemplates.js";

function stableIndex(seed, length) {
  if (length <= 0) return 0;
  let hash = 5381;
  const s = String(seed);
  for (let i = 0; i < s.length; i++) hash = ((hash << 5) + hash + s.charCodeAt(i)) | 0;
  return Math.abs(hash) % length;
}

/** Protocolo A/B/C → tipo sesión extensiva/intensiva/reactiva */
export function sessionTypeForProtocol(protocolo = "A") {
  const meta = PROTOCOL_DAY_META[protocolo] || PROTOCOL_DAY_META.A;
  return GRUPO_TO_SESION[meta.grupoMicrociclo] || "extensiva";
}

export function ageBlockForNivel(nivel = "B") {
  return NIVEL_TO_BLOQUE[String(nivel).toUpperCase()] || "2";
}

function placeholderWarmup() {
  return {
    id: "cgw_placeholder",
    carpeta: "/calentamientos_sin_balon",
    nombre: CLUB_SIN_BALON_INTRO.titulo,
    descripcion: CLUB_SIN_BALON_INTRO.descripcion,
    videoUrl: "",
    video: "",
    placeholder: true,
  };
}

export function allGeneralWarmups() {
  return loadCustomWarmups();
}

export function allFolderTasks() {
  return loadCustomTasks();
}

function sessionTypesOf(task) {
  if (Array.isArray(task.tipos_sesion) && task.tipos_sesion.length) {
    return task.tipos_sesion.map((s) => String(s).toLowerCase());
  }
  if (task.tipo_sesion) return [String(task.tipo_sesion).toLowerCase()];
  const folder = folderById(task.folderId) || CLUB_TASK_FOLDERS.find((f) => f.label === task.tipo_tarea);
  return folder?.tipos_sesion || [];
}

function matchesAgeBlock(task, bloque) {
  const blocks = Array.isArray(task.bloques_edad) ? task.bloques_edad.map(String) : null;
  if (!blocks || !blocks.length) return true;
  return blocks.includes(String(bloque));
}

function matchesSessionType(task, tipoSesion) {
  const allowed = sessionTypesOf(task);
  if (!allowed.length) return true;
  return allowed.includes(String(tipoSesion).toLowerCase());
}

export function selectGeneralWarmup({ seed = "", avoidId = null } = {}) {
  const pool = allGeneralWarmups().filter((w) => w.id !== avoidId);
  if (!pool.length) return placeholderWarmup();
  return pool[stableIndex(`${seed}|warmup`, pool.length)];
}

/**
 * Tarea con balón: mismas carpetas que el admin. Filtra por tipo de sesión.
 */
export function selectBallWarmup({ nivel = "B", protocolo = "A", seed = "", avoidId = null } = {}) {
  return selectMainTask({ nivel, protocolo, seed: `${seed}|ball`, avoidId });
}

export function selectMainTask({
  nivel = "B",
  protocolo = "A",
  seed = "",
  gymAccess = false,
  bloqueEdad = null,
  tipoSesion = null,
  avoidId = null,
} = {}) {
  const bloque = bloqueEdad || ageBlockForNivel(nivel);
  const sesion = tipoSesion || sessionTypeForProtocol(protocolo);
  const tasks = allFolderTasks().filter((t) => t.id !== avoidId);

  let pool = tasks.filter((t) => matchesAgeBlock(t, bloque) && matchesSessionType(t, sesion));
  if (!pool.length) pool = tasks.filter((t) => matchesSessionType(t, sesion));
  if (!pool.length) pool = tasks;
  if (!pool.length) return null;

  void gymAccess;
  return pool[stableIndex(`${seed}|main|${nivel}|${protocolo}|${bloque}|${sesion}`, pool.length)] || null;
}
