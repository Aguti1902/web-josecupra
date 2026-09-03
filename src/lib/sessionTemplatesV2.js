/**
 * DEPRO — Plantillas de sesión con slots etiquetados (multi-eje AND).
 * Keys públicas = nombres de sesión; templateCode = F_* del prompt.
 */

/** Naturaleza de selección: básicos/fuerza máx = multiarticulares; complementarios = analíticos. */
function inferSlotNature(c = {}) {
  const obj = (Array.isArray(c.objetivo) ? c.objetivo : [c.objetivo].filter(Boolean))
    .map((o) => String(o).toLowerCase());
  const patron = String(c.patron || "");
  if (patron === "analitico") return "analitico";
  if (["pliometria", "isometrico", "aceleracion", "aerobico", "umbral", "anaerobico"].includes(patron)) {
    return null;
  }
  if (obj.some((o) => ["resistencia", "velocidad", "prevencion", "movilidad"].includes(o))) {
    return null;
  }
  if (c.rol === "basico") return "multiarticular";
  if (c.rol === "complementario") return "analitico";
  return null;
}

function slot(constraints) {
  const next = { qty: 1, ...constraints };
  if (!next.nature) {
    const inferred = inferSlotNature(next);
    if (inferred) next.nature = inferred;
  }
  return next;
}

function block(type, label, duration, slots, extra = {}) {
  return { type, label, duration, slots, ...extra };
}

/** Calentamiento del jugador: un vídeo aleatorio de plantillas sin balón. */
const CALENTAMIENTO_SIN_BALON = block(
  "calentamiento",
  "Calentamiento",
  "5-6 min",
  [slot({ rol: "calentamiento", objetivo: "movilidad", description: "Calentamiento sin balón", slotId: "warm_sin_balon" })],
  { warmupSource: "sin_balon" },
);
const CALENTAMIENTO_SUP = CALENTAMIENTO_SIN_BALON;
const CALENTAMIENTO_INF = CALENTAMIENTO_SIN_BALON;
const CALENTAMIENTO_FULL = CALENTAMIENTO_SIN_BALON;
const CALENTAMIENTO_CORTO = CALENTAMIENTO_SIN_BALON;

const CORE = block("core", "Core", "6 min", [
  slot({
    rol: "core",
    patronOr: ["isometrico", "anti_rotacion", "anti_extension", "anti_flexion"],
    description: "Core / control",
    slotId: "core",
  }),
]);

/** Bloque isométrico corto delante de pliometría. */
const ISOMETRICOS_PRE = block("complementario", "Isométricos", "8 min", [
  slot({ rol: "complementario", patron: "isometrico", description: "Iso 1", slotId: "iso_pre_1" }),
  slot({ rol: "complementario", patron: "isometrico", description: "Iso 2", slotId: "iso_pre_2" }),
]);

