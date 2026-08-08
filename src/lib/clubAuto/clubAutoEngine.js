/**
 * Motor automático clubs/entrenadores — rama aislada.
 * NO importa ni modifica playerPlanEngine.
 */
import { getProtocolTemplate, PROTOCOL_DAY_META } from "./clubAutoTemplates.js";
import { selectProtocolExercises } from "./clubAutoProtocolSelector.js";
import { selectGeneralWarmup, selectBallWarmup, selectMainTask } from "./clubAutoTaskSelector.js";
import { CLUB_AUTO_OBSERVACIONES } from "../../data/clubAutoCatalog.js";

export const DAY_ORDER = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
export const TRAIN_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

const MATCH_DAY_MAP = {
  sabado: "Sábado",
  sábado: "Sábado",
  domingo: "Domingo",
  entre_semana: "Miércoles",
  "entre semana": "Miércoles",
  no_compite: "Sábado", // sin partido: ancla semanal neutra
};

export function normalizeNivel(nivel) {
  const n = String(nivel || "B").toUpperCase();
  if (n === "A" || n === "B" || n === "C") return n;
  // mapear edades textuales
  if (/9|10|11|12/.test(n)) return "A";
  if (/13|14|15/.test(n)) return "B";
  return "C";
}

export function normalizeMatchDay(diaPartido) {
  const raw = String(diaPartido || "sabado").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (raw.includes("no_compite") || raw.includes("no compite") || raw === "none") return "Sábado";
  if (raw.includes("domingo")) return "Domingo";
  if (raw.includes("entre")) return "Miércoles";
  return MATCH_DAY_MAP[raw] || "Sábado";
}

export function normalizeTrainDays(dias = []) {
  const map = {
    lunes: "Lunes", martes: "Martes", miercoles: "Miércoles", miércoles: "Miércoles",
    jueves: "Jueves", viernes: "Viernes",
  };
  return [...new Set(
    (dias || []).map((d) => {
      if (DAY_ORDER.includes(d)) return d;
      const key = String(d).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return map[key] || null;
    }).filter(Boolean),
  )].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));
}

/**
 * Validación del cuestionario entrenador.
 */
export function validateCoachQuestionnaire(q = {}) {
  const errors = [];
  const nivel = normalizeNivel(q.nivel);
  const n = Number(q.dias_entrenamiento_semana || q.trainingsPerWeek);
  const days = normalizeTrainDays(q.dias_exactos_entrenamiento || q.trainingDays || []);
  const matchDay = normalizeMatchDay(q.dia_partido || q.matchDay);
  const gymAccess = q.acceso_gimnasio === true || q.acceso_gimnasio === "si" || q.gymAccess === true;

  if (!["A", "B", "C"].includes(nivel)) errors.push("Nivel de equipo inválido (A/B/C).");
  if (![2, 3, 4].includes(n)) errors.push("Número de entrenamientos debe ser 2, 3 o 4.");
  if (days.length !== n) {
    errors.push(`Debes seleccionar exactamente ${n} días de entrenamiento (ahora: ${days.length}).`);
  }
  if (days.some((d) => !TRAIN_DAYS.includes(d))) {
    errors.push("Solo se permiten días de lunes a viernes.");
  }
  if (!matchDay) errors.push("Día de partido inválido.");

  return {
    ok: errors.length === 0,
    errors,
    normalized: {
      nivel,
      dias_entrenamiento_semana: n,
      dias_exactos_entrenamiento: days,
      dia_partido: matchDay,
      acceso_gimnasio: gymAccess,
    },
  };
}

/**
 * Días hasta el próximo partido (1 = víspera).
 * Días desde el partido anterior (1 = postpartido inmediato).
 */
export function daysUntilMatch(trainDay, matchDay) {
  const ti = DAY_ORDER.indexOf(trainDay);
  const mi = DAY_ORDER.indexOf(matchDay);
  if (ti < 0 || mi < 0) return 99;
  let d = mi - ti;
  if (d <= 0) d += 7;
  return d;
}

export function daysSinceMatch(trainDay, matchDay) {
  const ti = DAY_ORDER.indexOf(trainDay);
  const mi = DAY_ORDER.indexOf(matchDay);
  if (ti < 0 || mi < 0) return 99;
  let d = ti - mi;
  if (d <= 0) d += 7;
  return d;
}

