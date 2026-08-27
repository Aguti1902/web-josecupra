import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildSoloCoachClub, normalizeCoachAutoInput, stableCoachClubIds } from "./provisionSoloCoach.js";
import { usesClubAutoEngine } from "./clubAuto/clubAutoCoachBridge.js";

describe("provisionSoloCoach", () => {
  it("IDs estables por usuario", () => {
    const a = stableCoachClubIds("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee");
    const b = stableCoachClubIds("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee");
    assert.equal(a.clubId, b.clubId);
    assert.ok(a.clubId.startsWith("coach_club_"));
    assert.ok(a.teamId.startsWith("coach_team_"));
  });

  it("completa días por defecto si el metadata viene vacío", () => {
    const q = normalizeCoachAutoInput("");
    assert.ok(q.dias_exactos_entrenamiento.length >= 1);
    assert.equal(q.nivel, "B");
  });

  it("genera un club auto con coachConfig válido", () => {
    const { club, clubId, teamId } = buildSoloCoachClub({
      userId: "user-1",
      name: "Marcos",
      email: "marcos@test.com",
      plan: "coach-starter",
      coachAuto: JSON.stringify({
        nivel: "A",
        dias: "Lunes,Miércoles,Viernes",
        partido: "sabado",
        gym: "no",
        material: "Gomas",
        duracion: "75",
        jugadores: "14-18",
      }),
    });
    assert.equal(club.id, clubId);
    assert.equal(club.isSoloCoach, true);
    assert.equal(club.planningMode, "auto");
    assert.equal(club.coachConfig.engine, "club_auto");
    assert.equal(club.teams[0].id, teamId);
    assert.equal(usesClubAutoEngine(club), true);
  });
});
