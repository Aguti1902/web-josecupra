/** Diseñador de tareas — catálogo, parámetros, consignas y recomendaciones (editable por admin) */

export const DEFAULT_TASK_TYPES = [
  "Automatismos", "Ruedas de pase", "Posesiones", "Juegos de posición",
  "Conservaciones", "Rondo simple", "Rondo ampliado", "Rondo direccional",
  "Partidos reducidos", "Partidos condicionados", "Finalización",
  "Oleadas", "Secuencias por carriles", "1 vs 1", "2 vs 1", "3 vs 2",
  "Transiciones ofensivas", "Transiciones defensivas", "Circuitos técnicos",
  "Tarea mixta", "Tarea global", "Juegos reactivos", "Presión tras pérdida",
  "Salida de balón", "Juego posicional", "Pressing zonal", "Combinativas",
  "Trabajo técnico individual",
];

export const DEFAULT_PARAMS = {
  A: { space: "Amplio", grouping: "Todo el equipo", balls: "1 c/2–3 jug.", work: "8–12 min", rest: "3–4 min", intensity: "60–70%" },
  B: { space: "Reducido", grouping: "Grupos de 4–8", balls: "1 por grupo", work: "4–6 min", rest: "1–2 min", intensity: "80–90%" },
  C: { space: "Direccional", grouping: "Grupos de 4–6", balls: "1 por acción", work: "2–4 min", rest: "3–5 min", intensity: "Máxima" },
  D: { space: "Medio", grouping: "Grupos de 6–10", balls: "1 por grupo", work: "6–8 min", rest: "2–3 min", intensity: "50–60%" },
};

export const DEFAULT_TASK_CUES = {
  Posesiones: {
    A: ["Espacio grande, baja presión", "Circulación sin urgencia", "Fútbol asociativo"],
    B: ["Espacio reducido, ritmo alto", "Presión inmediata en pérdida", "Superioridades cambiantes"],
    C: ["Acciones rápidas y transiciones veloces", "Presión total", "Máx. 2–3 min por serie"],
  },
  "Rondo simple": {
    A: ["1–2 toques sin presión temporal", "Apoyo siempre disponible", "Ritmo técnico"],
    B: ["1 toque obligatorio", "Espacio más pequeño", "Velocidad de circulación máxima"],
    C: ["Reacción inmediata al cambio de rol", "Sprint defensivo al perder", "Pocas rep. máxima calidad"],
  },
  "Partidos reducidos": {
    A: ["Campo grande, juego asociativo", "Libertad táctica total", "Descansos generosos"],
    B: ["Campo pequeño, alta intensidad", "Transiciones muy rápidas", "Presión constante"],
    C: ["Ráfagas de 2–3 min al 100%", "Descanso amplio entre partidos", "Transición inmediata"],
  },
  Finalización: {
    A: ["Muchos disparos, poca presión", "Variedad de posiciones de tiro", "Ritmo técnico"],
    B: ["Finalización bajo presión activa", "Velocidad en el último pase", "Decisión rápida"],
    C: ["Sprint de llegada máximo", "Disparo sin control previo", "Recuperación total entre rep."],
  },
  "1 vs 1": {
    A: ["Espacio amplio para el dribling", "Muchas repeticiones técnicas", "Sin urgencia"],
    B: ["Espacio reducido para 1v1", "Alta presión defensiva", "Decisión instantánea"],
    C: ["Arranque máximo desde el primer metro", "100% en el sprint", "Transición explosiva"],
  },
  "Transiciones ofensivas": {
    A: ["Salida organizada sin urgencia", "Múltiples líneas de pase", "Comunicación táctica"],
    B: ["Velocidad de transición máxima", "Salida en 3 seg máximo", "Superioridad aprovechada"],
    C: ["Sprint total al recuperar", "Decisión instantánea", "Máxima velocidad hasta el gol"],
  },
  "Pressing zonal": {
    A: ["Zonas amplias de pressing suave", "Organización de referencias", "Baja intensidad defensiva"],
    B: ["Pressing coordinado y agresivo", "Trampa defensiva activa", "Alta intensidad en zona"],
    C: ["Activación total del pressing", "Sprint explosivo defensivo", "Recuperar el balón en 5 seg"],
  },
};

export const DEFAULT_FRAMEWORK_CUES = {
  A: ["Ritmo técnico controlado · alta repetición", "Espacios amplios sin urgencia temporal", "Descansos generosos entre series"],
  B: ["Velocidad de decisión máxima", "Presión alta sobre el portador", "Grupos reducidos sin pausa"],
  C: ["Arranque explosivo en cada acción", "Descanso completo antes de repetir", "100% de intensidad en cada ráfaga"],
  D: ["Trabajo complementario controlado", "Movilidad sin fatiga acumulada", "Participación total del grupo"],
};