/** Distancia firmada: negativo = antes del partido, positivo = después. */
export function matchDistance(trainDay, matchDay) {
  const until = daysUntilMatch(trainDay, matchDay);
  const since = daysSinceMatch(trainDay, matchDay);
  // Elegir la referencia más cercana (post vs pre)
  if (since <= until && since <= 3) return since; // post cercano
  return -until; // pre
}

/** Casos dorados del documento (orden calendario). */
const GOLDEN_ASSIGNMENTS = {
  "Sábado|Martes,Jueves": ["B", "C"],
  "Sábado|Lunes,Miércoles": ["A", "B"],
  "Sábado|Lunes,Miércoles,Viernes": ["A", "B", "C"],
  "Sábado|Lunes,Martes,Jueves,Viernes": ["A", "B", "C", "A"],
  "Domingo|Martes,Viernes": ["B", "C"],
  "Domingo|Lunes,Miércoles": ["A", "B"],
  "Domingo|Lunes,Miércoles,Viernes": ["A", "B", "C"],
  "Domingo|Lunes,Martes,Jueves,Viernes": ["A", "B", "C", "A"],
  // entre_semana → Miércoles
  "Miércoles|Lunes,Viernes": ["A", "C"],
  "Miércoles|Lunes,Martes": ["A", "C"],
  "Miércoles|Lunes,Martes,Viernes": ["A", "B", "C"],
  "Miércoles|Lunes,Martes,Jueves,Viernes": ["A", "B", "A", "C"],
};

/**
 * Asigna A/B/C a días exactos según proximidad al partido.
 * Ejemplos del prompt (partido sábado):
 *  M+J → B+C | L+X → A+B | L+X+V → A+B+C | L+M+J+V → A+B+C+A
 */
export function assignProtocolsToDays(trainDays, matchDay) {
  const days = normalizeTrainDays(trainDays);
  const match = normalizeMatchDay(matchDay);
  const n = days.length;
  if (!n) return [];

  const goldenKey = `${match}|${days.join(",")}`;
  if (GOLDEN_ASSIGNMENTS[goldenKey]) {
    const protocols = GOLDEN_ASSIGNMENTS[goldenKey];
    return days.map((day, i) => ({
      day,
      protocol: protocols[i] || "B",
      distance: matchDistance(day, match),
      meta: PROTOCOL_DAY_META[protocols[i] || "B"],
    }));
  }

  const scored = days.map((day) => {
    const until = daysUntilMatch(day, match);
    const since = daysSinceMatch(day, match);
    const dist = matchDistance(day, match);
    return { day, until, since, dist };
  });

  const assignment = Object.fromEntries(days.map((d) => [d, null]));

  // C = más cercano al partido (menor until, sin ser post puro)
  const byPre = [...scored].sort((a, b) => a.until - b.until || DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day));
  // A = postpartido más cercano (menor since entre posts) o día más lejano al partido
  const byPost = [...scored].sort((a, b) => a.since - b.since || DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day));
  // B = día central de carga (until medio-alto, no víspera)
  const byLoad = [...scored].sort((a, b) => {
    const aScore = a.until >= 2 && a.until <= 4 ? -a.until : 99;
    const bScore = b.until >= 2 && b.until <= 4 ? -b.until : 99;
    return aScore - bScore || DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day);
  });

  if (n === 2) {
    const nearPost = scored.some((s) => s.since <= 2);
    const nearPre = scored.some((s) => s.until <= 2);
    if (nearPost && !nearPre) {
      // A + B (post + carga)
      assignment[byPost[0].day] = "A";
      assignment[days.find((d) => d !== byPost[0].day)] = "B";
    } else if (nearPre) {
      // B + C
      assignment[byPre[0].day] = "C";
      assignment[days.find((d) => d !== byPre[0].day)] = "B";
    } else {
      assignment[days[0]] = "A";
      assignment[days[1]] = "B";
    }
  } else if (n === 3) {
    assignment[byPost[0].day] = "A";
    assignment[byPre[0].day] = "C";
    const mid = days.find((d) => !assignment[d]);
    assignment[mid] = "B";
    if (Object.values(assignment).filter(Boolean).length < 3) {
      ["A", "B", "C"].forEach((p, i) => { assignment[days[i]] = p; });
    }
  } else {
    // A + B + C + A (calendario): post→A, load→B, pre→C, resto→A
    assignment[byPost[0].day] = "A";
    const cDay = byPre.find((s) => s.day !== byPost[0].day)?.day || days[days.length - 1];
    assignment[cDay] = "C";
    const remain = days.filter((d) => !assignment[d]);
    const bDay = byLoad.find((s) => remain.includes(s.day))?.day || remain[0];
    assignment[bDay] = "B";
    remain.filter((d) => d !== bDay).forEach((d) => { assignment[d] = "A"; });
  }

  return days.map((day) => ({
    day,
    protocol: assignment[day] || "B",
    distance: matchDistance(day, match),
    meta: PROTOCOL_DAY_META[assignment[day] || "B"],
  }));
}

