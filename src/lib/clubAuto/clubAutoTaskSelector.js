/**
 * Selectores de calentamiento general, tarea con balón y tarea principal.
 */
import {
  CLUB_GENERAL_WARMUPS,
  CLUB_BALL_WARMUPS,
  CLUB_MAIN_TASKS,
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
    ...(ov.tags ? {
      tipo: ov.tags.tipo ?? item.tipo,
      intensidad: ov.tags.intensidad ?? item.intensidad,
    } : {}),
  };
}

function applyTaskOverride(item) {
  if (!item) return item;
  const ov = readJson(TASK_OVERRIDES_KEY, {})[item.id];
  // Solo explicación editable en tareas base
  if (!ov) return item;
  return {
    ...item,
    descripcion: ov.descripcion ?? item.descripcion,
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

export function selectMainTask({ nivel = "B", protocolo = "A", seed = "", gymAccess = false } = {}) {
  const meta = PROTOCOL_DAY_META[protocolo] || PROTOCOL_DAY_META.A;
  const tasks = allMainTasks();
  let pool = tasks.filter(
    (t) => t.nivel === nivel && t.grupo_microciclo === meta.grupoMicrociclo,
  );
  // Las tareas de campo no dependen de gym; se mantiene el flag por compatibilidad futura
  if (gymAccess) {
    pool = pool.filter((t) => t.gimnasio === true || t.gimnasio === false);
  }
  if (!pool.length) {
    pool = tasks.filter((t) => t.grupo_microciclo === meta.grupoMicrociclo);
  }
  if (!pool.length) pool = tasks;
  return applyTaskOverride(pool[stableIndex(`${seed}|main|${nivel}|${protocolo}`, pool.length)]);
}
