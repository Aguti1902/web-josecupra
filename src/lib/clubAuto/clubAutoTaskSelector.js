/**
 * Selectores de calentamiento general, tarea con balón y tarea principal.
 */
import {
  CLUB_GENERAL_WARMUPS,
  CLUB_BALL_WARMUPS,
  CLUB_MAIN_TASKS,
} from "../../data/clubAutoCatalog.js";
import { PROTOCOL_DAY_META } from "./clubAutoTemplates.js";

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
  return list[stableIndex(`${seed}|warmup`, list.length)];
}

export function selectBallWarmup({ nivel = "B", protocolo = "A", seed = "" } = {}) {
  const meta = PROTOCOL_DAY_META[protocolo] || PROTOCOL_DAY_META.A;
  const preferIntensity = meta.grupoMicrociclo === "carga_alta" ? "media" : "baja";
  let pool = CLUB_BALL_WARMUPS.filter(
    (t) => t.nivel.includes(nivel) && t.intensidad === preferIntensity,
  );
  if (!pool.length) pool = CLUB_BALL_WARMUPS.filter((t) => t.nivel.includes(nivel));
  if (!pool.length) pool = CLUB_BALL_WARMUPS;
  return pool[stableIndex(`${seed}|ball|${nivel}|${protocolo}`, pool.length)];
}

export function selectMainTask({ nivel = "B", protocolo = "A", seed = "", gymAccess = false } = {}) {
  const meta = PROTOCOL_DAY_META[protocolo] || PROTOCOL_DAY_META.A;
  let pool = CLUB_MAIN_TASKS.filter(
    (t) => t.nivel === nivel && t.grupo_microciclo === meta.grupoMicrociclo,
  );
  // Las tareas de campo no dependen de gym; se mantiene el flag por compatibilidad futura
  if (gymAccess) {
    pool = pool.filter((t) => t.gimnasio === true || t.gimnasio === false);
  }
  if (!pool.length) {
    pool = CLUB_MAIN_TASKS.filter((t) => t.grupo_microciclo === meta.grupoMicrociclo);
  }
  if (!pool.length) pool = CLUB_MAIN_TASKS;
  return pool[stableIndex(`${seed}|main|${nivel}|${protocolo}`, pool.length)];
}