function buildSession({ day, protocol, nivel, gymAccess, seed, weekOffset = 0 }) {
  const template = getProtocolTemplate(protocol, gymAccess);
  const warmup = selectGeneralWarmup({ seed: `${seed}|${day}|${weekOffset}|w` });
  const ball = selectBallWarmup({ nivel, protocolo: protocol, seed: `${seed}|${day}|${weekOffset}|b` });
  const { exercises: protocolExercises } = selectProtocolExercises({
    protocolo: protocol,
    gymAccess,
    seed: `${seed}|${day}|${weekOffset}|p`,
  });
  const mainTask = selectMainTask({
    nivel,
    protocolo: protocol,
    gymAccess,
    seed: `${seed}|${day}|${weekOffset}|m`,
  });

  return {
    id: `club_auto_${day}_${protocol}_${weekOffset}`,
    assignedDay: day,
    protocol,
    protocolLabel: PROTOCOL_DAY_META[protocol]?.label || protocol,
    intensityDay: PROTOCOL_DAY_META[protocol]?.intensidadDia,
    title: `Sesión ${protocol} · ${day}`,
    structure: [
      { type: "calentamiento_general", label: "1. Calentamiento general", item: warmup },
      { type: "calentamiento_balon", label: "2. Tarea con balón de calentamiento", item: ball },
      {
        type: "protocolo",
        label: `3. Protocolo ${template.title}`,
        template,
        exercises: protocolExercises,
      },
      { type: "tarea_principal", label: "4. Tarea principal", item: mainTask },
      {
        type: "observaciones",
        label: "5. Diseñador de tareas / observaciones / adaptaciones",
        item: {
          observaciones: CLUB_AUTO_OBSERVACIONES[protocol],
          adaptaciones_jugadores: mainTask.adaptaciones?.jugadores,
          adaptaciones_espacio: mainTask.adaptaciones?.espacio,
        },
      },
    ],
  };
}

/**
 * Genera microciclo automático completo.
 */
export function generateClubAutoMicrociclo(questionnaire, options = {}) {
  const validation = validateCoachQuestionnaire(questionnaire);
  if (!validation.ok) {
    return { ok: false, errors: validation.errors, sessions: [] };
  }

  const q = validation.normalized;
  const seed = options.seed || `${q.nivel}|${q.dia_partido}|${q.dias_exactos_entrenamiento.join("-")}|${options.weekOffset || 0}`;
  const plan = assignProtocolsToDays(q.dias_exactos_entrenamiento, q.dia_partido);

  const sessions = plan.map(({ day, protocol, distance, meta }) => ({
    ...buildSession({
      day,
      protocol,
      nivel: q.nivel,
      gymAccess: q.acceso_gimnasio,
      seed,
      weekOffset: options.weekOffset || 0,
    }),
    matchDistance: distance,
    dayMeta: meta,
  }));

  return {
    ok: true,
    errors: [],
    questionnaire: q,
    sessions,
    summary: sessions.map((s) => `${s.assignedDay}: ${s.protocol}`).join(" · "),
  };
}

/**
 * Genera N ciclos de 4 semanas (por defecto 1 → 4 semanas).
 * @param {object} questionnaire
 * @param {{ cycles?: number }} [options]
 */
export function generateClubAutoFourWeeks(questionnaire, { cycles = 1 } = {}) {
  const n = Math.max(1, Math.min(6, Number(cycles) || 1));
  const weeks = [];
  for (let c = 0; c < n; c++) {
    for (let w = 0; w < 4; w++) {
      const weekOffset = c * 4 + w;
      weeks.push({
        week: weekOffset + 1,
        label: `Semana ${weekOffset + 1}`,
        cycle: c + 1,
        ...generateClubAutoMicrociclo(questionnaire, {
          weekOffset,
          seed: `c${c}|w${w}`,
        }),
      });
    }
  }
  return weeks;
}

/** API pública estable */
export function generateClubAutoPlan(perfil) {
  return generateClubAutoMicrociclo(perfil);
}
