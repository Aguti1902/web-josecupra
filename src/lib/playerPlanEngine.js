/**
 * Motor de plan jugador: asignación de días + relleno de plantillas fijas
 */
import { filterExercisesEnriched, buildAIPrompt } from "../data/exercises";
import { getWeeklySessionTypes, getTemplate } from "./planTemplates";

export const DAY_ORDER = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
export const DAY_SHORT = ["L", "M", "X", "J", "V", "S", "D"];

/** Prioridad de día por tipo de sesión (reglas PDF) */
const DAY_PRIORITY = {
  "Resistencia aeróbica": ["Lunes", "Martes"],
  "Resistencia anaeróbica": ["Martes", "Miércoles"],
  "Resistencia umbral": ["Miércoles", "Jueves"],
  "Fuerza A": ["Miércoles", "Jueves"],
  "Fuerza B": ["Jueves", "Viernes"],
  Velocidad: ["Viernes", "Sábado"],
  Hipertrofia: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
  Prevención: ["Lunes", "Martes", "Domingo"],
  Movilidad: ["Domingo", "Lunes"],
};

const HARD_TYPES = new Set(["Fuerza A", "Fuerza B", "Velocidad", "Resistencia anaeróbica", "Resistencia umbral"]);

function normalizeMaterial(material) {
  return (material || "sin_material")
    .toLowerCase()
    .replace(/\s|\//g, "_")
    .replace("barra_gimnasio", "barra")
    .replace("sin_material", "sin_material");
}

function normalizeLesions(lesion, lesionSubtipo) {
  const base = (lesion || []).map((l) => l.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
  const sub = (lesionSubtipo || []).map((l) => l.toLowerCase());
  return [...new Set([...base, ...sub])].filter((l) => l && l !== "ninguna");
}

/** Asigna cada sesión a un día disponible evitando dos sesiones duras seguidas */
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

function makeExercise(ex, ei, blockType, blockTags) {
  const isIso = ex.etiquetas?.includes("isometrico");
  return {
    id: `${ex.id}_${ei}`,
    name: ex.nombre,
    duration: blockType === "calentamiento" ? "8–10 min" : blockType === "vuelta_calma" ? "5 min" : "40\"",
    sets: blockType === "principal" ? 4 : 3,
    reps: isIso ? "25–30\"" : blockTags.includes("resistencia") ? "30–45\"" : "10–12",
    description: `Ejercicio de ${(ex.etiquetas || []).slice(0, 2).join(" y ").replace(/_/g, " ")}.`,
    tips: [
      "Mantén la postura durante toda la serie",
      "Controla el movimiento en ambas fases",
      "Respira con normalidad",
    ],
    errorsToAvoid: ex.contraindicado?.length
      ? `Evita si tienes: ${ex.contraindicado.join(", ")}`
      : "No sacrifiques la técnica por añadir carga.",
    videoUrl: "",
  };
}

function fillTemplate(sessionType, filterParams, usedIds) {
  const template = getTemplate(sessionType);
  let globalIdx = 0;

  const blocks = template.blocks.map((slot) => {
    const pool = filterExercisesEnriched({
      ...filterParams,
      etiquetas: slot.tags,
    }).filter((ex) => !usedIds.has(ex.id));

    const picked = pool.slice(0, slot.slots);
    picked.forEach((ex) => usedIds.add(ex.id));

    return {
      type: slot.type,
      label: slot.label,
      duration: slot.duration,
      exercises: picked.map((ex, i) => makeExercise(ex, globalIdx + i, slot.type, slot.tags)),
    };
  });

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

/** Construye plan semanal completo (7 días, sesiones en días asignados) */
export function buildPlayerPlan(user) {
  const frecuencia = user?.frecuencia || "3";
  const material = normalizeMaterial(user?.material);
  const lesiones = normalizeLesions(user?.lesion, user?.lesionSubtipo);
  const edad = parseInt(user?.edad) || 20;
  const deporte = user?.deporte || "";
  const objetivo = user?.objetivo || "Fuerza";
  const availableDays = user?.disponibles?.length ? user.disponibles : null;

  const sessionTypes = getWeeklySessionTypes(objetivo, frecuencia);
  const assignments = assignTrainingDays(sessionTypes, availableDays);
  const filterParams = { material, lesiones, edad, deporte };
  const usedIds = new Set();

  const dayMap = {};
  assignments.forEach(({ sessionType, day }, i) => {
    const session = fillTemplate(sessionType, filterParams, usedIds);
    session.id = `gen_${day}_${i}`;
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

/** Prompt IA listo para enviar al backend */
export function buildPlanAIPayload(user) {
  const frecuencia = user?.frecuencia || "3";
  const sessionTypes = getWeeklySessionTypes(user?.objetivo, frecuencia);
  const material = normalizeMaterial(user?.material);
  const lesiones = normalizeLesions(user?.lesion, user?.lesionSubtipo);
  const allEx = filterExercisesEnriched({
    material,
    lesiones,
    edad: parseInt(user?.edad) || 20,
    deporte: user?.deporte || "",
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
    const weekPlan = buildPlayerPlan({ ...user, _weekVariant: w });
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