export const SESSION_TEMPLATES = {
  "Fuerza Inferior": {
    templateCode: "F_FUERZA_INF",
    title: "Fuerza — Tren inferior",
    duration: "55-65 min",
    intensityLevel: "alta",
    objective: "fuerza",
    muscleGroup: "lower",
    blocks: [
      CALENTAMIENTO_INF,
      block("principal", "Básicos", "25 min", [
        slot({ rol: "basico", objetivo: "fuerza", segmento: "tren_inferior", patron: "cadena_anterior", description: "Básico cadena anterior", slotId: "fi_b1" }),
        slot({ rol: "basico", objetivo: "fuerza", segmento: "tren_inferior", patron: "cadena_posterior", description: "Básico cadena posterior", slotId: "fi_b2" }),
      ]),
      block("complementario", "Complementarios", "15 min", [
        slot({ rol: "complementario", objetivo: "fuerza", patron: "pliometria", description: "Pliometría 1", slotId: "fi_c1" }),
        slot({ rol: "complementario", objetivo: ["fuerza", "pliometria"], patron: "pliometria", description: "Pliometría 2", slotId: "fi_c2" }),
      ]),
      CORE,
    ],
  },

  "Fuerza Superior": {
    templateCode: "F_FUERZA_SUP",
    title: "Fuerza — Tren superior",
    duration: "50-60 min",
    intensityLevel: "alta",
    objective: "fuerza",
    muscleGroup: "upper",
    blocks: [
      CALENTAMIENTO_SUP,
      block("principal", "Básicos", "25 min", [
        slot({ rol: "basico", objetivo: "fuerza", segmento: "tren_superior", patron: "empuje", description: "Básico empuje", slotId: "fs_b1" }),
        slot({ rol: "basico", objetivo: "fuerza", segmento: "tren_superior", patron: "traccion", description: "Básico tracción", slotId: "fs_b2" }),
      ]),
      block("complementario", "Complementarios", "12 min", [
        slot({ rol: "complementario", patron: "analitico", grupo_muscular: "biceps", description: "Bíceps", slotId: "fs_c1" }),
        slot({ rol: "complementario", patron: "analitico", grupo_muscular: "triceps", description: "Tríceps", slotId: "fs_c2" }),
      ]),
      CORE,
    ],
  },

  "Fuerza Full": {
    templateCode: "F_FUERZA_FULL",
    title: "Fuerza — Full body",
    duration: "60-75 min",
    intensityLevel: "alta",
    objective: "fuerza",
    muscleGroup: "full",
    blocks: [
      CALENTAMIENTO_FULL,
      block("principal", "Básicos", "35 min", [
        slot({ rol: "basico", objetivo: "fuerza", segmento: "tren_superior", patron: "empuje", description: "Empuje", slotId: "ff_b1" }),
        slot({ rol: "basico", objetivo: "fuerza", segmento: "tren_superior", patron: "traccion", description: "Tracción", slotId: "ff_b2" }),
        slot({ rol: "basico", objetivo: "fuerza", segmento: "tren_inferior", patron: "cadena_anterior", description: "Cadena anterior", slotId: "ff_b3" }),
        slot({ rol: "basico", objetivo: "fuerza", segmento: "tren_inferior", patron: "cadena_posterior", description: "Cadena posterior", slotId: "ff_b4" }),
      ]),
      block("complementario", "Complementarios", "12 min", [
        slot({ rol: "complementario", patron: "analitico", grupo_muscular: "biceps", description: "Bíceps", slotId: "ff_c1" }),
        slot({ rol: "complementario", patron: "analitico", grupo_muscular: "triceps", description: "Tríceps", slotId: "ff_c2" }),
      ]),
      CORE,
    ],
  },

  Velocidad: {
    templateCode: "F_VELOCIDAD",
    title: "Velocidad",
    duration: "50-60 min",
    intensityLevel: "alta",
    objective: "velocidad",
    muscleGroup: null,
    blocks: [
      CALENTAMIENTO_SIN_BALON,
      block("principal", "Fuerza máxima", "12 min", [
        slot({ rol: "basico", objetivo: "fuerza", segmento: "tren_inferior", patron: "cadena_anterior", description: "Fuerza máx. anterior", slotId: "vel_fm1" }),
        slot({ rol: "basico", objetivo: "fuerza", segmento: "tren_inferior", patron: "cadena_posterior", description: "Fuerza máx. posterior", slotId: "vel_fm2" }),
      ]),
      ISOMETRICOS_PRE,
      block("complementario", "Pliometría", "10 min", [
        slot({ rol: "complementario", patron: "pliometria", segmento: "tren_inferior", carpeta: "pliometria", description: "Pliometría 1", slotId: "vel_p1" }),
        slot({ rol: "complementario", patron: "pliometria", segmento: "tren_inferior", carpeta: "pliometria", description: "Pliometría 2", slotId: "vel_p2" }),
      ]),
      block("principal", "Velocidad", "15 min", [
        slot({ rol: "basico", objetivo: "velocidad", patron: "aceleracion", segmento: "tren_inferior", carpeta: "velocidad", description: "Aceleración", slotId: "vel_v1" }),
        slot({ rol: "basico", objetivo: "velocidad", patron: "velocidad_pura", segmento: "tren_inferior", carpeta: "velocidad", description: "Velocidad pura", slotId: "vel_v2" }),
        slot({ rol: "complementario", objetivo: "velocidad", patronOr: ["reaccion", "COD"], segmento: "tren_inferior", carpeta: "velocidad", description: "Reacción / COD", slotId: "vel_v3" }),
      ]),
    ],
  },

  "Hipertrofia Full": {
    templateCode: "F_HIP_FULL",
    title: "Hipertrofia — Full body",
    duration: "60-75 min",
    intensityLevel: "alta",
    objective: "hipertrofia",
    muscleGroup: "full",
    blocks: [
      CALENTAMIENTO_FULL,
      block("principal", "Básicos", "35 min", [
        slot({ rol: "basico", objetivo: "fuerza", segmento: "tren_superior", patron: "empuje", description: "Empuje", slotId: "hf_b1" }),
        slot({ rol: "basico", objetivo: "fuerza", segmento: "tren_superior", patron: "traccion", description: "Tracción", slotId: "hf_b2" }),
        slot({ rol: "basico", objetivo: "fuerza", segmento: "tren_inferior", patron: "cadena_anterior", description: "Cadena anterior", slotId: "hf_b3" }),
        slot({ rol: "basico", objetivo: "fuerza", segmento: "tren_inferior", patron: "cadena_posterior", description: "Cadena posterior", slotId: "hf_b4" }),
      ]),
      block("complementario", "Complementarios", "12 min", [
        slot({ rol: "complementario", patron: "analitico", grupo_muscular: "biceps", description: "Bíceps", slotId: "hf_c1" }),
        slot({ rol: "complementario", patron: "analitico", grupo_muscular: "triceps", description: "Tríceps", slotId: "hf_c2" }),
      ]),
      CORE,
    ],
  },

  "Hipertrofia Pierna": {
    templateCode: "F_HIP_PIERNA",
    title: "Hipertrofia — Pierna",
    duration: "55-70 min",
    intensityLevel: "alta",
    objective: "hipertrofia",
    muscleGroup: "lower",
    blocks: [
      CALENTAMIENTO_INF,
      block("principal", "Básicos", "25 min", [
        slot({ rol: "basico", objetivo: "fuerza", segmento: "tren_inferior", patron: "cadena_anterior", description: "Cadena anterior", slotId: "hp_b1" }),
        slot({ rol: "basico", objetivo: "fuerza", segmento: "tren_inferior", patron: "cadena_posterior", description: "Cadena posterior", slotId: "hp_b2" }),
      ]),
      block("complementario", "Analíticos", "18 min", [
        slot({ rol: "complementario", patron: "analitico", grupo_muscular: "cuadriceps", description: "Cuádriceps", slotId: "hp_c1" }),
        slot({ rol: "complementario", patron: "analitico", grupo_muscular: "isquios", description: "Isquios", slotId: "hp_c2" }),
        slot({ rol: "complementario", patron: "analitico", grupo_muscular: "gemelo", description: "Gemelo", slotId: "hp_c3" }),
      ]),
      CORE,
    ],
  },

  "Hipertrofia Torso": {
    templateCode: "F_HIP_TORSO",
    title: "Hipertrofia — Torso",
    duration: "55-70 min",
    intensityLevel: "alta",
    objective: "hipertrofia",
    muscleGroup: "upper",
    blocks: [
      CALENTAMIENTO_SUP,
      block("principal", "Básicos", "25 min", [
        slot({ rol: "basico", objetivo: "fuerza", segmento: "tren_superior", patron: "empuje", description: "Empuje", slotId: "ht_b1" }),
        slot({ rol: "basico", objetivo: "fuerza", segmento: "tren_superior", patron: "traccion", description: "Tracción", slotId: "ht_b2" }),
      ]),
      block("complementario", "Analíticos", "12 min", [
        slot({ rol: "complementario", patron: "analitico", grupo_muscular: "biceps", description: "Bíceps", slotId: "ht_c1" }),
        slot({ rol: "complementario", patron: "analitico", grupo_muscular: ["triceps"], description: "Tríceps analítico", slotId: "ht_c2" }),
      ]),
      CORE,
    ],
  },

  Prevención: {
    templateCode: "F_PREVENCION",
    title: "Prevención",
    duration: "35-45 min",
    intensityLevel: "baja",
    objective: "prevencion",
    muscleGroup: null,
    blocks: [
      CALENTAMIENTO_CORTO,
      block("complementario", "Estabilidad", "12 min", [
        slot({ rol: "complementario", objetivo: "prevencion", patron: "isometrico", description: "Estabilidad", slotId: "pr_e" }),
      ]),
      block("complementario", "Compensatorio", "10 min", [
        slot({ rol: "complementario", objetivo: "prevencion", description: "Compensatorio deporte", slotId: "pr_c" }),
      ]),
      CORE,
    ],
  },

  Movilidad: {
    templateCode: "F_MOVILIDAD",
    title: "Movilidad",
    duration: "30-40 min",
    intensityLevel: "baja",
    objective: "movilidad",
    muscleGroup: null,
    blocks: [
      CALENTAMIENTO_CORTO,
      block("principal", "Movilidad articular", "12 min", [
        slot({ rol: "calentamiento", objetivo: "movilidad", grupo_muscular: ["tobillo", "cadera", "hombro_completo"], description: "Articular", slotId: "mo_a" }),
      ]),
      block("complementario", "Control motor", "8 min", [
        slot({ rol: "complementario", objetivo: "prevencion", patron: "isometrico", description: "Control motor", slotId: "mo_c" }),
      ]),
    ],
  },

  "Resistencia aeróbica": {
    templateCode: "F_RES_AER",
    title: "Resistencia aeróbica",
    duration: "30-40 min",
    intensityLevel: "baja",
    objective: "resistencia",
    resistanceKind: "aerobico",
    variants: {
      AER_1: { label: "3×10 min al 65% BAM", description: "Puedo hablar mientras corro. Pausa 1 min caminando." },
      AER_2: { label: "2×20 min al 65% BAM", description: "Puedo hablar mientras corro. Pausa 2 min caminando." },
      AER_3: { label: "30 min continuos al 70% BAM", description: "Ritmo cómodo constante." },
    },
    blocks: [
      CALENTAMIENTO_CORTO,
      CORE,
      block("principal", "Trabajo aeróbico", "25 min", [
        slot({ rol: "basico", objetivo: "resistencia", patron: "aerobico", description: "Aeróbico", slotId: "ra_p" }),
      ]),
    ],
  },

  "Resistencia umbral": {
    templateCode: "F_RES_UMBRAL",
    title: "Resistencia umbral",
    duration: "45-55 min",
    intensityLevel: "media",
    objective: "resistencia",
    resistanceKind: "umbral",
    variants: {
      UMB_1: { label: "3×6 min umbral", description: "Pausa 90s. Apenas puedo mantener una conversación." },
      UMB_2: { label: "2×10 min umbral", description: "Pausa 2 min trote suave." },
      UMB_3: { label: "4×4 min umbral", description: "Pausa 90s. Bloques cortos." },
    },
    blocks: [
      CALENTAMIENTO_CORTO,
      CORE,
      block("principal", "Umbral", "28 min", [
        slot({ rol: "basico", objetivo: "resistencia", patron: "umbral", description: "Umbral", slotId: "ru_p" }),
      ]),
    ],
  },

  "Resistencia anaeróbica": {
    templateCode: "F_RES_ANAER",
    title: "Resistencia anaeróbica",
    duration: "40-50 min",
    intensityLevel: "alta",
    objective: "resistencia",
    resistanceKind: "anaerobico",
    variants: {
      ANA_1: { label: "30/30", description: "30s sprint / 30s descanso, 8-10 series." },
      ANA_2: { label: "20/20", description: "20s sprint / 20s descanso, 10-12 series." },
      ANA_3: { label: "Series 200 m", description: "6-8 reps máx, descanso 1:3." },
    },
    blocks: [
      CALENTAMIENTO_CORTO,
      CORE,
      block("principal", "Anaeróbico", "25 min", [
        slot({ rol: "basico", objetivo: "resistencia", patron: "anaerobico", description: "Anaeróbico", slotId: "rn_p" }),
      ]),
    ],
  },

  // Aliases legacy → mismas plantillas nuevas
  "Fuerza A": null,
  "Fuerza B": null,
  "Fuerza Superior A": null,
  "Fuerza Superior B": null,
  "Full Body": null,
  "Hipertrofia Push": null,
  "Hipertrofia Pull": null,
  Pliometría: null,
  Isométricos: null,
};

