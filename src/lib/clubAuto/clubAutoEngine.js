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

function matchDistance(trainDay, matchDay) {
  const ti = DAY_ORDER.indexOf(trainDay);
  const mi = DAY_ORDER.indexOf(matchDay);
  if (ti < 0 || mi < 0) return 0;
  let dist = ti - mi;
  if (dist > 3) dist -= 7;
  if (dist < -3) dist += 7;
  return dist; // negativo = antes del partido
}

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

  const scored = days.map((day) => {
    const dist = matchDistance(day, match); // -1 víspera, +1 post, etc.
    return { day, dist };
  });

  // Heurística: postpartido (dist>0 cercano) → A; más lejos pre (más negativo lejos) → B; cerca pre → C
  const byPost = [...scored].sort((a, b) => {
    // prefer post or early week for A
    const aPost = a.dist > 0 ? a.dist : 99;
    const bPost = b.dist > 0 ? b.dist : 99;
    if (aPost !== bPost) return aPost - bPost;
    return DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day);
  });
  const byPre = [...scored].sort((a, b) => {
    // closer to match before (dist -1 better than -3 for C)
    const aPre = a.dist < 0 ? Math.abs(a.dist) : 99;
    const bPre = b.dist < 0 ? Math.abs(b.dist) : 99;
    return aPre - bPre || DAY_ORDER.indexOf(b.day) - DAY_ORDER.indexOf(a.day);
  });
  const byCentral = [...scored].sort((a, b) => {
    // strongest mid-cycle: farthest from match among pre days, else middle of week
    const aScore = a.dist < 0 ? Math.abs(a.dist) : (a.dist > 0 ? 0 : 2);
    const bScore = b.dist < 0 ? Math.abs(b.dist) : (b.dist > 0 ? 0 : 2);
    return bScore - aScore || DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day);
  });

  const assignment = Object.fromEntries(days.map((d) => [d, null]));

  if (n === 2) {
    const hasNearPost = scored.some((s) => s.dist === 1 || s.dist === 2 || (s.dist > 0 && s.dist <= 2));
    const hasNearPre = scored.some((s) => s.dist === -1 || s.dist === -2);
    // Si hay postpartido cercano → A+B; si hay carga + cercano partido → B+C
    if (hasNearPost && !hasNearPre) {
      assignment[byPost[0].day] = "A";
      const other = days.find((d) => d !== byPost[0].day);
      assignment[other] = "B";
    } else if (hasNearPre) {
      assignment[byPre[0].day] = "C";
      const other = days.find((d) => d !== byPre[0].day);
      assignment[other] = "B";
    } else {
      // default B+C si ambos son pre-partido relativamente tarde; A+B si tempranos
      const avg = scored.reduce((s, x) => s + x.dist, 0) / 2;
      if (avg <= -2.5) {
        assignment[days[0]] = "A";
        assignment[days[1]] = "B";
      } else {
        assignment[byCentral[0].day] = "B";
        const other = days.find((d) => d !== byCentral[0].day);
        assignment[other] = "C";
      }
    }
  } else if (n === 3) {
    assignment[byPost[0].day] = "A";
    assignment[byPre[0].day] = "C";
    const mid = days.find((d) => !assignment[d]);
    assignment[mid] = "B";
    // si colisión A/C mismo día (raro), forzar orden L→A M→B V→C por índice
    if (Object.values(assignment).filter(Boolean).length < 3) {
      const order = ["A", "B", "C"];
      days.forEach((d, i) => { assignment[d] = order[i]; });
    }
  } else if (n >= 4) {
    // A + B + C + A
    const a1 = byPost[0].day;
    assignment[a1] = "A";
    const cDay = byPre.find((s) => s.day !== a1)?.day || days[days.length - 1];
    assignment[cDay] = "C";
    const remain = days.filter((d) => !assignment[d]);
    const bDay = remain.sort((a, b) => {
      const da = Math.abs(matchDistance(a, match));
      const db = Math.abs(matchDistance(b, match));
      return db - da;
    })[0];
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

export function generateClubAutoFourWeeks(questionnaire) {
  const weeks = [];
  for (let w = 0; w < 4; w++) {
    weeks.push({
      week: w + 1,
      label: `Semana ${w + 1}`,
      ...generateClubAutoMicrociclo(questionnaire, { weekOffset: w, seed: `w${w}` }),
    });
  }
  return weeks;
}

/** API pública estable */
export function generateClubAutoPlan(perfil) {
  return generateClubAutoMicrociclo(perfil);
}
