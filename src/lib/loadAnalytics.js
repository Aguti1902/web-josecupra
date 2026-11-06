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

/** 1RM estimado (Epley). No se usa como predictor clínico. */
export function estimate1RM(weight, reps) {
  const w = Number(weight);
  const r = Number(reps);
  if (!Number.isFinite(w) || w <= 0 || !Number.isFinite(r) || r < 1) return null;
  if (r === 1) return Math.round(w * 10) / 10;
  return Math.round(w * (1 + r / 30) * 10) / 10;
}

function mondayKeyFromIso(iso) {
  const d = new Date(iso || Date.now());
  if (Number.isNaN(d.getTime())) return null;
  const day = d.getDay() || 7;
  const mon = new Date(d);
  mon.setHours(12, 0, 0, 0);
  mon.setDate(d.getDate() - day + 1);
  return mon.toISOString().slice(0, 10);
}

function parseDurationMinutes(value) {
  const raw = String(value || "");
  const nums = raw.match(/(\d+(?:[.,]\d+)?)/g);
  if (!nums?.length) return null;
  const vals = nums.map((n) => parseFloat(n.replace(",", "."))).filter(Number.isFinite);
  if (!vals.length) return null;
  return vals.length === 1 ? vals[0] : (vals[0] + vals[vals.length - 1]) / 2;
}

function sessionLoadUnits(log) {
  if (!log) return 0;
  if (log.tipoRegistro === "session_rpe") {
    const rpe = parseWeight(log.rpe);
    const min = parseDurationMinutes(log.duration || log.time) || 45;
    if (rpe == null) return 0;
    return rpe * min;
  }
  const snap = extractFuerzaSnapshot(log);
  if (snap?.volume) return snap.volume;
  const rpe = parseWeight(log.rpe);
  if (rpe != null) return rpe * (parseDurationMinutes(log.time || log.duration) || 10);
  return 0;
}

function classifyLoadDomain(log) {
  const tipo = String(log?.tipoRegistro || "").toLowerCase();
  if (tipo === "fuerza") return "fuerza";
  if (tipo === "resistencia") return "resistencia";
  if (tipo === "velocidad" || tipo === "pliometria") return "velocidad";
  const obj = String(log?.objective || log?.sessionTitle || "").toLowerCase();
  if (/fuerza|hipertrof/.test(obj)) return "fuerza";
  if (/resist/.test(obj)) return "resistencia";
  if (/veloc|sprint|pliom/.test(obj)) return "velocidad";
  return "otros";
}

export function listLoggedExercises(userId) {
  const names = new Map();
  for (const log of getLoadLogs(userId)) {
    if (log.tipoRegistro === "session_rpe") continue;
    const name = String(log.exerciseName || log.nombre || "").trim();
    if (!name) continue;
    const prev = names.get(name);
    const at = log.recordedAt || "";
    if (!prev || at > prev.lastAt) names.set(name, { name, lastAt: at, tipo: classifyLoadDomain(log) });
  }
  return [...names.values()].sort((a, b) => String(b.lastAt).localeCompare(String(a.lastAt)));
}

export function getExerciseProgressDetail(userId, exerciseName) {
  const name = String(exerciseName || "").trim().toLowerCase();
  const logs = getLoadLogs(userId)
    .filter((l) => String(l.exerciseName || l.nombre || "").trim().toLowerCase() === name)
    .sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));
  const snaps = logs.map((log) => {
    const snap = extractFuerzaSnapshot(log) || {};
    const epley = snap.maxWeight != null && snap.repsAtMax
      ? estimate1RM(snap.maxWeight, snap.repsAtMax)
      : null;
    return {
      log,
      ...snap,
      epley,
      series: Array.isArray(log.series) ? log.series : [],
      date: log.recordedAt,
    };
  }).filter((s) => s.maxWeight != null || s.volume != null || s.totalReps != null);
  if (!snaps.length) {
    return { exerciseName, sessions: [], last: null, prev: null, record: null, epley: null };
  }
  const last = snaps[snaps.length - 1];
  const prev = snaps.length > 1 ? snaps[snaps.length - 2] : null;
  const record = snaps.reduce((best, s) => {
    if (s.maxWeight == null) return best;
    if (!best || s.maxWeight > best.maxWeight) return s;
    return best;
  }, null);
  return {
    exerciseName,
    sessions: snaps,
    last,
    prev,
    record,
    deltaWeight: last.maxWeight != null && prev?.maxWeight != null
      ? Math.round((last.maxWeight - prev.maxWeight) * 10) / 10
      : null,
    epley: last.epley,
    chartWeight: snaps.map((s, i) => ({
      label: i === snaps.length - 1 ? "Actual" : `S−${snaps.length - 1 - i}`,
      value: s.maxWeight,
    })).slice(-8),
    chartVolume: snaps.map((s, i) => ({
      label: i === snaps.length - 1 ? "Actual" : `S−${snaps.length - 1 - i}`,
      value: s.volume,
    })).slice(-8),
    chart1rm: snaps.map((s, i) => ({
      label: i === snaps.length - 1 ? "Actual" : `S−${snaps.length - 1 - i}`,
      value: s.epley,
    })).slice(-8),
  };
}