// Resolver aliases
SESSION_TEMPLATES["Fuerza A"] = { ...SESSION_TEMPLATES["Fuerza Inferior"], title: "Fuerza A - Tren Inferior" };
SESSION_TEMPLATES["Fuerza B"] = { ...SESSION_TEMPLATES["Fuerza Superior"], title: "Fuerza B - Tren Superior", intensityLevel: "alta" };
SESSION_TEMPLATES["Fuerza Superior A"] = { ...SESSION_TEMPLATES["Fuerza Superior"], title: "Fuerza Superior A" };
SESSION_TEMPLATES["Fuerza Superior B"] = { ...SESSION_TEMPLATES["Fuerza Superior"], title: "Fuerza Superior B" };
SESSION_TEMPLATES["Full Body"] = { ...SESSION_TEMPLATES["Fuerza Full"], title: "Full Body" };
SESSION_TEMPLATES["Hipertrofia Push"] = { ...SESSION_TEMPLATES["Hipertrofia Torso"], title: "Hipertrofia Push" };
SESSION_TEMPLATES["Hipertrofia Pull"] = { ...SESSION_TEMPLATES["Hipertrofia Torso"], title: "Hipertrofia Pull" };
SESSION_TEMPLATES.Pliometría = {
  ...SESSION_TEMPLATES.Prevención,
  title: "Pliometría",
  intensityLevel: "alta",
  templateCode: "F_PLIO",
  blocks: [
    CALENTAMIENTO_CORTO,
    ISOMETRICOS_PRE,
    block("complementario", "Pliometría", "20 min", [
      slot({ rol: "complementario", patron: "pliometria", description: "Pliometría 1", slotId: "pl_1" }),
      slot({ rol: "complementario", patron: "pliometria", description: "Pliometría 2", slotId: "pl_2" }),
      slot({ rol: "complementario", patron: "pliometria", description: "Pliometría 3", slotId: "pl_3" }),
    ]),
  ],
};
SESSION_TEMPLATES.Isométricos = {
  title: "Isométricos",
  duration: "35-45 min",
  intensityLevel: "baja",
  objective: "fuerza",
  templateCode: "F_ISO",
  blocks: [
    CALENTAMIENTO_CORTO,
    block("complementario", "Isométricos", "20 min", [
      slot({ rol: "complementario", patron: "isometrico", description: "Iso 1", slotId: "iso_1" }),
      slot({ rol: "complementario", patron: "isometrico", description: "Iso 2", slotId: "iso_2" }),
      slot({ rol: "complementario", patron: "isometrico", description: "Iso 3", slotId: "iso_3" }),
    ]),
    CORE,
  ],
};

