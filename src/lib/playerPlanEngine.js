/**
 * Motor de plan jugador: asignación de días + relleno de plantillas fijas
 */
import { filterExercisesEnriched, buildAIPrompt } from "../data/exercises";
import { getWeeklySessionTypes, getTemplate } from "./planTemplates";

export const DAY_ORDER = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
export const DAY_SHORT = ["L", "M", "X", "J", "V", "S", "D"];

const DAY_PRIORITY = {
  "Resistencia aeróbica": ["Lunes", "Martes"],
  "Resistencia anaeróbica": ["Martes", "Miércoles"],
  "Resistencia umbral": ["Miércoles", "Jueves"],
  "Fuerza A": ["Miércoles", "Jueves"],
  "Fuerza B": ["Jueves", "Viernes"],
  Velocidad: ["Viernes", "Sábado"],
  Hipertrofia: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
  "Hipertrofia Anterior": ["Lunes", "Martes"],
  "Hipertrofia Posterior": ["Miércoles", "Jueves"],
  "Hipertrofia Push": ["Lunes", "Martes"],
  "Hipertrofia Pull": ["Miércoles", "Jueves"],
  "Hipertrofia Pierna": ["Viernes", "Sábado"],
  Prevención: ["Lunes", "Martes", "Domingo"],
  Movilidad: ["Domingo", "Lunes"],
  "Sesión mínima": ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
};

const HARD_TYPES = new Set([
  "Fuerza A", "Fuerza B", "Velocidad",
  "Resistencia anaeróbica", "Resistencia umbral",
  "Hipertrofia Push", "Hipertrofia Pull", "Hipertrofia Pierna",
]);

const SUBTIPO_TO_AREA = {
  acl: "rodilla", menisco: "rodilla", rotuliana: "rodilla",
  esguince: "tobillo", inestabilidad: "tobillo",
  manguito: "hombro", inestabilidad_h: "hombro",
  lumbar: "espalda", dorsal: "espalda",
  pubis: "pubalgia", aductor: "pubalgia",
};

const LESION_FOLDER_TAGS = {
  rodilla: "lesion_rodilla",
  tobillo: "lesion_tobillo",
  hombro: "lesion_hombro",
  espalda: "lesion_espalda",
  pubalgia: "lesion_pubalgia",
};

