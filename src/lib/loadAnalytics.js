/** Análisis de cargas y pesos para ranking y gráficas. */
import { getLoadLogs } from "./loadLogs";
import { POOLS } from "./poolDefinitions";

const WEIGHT_POOL_PATTERN = /-(MAN|BAR)(?:$|[-_])/i;
const WEIGHT_NAME_PATTERN = /mancuerna|barra|peso muerto|hip thrust|farmer|remo con barra|press banca|sentadilla con/i;

export function exerciseNeedsWeight(exercise) {
  if (!exercise) return false;
  const pool = String(exercise.pool || "");
  if (WEIGHT_POOL_PATTERN.test(pool)) return true;
  const poolMat = POOLS[pool]?.material;
  if (poolMat === "mancuernas" || poolMat === "barra") return true;
  const name = String(exercise.name || exercise.nombre || "").toLowerCase();
  return WEIGHT_NAME_PATTERN.test(name);
}

export function loadFieldsForExercise(exercise, objective) {
  if (exerciseNeedsWeight(exercise)) {
    return ["weight", "sets", "reps", "rpe", "notes"];
  }
  const obj = String(objective || "").toLowerCase();
  if (obj.includes("velocidad")) return ["time", "distance", "rpe", "notes"];
  if (obj.includes("resistencia")) return ["distance", "time", "heartRate", "rpe", "notes"];
  if (obj.includes("movilidad") || obj.includes("prevención") || obj.includes("prevencion")) {
    return ["rpe", "feelings", "notes"];
  }
  return ["weight", "sets", "reps", "rpe", "notes"];
}

function parseWeight(value) {
  const n = parseFloat(String(value || "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function getWeightLogs(userId, { exerciseName = null, limit = 50 } = {}) {
  return getLoadLogs(userId)
    .filter((log) => parseWeight(log.weight) != null)
    .filter((log) => !exerciseName || log.exerciseName === exerciseName)
    .slice(0, limit)
    .map((log) => ({
      ...log,
      weightNum: parseWeight(log.weight),
      date: log.recordedAt?.slice(0, 10) || "",
    }));
}

/** Máximo peso por semana (ISO week start lunes). */
export function getMaxWeightByWeek(userId) {
  const byWeek = {};
  getWeightLogs(userId).forEach((log) => {
    const d = new Date(log.recordedAt || Date.now());
    const day = d.getDay() || 7;
    const mon = new Date(d);
    mon.setDate(d.getDate() - day + 1);
    const key = mon.toISOString().slice(0, 10);
    byWeek[key] = Math.max(byWeek[key] || 0, log.weightNum);
  });
  return Object.entries(byWeek)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([week, maxWeight]) => ({ week, maxWeight, label: formatWeekLabel(week) }));
}

export function getTopWeightedExercises(userId, limit = 5) {
  const map = {};
  getWeightLogs(userId).forEach((log) => {
    const name = log.exerciseName || "Ejercicio";
    if (!map[name]) map[name] = { name, max: 0, count: 0, last: null };
    map[name].max = Math.max(map[name].max, log.weightNum);
    map[name].count += 1;
    map[name].last = log.recordedAt;
  });
  return Object.values(map)
    .sort((a, b) => b.max - a.max)
    .slice(0, limit);
}

export function getImprovementSummary(userId) {
  const logs = getWeightLogs(userId);
  if (logs.length < 2) return null;
  const sorted = [...logs].sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const diff = +(last.weightNum - first.weightNum).toFixed(1);
  if (diff <= 0) return null;
  return {
    exerciseName: last.exerciseName,
    from: first.weightNum,
    to: last.weightNum,
    diff,
  };
}

function formatWeekLabel(isoMonday) {
  const d = new Date(isoMonday);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export function buildPublicStats(userId) {
  const weightWeeks = getMaxWeightByWeek(userId);
  const topExercises = getTopWeightedExercises(userId, 3);
  const improvement = getImprovementSummary(userId);
  return {
    maxWeight: weightWeeks.length ? weightWeeks[weightWeeks.length - 1].maxWeight : null,
    weightWeeks,
    topExercises,
    improvement,
    loadCount: getLoadLogs(userId).length,
  };
}
