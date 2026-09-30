/**
 * Cuadrícula S1–S4 de Mis cargas (fuerza / resistencia / velocidad).
 * Enlaza los registros de la rutina sin reescribirlos.
 */
import { getLoadLogs } from "./loadLogs.js";
import { getLogsByDomain, parseTimeToSeconds } from "./loadAnalytics.js";

function parseNum(value) {
  const raw = String(value || "").trim();
  if (!raw || /^pc$/i.test(raw) || /peso\s*corporal/i.test(raw)) return null;
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

export function mesoWeekIndex(recordedAt, startDate, weekLabel, weekNumber) {
  if (weekNumber != null && Number(weekNumber) >= 1) {
    return Math.min(6, Math.max(1, Number(weekNumber)));
  }
  const fromLabel = String(weekLabel || "");
  const labeled = fromLabel.match(/(?:semana|s|week)\s*(\d+)/i) || fromLabel.match(/^(\d+)$/);
  if (labeled) {
    const n = Number(labeled[1]);
    if (n >= 1 && n <= 6) return n;
  }
  if (recordedAt && startDate) {
    const a = Date.parse(recordedAt);
    const b = Date.parse(startDate);
    if (Number.isFinite(a) && Number.isFinite(b)) {
      const diff = Math.floor((a - b) / (7 * 86400000));
      return Math.min(6, Math.max(1, diff + 1));
    }
  }
  return 1;
}

export function exerciseKey(log) {
  if (log?.catalogId != null) return `c:${log.catalogId}`;
  const id = String(log?.exerciseId || "");
  const fromId = id.match(/^v2_(\d+)_/);
  if (fromId) return `c:${fromId[1]}`;
  return `n:${String(log?.exerciseName || log?.nombre || "ejercicio").trim().toLowerCase()}`;
}

function seriesFromLog(log) {
  if (Array.isArray(log.series) && log.series.length) {
    return log.series.map((s) => ({
      weight: s.weight || "",
      reps: s.reps || "",
      weightNum: parseNum(s.weight),
      repsNum: parseReps(s.reps),
    }));
  }
  const weights = String(log.weight || "").split("/").map((s) => s.trim()).filter(Boolean);
  const reps = String(log.reps || "").split("/").map((s) => s.trim()).filter(Boolean);
  const n = Math.max(weights.length, reps.length, 1);
  return Array.from({ length: n }, (_, i) => ({
    weight: weights[i] || "",
    reps: reps[i] || "",
    weightNum: parseNum(weights[i]),
    repsNum: parseReps(reps[i]),
  }));
}

function volumeOfSeries(series) {
  return (series || []).reduce((sum, s) => {
    const w = s.weightNum;
    const r = s.repsNum;
    if (w == null || r == null) return sum;
    return sum + w * r;
  }, 0);
}

function maxWeightOfSeries(series) {
  const nums = (series || []).map((s) => s.weightNum).filter((n) => n != null);
  return nums.length ? Math.max(...nums) : null;
}

function meanOf(values) {
  const nums = values.filter((n) => n != null && Number.isFinite(n));
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function toneVs(current, baseline, { invert = false } = {}) {
  if (current == null || baseline == null || baseline === 0) return "neutral";
  const better = invert ? current < baseline : current > baseline;
  const worse = invert ? current > baseline : current < baseline;
  if (better) return "positive";
  if (worse) return "negative";
  return "neutral";
}

function pctFrom(current, baseline, { invert = false } = {}) {
  if (current == null || baseline == null || baseline === 0) return null;
  const raw = ((current - baseline) / Math.abs(baseline)) * 100;
  const signed = invert ? -raw : raw;
  return Math.round(signed * 10) / 10;
}

/**
 * @returns {{ weeks: number[], rows: object[], sessionTotals: object[], charts: object }}
 */
export function buildLoadGrid(userId, domain, { startDate = null, weekFilter = "all" } = {}) {
  const buckets = getLogsByDomain(userId);
  const logs = (buckets[domain] || []).slice().sort(
    (a, b) => String(a.recordedAt || "").localeCompare(String(b.recordedAt || "")),
  );
  const weekSet = new Set();
  const byEx = new Map();

  for (const log of logs) {
    const w = mesoWeekIndex(log.recordedAt, startDate || log.planStartDate, log.weekLabel, log.weekNumber);
    weekSet.add(w);
    const key = exerciseKey(log);
    if (!byEx.has(key)) {
      byEx.set(key, {
        key,
        name: log.exerciseName || log.nombre || "Ejercicio",
        catalogId: log.catalogId || null,
        weeks: {},
      });
    }
    const row = byEx.get(key);
    const prev = row.weeks[w];
    const newer = !prev || String(log.recordedAt || "") >= String(prev.recordedAt || "");
    if (!newer) continue;

    if (domain === "fuerza") {
      const series = seriesFromLog(log);
      row.weeks[w] = {
        recordedAt: log.recordedAt,
        series,
        maxWeight: maxWeightOfSeries(series),
        volume: volumeOfSeries(series),
        meanWeight: meanOf(series.map((s) => s.weightNum)),
      };
    } else if (domain === "resistencia") {
      row.weeks[w] = {
        recordedAt: log.recordedAt,
        heartRate: parseNum(log.heartRate),
        rpe: parseNum(log.rpe || log.intensity),
        distance: parseNum(log.distance),
        time: log.time || "",
        timeSec: parseTimeToSeconds(log.time),
      };
    } else {
      row.weeks[w] = {
        recordedAt: log.recordedAt,
        time: log.time || "",
        timeSec: parseTimeToSeconds(log.time),
        heartRate: parseNum(log.heartRate),
        rpe: parseNum(log.rpe),
      };
    }
  }

  const weeks = [1, 2, 3, 4].filter((w) => weekFilter === "all" || Number(weekFilter) === w);
  const rows = [...byEx.values()].map((row) => {
    const w1 = row.weeks[1];
    const cells = {};
    for (const w of [1, 2, 3, 4]) {
      const cell = row.weeks[w];
      if (!cell) {
        cells[w] = null;
        continue;
      }
      if (domain === "fuerza") {
        cells[w] = {
          ...cell,
          tone: toneVs(cell.maxWeight, w1?.maxWeight),
          pctFromS1: pctFrom(cell.maxWeight, w1?.maxWeight),
        };
      } else if (domain === "resistencia") {
        cells[w] = {
          ...cell,
          tone: toneVs(cell.distance, w1?.distance) !== "neutral"
            ? toneVs(cell.distance, w1?.distance)
            : toneVs(cell.heartRate, w1?.heartRate, { invert: true }),
          pctFromS1: pctFrom(cell.distance, w1?.distance) ?? pctFrom(cell.heartRate, w1?.heartRate, { invert: true }),
        };
      } else {
        cells[w] = {
          ...cell,
          tone: toneVs(cell.timeSec, w1?.timeSec, { invert: true }),
          pctFromS1: pctFrom(cell.timeSec, w1?.timeSec, { invert: true }),
        };
      }
    }
    const filled = [1, 2, 3, 4].map((w) => row.weeks[w]).filter(Boolean);
    const last = filled[filled.length - 1];
    const maxes = filled.map((c) => c.maxWeight).filter((n) => n != null);
    const means = filled.map((c) => c.meanWeight).filter((n) => n != null);
    return {
      ...row,
      cells,
      pctFromS1: last?.pctFromS1 ?? cells[filled.length]?.pctFromS1 ?? null,
      tone: last?.tone || "neutral",
      maxWeight: maxes.length ? Math.max(...maxes) : null,
      meanWeight: meanOf(means),
    };
  }).sort((a, b) => a.name.localeCompare(b.name, "es"));

  const sessionMap = new Map();
  for (const log of logs) {
    const w = mesoWeekIndex(log.recordedAt, startDate || log.planStartDate, log.weekLabel, log.weekNumber);
    if (weekFilter !== "all" && Number(weekFilter) !== w) continue;
    const sid = log.sessionId || `${w}|${log.sessionTitle || log.recordedAt?.slice(0, 10)}`;
    if (!sessionMap.has(sid)) {
      sessionMap.set(sid, {
        sessionId: sid,
        title: log.sessionTitle || "Sesión",
        week: w,
        date: log.recordedAt?.slice(0, 10) || "",
        volume: 0,
        count: 0,
      });
    }
    const rec = sessionMap.get(sid);
    rec.count += 1;
    if (domain === "fuerza") rec.volume += volumeOfSeries(seriesFromLog(log));
  }
  const sessionTotals = [...sessionMap.values()].sort((a, b) => a.week - b.week || String(a.date).localeCompare(b.date));

  const charts = {
    exerciseEvolution: rows.slice(0, 8).map((row) => ({
      name: row.name,
      points: [1, 2, 3, 4].map((w) => {
        const c = row.cells[w];
        if (!c) return { week: w, value: null };
        if (domain === "fuerza") return { week: w, value: c.maxWeight };
        if (domain === "resistencia") return { week: w, value: c.distance ?? c.heartRate };
        return { week: w, value: c.timeSec };
      }),
    })),
    improvement: rows
      .filter((r) => r.pctFromS1 != null)
      .sort((a, b) => (b.pctFromS1 || 0) - (a.pctFromS1 || 0))
      .slice(0, 8)
      .map((r) => ({ name: r.name, pct: r.pctFromS1, tone: r.tone })),
    sessionVolume: sessionTotals.map((s) => ({
      label: `S${s.week}`,
      value: Math.round(s.volume),
      title: s.title,
    })),
  };

  void weekSet;
  return { weeks, rows, sessionTotals, charts, domain };
}

export function loadGridToCsv(grid, domain) {
  const header = domain === "fuerza"
    ? ["Ejercicio", "S1 series", "S2 series", "S3 series", "S4 series", "Máximo kg", "Media kg", "% vs S1"]
    : domain === "resistencia"
      ? ["Ejercicio", "S1 FC/RPE/dist", "S2", "S3", "S4", "% vs S1"]
      : ["Ejercicio", "S1 tiempo/FC/RPE", "S2", "S3", "S4", "% vs S1"];
  const lines = [header.join(";")];
  for (const row of grid.rows || []) {
    const cellTxt = (w) => {
      const c = row.cells?.[w];
      if (!c) return "";
      if (domain === "fuerza") {
        return (c.series || []).map((s) => `${s.weight || "–"}×${s.reps || "–"}`).join(" | ");
      }
      if (domain === "resistencia") {
        return [`FC ${c.heartRate ?? "–"}`, `RPE ${c.rpe ?? "–"}`, `m ${c.distance ?? "–"}`].join(" · ");
      }
      return [`${c.time || "–"}`, `FC ${c.heartRate ?? "–"}`, `RPE ${c.rpe ?? "–"}`].join(" · ");
    };
    if (domain === "fuerza") {
      lines.push([
        row.name,
        cellTxt(1), cellTxt(2), cellTxt(3), cellTxt(4),
        row.maxWeight ?? "",
        row.meanWeight != null ? row.meanWeight.toFixed(1) : "",
        row.pctFromS1 != null ? `${row.pctFromS1}%` : "",
      ].join(";"));
    } else {
      lines.push([
        row.name,
        cellTxt(1), cellTxt(2), cellTxt(3), cellTxt(4),
        row.pctFromS1 != null ? `${row.pctFromS1}%` : "",
      ].join(";"));
    }
  }
  return `\uFEFF${lines.join("\n")}`;
}

export function downloadLoadGridCsv(grid, domain) {
  const csv = loadGridToCsv(grid, domain);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mis-cargas-${domain}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function uniquePlayersFromLogs(userId) {
  const names = new Set();
  for (const log of getLoadLogs(userId)) {
    if (log.playerName) names.add(log.playerName);
  }
  return [...names].sort((a, b) => a.localeCompare(b, "es"));
}