function normalizeMaterial(material) {
  return (material || "sin_material")
    .toLowerCase()
    .replace(/\s|\//g, "_")
    .replace("barra_gimnasio", "barra")
    .replace("sin_material", "sin_material");
}

export function normalizeLesions(lesion, lesionSubtipo) {
  const base = (lesion || []).map((l) =>
    l.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  );
  const subAreas = (lesionSubtipo || []).map((s) => SUBTIPO_TO_AREA[s.toLowerCase()] || s.toLowerCase());
  return [...new Set([...base, ...subAreas])].filter((l) => l && l !== "ninguna");
}

function experienciaLevel(experiencia) {
  const e = (experiencia || "").toLowerCase();
  if (e.includes("nunca") || e.includes("<6")) return "novato";
  if (e.includes("6-12") || e.includes("6–12")) return "intermedio";
  return "avanzado";
}

function pickExercises(pool, count, usedIds, weekOffset = 0) {
  const available = pool.filter((ex) => !usedIds.has(ex.id));
  const start = (weekOffset * count) % Math.max(available.length, 1);
  const picked = [];
  for (let i = 0; i < count && available.length; i++) {
    const ex = available[(start + i) % available.length];
    if (!picked.find((p) => p.id === ex.id)) {
      picked.push(ex);
      usedIds.add(ex.id);
    }
  }
  return picked;
}

function injectLesionExercises(pool, lesiones, count) {
  const tags = lesiones.map((l) => LESION_FOLDER_TAGS[l]).filter(Boolean);
  if (!tags.length) return [];
  return pool.filter((ex) =>
    tags.some((t) => ex.etiquetas?.includes(t)) &&
    !lesiones.some((l) => ex.contraindicado?.includes(l))
  ).slice(0, count);
}

function makeExercise(ex, ei, blockType, blockTags) {
  const isIso = ex.etiquetas?.includes("isometrico");
  const tipsRaw = ex.tips;
  const tips = Array.isArray(tipsRaw)
    ? tipsRaw
    : tipsRaw
      ? String(tipsRaw).split("\n").filter(Boolean)
      : [
          "Mantén la postura durante toda la serie",
          "Controla el movimiento en ambas fases",
          "Respira con normalidad",
        ];
  return {
    id: `${ex.id}_${ei}`,
    name: ex.nombre,
    duration: ex.duration || (blockType === "calentamiento" ? "8–10 min" : blockType === "vuelta_calma" ? "5 min" : "40\""),
    sets: blockType === "principal" ? 4 : 3,
    reps: isIso ? "25–30\"" : blockTags.includes("resistencia") ? "30–45\"" : "10–12",
    description: ex.description || `Ejercicio de ${(ex.etiquetas || []).slice(0, 2).join(" y ").replace(/_/g, " ")}.`,
    tips,
    errorsToAvoid: ex.contraindicado?.length
      ? `Evita si tienes: ${ex.contraindicado.join(", ")}`
      : "No sacrifiques la técnica por añadir carga.",
    videoUrl: ex.videoUrl || "",
  };
}

function fillTemplate(sessionType, filterParams, usedIds, weekOffset = 0) {
  const template = getTemplate(sessionType);
  let globalIdx = 0;
  const lesiones = filterParams.lesiones || [];

  const blocks = template.blocks.map((slot) => {
    let pool = filterExercisesEnriched({
      ...filterParams,
      etiquetas: slot.tags,
    }).filter((ex) => !usedIds.has(ex.id));

    const lesionRec = injectLesionExercises(pool, lesiones, Math.min(2, slot.slots));
    lesionRec.forEach((ex) => usedIds.add(ex.id));

    const remaining = slot.slots - lesionRec.length;
    const picked = pickExercises(pool, remaining, usedIds, weekOffset);
    const allPicked = [...lesionRec, ...picked];

    return {
      type: slot.type,
      label: slot.label,
      duration: slot.duration,
      exercises: allPicked.map((ex, i) => makeExercise(ex, globalIdx + i, slot.type, slot.tags)),
    };
  });

  globalIdx += blocks.reduce((n, b) => n + b.exercises.length, 0);

  return {
    type: sessionType,
    title: sessionType,
    objective: `Sesión ${sessionType} según tu plan personalizado DEPRO.`,
    duration: template.duration,
    intensity: template.intensity,
    status: "pending",
    blocks,
    exercises: blocks.flatMap((b) => b.exercises),
  };
}

export function assignTrainingDays(sessionTypes, availableDays) {
  const pool = (availableDays?.length ? availableDays : DAY_ORDER.slice(0, 5)).filter((d) =>
    DAY_ORDER.includes(d)
  );
  const sortedPool = [...pool].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));
  const used = new Set();
  const assignments = [];

  for (const sessionType of sessionTypes) {
    const prefs = DAY_PRIORITY[sessionType] || sortedPool;
    let chosen = null;

    for (const day of prefs) {
      if (!sortedPool.includes(day) || used.has(day)) continue;
      const prevIdx = assignments.length - 1;
      if (prevIdx >= 0 && HARD_TYPES.has(sessionTypes[prevIdx]) && HARD_TYPES.has(sessionType)) {
        const prevDay = assignments[prevIdx].day;
        if (DAY_ORDER.indexOf(day) - DAY_ORDER.indexOf(prevDay) === 1) continue;
      }
      chosen = day;
      break;
    }

    if (!chosen) {
      chosen = sortedPool.find((d) => !used.has(d)) || sortedPool[assignments.length % sortedPool.length];
    }
    used.add(chosen);
    assignments.push({ sessionType, day: chosen });
  }

  return assignments;
}

