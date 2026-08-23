/**
 * Tests físicos globales (admin + panel club/ProCoach).
 * El protocolo de texto sale siempre; el vídeo lo pone el admin.
 */
export const EVAL_TEST_DEFAULTS = [
  {
    id: "resistencia",
    label: "Resistencia aeróbica",
    unit: "m / min",
    placeholder:
      "Protocolo: el jugador corre durante X minutos a ritmo constante. Se miden los metros totales cubiertos. Mantén el mismo circuito y las mismas condiciones en T1, T2 y T3.",
  },
  {
    id: "sprint",
    label: "Sprint 30m",
    unit: "seg",
    placeholder:
      "Protocolo: el jugador realiza un sprint de 30m partiendo desde parado. Se registra el tiempo con fotocélulas o cronómetro. Mejor de 2 intentos, con recuperación completa.",
  },
  {
    id: "cod",
    label: "Cambio de dirección",
    unit: "seg",
    placeholder:
      "Protocolo: test 5-10-5 o Illinois. El jugador recorre el circuito lo más rápido posible. Misma salida, mismo sentido y mismo calentamiento en cada evaluación.",
  },
  {
    id: "cmj",
    label: "Salto CMJ",
    unit: "cm",
    placeholder:
      "Protocolo: salto con contramovimiento desde posición erguida, manos en cadera. Se mide la altura máxima alcanzada. Mejor de 3 intentos válidos.",
  },
];

export function mergeEvalTests(saved = []) {
  const byId = Object.fromEntries((saved || []).map((t) => [t.id, t]));
  const merged = EVAL_TEST_DEFAULTS.map((base) => {
    const hit = byId[base.id] || {};
    const description = String(hit.description || "").trim() || base.placeholder;
    return {
      ...base,
      ...hit,
      label: hit.label || base.label,
      unit: hit.unit || base.unit,
      description,
      videoUrl: hit.videoUrl || "",
      placeholder: base.placeholder,
    };
  });
  for (const t of saved || []) {
    if (!EVAL_TEST_DEFAULTS.some((b) => b.id === t.id)) merged.push(t);
  }
  return merged;
}
