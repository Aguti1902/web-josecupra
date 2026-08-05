import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  usesClubAutoEngine,
  coachConfigToQuestionnaire,
  generateClubAutoWeekForCoach,
  categoryForNivel,
} from "./clubAutoCoachBridge.js";

describe("clubAutoCoachBridge", () => {
  it("detecta engine club_auto", () => {
    assert.equal(usesClubAutoEngine({ coachConfig: { engine: "club_auto", nivel: "B" } }), true);
    assert.equal(usesClubAutoEngine({ coachConfig: { nivel: "A" } }), true);
    assert.equal(usesClubAutoEngine({ coachConfig: { trainingsPerWeek: 3 } }), false);
  });

  it("mapea cuestionario corto y genera semana con estructura 5 bloques", () => {
    const config = {
      engine: "club_auto",
      nivel: "B",
      dias_entrenamiento_semana: 3,
      dias_exactos_entrenamiento: ["Lunes", "Miércoles", "Viernes"],
      dia_partido: "sabado",
      acceso_gimnasio: "no",
    };
    const q = coachConfigToQuestionnaire(config);
    assert.equal(q.nivel, "B");
    assert.equal(q.dias_entrenamiento_semana, 3);

    const week = generateClubAutoWeekForCoach(config, { weekStart: "2026-08-03" });
    assert.equal(week.engine, "club_auto");
    assert.equal(week.sessions.length, 3);
    const types = week.sessions[0].structure.map((b) => b.type);
    assert.deepEqual(types, [
      "calentamiento_general",
      "calentamiento_balon",
      "protocolo",
      "tarea_principal",
      "observaciones",
    ]);
    assert.equal(week.sessions[0].exercises.length, 6);
  });

  it("categoryForNivel", () => {
    assert.equal(categoryForNivel("A"), "Sub-11");
    assert.equal(categoryForNivel("C"), "Juvenil");
  });
});