/**
 * Control de carga semanal + ACWR descriptivo (no predictor de lesiones).
 * ACWR = carga aguda (7 días) / crónica (media de 4 semanas). Requiere ≥3 semanas.
 */
export function getWeeklyLoadControl(userId, { weeks = 4 } = {}) {
  const logs = getLoadLogs(userId);
  const byWeek = {};
  for (const log of logs) {
    const wk = mondayKeyFromIso(log.recordedAt);
    if (!wk) continue;
    if (!byWeek[wk]) {
      byWeek[wk] = {
        week: wk,
        units: 0,
        minutes: 0,
        rpeSum: 0,
        rpeCount: 0,
        sessionIds: new Set(),
        domains: { fuerza: 0, resistencia: 0, velocidad: 0, otros: 0 },
      };
    }
    const bucket = byWeek[wk];
    const units = sessionLoadUnits(log);
    bucket.units += units;
    const mins = parseDurationMinutes(log.duration || log.time);
    if (mins) bucket.minutes += mins;
    const rpe = parseWeight(log.rpe);
    if (rpe != null) {
      bucket.rpeSum += rpe;
      bucket.rpeCount += 1;
    }
    if (log.sessionId) bucket.sessionIds.add(log.sessionId);
    else bucket.sessionIds.add(log.id);
    bucket.domains[classifyLoadDomain(log)] += units;
  }

  const keys = Object.keys(byWeek).sort();
  const lastKeys = [];
  const todayMon = mondayKeyFromIso(new Date().toISOString());
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(`${todayMon}T12:00:00`);
    d.setDate(d.getDate() - 7 * i);
    lastKeys.push(d.toISOString().slice(0, 10));
  }
  const series = lastKeys.map((week, i) => {
    const b = byWeek[week];
    return {
      week,
      label: i === lastKeys.length - 1 ? "Actual" : `S−${lastKeys.length - 1 - i}`,
      units: b ? Math.round(b.units) : 0,
      minutes: b ? Math.round(b.minutes) : 0,
      sessions: b ? b.sessionIds.size : 0,
      avgRpe: b && b.rpeCount ? Math.round((b.rpeSum / b.rpeCount) * 10) / 10 : null,
      domains: b ? b.domains : { fuerza: 0, resistencia: 0, velocidad: 0, otros: 0 },
    };
  });

  const current = series[series.length - 1] || {
    units: 0, minutes: 0, sessions: 0, avgRpe: null,
    domains: { fuerza: 0, resistencia: 0, velocidad: 0, otros: 0 },
  };
  const prev = series.length > 1 ? series[series.length - 2] : null;
  const chronicWeeks = series.filter((s) => s.units > 0);
  const chronic = chronicWeeks.length >= 3
    ? chronicWeeks.reduce((a, s) => a + s.units, 0) / chronicWeeks.length
    : null;
  const acute = current.units;
  const acwr = chronic && chronic > 0 ? Math.round((acute / chronic) * 100) / 100 : null;
  let acwrBand = null;
  if (acwr != null) {
    if (acwr < 0.8) acwrBand = { label: "Baja", tone: "neutral" };
    else if (acwr <= 1.3) acwrBand = { label: "Óptima", tone: "positive" };
    else acwrBand = { label: "Alta", tone: "mixed" };
  }

  const domainTotals = current.domains;
  const domainSum = Object.values(domainTotals).reduce((a, b) => a + b, 0) || 1;
  const distribution = ["fuerza", "resistencia", "velocidad", "otros"].map((k) => ({
    key: k,
    label: k === "otros" ? "Otros" : k[0].toUpperCase() + k.slice(1),
    units: Math.round(domainTotals[k] || 0),
    pct: Math.round(((domainTotals[k] || 0) / domainSum) * 100),
  }));

  return {
    current: {
      units: Math.round(current.units),
      minutes: current.minutes,
      sessions: current.sessions,
      avgRpe: current.avgRpe,
    },
    prev: prev ? {
      units: Math.round(prev.units),
      minutes: prev.minutes,
      sessions: prev.sessions,
      avgRpe: prev.avgRpe,
    } : null,
    series,
    distribution,
    acwr,
    acwrBand,
    weeksWithData: keys.length,
  };
}
