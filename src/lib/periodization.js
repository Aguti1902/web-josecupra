/**
 * periodization.js
 *
 * Motor de distribución de sesiones basado en periodización táctica (JPP).
 * Partidos en domingo → el algoritmo adapta la carga según distancia al partido.
 *
 * Marcos condicionales A / B / C / D con plantillas múltiples (A1, A2, B1…).
 * El mesociclo define qué plantilla usa cada marco en cada semana (weekSchedule).
 */
import {
  ensureWeekSchedule,
  resolveWeekSessions,
  formatWeekCombination,
  ensureSessionTemplateFields,
} from "./mesocycleTemplates";

/** Orden canónico de los días */
export const DAY_ORDER = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

/**
 * Tipo de sesión preferida para cada día de entrenamiento.
 * Se basa en la distancia al partido (domingo).
 */
export const DAY_PREFERRED_TYPE = {
  "Lunes":      "A",   // D+1  → recuperación
  "Martes":     "A",   // D+2  → carga baja-media
  "Miércoles":  "B",   // D+3  → pico de carga
  "Jueves":     "B",   // D+4  → carga media-alta
  "Viernes":    "C",   // D+5  → activación velocidad pre-partido
  "Sábado":     "C",   // D+6  → activación ligera
};

/** Tipo D para equipos de 4 días (complementaria) */
export const DAY_PREFERRED_TYPE_4D = {
  ...DAY_PREFERRED_TYPE,
  "Jueves": "D",
};

/** Mapeo intensidad → tipo de sesión (A / B / C / D) */
export function getSessionType(intensity) {
  const i = (intensity || "").toLowerCase();
  if (i.includes("complementaria") || i === "d") return "D";
  if (["Baja", "Media"].includes(intensity)) return "A";
  if (["Media-alta", "Alta"].includes(intensity)) return "B";
  return "C"; // Máxima
}

/**
 * Distribuye un grupo de sesiones entre los días de entrenamiento del equipo.
 *
 * @param {Array}  weekSessions  - Sesiones del mesociclo para esta semana
 * @param {Array}  trainingDays  - Días de entrenamiento del equipo (["Lunes","Miércoles","Viernes"])
 * @returns {Array} Sesiones asignadas, cada una con `assignedDay` añadido
 */
export function distributeWeekSessions(weekSessions, trainingDays) {
  if (!trainingDays?.length) return weekSessions.slice(0, 3);

  // Ordenar días de entrenamiento
  const sortedDays = [...trainingDays]
    .filter((d) => DAY_ORDER.includes(d))
    .sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));

  // Agrupar sesiones disponibles por tipo
  const byType = { A: [], B: [], C: [], D: [] };
  weekSessions.forEach((s) => {
    const t = getSessionType(s.intensity);
    if (byType[t]) byType[t].push(s);
    else byType.C.push(s);
  });

  const used = new Set();
  const result = [];
  const use4D = sortedDays.length >= 4;

  for (const day of sortedDays) {
    const preferred = (use4D ? DAY_PREFERRED_TYPE_4D : DAY_PREFERRED_TYPE)[day] || "B";
    // Orden de fallback: primero el tipo correcto, luego los adyacentes
    const fallbackOrder = preferred === "A" ? ["A", "B", "C", "D"]
                        : preferred === "B" ? ["B", "A", "C", "D"]
                        : preferred === "D" ? ["D", "C", "B", "A"]
                        :                    ["C", "B", "A", "D"];

    let assigned = null;
    for (const t of fallbackOrder) {
      const candidate = byType[t].find((s) => !used.has(s.id ?? s.title));
      if (candidate) {
        assigned = candidate;
        used.add(candidate.id ?? candidate.title);
        break;
      }
    }

    if (assigned) {
      result.push({ ...assigned, assignedDay: day });
    }
  }

  return result;
}

/**
 * Distribuye un mesociclo para un equipo combinando plantillas A/B/C/D por semana.
 *
 * @param {Object|Array} mesocycleOrSessions - Mesociclo { sessions, weekSchedule, startDate, endDate } o array legacy
 * @param {Array}  trainingDays
 * @param {number} baseWeekSize
 * @param {number|null} totalCalendarWeeks
 */
