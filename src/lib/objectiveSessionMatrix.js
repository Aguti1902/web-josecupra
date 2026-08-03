/**
 * Matriz de sesiones por frecuencia × nº de objetivos (DEPRO motor 3 fases).
 * Cobertura de patrones garantizada por construcción en Fase 2.
 */

export const SECONDARY_BLOCKED_FREQ1_MESSAGE = `Con un único entrenamiento semanal el objetivo secundario se incrusta como bloque accesorio dentro de la sesión principal.`;

export const MATRIX_UNDEFINED_PREFIX = "Combinación no definida en matriz:";

const VALID_PRIMARIES = ["fuerza", "velocidad", "resistencia", "hipertrofia", "estetica", "movilidad", "prevencion"];

export function normalizeObjectiveKey(objetivo) {
  const key = (objetivo || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
  if (key === "estetica") return "hipertrofia";
  return key;
}

/** Plantillas A/B/FULL por objetivo. */
export const OBJECTIVE_TEMPLATES = {
  fuerza: { A: "Fuerza Inferior", B: "Fuerza Superior", FULL: "Fuerza Full" },
  hipertrofia: { A: "Hipertrofia Pierna", B: "Hipertrofia Torso", FULL: "Hipertrofia Full" },
  velocidad: { A: "Velocidad", B: "Velocidad", FULL: "Velocidad" },
  resistencia: { A: "Resistencia aeróbica", B: "Resistencia umbral", FULL: "Resistencia anaeróbica" },
  prevencion: { A: "Prevención", B: "Movilidad", FULL: "Prevención" },
  movilidad: { A: "Movilidad", B: "Prevención", FULL: "Movilidad" },
};

export function parseWeeklyFrequency(frecuencia) {
  return Math.min(5, Math.max(1, parseInt(String(frecuencia).replace(/\D/g, "")) || 3));
}

export function resolveUserObjectives(user) {
  const principal = user?.objetivo || user?.objetivos?.[0] || "";
  let secondary = user?.objetivoSecundario || null;

  if (Array.isArray(user?.objetivos)) {
    if (user.objetivos.length <= 1) {
      secondary = null;
    } else if (!secondary) {
      secondary = user.objetivos[1] || null;
    }
  }

  if (secondary && normalizeObjectiveKey(secondary) === normalizeObjectiveKey(principal)) {
    secondary = null;
  }

  return { principal, secondary: secondary || null };
}

function templatesFor(obj) {
  const key = normalizeObjectiveKey(obj);
  return OBJECTIVE_TEMPLATES[key] || null;
}

function fullOf(obj) {
  return templatesFor(obj)?.FULL || "Movilidad";
}

function abOf(obj) {
  const t = templatesFor(obj);
  if (!t) return ["Movilidad", "Prevención"];
  if (t.A === t.B) return [t.A, t.FULL === t.A ? "Prevención" : t.FULL];
  return [t.A, t.B];
}

/**
 * Construye la lista cerrada de sesiones (Fase 2) antes de colocarlas.
 * @returns {{ sessionTypes?: string[], embedSecondary?: boolean, fillSessions?: string[], error?: string }}
 */
export function buildWeekSessionList(objetivoPrincipal, objetivoSecundario, frecuencia) {
  const n = parseWeeklyFrequency(frecuencia);
  const pri = normalizeObjectiveKey(objetivoPrincipal);
  let sec = objetivoSecundario ? normalizeObjectiveKey(objetivoSecundario) : null;

  if (!pri || !VALID_PRIMARIES.includes(pri)) {
    const msg = `${MATRIX_UNDEFINED_PREFIX} objetivo principal «${objetivoPrincipal || "?"}» no reconocido`;
    console.error("[DEPRO matriz]", msg);
    return { error: msg };
  }
  if (sec && sec === pri) sec = null;
  if (sec && !VALID_PRIMARIES.includes(sec)) sec = null;

  const pT = templatesFor(pri);
  if (!pT) {
    return { error: `${MATRIX_UNDEFINED_PREFIX} ${objetivoPrincipal}` };
  }

  let sessionTypes = [];
  let embedSecondary = false;
  let fillSessions = [];

  if (!sec) {
    if (pri === "velocidad") {
      // Velocidad: 1 sesión de P (+ opcional 2ª) y relleno fuerza→prevención→movilidad
      sessionTypes = ["Velocidad"];
      if (n >= 2) {
        // huecos se rellenan abajo
      }
    } else if (pri === "prevencion") {
      if (n === 1) sessionTypes = ["Prevención"];
      else if (n === 2) sessionTypes = ["Prevención", "Movilidad"];
      else if (n === 3) sessionTypes = ["Prevención", "Fuerza Full", "Movilidad"];
      else if (n === 4) sessionTypes = ["Prevención", "Fuerza Full", "Movilidad", "Prevención"];
      else sessionTypes = ["Prevención", "Fuerza Full", "Movilidad", "Técnica Media", "Prevención"];
      // Fuerza Full de prevención cuenta como relleno
      fillSessions = sessionTypes.filter((s) => s.startsWith("Fuerza"));
    } else if (pri === "movilidad") {
      if (n === 1) sessionTypes = ["Movilidad"];
      else if (n === 2) sessionTypes = ["Movilidad", "Prevención"];
      else sessionTypes = ["Movilidad", "Prevención", "Fuerza Full", "Movilidad", "Prevención"].slice(0, n);
      fillSessions = sessionTypes.filter((s) => s.startsWith("Fuerza"));
    } else if (n === 1) {
      sessionTypes = [pT.FULL];
    } else if (n === 2) {
      sessionTypes = abOf(pri);
    } else if (n === 3) {
      sessionTypes = [...abOf(pri), pT.FULL];
    } else if (n === 4) {
      sessionTypes = [...abOf(pri), pT.FULL, "Prevención"];
    } else {
      sessionTypes = [...abOf(pri), pT.FULL, "Técnica Media", "Prevención"];
    }
  } else {
    const sT = templatesFor(sec);
    if (n === 1) {
      sessionTypes = [pT.FULL];
      embedSecondary = true;
    } else if (n === 2) {
      sessionTypes = [pT.FULL, sT?.FULL || fullOf(sec)];
    } else if (n === 3) {
      sessionTypes = [...abOf(pri), sT?.FULL || fullOf(sec)];
    } else if (n === 4) {
      const sAB = abOf(sec);
      sessionTypes = [...abOf(pri), sAB[0], sAB[1] || sT?.FULL || "Prevención"];
    } else {
      const sAB = abOf(sec);
      sessionTypes = [...abOf(pri), sAB[0], sAB[1] || sT?.FULL || "Prevención", "Prevención"];
    }
  }

  // Intercalado preferente P/S
  sessionTypes = interleaveObjectives(sessionTypes, pri, sec);

  // Relleno de huecos (prioridad: fuerza máx 2 → prevención → movilidad)
  sessionTypes = sessionTypes.slice(0, n);
  const fillIndexes = [];
  // Marcar rellenos ya incluidos (p.ej. prevención/movilidad con fuerza de relleno)
  if (fillSessions.length) {
    sessionTypes.forEach((st, i) => {
      if (fillSessions.includes(st) && String(st).startsWith("Fuerza")) fillIndexes.push(i);
    });
  }
  while (sessionTypes.length < n) {
    const fill = pickFillSession(sessionTypes);
    fillIndexes.push(sessionTypes.length);
    sessionTypes.push(fill);
    fillSessions.push(fill);
  }

  return {
    sessionTypes,
    fullSequence: sessionTypes,
    embedSecondary,
    fillSessions,
    fillIndexes,
    primary: pri,
    secondary: sec,
  };
}

function pickFillSession(existing) {
  const fuerzaCount = existing.filter((s) => String(s).startsWith("Fuerza")).length;
  if (fuerzaCount < 2) return "Fuerza Full";
  if (!existing.includes("Prevención")) return "Prevención";
  return "Movilidad";
}

function objectiveOfSession(sessionType) {
  const s = String(sessionType);
  if (s.startsWith("Fuerza")) return "fuerza";
  if (s.startsWith("Hipertrofia")) return "hipertrofia";
  if (s === "Velocidad" || s === "Técnica Media") return "velocidad";
  if (s.startsWith("Resistencia")) return "resistencia";
  if (s === "Prevención") return "prevencion";
  if (s === "Movilidad") return "movilidad";
  return "otro";
}

/** Intercala objetivos distintos cuando es posible (preferente). */
function interleaveObjectives(sessions, pri, sec) {
  if (!sec || sessions.length < 3) return sessions;
  const primarySessions = sessions.filter((s) => objectiveOfSession(s) === pri);
  const secondarySessions = sessions.filter((s) => objectiveOfSession(s) === sec);
  const others = sessions.filter((s) => {
    const o = objectiveOfSession(s);
    return o !== pri && o !== sec;
  });
  if (!primarySessions.length || !secondarySessions.length) return sessions;

  const out = [];
  let i = 0;
  let j = 0;
  while (i < primarySessions.length || j < secondarySessions.length) {
    if (i < primarySessions.length) out.push(primarySessions[i++]);
    if (j < secondarySessions.length) out.push(secondarySessions[j++]);
  }
  return [...out, ...others].slice(0, sessions.length);
}

/**
 * API compatible: resuelve secuencia de sesiones.
 */
export function resolveMatrixSessionTypes(objetivoPrincipal, objetivoSecundario, frecuencia) {
  return buildWeekSessionList(objetivoPrincipal, objetivoSecundario, frecuencia);
}

/** Secuencias de compatibilidad para tests/callers antiguos. */
export const PRIMARY_ONLY_MATRIX = {
  fuerza: ["Fuerza Inferior", "Fuerza Superior", "Fuerza Full", "Prevención", "Técnica Media"],
  velocidad: ["Velocidad", "Fuerza Full", "Prevención", "Movilidad", "Técnica Media"],
  resistencia: ["Resistencia aeróbica", "Resistencia umbral", "Resistencia anaeróbica", "Fuerza Full", "Movilidad"],
  hipertrofia: ["Hipertrofia Pierna", "Hipertrofia Torso", "Hipertrofia Full", "Prevención", "Movilidad"],
  movilidad: ["Movilidad", "Prevención", "Fuerza Full", "Movilidad", "Prevención"],
  prevencion: ["Prevención", "Movilidad", "Fuerza Full", "Prevención", "Movilidad"],
};

export const OBJECTIVE_MATRIX = {
  fuerza: {
    velocidad: ["Fuerza Inferior", "Velocidad", "Fuerza Superior", "Prevención", "Fuerza Full"],
    resistencia: ["Fuerza Inferior", "Resistencia umbral", "Fuerza Superior", "Resistencia aeróbica", "Movilidad"],
    hipertrofia: ["Fuerza Inferior", "Hipertrofia Pierna", "Fuerza Superior", "Hipertrofia Torso", "Prevención"],
    estetica: ["Fuerza Inferior", "Hipertrofia Pierna", "Fuerza Superior", "Hipertrofia Torso", "Prevención"],
    movilidad: ["Fuerza Inferior", "Movilidad", "Fuerza Superior", "Prevención", "Fuerza Full"],
    prevencion: ["Fuerza Inferior", "Prevención", "Fuerza Superior", "Movilidad", "Fuerza Full"],
  },
  velocidad: {
    fuerza: ["Velocidad", "Fuerza Full", "Prevención", "Fuerza Inferior", "Movilidad"],
    resistencia: ["Velocidad", "Resistencia umbral", "Prevención", "Fuerza Full", "Movilidad"],
    hipertrofia: ["Velocidad", "Hipertrofia Full", "Prevención", "Fuerza Full", "Movilidad"],
    estetica: ["Velocidad", "Hipertrofia Full", "Prevención", "Fuerza Full", "Movilidad"],
    movilidad: ["Velocidad", "Movilidad", "Prevención", "Fuerza Full", "Movilidad"],
    prevencion: ["Velocidad", "Prevención", "Fuerza Full", "Movilidad", "Prevención"],
  },
  resistencia: {
    fuerza: ["Resistencia aeróbica", "Fuerza Full", "Resistencia umbral", "Resistencia anaeróbica", "Movilidad"],
    velocidad: ["Resistencia aeróbica", "Velocidad", "Resistencia umbral", "Fuerza Full", "Prevención"],
    hipertrofia: ["Resistencia aeróbica", "Hipertrofia Full", "Resistencia umbral", "Fuerza Full", "Resistencia anaeróbica"],
    estetica: ["Resistencia aeróbica", "Hipertrofia Full", "Resistencia umbral", "Fuerza Full", "Resistencia anaeróbica"],
    movilidad: ["Resistencia aeróbica", "Movilidad", "Resistencia umbral", "Fuerza Full", "Prevención"],
    prevencion: ["Resistencia aeróbica", "Prevención", "Resistencia umbral", "Fuerza Full", "Movilidad"],
  },
  hipertrofia: {
    fuerza: ["Hipertrofia Pierna", "Fuerza Inferior", "Hipertrofia Torso", "Fuerza Superior", "Hipertrofia Full"],
    velocidad: ["Hipertrofia Pierna", "Velocidad", "Hipertrofia Torso", "Prevención", "Hipertrofia Full"],
    resistencia: ["Hipertrofia Pierna", "Resistencia umbral", "Hipertrofia Torso", "Fuerza Full", "Hipertrofia Full"],
    movilidad: ["Hipertrofia Pierna", "Movilidad", "Hipertrofia Torso", "Prevención", "Hipertrofia Full"],
    prevencion: ["Hipertrofia Pierna", "Prevención", "Hipertrofia Torso", "Movilidad", "Hipertrofia Full"],
  },
  movilidad: {
    fuerza: ["Movilidad", "Fuerza Full", "Prevención", "Fuerza Inferior", "Movilidad"],
    velocidad: ["Movilidad", "Velocidad", "Prevención", "Fuerza Full", "Movilidad"],
    resistencia: ["Movilidad", "Resistencia umbral", "Prevención", "Fuerza Full", "Movilidad"],
    hipertrofia: ["Movilidad", "Hipertrofia Full", "Prevención", "Hipertrofia Pierna", "Movilidad"],
    estetica: ["Movilidad", "Hipertrofia Full", "Prevención", "Hipertrofia Pierna", "Movilidad"],
    prevencion: ["Movilidad", "Prevención", "Fuerza Full", "Movilidad", "Prevención"],
  },
  prevencion: {
    fuerza: ["Prevención", "Fuerza Full", "Movilidad", "Fuerza Inferior", "Prevención"],
    velocidad: ["Prevención", "Velocidad", "Movilidad", "Fuerza Full", "Prevención"],
    resistencia: ["Prevención", "Resistencia aeróbica", "Movilidad", "Fuerza Full", "Prevención"],
    hipertrofia: ["Prevención", "Hipertrofia Full", "Movilidad", "Hipertrofia Pierna", "Prevención"],
    estetica: ["Prevención", "Hipertrofia Full", "Movilidad", "Hipertrofia Pierna", "Prevención"],
    movilidad: ["Prevención", "Movilidad", "Fuerza Full", "Prevención", "Movilidad"],
  },
};

export function getPrimaryOnlySequence(objetivo) {
  const key = normalizeObjectiveKey(objetivo);
  return PRIMARY_ONLY_MATRIX[key] ? [...PRIMARY_ONLY_MATRIX[key]] : null;
}

export { objectiveOfSession };
