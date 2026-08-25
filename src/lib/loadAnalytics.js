/** Análisis de cargas y pesos para ranking y gráficas. */
import { getLoadLogs } from "./loadLogs.js";
import { POOLS } from "./poolDefinitions.js";
import { getTipoRegistro, fieldsForTipoRegistro, isLoadRegistrable } from "./tipoRegistro.js";

const WEIGHT_POOL_PATTERN = /-(MAN|BAR)(?:$|[-_])/i;
const WEIGHT_NAME_PATTERN = /mancuerna|barra|peso muerto|hip thrust|farmer|remo con barra|press banca|sentadilla con/i;

export { getTipoRegistro, fieldsForTipoRegistro, isLoadRegistrable };

export function exerciseNeedsWeight(exercise) {
  if (!exercise) return false;
  if (getTipoRegistro(exercise) === "fuerza") return true;
  const pool = String(exercise.pool || "");
  if (WEIGHT_POOL_PATTERN.test(pool)) return true;
  const poolMat = POOLS[pool]?.material;
  if (poolMat === "mancuernas" || poolMat === "barra") return true;
  const name = String(exercise.name || exercise.nombre || "").toLowerCase();
  return WEIGHT_NAME_PATTERN.test(name);
}

/** Bloques donde NO debe aparecer registro de carga. */
export function blockAllowsLoadLogging(blockType) {
  const t = String(blockType || "").toLowerCase();
  if (!t) return true;
  return t !== "calentamiento" && t !== "vuelta_calma" && t !== "vuelta-calma";
}

/** Objetivos medibles con registro en el ejercicio. */
export function objectiveAllowsLoadLogging(objective) {
  const obj = String(objective || "").toLowerCase();
  return (
    obj.includes("fuerza")
    || obj.includes("hipertrofia")
    || obj.includes("resistencia")
    || obj.includes("velocidad")
  );
}

export function loadFieldsForExercise(exercise, objective) {
  const tipo = getTipoRegistro({
    ...exercise,
    etiquetas: exercise?.etiquetas || {
      objetivo: objective ? [String(objective).toLowerCase()] : [],
      rol: exercise?.slotConstraints?.rol,
    },
    carpeta: exercise?.carpeta,
    blockType: exercise?.blockType,
  });
  if (tipo === "no_registrable") return [];
  return fieldsForTipoRegistro(tipo);
}

/** Modo de registro por series (fuerza) vs campos simples (velocidad/resistencia). */
export function loadLoggingMode(objective, exercise = null) {
  if (exercise) {
    const tipo = getTipoRegistro(exercise);
    if (tipo === "velocidad") return "velocidad";
    if (tipo === "resistencia") return "resistencia";
    if (tipo === "pliometria") return "pliometria";
    if (tipo === "no_registrable") return "none";
    return "fuerza_series";
  }
  const obj = String(objective || "").toLowerCase();
  if (obj.includes("velocidad")) return "velocidad";
  if (obj.includes("resistencia")) return "resistencia";
  if (obj.includes("fuerza") || obj.includes("hipertrofia")) return "fuerza_series";
  return "fuerza_series";
}

/** Agrupa logs por dominio para progresión fuerza/velocidad/resistencia. */
export function getLogsByDomain(userId) {
  const logs = getLoadLogs(userId);
  const buckets = { fuerza: [], velocidad: [], resistencia: [], pliometria: [] };
  for (const log of logs) {
    const tipo = log.tipoRegistro || getTipoRegistro({
      nombre: log.exerciseName,
      carpeta: log.carpeta,
      etiquetas: { objetivo: log.objective ? [log.objective] : [], rol: log.rol },
      tipo_registro: log.tipoRegistro,
    });
    if (tipo === "no_registrable" || tipo === "session_rpe") continue;
    if (buckets[tipo]) buckets[tipo].push(log);
    else if (tipo === "fuerza") buckets.fuerza.push(log);
  }
  return buckets;
}

