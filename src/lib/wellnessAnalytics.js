/**
 * Feedback wellness semana vs semana anterior (estilo Mis cargas).
 * Métricas: peso, perímetro abdominal, fatiga (1–5), sueño (1–5).
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

  const summary = cards.length
    ? cards.find((c) => c.tone === "positive")
      || cards.find((c) => c.tone === "negative")
      || cards[0]
    : null;

  return { cards, summary };
}

export function entryHasData(entry) {
  if (!entry) return false;
  return ["weightKg", "waistCm", "fatigue", "sleep"].some((k) => {
    const n = parseNum(entry[k]);
    return n != null;
  });
}
