/**
 * periodization.js
 *
 * Motor de distribución de sesiones basado en periodización táctica (JPP).
 * Partidos en domingo → el algoritmo adapta la carga según distancia al partido.
 *
 * Lógica de asignación por día:
 *   Lunes / Martes  → Sesión A  (Extensiva  · recuperación post-partido)
 *   Miércoles / Jueves → Sesión B  (Intensiva   · pico de carga mid-week)
 *   Viernes / Sábado → Sesión C  (Reactiva    · activación pre-partido)
 *
 * Si el equipo entrena 3 días (L/X/V) ve A + B + C.
 * Si el equipo entrena 2 días (L/J)   ve A + B (sin C).
 * Si el equipo entrena 2 días (X/V)   ve B + C (sin A).
 * → Las sesiones que "sobran" no se suprimen de la planificación global,
 *   solo no se asignan a ese equipo esa semana.
 */

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

/** Mapeo intensidad → tipo de sesión (A / B / C) */
export function getSessionType(intensity) {
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
  const byType = { A: [], B: [], C: [] };
  weekSessions.forEach((s) => {
    const t = getSessionType(s.intensity);
    byType[t].push(s);
  });

  const used = new Set();
  const result = [];

  for (const day of sortedDays) {
    const preferred = DAY_PREFERRED_TYPE[day] || "B";
    // Orden de fallback: primero el tipo correcto, luego los adyacentes
    const fallbackOrder = preferred === "A" ? ["A", "B", "C"]
                        : preferred === "B" ? ["B", "A", "C"]
                        :                    ["C", "B", "A"];

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
 * Distribuye todas las sesiones de un mesociclo para un equipo.
 * Agrupa las sesiones en semanas (N sesiones/semana según sessionsPerWeek),
 * y aplica distributeWeekSessions a cada semana.
 *
 * @param {Array}  allSessions     - Todas las sesiones del mesociclo (de Jose)
 * @param {Array}  trainingDays    - Días de entrenamiento del equipo
 * @param {number} baseWeekSize    - Sesiones por semana del plan original (por defecto 3)
 * @returns {{ weeks: Array, totalSessions: number }}
 */
export function distributeMesocycleForTeam(allSessions, trainingDays, baseWeekSize = 3) {
  const teamDays = (trainingDays || []).filter((d) => DAY_ORDER.includes(d));
  const sessionsPerTeamWeek = teamDays.length || baseWeekSize;

  const weeks = [];
  for (let i = 0; i < allSessions.length; i += baseWeekSize) {
    const chunk = allSessions.slice(i, i + baseWeekSize);
    const distributed = distributeWeekSessions(chunk, teamDays);
    if (distributed.length > 0) {
      weeks.push({
        weekNumber: weeks.length + 1,
        sessions: distributed,
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
