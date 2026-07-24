import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applySplitAlternationToAssignments,
  resolveSessionSplitVariant,
  isAlternateTemplateAllowed,
} from "./muscleSplitAlternation.js";

describe("muscleSplitAlternation", () => {
  it("Fuerza B (inferior) lunes → Fuerza A martes usa plantilla superior", () => {
    const { assignments } = applySplitAlternationToAssignments([
      { sessionType: "Fuerza B", day: "Lunes" },
      { sessionType: "Fuerza A", day: "Martes" },
    ]);

    assert.equal(assignments[0].templateKey, "Fuerza B");
    assert.equal(assignments[1].templateKey, "Fuerza Superior A");
    assert.equal(assignments[1].sessionType, "Fuerza A");
    assert.equal(assignments[1].titleOverride, "Fuerza A - Tren Superior");
  });

  it("Hipertrofia Pierna consecutiva → segunda sesión alterna a Push", () => {
    const { assignments } = applySplitAlternationToAssignments([
      { sessionType: "Hipertrofia Pierna", day: "Lunes" },
      { sessionType: "Hipertrofia Pierna", day: "Miércoles" },
    ]);

    assert.equal(assignments[0].templateKey, "Hipertrofia Pierna");
    assert.equal(assignments[1].templateKey, "Hipertrofia Push");
    assert.equal(assignments[1].sessionType, "Hipertrofia Pierna");
  });

  it("Lesión de hombro bloquea alternativa superior y emite advertencia", () => {
    const filterParams = { lesiones: ["hombro"] };
    assert.equal(isAlternateTemplateAllowed("Fuerza Superior A", filterParams), false);

    const { assignments, warnings } = applySplitAlternationToAssignments([
      { sessionType: "Fuerza B", day: "Lunes" },
      { sessionType: "Fuerza A", day: "Martes" },
    ], filterParams);

    assert.equal(assignments[1].templateKey, "Fuerza A");
    assert.match(warnings[0], /variante alternativa bloqueada/i);
  });

  it("Última sesión de semana N afecta alternancia en semana N+1 (mesociclo)", () => {
    const week1 = applySplitAlternationToAssignments([
      { sessionType: "Fuerza B", day: "Viernes" },
    ]);
    const week2 = applySplitAlternationToAssignments([
      { sessionType: "Fuerza A", day: "Lunes" },
    ], {}, week1.lastMuscleGroup);

    assert.equal(week2.assignments[0].templateKey, "Fuerza Superior A");
  });

  it("Velocidad entre dos fuerzas inferiores no resetea el grupo muscular", () => {
    const { assignments } = applySplitAlternationToAssignments([
      { sessionType: "Fuerza B", day: "Lunes" },
      { sessionType: "Velocidad", day: "Martes" },
      { sessionType: "Fuerza A", day: "Jueves" },
    ]);

    assert.equal(assignments[2].templateKey, "Fuerza Superior A");
  });

  it("resolveSessionSplitVariant mantiene sessionType de matriz sin alternancia previa", () => {
    const r = resolveSessionSplitVariant("Fuerza A", null, {});
    assert.equal(r.sessionType, "Fuerza A");
    assert.equal(r.templateKey, "Fuerza A");
    assert.equal(r.muscleGroupUsed, "lower");
  });
});