export function distributeMesocycleForTeam(mesocycleOrSessions, trainingDays, baseWeekSize = 3, totalCalendarWeeks = null) {
  const mesocycle = Array.isArray(mesocycleOrSessions)
    ? { sessions: mesocycleOrSessions.map(ensureSessionTemplateFields) }
    : {
        ...mesocycleOrSessions,
        sessions: (mesocycleOrSessions?.sessions || []).map(ensureSessionTemplateFields),
      };

  const teamDays = (trainingDays || []).filter((d) => DAY_ORDER.includes(d));
  const sessionsPerTeamWeek = teamDays.length || baseWeekSize;

  if (!mesocycle.sessions?.length) {
    return { weeks: [], totalSessions: 0, sessionsPerWeek: sessionsPerTeamWeek };
  }

  const numWeeks = totalCalendarWeeks
    ?? Math.max(1, Math.ceil(mesocycle.sessions.length / Math.max(baseWeekSize, 1)));

  const schedule = ensureWeekSchedule(mesocycle, numWeeks);
  const mesoWithSchedule = { ...mesocycle, weekSchedule: schedule };

  const weeks = [];
  for (let w = 0; w < numWeeks; w++) {
    const weekSessions = resolveWeekSessions(mesoWithSchedule, w, numWeeks);
    const distributed = distributeWeekSessions(weekSessions, teamDays);
    if (distributed.length > 0) {
      weeks.push({
        weekNumber: w + 1,
        sessions: distributed,
        combination: formatWeekCombination(schedule[w], mesocycle.sessions),
        schedule: schedule[w],
      });
    }
  }

  return {
    weeks,
    totalSessions: weeks.reduce((acc, w) => acc + w.sessions.length, 0),
    sessionsPerWeek: sessionsPerTeamWeek,
  };
}

/**
 * Devuelve una etiqueta explicativa de por qué una sesión está en ese día.
 */
export function getDayRationale(day, sessionType) {
  const map = {
    "Lunes":     "Recuperación activa post-partido · Carga baja",
    "Martes":    "Activación · Carga baja-media",
    "Miércoles": "Pico de carga semanal · Máximo rendimiento",
    "Jueves":    "Consolidación táctica · Carga media-alta",
    "Viernes":   "Activación pre-partido · Velocidad y reacción",
    "Sábado":    "Preparación día de partido · Carga mínima",
  };
  return map[day] ?? "";
}

/* ═══════════════════════════════════════════════════════════
   UTILIDADES DE CALENDARIO
   ═══════════════════════════════════════════════════════════ */

/**
 * Dado el startDate (YYYY-MM-DD) del mesociclo y la fecha de hoy,
 * devuelve el índice de la semana actual (0-based).
 * Devuelve -1 si el mesociclo no ha empezado o ya terminó.
 */
export function getCurrentWeekIndex(startDate, endDate) {
  if (!startDate) return 0; // sin fecha → mostrar semana 1 por defecto
  const start = new Date(startDate);
  const end   = endDate ? new Date(endDate) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  if (end) end.setHours(23, 59, 59, 999);

  if (today < start) return 0;          // antes del inicio → semana 1
  if (end && today > end) return -1;    // terminado

  const diffDays = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7);
}

/**
 * Formatea una fecha YYYY-MM-DD como "5 may 2025".
 */
export function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * Calcula la fecha de inicio de la semana N (0-based) dentro del mesociclo.
 */
export function getWeekStartDate(mesocicloStartDate, weekIndex) {
  if (!mesocicloStartDate) return null;
  const d = new Date(mesocicloStartDate + "T00:00:00");
  d.setDate(d.getDate() + weekIndex * 7);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

/**
 * Devuelve si el mesociclo está activo hoy.
 */
export function isMesocicloActive(startDate, endDate) {
  if (!startDate) return false;
  const today = new Date();
  const start = new Date(startDate + "T00:00:00");
  const end   = endDate ? new Date(endDate + "T23:59:59") : null;
  return today >= start && (!end || today <= end);
}

/**
 * Dado un mesociclo con startDate y endDate, calcula cuántas semanas tiene.
 */
export function getMesocicloWeeks(startDate, endDate) {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate + "T00:00:00");
  const end   = new Date(endDate + "T00:00:00");
  const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  return Math.ceil(diffDays / 7);
}
