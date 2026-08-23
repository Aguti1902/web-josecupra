import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { assignClubAutoPlan, resolveClubAutoAssignIds, listAssignableClubTargets } from "./adminAssignPlan.js";

function installLocalStorage() {
  const data = {};
  globalThis.localStorage = {
    getItem(k) { return Object.prototype.hasOwnProperty.call(data, k) ? data[k] : null; },
    setItem(k, v) { data[k] = String(v); },
    removeItem(k) { delete data[k]; },
    key(i) { return Object.keys(data)[i] ?? null; },
    get length() { return Object.keys(data).length; },
  };
  return data;
}

const QUESTIONNAIRE = {
  nivel: "B",
  dias_entrenamiento_semana: 3,
  dias_exactos_entrenamiento: ["Martes", "Jueves", "Viernes"],
  dia_partido: "sabado",
  duracion_sesion: "75",
  num_jugadores: "14-18",
  material: ["Sin material", "Gomas"],
  acceso_gimnasio: "no",
};

describe("assignClubAutoPlan → panel ProCoach", () => {
  let store;
  beforeEach(() => {
    store = installLocalStorage();
    globalThis.fetch = async () => ({ ok: false, json: async () => ({}) });
  });
  afterEach(() => {
    delete globalThis.localStorage;
    delete globalThis.fetch;
  });

  it("resuelve clubId/teamId de un ProCoach recién creado", () => {
    const club = {
      id: "coach_1",
      name: "DEPRO Coach · Ana",
      isSoloCoach: true,
      teams: [{ id: "team_1", name: "Mi equipo" }],
    };
    localStorage.setItem("depro_clubs", JSON.stringify([club]));
    localStorage.setItem("depro_club_coach_1", JSON.stringify(club));
    localStorage.setItem("depro_admin_clients", JSON.stringify([{
      id: "user_1",
      name: "Ana",
      type: "coach",
      teamRole: "entrenador",
      isSoloCoach: true,
      clubId: "coach_1",
      teamId: "team_1",
    }]));

    const resolved = resolveClubAutoAssignIds({
      kind: "entrenador",
      clubId: "coach_1",
      teamId: "team_1",
      targetId: "user_1",
    });
    assert.equal(resolved.clubId, "coach_1");
    assert.equal(resolved.teamId, "team_1");

    const targets = listAssignableClubTargets();
    assert.ok(targets.some((t) => t.id === "user_1" && t.kind === "entrenador" && t.teamId === "team_1"));
  });

  it("persiste coachConfig y semanas en las claves que lee el panel", () => {
    const club = {
      id: "coach_1",
      name: "DEPRO Coach · Ana",
      isSoloCoach: true,
      teams: [{ id: "team_1", name: "Mi equipo" }],
    };
    localStorage.setItem("depro_clubs", JSON.stringify([club]));
    localStorage.setItem("depro_club_coach_1", JSON.stringify(club));

    const payload = assignClubAutoPlan({
      targetId: "user_1",
      kind: "entrenador",
      clubId: "coach_1",
      teamId: "team_1",
      questionnaire: QUESTIONNAIRE,
      startDate: "2026-08-03",
      cycles: 1,
    });

    assert.equal(payload.engine, "club_auto");
    assert.equal(payload.assignment.clubId, "coach_1");
    assert.equal(payload.assignment.teamId, "team_1");

    const detail = JSON.parse(localStorage.getItem("depro_club_coach_1"));
    assert.equal(detail.coachConfig.engine, "club_auto");
    assert.equal(detail.coachConfig.nivel, "B");

    const weekKey = Object.keys(store).find((k) => k.startsWith("depro_coach_week_coach_1_team_1_"));
    assert.ok(weekKey, "debe guardar depro_coach_week_{clubId}_{teamId}_{weekStart}");
    const week = JSON.parse(store[weekKey]);
    assert.equal(week.engine, "club_auto");
    assert.ok((week.sessions || []).length >= 1);
    assert.equal(week.sessions[0].duration, "75 min");
    assert.equal(week.sessions[0].taskDesigner, undefined);

    assert.equal(detail.coachWeeks, undefined);

    const meso = JSON.parse(localStorage.getItem("depro_coach_meso_coach_1_team_1"));
    assert.equal(meso.engine, "club_auto");
    assert.ok(Number(meso.numWeeks) >= 1);
  });
});
