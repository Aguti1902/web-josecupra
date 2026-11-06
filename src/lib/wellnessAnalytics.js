/**
 * Feedback wellness semana vs semana anterior (estilo Mis cargas).
 * Métricas: peso, perímetro abdominal, fatiga (1–5), sueño (1–5), dolor muscular (1–5).
 */

function parseNum(v) {
  if (v == null || v === "") return null;
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function pctChange(curr, prev) {
  if (curr == null || prev == null || prev === 0) return null;
  return Math.round(((curr - prev) / Math.abs(prev)) * 1000) / 10;
}

/**
 * @param {object} curr entry
 * @param {object} prev entry
 * @returns {{ cards: array, summary: object|null }}
 */
export function buildWellnessFeedback(curr = {}, prev = {}) {
  const cards = [];

  const wCurr = parseNum(curr.weightKg);
  const wPrev = parseNum(prev.weightKg);
  if (wCurr != null && wPrev != null) {
    const delta = Math.round((wCurr - wPrev) * 10) / 10;
    const pct = pctChange(wCurr, wPrev);
    let tone = "neutral";
    let message = `Peso estable (${wCurr} kg).`;
    if (delta > 0.15) {
      tone = "mixed";
      message = `El peso ha subido ${delta} kg (${wPrev} → ${wCurr} kg).`;
    } else if (delta < -0.15) {
      tone = "positive";
      message = `El peso ha bajado ${Math.abs(delta)} kg (${wPrev} → ${wCurr} kg).`;
    }
    cards.push({
      id: "weight",
      label: "Peso",
      unit: "kg",
      curr: wCurr,
      prev: wPrev,
      delta,
      pct,
      tone,
      message,
    });
  }

  const aCurr = parseNum(curr.waistCm);
  const aPrev = parseNum(prev.waistCm);
  if (aCurr != null && aPrev != null) {
    const delta = Math.round((aCurr - aPrev) * 10) / 10;
    const pct = pctChange(aCurr, aPrev);
    let tone = "neutral";
    let message = `Perímetro abdominal estable (${aCurr} cm).`;
    if (delta > 0.3) {
      tone = "mixed";
      message = `El perímetro abdominal ha subido ${delta} cm.`;
    } else if (delta < -0.3) {
      tone = "positive";
      message = `El perímetro abdominal ha bajado ${Math.abs(delta)} cm. Buena señal.`;
    }
    cards.push({
      id: "waist",
      label: "Perímetro abdominal",
      unit: "cm",
      curr: aCurr,
      prev: aPrev,
      delta,
      pct,
      tone,
      message,
      invertPct: true,
    });
  }

  const fCurr = parseNum(curr.fatigue);
  const fPrev = parseNum(prev.fatigue);
  if (fCurr != null && fPrev != null) {
    const delta = Math.round((fCurr - fPrev) * 10) / 10;
    let tone = "neutral";
    let message = `Fatiga similar (${fCurr}/5).`;
    if (delta <= -0.5) {
      tone = "positive";
      message = `Menos fatiga que la semana pasada (${fPrev} → ${fCurr}/5).`;
    } else if (delta >= 0.5) {
      tone = "negative";
      message = `Más fatiga que la semana pasada (${fPrev} → ${fCurr}/5). Prioriza descanso.`;
    }
    cards.push({
      id: "fatigue",
      label: "Fatiga",
      unit: "/5",
      curr: fCurr,
      prev: fPrev,
      delta,
      pct: pctChange(fCurr, fPrev),
      tone,
      message,
      invertPct: true,
    });
  }

  const sCurr = parseNum(curr.sleep);
  const sPrev = parseNum(prev.sleep);
  if (sCurr != null && sPrev != null) {
    const delta = Math.round((sCurr - sPrev) * 10) / 10;
    let tone = "neutral";
    let message = `Sueño similar (${sCurr}/5).`;
    if (delta >= 0.5) {
      tone = "positive";
      message = `Has dormido mejor (${sPrev} → ${sCurr}/5).`;
    } else if (delta <= -0.5) {
      tone = "negative";
      message = `La calidad del sueño ha bajado (${sPrev} → ${sCurr}/5).`;
    }
    cards.push({
      id: "sleep",
      label: "Sueño",
      unit: "/5",
      curr: sCurr,
      prev: sPrev,
      delta,
      pct: pctChange(sCurr, sPrev),
      tone,
      message,
    });
  }

  const pCurr = parseNum(curr.musclePain);
  const pPrev = parseNum(prev.musclePain);
  if (pCurr != null && pPrev != null) {
    const delta = Math.round((pCurr - pPrev) * 10) / 10;
    let tone = "neutral";
    let message = `Dolor muscular similar (${pCurr}/5).`;
    if (delta <= -0.5) {
      tone = "positive";
      message = `Menos dolor muscular que la semana pasada (${pPrev} → ${pCurr}/5).`;
    } else if (delta >= 0.5) {
      tone = "negative";
      message = `Más dolor muscular que la semana pasada (${pPrev} → ${pCurr}/5).`;
    }
    cards.push({
      id: "musclePain",
      label: "Dolor muscular",
      unit: "/5",
      curr: pCurr,
      prev: pPrev,
      delta,
      pct: pctChange(pCurr, pPrev),
      tone,
      message,
      invertPct: true,
    });
  }

  const overview = buildWeeklyWellnessOverview(curr, prev, cards);
  const summary = overview || (cards.length
    ? cards.find((c) => c.tone === "positive")
      || cards.find((c) => c.tone === "negative")
      || cards[0]
    : null);

  return { cards, summary, overview };
}

const FATIGUE_WORD = { 1: "muy baja", 2: "baja", 3: "moderada", 4: "alta", 5: "muy alta" };
const SLEEP_WORD = { 1: "muy mala", 2: "mala", 3: "regular", 4: "buena", 5: "excelente" };
const PAIN_WORD = { 1: "muy bajo", 2: "bajo", 3: "moderado", 4: "alto", 5: "muy alto" };

export function buildWeeklyWellnessOverview(curr = {}, prev = {}, cards = []) {
  const f = parseNum(curr.fatigue);
  const s = parseNum(curr.sleep);
  const p = parseNum(curr.musclePain);
  if (f == null && s == null && p == null && !cards.length) return null;

  const bits = [];
  if (f != null) bits.push(`Fatiga ${FATIGUE_WORD[Math.round(f)] || "moderada"}`);
  if (s != null) bits.push(`sueño ${SLEEP_WORD[Math.round(s)] || "regular"}`);
  if (p != null) bits.push(`dolor muscular ${PAIN_WORD[Math.round(p)] || "bajo"}`);

  const negatives = cards.filter((c) => c.tone === "negative").length;
  const positives = cards.filter((c) => c.tone === "positive").length;
  let status = "Estable";
  let tone = "neutral";
  if (negatives >= 2 || f >= 4 || s <= 2 || p >= 4) {
    status = "Atención";
    tone = "negative";
  } else if (positives >= 2 && negatives === 0) {
    status = "Mejora";
    tone = "positive";
  } else if (f <= 2 && s >= 4 && (p == null || p <= 2)) {
    status = "Óptimo";
    tone = "positive";
  }

  const head = tone === "negative"
    ? "Conviene vigilar la recuperación."
    : "Tu estado general es bueno.";
  const message = bits.length ? `${head} ${bits.join(" y ")}.` : head;

  return { status, tone, message, cards };
}

export function wellnessChartSeries(map, metric, count = 4, fromDate = new Date()) {
  const keys = chartWeekKeys(count, fromDate);
  return keys.map((weekKey, i) => ({
    weekKey,
    label: i === keys.length - 1 ? "Actual" : `S−${keys.length - 1 - i}`,
    value: parseNum(map?.[weekKey]?.[metric]),
  }));
}

function chartWeekKeys(count, fromDate = new Date()) {
  const d = new Date(fromDate);
  d.setHours(12, 0, 0, 0);
  const diff = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diff);
  const keys = [];
  for (let i = count - 1; i >= 0; i--) {
    const x = new Date(d);
    x.setDate(d.getDate() - 7 * i);
    keys.push(x.toISOString().slice(0, 10));
  }
  return keys;
}

export function entryHasData(entry) {
  if (!entry) return false;
  return ["weightKg", "waistCm", "fatigue", "sleep", "musclePain"].some((k) => {
    const n = parseNum(entry[k]);
    return n != null;
  });
}