export function buildPlayerPlan(user, options = {}) {
  const { weekOffset = 0, sessionTypesOverride = null } = options;
  const frecuencia = user?.frecuencia || "3";
  const material = normalizeMaterial(user?.material);
  const lesiones = normalizeLesions(user?.lesion, user?.lesionSubtipo);
  const edad = parseInt(user?.edad) || 20;
  const deporte = user?.deporte || "";
  const objetivo = user?.objetivo || "Fuerza";
  const availableDays = user?.disponibles?.length ? user.disponibles : null;
  const expLevel = experienciaLevel(user?.experiencia);

  const sessionTypes = sessionTypesOverride || getWeeklySessionTypes(objetivo, frecuencia);
  const assignments = assignTrainingDays(sessionTypes, availableDays);
  const filterParams = { material, lesiones, edad, deporte, experiencia: expLevel };
  const usedIds = new Set();

  const dayMap = {};
  assignments.forEach(({ sessionType, day }, i) => {
    const session = fillTemplate(sessionType, filterParams, usedIds, weekOffset + i);
    session.id = `gen_${day}_${weekOffset}_${i}`;
    session.sessionNumber = i + 1;
    dayMap[day] = session;
  });

  const todayName = DAY_ORDER[(new Date().getDay() + 6) % 7];

  return DAY_ORDER.map((nombre, i) => {
    const session = dayMap[nombre];
    if (!session) {
      return { day: nombre, shortDay: DAY_SHORT[i], date: nombre, sessions: [] };
    }
    const isToday = nombre === todayName;
    return {
      day: nombre,
      shortDay: DAY_SHORT[i],
      date: nombre,
      sessions: [{
        ...session,
        status: session.status === "completed" ? "completed" : isToday ? "today" : "pending",
      }],
    };
  });
}

export function buildMinimalSession(user) {
  const material = normalizeMaterial(user?.material);
  const lesiones = normalizeLesions(user?.lesion, user?.lesionSubtipo);
  const usedIds = new Set();
  return fillTemplate("Sesión mínima", {
    material, lesiones,
    edad: parseInt(user?.edad) || 20,
    deporte: user?.deporte || "",
    experiencia: experienciaLevel(user?.experiencia),
  }, usedIds);
}

export function ensurePlayerPlan(user) {
  if (!user?.id) return null;
  const planKey = `depro_plan_${user.id}`;
  try {
    const existing = localStorage.getItem(planKey);
    if (existing) return JSON.parse(existing);
  } catch { /* ignore */ }
  const plan = buildPlayerPlan(user);
  localStorage.setItem(planKey, JSON.stringify(plan));
  return plan;
}

export function buildPlanAIPayload(user) {
  const frecuencia = user?.frecuencia || "3";
  const sessionTypes = getWeeklySessionTypes(user?.objetivo, frecuencia);
  const material = normalizeMaterial(user?.material);
  const lesiones = normalizeLesions(user?.lesion, user?.lesionSubtipo);
  const allEx = filterExercisesEnriched({
    material, lesiones,
    edad: parseInt(user?.edad) || 20,
    deporte: user?.deporte || "",
    experiencia: experienciaLevel(user?.experiencia),
    etiquetas: [],
  });

  return sessionTypes.map((st) =>
    buildAIPrompt({
      edad: user?.edad,
      objetivo: user?.objetivo,
      deporte: user?.deporte,
      frecuencia: user?.frecuencia,
      material: user?.material,
      lesion: user?.lesion,
      exercises: allEx.slice(0, 40),
      plantilla: getTemplate(st).blocks.map((b) => `${b.label}: ${b.slots} ej.`).join("; "),
    })
  );
}

export function buildMesoPlayerPlan(user, weeks = 3) {
  const result = [];
  let counter = 0;
  for (let w = 0; w < weeks; w++) {
    const weekPlan = buildPlayerPlan(user, { weekOffset: w });
    const sessions = weekPlan
      .filter((d) => d.sessions.length)
      .map((d) => ({
        ...d.sessions[0],
        id: `meso_w${w}_${d.sessions[0].id}`,
        title: `Sesión ${++counter}`,
        sessionNumber: counter,
        dayName: d.day,
        templateVariant: ["A1", "A2", "B1"][w % 3],
      }));
    result.push({ week: w + 1, label: `Semana ${w + 1}`, sessions });
  }
  return result;
}
