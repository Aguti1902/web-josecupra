/** Valoración de tests físicos respecto a la media del equipo (automática) */

export const RATING_LEGEND = [
  { label: "Excelente", color: "#22C55E", hint: ">10% vs media" },
  { label: "Bueno", color: "#3B82F6", hint: "3–10% vs media" },
  { label: "Medio", color: "#F59E0B", hint: "±3% vs media" },
  { label: "Bajo", color: "#EF4444", hint: "<−3% vs media" },
];

export function seasonTestsKey(playerId) {
  return `depro_season_tests_${playerId}`;
}

export function loadSeasonData(playerId) {
  try {
    const raw = localStorage.getItem(seasonTestsKey(playerId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveSeasonData(playerId, data) {
  localStorage.setItem(seasonTestsKey(playerId), JSON.stringify(data));
}

export function getEvalValues(playerId, testId) {
  const d = loadSeasonData(playerId);
  return d[testId] || ["", "", ""];
}

export function setEvalValue(playerId, testId, evalIdx, value) {
  const d = loadSeasonData(playerId);
  const arr = d[testId] || ["", "", ""];
  arr[evalIdx] = value;
  d[testId] = arr;
  saveSeasonData(playerId, d);
}

/** Media del equipo para un test en T1/T2/T3 (evalIdx 0–2) */
export function getTeamAvgForEval(playerIds, testId, evalIdx, valueOverrides = {}) {
  const vals = playerIds
    .map((pid) => {
      if (Object.prototype.hasOwnProperty.call(valueOverrides, pid)) {
        return valueOverrides[pid];
      }
      return getEvalValues(pid, testId)[evalIdx];
    })
    .filter((v) => v !== "" && !isNaN(parseFloat(v)))
    .map(parseFloat);
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

/** % respecto a la media: positivo = mejor que la media del equipo */
export function pctVsTeamAvg(test, value, teamAvg) {
  const n = parseFloat(value);
  if (isNaN(n) || teamAvg == null || teamAvg === 0) return null;
  if (test.higher_is_better) return ((n - teamAvg) / Math.abs(teamAvg)) * 100;
  return ((teamAvg - n) / Math.abs(teamAvg)) * 100;
}

export function getRatingVsTeamAvg(test, value, teamAvg) {
  const pct = pctVsTeamAvg(test, value, teamAvg);
  if (pct == null) return null;
  if (pct >= 10) return { label: "Excelente", color: "#22C55E", pct };
  if (pct >= 3) return { label: "Bueno", color: "#3B82F6", pct };
  if (pct >= -3) return { label: "Medio", color: "#F59E0B", pct };
  return { label: "Bajo", color: "#EF4444", pct };
}

/** Matriz de medias [testId][evalIdx] para una plantilla */
export function buildTeamAvgMatrix(players, tests) {
  const ids = players.map((p) => p.id);
  const matrix = {};
  tests.forEach((t) => {
    matrix[t.id] = [0, 1, 2].map((i) => getTeamAvgForEval(ids, t.id, i));
  });
  return matrix;
}

export function getLastEvalInfo(vals) {
  for (let i = vals.length - 1; i >= 0; i--) {
    if (vals[i] !== "" && !isNaN(parseFloat(vals[i]))) {
      return { idx: i, value: vals[i] };
    }
  }
  return null;
}

/** Valoración de un valor concreto vs media del equipo en esa evaluación */
export function getRatingForEval(test, value, playerIds, evalIdx, overridePlayerId = null, overrideValue = null) {
  const overrides = {};
  if (overridePlayerId != null && overrideValue !== undefined) {
    overrides[overridePlayerId] = overrideValue;
  }
  const teamAvg = getTeamAvgForEval(playerIds, test.id, evalIdx, overrides);
  return getRatingVsTeamAvg(test, value, teamAvg);
}
