/**
 * Selectores de calentamiento general, tarea con balón y tarea principal.
 * Filtros IA (§3.1): bloque de edad → tipo de sesión → selección.
 */
import {
  CLUB_GENERAL_WARMUPS,
  CLUB_BALL_WARMUPS,
  CLUB_MAIN_TASKS,
  GRUPO_TO_SESION,
  NIVEL_TO_BLOQUE,
} from "../../data/clubAutoCatalog.js";
import { PROTOCOL_DAY_META } from "./clubAutoTemplates.js";

const WARMUP_OVERRIDES_KEY = "depro_club_warmup_overrides";
const TASK_OVERRIDES_KEY = "depro_club_task_overrides";
const CUSTOM_TASKS_KEY = "depro_club_custom_tasks";

function readJson(key, fallback) {
  try {
    if (typeof localStorage === "undefined") return fallback;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function applyWarmupOverride(item) {
  if (!item) return item;
  const ov = readJson(WARMUP_OVERRIDES_KEY, {})[item.id];
  if (!ov) return item;
  return {
    ...item,
    nombre: ov.nombre ?? item.nombre,
    descripcion: ov.descripcion ?? item.descripcion,
    videoUrl: ov.videoUrl ?? item.videoUrl ?? item.video ?? "",
    video: ov.videoUrl ?? item.videoUrl ?? item.video ?? "",
    ...(ov.tags ? {
      tipo: ov.tags.tipo ?? item.tipo,
      intensidad: ov.tags.intensidad ?? item.intensidad,
    } : {}),
  };
}

function applyTaskOverride(item) {
  if (!item) return item;
  const ov = readJson(TASK_OVERRIDES_KEY, {})[item.id];
  if (!ov) return item;
  return {
    ...item,
    descripcion: ov.descripcion ?? item.descripcion,
    video: ov.video ?? item.video,
    videoUrl: ov.video ?? ov.videoUrl ?? item.videoUrl ?? item.video,
    tipo_tarea: ov.tipo_tarea ?? item.tipo_tarea,
    tipo_sesion: ov.tipo_sesion ?? item.tipo_sesion,
    bloques_edad: ov.bloques_edad ?? item.bloques_edad,
  };
}

function allMainTasks() {
  const custom = readJson(CUSTOM_TASKS_KEY, []);
  return [...CLUB_MAIN_TASKS, ...(Array.isArray(custom) ? custom : [])];
}

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

function matchesAgeBlock(task, bloque) {
  const blocks = Array.isArray(task.bloques_edad) ? task.bloques_edad.map(String) : null;
  if (!blocks || !blocks.length) return true;
  return blocks.includes(String(bloque));
}

function matchesSessionType(task, tipoSesion) {
  if (!task.tipo_sesion) return true;
  return String(task.tipo_sesion).toLowerCase() === String(tipoSesion).toLowerCase();
}

export function selectGeneralWarmup({ seed = "", avoidId = null } = {}) {
  const pool = CLUB_GENERAL_WARMUPS.filter((w) => w.id !== avoidId);
  const list = pool.length ? pool : CLUB_GENERAL_WARMUPS;
  return applyWarmupOverride(list[stableIndex(`${seed}|warmup`, list.length)]);
}

export function selectBallWarmup({ nivel = "B", protocolo = "A", seed = "" } = {}) {
  const meta = PROTOCOL_DAY_META[protocolo] || PROTOCOL_DAY_META.A;
  const preferIntensity = meta.grupoMicrociclo === "carga_alta" ? "media" : "baja";
  let pool = CLUB_BALL_WARMUPS.filter(
    (t) => t.nivel.includes(nivel) && t.intensidad === preferIntensity,
  );
  if (!pool.length) pool = CLUB_BALL_WARMUPS.filter((t) => t.nivel.includes(nivel));
  if (!pool.length) pool = CLUB_BALL_WARMUPS;
  return applyWarmupOverride(pool[stableIndex(`${seed}|ball|${nivel}|${protocolo}`, pool.length)]);
}

/**
 * Selección de tarea principal / calentamiento con balón filtrable.
 * Orden: bloque edad → tipo sesión → grupo microciclo / nivel → aleatorio estable.
 */
export function selectMainTask({
  nivel = "B",
  protocolo = "A",
  seed = "",
  gymAccess = false,
  bloqueEdad = null,
  tipoSesion = null,
} = {}) {
  const meta = PROTOCOL_DAY_META[protocolo] || PROTOCOL_DAY_META.A;
  const bloque = bloqueEdad || ageBlockForNivel(nivel);
  const sesion = tipoSesion || sessionTypeForProtocol(protocolo);
  const tasks = allMainTasks();

  let pool = tasks.filter((t) => matchesAgeBlock(t, bloque));
  pool = pool.filter((t) => matchesSessionType(t, sesion));

  let narrowed = pool.filter(
    (t) => t.nivel === nivel && t.grupo_microciclo === meta.grupoMicrociclo,
  );
  if (!narrowed.length) {
    narrowed = pool.filter((t) => t.grupo_microciclo === meta.grupoMicrociclo);
  }
  if (!narrowed.length) narrowed = pool;
  if (!narrowed.length) {
    // Fallback suave: no vaciar la sesión si el catálogo custom está mal etiquetado
    narrowed = tasks.filter((t) => t.grupo_microciclo === meta.grupoMicrociclo);
  }
  if (!narrowed.length) narrowed = tasks;

  if (gymAccess) {
    const withGymFlag = narrowed.filter((t) => t.gimnasio === true || t.gimnasio === false);
    if (withGymFlag.length) narrowed = withGymFlag;
  }

  return applyTaskOverride(narrowed[stableIndex(`${seed}|main|${nivel}|${protocolo}|${bloque}|${sesion}`, narrowed.length)]);
}