function parseWeight(value) {
  const raw = String(value || "").trim();
  if (!raw || /^pc$/i.test(raw) || /peso\s*corporal/i.test(raw)) return null;
  // "80 / 82 / 85" → max
  if (raw.includes("/")) {
    const parts = raw.split("/").map((p) => parseFloat(p.replace(",", ".").trim())).filter(Number.isFinite);
    return parts.length ? Math.max(...parts) : null;
  }
  const n = parseFloat(raw.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function parseReps(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  if (raw.includes("/")) {
    const parts = raw.split("/").map((p) => parseFloat(p.replace(",", ".").trim())).filter(Number.isFinite);
    return parts.length ? parts.reduce((a, b) => a + b, 0) : null;
  }
  const n = parseFloat(raw.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

/** Convierte "1.85 s", "1:25", "85", "3'20"" a segundos. */
export function parseTimeToSeconds(value) {
  if (value == null || value === "") return null;
  const raw = String(value).trim().toLowerCase();
  if (!raw) return null;

  const minSec = raw.match(/^(\d+)\s*[:'′]\s*(\d+(?:[.,]\d+)?)\s*(?:s|seg|")?$/);
  if (minSec) {
    return parseInt(minSec[1], 10) * 60 + parseFloat(minSec[2].replace(",", "."));
  }

  const onlyNum = raw.replace(",", ".").replace(/[^\d.]/g, "");
  const n = parseFloat(onlyNum);
  return Number.isFinite(n) ? n : null;
}

export function pctChange(from, to) {
  if (from == null || to == null) return null;
  if (!Number.isFinite(from) || !Number.isFinite(to) || from === 0) return null;
  return +(((to - from) / Math.abs(from)) * 100).toFixed(1);
}

/** Snapshot de una sesión de fuerza (series o campos planos). */
export function extractFuerzaSnapshot(log) {
  if (!log) return null;
  const series = Array.isArray(log.series) ? log.series : null;
  if (series?.length) {
    let maxWeight = null;
    let repsAtMax = 0;
    let totalReps = 0;
    let volume = 0;
    for (const s of series) {
      const w = parseWeight(s.weight);
      const r = parseReps(s.reps) || 0;
      totalReps += r;
      if (w != null) {
        volume += w * r;
        if (maxWeight == null || w > maxWeight) {
          maxWeight = w;
          repsAtMax = r;
        } else if (w === maxWeight) {
          repsAtMax = Math.max(repsAtMax, r);
        }
      }
    }
    return {
      maxWeight,
      repsAtMax: maxWeight != null ? repsAtMax : null,
      totalReps: totalReps || null,
      volume: volume || null,
      recordedAt: log.recordedAt,
    };
  }

  const maxWeight = parseWeight(log.weight);
  const totalReps = parseReps(log.reps);
  const sets = parseWeight(log.sets) || (totalReps != null ? 1 : null);
  const volume = maxWeight != null && totalReps != null
    ? maxWeight * totalReps * (sets && sets > 1 && !String(log.reps || "").includes("/") ? sets : 1)
    : null;
  return {
    maxWeight,
    repsAtMax: totalReps,
    totalReps,
    volume,
    recordedAt: log.recordedAt,
  };
}

export function extractTimeHrSnapshot(log) {
  if (!log) return null;
  return {
    timeSec: parseTimeToSeconds(log.time),
    heartRate: parseWeight(log.heartRate),
    distance: parseWeight(log.distance),
    recordedAt: log.recordedAt,
  };
}

/**
 * Veredicto práctico velocidad/resistencia.
 * Mejor tiempo = menor; mejor FC = menor media.
 */
export function classifyTimeHrImprovement(prev, curr) {
  if (!prev || !curr) return null;
  const rawTimePct = pctChange(prev.timeSec, curr.timeSec);
  const rawHrPct = pctChange(prev.heartRate, curr.heartRate);
  const timePctBetter = rawTimePct != null ? +((-rawTimePct).toFixed(1)) : null;
  const hrPctBetter = rawHrPct != null ? +((-rawHrPct).toFixed(1)) : null;

  const timeImproved = timePctBetter != null && timePctBetter > 0.5;
  const timeWorse = timePctBetter != null && timePctBetter < -0.5;
  const timeFlat = timePctBetter != null && Math.abs(timePctBetter) <= 0.5;
  const hrImproved = hrPctBetter != null && hrPctBetter > 0.5;
  const hrWorse = hrPctBetter != null && hrPctBetter < -0.5;

  let verdict = "sin_cambio";
  let message = "Sin cambios claros entre sesiones";
  let tone = "neutral";

  if (timeImproved && hrImproved) {
    verdict = "tiempo_y_fc";
    message = "Más rápido y con menos FC media";
    tone = "positive";
  } else if (timeImproved && hrWorse) {
    verdict = "tiempo_con_mas_fc";
    message = "Mejor tiempo, pero la FC media subió";
    tone = "mixed";
  } else if (timeImproved) {
    verdict = "mejor_tiempo";
    message = "Has mejorado el tiempo";
    tone = "positive";
  } else if ((timeFlat || timeWorse) && hrImproved) {
    verdict = timeWorse ? "peor_tiempo_mejor_fc" : "misma_eficiencia";
    message = timeWorse
      ? "El tiempo no mejoró, pero la FC media bajó (mejor eficiencia)"
      : "Mismo tiempo con menos FC media — mejor eficiencia";
    tone = "positive";
  } else if (timeWorse && hrWorse) {
    verdict = "peor";
    message = "Tiempo más lento y FC más alta";
    tone = "negative";
  } else if (timeWorse) {
    verdict = "peor_tiempo";
    message = "El tiempo empeoró respecto a la sesión anterior";
    tone = "negative";
  } else if (hrImproved) {
    verdict = "mejor_fc";
    message = "La FC media bajó";
    tone = "positive";
  } else if (hrWorse) {
    verdict = "peor_fc";
    message = "La FC media subió";
    tone = "negative";
  }

  return {
    verdict,
    message,
    tone,
    timePctBetter,
    hrPctBetter,
    fromTime: prev.timeSec,
    toTime: curr.timeSec,
    fromHr: prev.heartRate,
    toHr: curr.heartRate,
  };
}

function groupLogsByExercise(logs) {
  const map = {};
  for (const log of logs) {
    const name = (log.exerciseName || "").trim() || "Ejercicio";
    if (!map[name]) map[name] = [];
    map[name].push(log);
  }
  for (const name of Object.keys(map)) {
    map[name].sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));
  }
  return map;
}

/** Progresión práctica por ejercicio de fuerza: % peso y % reps vs sesión anterior. */
export function getFuerzaExerciseProgress(userId, { limit = 12 } = {}) {
  const { fuerza } = getLogsByDomain(userId);
  const byEx = groupLogsByExercise(fuerza);
  const rows = [];

  for (const [name, exLogs] of Object.entries(byEx)) {
    const snaps = exLogs.map(extractFuerzaSnapshot).filter((s) => s && (s.maxWeight != null || s.totalReps != null));
    if (snaps.length < 2) continue;
    const prev = snaps[snaps.length - 2];
    const curr = snaps[snaps.length - 1];
    const first = snaps[0];

    const weightPct = pctChange(prev.maxWeight, curr.maxWeight);
    let repsPct = pctChange(prev.repsAtMax ?? prev.totalReps, curr.repsAtMax ?? curr.totalReps);
    const vsFirstWeight = pctChange(first.maxWeight, curr.maxWeight);
    const vsFirstReps = pctChange(first.repsAtMax ?? first.totalReps, curr.repsAtMax ?? curr.totalReps);

    let primary = null;
    if (weightPct != null && Math.abs(weightPct) >= Math.abs(repsPct || 0)) {
      primary = { metric: "peso", pct: weightPct, from: prev.maxWeight, to: curr.maxWeight, unit: "kg" };
    } else if (repsPct != null) {
      primary = {
        metric: "reps",
        pct: repsPct,
        from: prev.repsAtMax ?? prev.totalReps,
        to: curr.repsAtMax ?? curr.totalReps,
        unit: "reps",
      };
    }
    if (!primary) continue;

    let message = "Estable respecto a la sesión anterior";
    let tone = "neutral";
    if (primary.pct > 0.5) {
      tone = "positive";
      message = primary.metric === "peso"
        ? `Has subido el peso un ${primary.pct}%`
        : `Has aumentado las repeticiones un ${primary.pct}%`;
    } else if (primary.pct < -0.5) {
      tone = "negative";
      message = primary.metric === "peso"
        ? `El peso bajó un ${Math.abs(primary.pct)}%`
        : `Las repeticiones bajaron un ${Math.abs(primary.pct)}%`;
    } else if (weightPct != null && Math.abs(weightPct) <= 0.5 && repsPct != null && repsPct > 0.5) {
      tone = "positive";
      message = `Mismo peso, +${repsPct}% reps`;
      primary = {
        metric: "reps",
        pct: repsPct,
        from: prev.repsAtMax ?? prev.totalReps,
        to: curr.repsAtMax ?? curr.totalReps,
        unit: "reps",
      };
    }

    rows.push({
      domain: "fuerza",
      exerciseName: name,
      sessions: snaps.length,
      primary,
      weightPct,
      repsPct,
      vsFirstWeight,
      vsFirstReps,
      prev,
      curr,
      message,
      tone,
      recordedAt: curr.recordedAt,
    });
  }

  return rows
    .sort((a, b) => Math.abs(b.primary?.pct || 0) - Math.abs(a.primary?.pct || 0))
    .slice(0, limit);
}

/** Progresión práctica velocidad/resistencia: tiempo + FC. */
export function getTimeHrExerciseProgress(userId, domain, { limit = 12 } = {}) {
  const buckets = getLogsByDomain(userId);
  const logs = buckets[domain] || [];
  const byEx = groupLogsByExercise(logs);
  const rows = [];

  for (const [name, exLogs] of Object.entries(byEx)) {
    const snaps = exLogs
      .map(extractTimeHrSnapshot)
      .filter((s) => s && (s.timeSec != null || s.heartRate != null));
    if (snaps.length < 2) continue;
    const prev = snaps[snaps.length - 2];
    const curr = snaps[snaps.length - 1];
    const classified = classifyTimeHrImprovement(prev, curr);
    if (!classified) continue;

    rows.push({
      domain,
      exerciseName: name,
      sessions: snaps.length,
      ...classified,
      prev,
      curr,
      recordedAt: curr.recordedAt,
    });
  }

  const toneRank = { positive: 0, mixed: 1, neutral: 2, negative: 3 };
  return rows
    .sort((a, b) => {
      const tr = (toneRank[a.tone] ?? 9) - (toneRank[b.tone] ?? 9);
      if (tr !== 0) return tr;
      return Math.abs(b.timePctBetter || b.hrPctBetter || 0) - Math.abs(a.timePctBetter || a.hrPctBetter || 0);
    })
    .slice(0, limit);
}

/** Resumen unificado para el panel «Mis mejoras». */
export function getPracticalImprovements(userId) {
  return {
    fuerza: getFuerzaExerciseProgress(userId),
    velocidad: getTimeHrExerciseProgress(userId, "velocidad"),
    resistencia: getTimeHrExerciseProgress(userId, "resistencia"),
  };
}

export function getWeightLogs(userId, { exerciseName = null, limit = 50 } = {}) {
  return getLoadLogs(userId)
    .filter((log) => parseWeight(log.weight) != null || (Array.isArray(log.series) && log.series.some((s) => parseWeight(s.weight) != null)))
    .filter((log) => !exerciseName || log.exerciseName === exerciseName)
    .slice(0, limit)
    .map((log) => {
      const snap = extractFuerzaSnapshot(log);
      return {
        ...log,
        weightNum: snap?.maxWeight ?? parseWeight(log.weight),
        date: log.recordedAt?.slice(0, 10) || "",
      };
    })
    .filter((log) => log.weightNum != null);
}

/** Máximo peso por semana (ISO week start lunes). */
export function getMaxWeightByWeek(userId) {
  const byWeek = {};
  getWeightLogs(userId).forEach((log) => {
    try {
      const d = new Date(log.recordedAt || Date.now());
      if (Number.isNaN(d.getTime())) return;
      const day = d.getDay() || 7;
      const mon = new Date(d);
      mon.setDate(d.getDate() - day + 1);
      if (Number.isNaN(mon.getTime())) return;
      const key = mon.toISOString().slice(0, 10);
      byWeek[key] = Math.max(byWeek[key] || 0, log.weightNum);
    } catch { /* fecha sucia: no tumbar ranking */ }
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
  const progress = getFuerzaExerciseProgress(userId, { limit: 20 });
  const best = progress.find((p) => p.tone === "positive" && p.primary?.metric === "peso")
    || progress.find((p) => p.tone === "positive")
    || null;
  if (best?.primary) {
    return {
      exerciseName: best.exerciseName,
      from: best.primary.from,
      to: best.primary.to,
      diff: +(best.primary.to - best.primary.from).toFixed(1),
      pct: best.primary.pct,
      metric: best.primary.metric,
      unit: best.primary.unit,
      message: best.message,
    };
  }

  // Fallback histórico global (compat ranking)
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
    pct: pctChange(first.weightNum, last.weightNum),
    metric: "peso",
    unit: "kg",
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