export const TEMPLATE_CODE_TO_KEY = Object.fromEntries(
  Object.entries(SESSION_TEMPLATES)
    .filter(([, t]) => t?.templateCode)
    .map(([k, t]) => [t.templateCode, k]),
);

export const WEEKLY_SESSION_CONFIG = {
  // Compatibilidad con callers antiguos; la matriz viva está en objectiveSessionMatrix.js
  fuerza: { 1: ["Fuerza Full"], 2: ["Fuerza Inferior", "Fuerza Superior"], 3: ["Fuerza Inferior", "Fuerza Superior", "Fuerza Full"] },
  velocidad: { 1: ["Velocidad"], 2: ["Velocidad", "Velocidad"], 3: ["Velocidad", "Prevención", "Fuerza Full"] },
};

export function isV2Template(template) {
  if (!template?.blocks?.length) return false;
  const firstSlot = template.blocks[0]?.slots;
  if (!Array.isArray(firstSlot)) return false;
  if (typeof firstSlot[0] === "number") return false;
  return firstSlot.length === 0 || typeof firstSlot[0] === "object";
}

export function getResistanceVariantKey(sessionType, weekNumber = 1) {
  const template = SESSION_TEMPLATES[sessionType];
  if (!template?.variants) return null;
  const keys = Object.keys(template.variants);
  const idx = ((weekNumber - 1) % keys.length + keys.length) % keys.length;
  return keys[idx];
}

export default SESSION_TEMPLATES;