export const DEFAULT_RECOMMENDATIONS = {
  A: [
    "Espacios amplios para circulación fluida",
    "Alta repetición con baja presión temporal",
    "Descansos largos entre series, sin prisa",
    "Participación colectiva: todo el equipo junto",
  ],
  B: [
    "Espacios reducidos para forzar decisiones rápidas",
    "Grupos pequeños → máxima participación individual",
    "Bloques cortos de alta exigencia sin pausa",
    "Presión constante sobre el portador del balón",
  ],
  C: [
    "Acciones de 2–4 seg con arranque máximo",
    "Recuperación generosa para mantener calidad",
    "Cambios de dirección y velocidad al máximo",
    "El descanso define la calidad de cada acción",
  ],
  D: [
    "Trabajo complementario de baja carga articular",
    "Movilidad y activación sin fatiga acumulada",
    "Ideal tras sesiones intensas de la semana",
    "Participación total con foco en calidad técnica",
  ],
};

const PARAM_FIELDS = [
  { key: "space", label: "Espacio", placeholder: "Amplio" },
  { key: "grouping", label: "Agrupación", placeholder: "Todo el equipo" },
  { key: "balls", label: "Balones", placeholder: "1 c/2–3 jug." },
  { key: "work", label: "Trabajo", placeholder: "8–12 min" },
  { key: "rest", label: "Descanso", placeholder: "3–4 min" },
  { key: "intensity", label: "Intensidad", placeholder: "60–70%" },
];

export { PARAM_FIELDS };

function cloneParams() {
  return Object.fromEntries(
    Object.entries(DEFAULT_PARAMS).map(([fw, p]) => [fw, { ...p }])
  );
}

function cloneRecommendations() {
  return Object.fromEntries(
    Object.entries(DEFAULT_RECOMMENDATIONS).map(([fw, list]) => [fw, [...list]])
  );
}

export function createDefaultTaskDesigner() {
  return {
    taskTypes: [...DEFAULT_TASK_TYPES],
    paramsByFramework: cloneParams(),
    cuesByTask: {},
    recommendationsByFramework: cloneRecommendations(),
  };
}

export function normalizeTaskDesigner(raw) {
  const base = createDefaultTaskDesigner();
  if (!raw) return base;
  return {
    taskTypes: raw.taskTypes?.length ? [...raw.taskTypes] : base.taskTypes,
    paramsByFramework: {
      ...base.paramsByFramework,
      ...(raw.paramsByFramework || {}),
      ...Object.fromEntries(
        Object.entries(raw.paramsByFramework || {}).map(([fw, p]) => [fw, { ...base.paramsByFramework[fw], ...p }])
      ),
    },
    cuesByTask: { ...(raw.cuesByTask || {}) },
    recommendationsByFramework: {
      ...base.recommendationsByFramework,
      ...Object.fromEntries(
        Object.entries(raw.recommendationsByFramework || {}).map(([fw, list]) => {
          const normalized = asCueList(list);
          return [fw, normalized.length ? normalized : base.recommendationsByFramework[fw]];
        })
      ),
    },
  };
}

export function resolveTaskTypes(taskDesigner) {
  const td = normalizeTaskDesigner(taskDesigner);
  return td.taskTypes.filter(Boolean);
}

export function resolveTaskParams(taskDesigner, framework = "A") {
  const td = normalizeTaskDesigner(taskDesigner);
  const fw = framework || "A";
  return { ...DEFAULT_PARAMS[fw], ...td.paramsByFramework[fw] };
}

function asCueList(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

export function resolveTaskCues(taskDesigner, taskName, framework = "A") {
  const td = normalizeTaskDesigner(taskDesigner);
  const fw = framework || "A";
  const custom = asCueList(td.cuesByTask?.[taskName]?.[fw]);
  if (custom.length) return custom;
  if (DEFAULT_TASK_CUES[taskName]?.[fw]) return DEFAULT_TASK_CUES[taskName][fw];
  return DEFAULT_FRAMEWORK_CUES[fw] || DEFAULT_FRAMEWORK_CUES.A;
}

export function resolveTaskRecommendations(taskDesigner, framework = "A") {
  const td = normalizeTaskDesigner(taskDesigner);
  const fw = framework || "A";
  const list = asCueList(td.recommendationsByFramework[fw]);
  if (list.length) return list;
  return DEFAULT_RECOMMENDATIONS[fw] || DEFAULT_RECOMMENDATIONS.A;
}
