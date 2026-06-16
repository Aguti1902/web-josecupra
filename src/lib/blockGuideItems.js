/** Panel informativo derecho (calentamiento / principal) — editable por admin */

export const DEFAULT_WARMUP_GUIDE = [
  { id: "w1", label: "Con balón",       text: "Posesión simple, rueda o rondo de activación" },
  { id: "w2", label: "Tarea integrada", text: "Rondo, conservación o circuito técnico corto" },
  { id: "w3", label: "Espacio",         text: "Zona media del campo · Sin presión inicial" },
  { id: "w4", label: "Participación",   text: "Todo el equipo desde el minuto 1" },
  { id: "w5", label: "Duración",        text: "10–15 min · Escalado gradual hasta ritmo medio" },
  { id: "w6", label: "Evitar",          text: "Sprints sin balón, ejercicios estáticos, carga en frío" },
];

export const DEFAULT_PRINCIPAL_GUIDE = {
  A: [
    { id: "pa1", label: "Qué haremos",  text: "Trabajo de volumen y dominio colectivo" },
    { id: "pa2", label: "Por qué",       text: "Construir base técnica sin sobrecargar el SNC" },
    { id: "pa3", label: "Duración",      text: "Series largas · 8–12 min de trabajo" },
    { id: "pa4", label: "Intensidad",    text: "60–70% · Ritmo controlado" },
    { id: "pa5", label: "Sub-12",        text: "Reducir series 20% · Sin impacto articular" },
  ],
  B: [
    { id: "pb1", label: "Qué haremos",  text: "Alta exigencia en espacios reducidos" },
    { id: "pb2", label: "Por qué",       text: "Mejorar decisión bajo presión y velocidad" },
    { id: "pb3", label: "Duración",      text: "Bloques cortos · 4–6 min de trabajo" },
    { id: "pb4", label: "Intensidad",    text: "80–90% · Ritmo muy elevado" },
    { id: "pb5", label: "Sub-14",        text: "Máx. 85% FCmax · Vigilar carga articular" },
  ],
  C: [
    { id: "pc1", label: "Qué haremos",  text: "Acciones explosivas y velocidad reactiva máxima" },
    { id: "pc2", label: "Por qué",       text: "Activar el SNC y mejorar la velocidad de reacción" },
    { id: "pc3", label: "Duración",      text: "Ráfagas cortas · 2–4 min · Descanso 3–5 min" },
    { id: "pc4", label: "Intensidad",    text: "100% · Sin reservas · Máximo esfuerzo" },
    { id: "pc5", label: "Sub-16",        text: "Calentamiento mínimo 15 min · Riesgo lesional" },
  ],
  D: [
    { id: "pd1", label: "Qué haremos",  text: "Trabajo complementario de movilidad y activación" },
    { id: "pd2", label: "Por qué",       text: "Completar la semana sin acumular fatiga" },
    { id: "pd3", label: "Duración",      text: "Bloques medios · 6–8 min" },
    { id: "pd4", label: "Intensidad",    text: "50–60% · Carga baja" },
    { id: "pd5", label: "4 días/sem",    text: "Sesión ideal para equipos con 4 entrenos semanales" },
  ],
};

export function emptyGuideItem() {
  return {
    id: `g_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    label: "",
    text: "",
  };
}

export function getDefaultGuideItems(blockType, framework = "A") {
  if (blockType === "calentamiento") {
    return DEFAULT_WARMUP_GUIDE.map((item) => ({ ...item }));
  }
  const fw = framework || "A";
  const list = DEFAULT_PRINCIPAL_GUIDE[fw] || DEFAULT_PRINCIPAL_GUIDE.A;
  return list.map((item) => ({ ...item }));
}

/** Items del panel derecho: personalizados en el bloque o valores por defecto */
export function resolveBlockGuideItems(block, blockType, framework = "A") {
  if (block?.guideItems?.length) {
    return block.guideItems.filter((item) => item.label || item.text);
  }
  return getDefaultGuideItems(blockType, framework);
}
