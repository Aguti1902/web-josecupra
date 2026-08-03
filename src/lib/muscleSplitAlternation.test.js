import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applySplitAlternationToAssignments,
  resolveSessionSplitVariant,
  validateMuscleCoverage,
} from "./muscleSplitAlternation.js";

describe("muscleSplitAlternation (validador)", () => {
  it("No corrige plantillas: mantiene sessionType de la matriz", () => {
    const { assignments } = applySplitAlternationToAssignments([
      { sessionType: "Fuerza Inferior", day: "Lunes" },
      { sessionType: "Fuerza Inferior", day: "Martes" },
    ]);

    assert.equal(assignments[0].templateKey, "Fuerza Inferior");
    assert.equal(assignments[1].templateKey, "Fuerza Inferior");
    assert.equal(assignments[1].sessionType, "Fuerza Inferior");
  });

  it("Detecta solape muscular sin alterar assignments", () => {
    const { warnings } = validateMuscleCoverage([
      { sessionType: "Fuerza Inferior", day: "Lunes" },
      { sessionType: "Hipertrofia Pierna", day: "Martes" },
    ]);
    assert.ok(warnings.length >= 1);
    assert.match(warnings[0], /Solape muscular/i);
  });

  it("Cobertura fuerza incompleta avisa", () => {
    const { warnings } = validateMuscleCoverage([
      { sessionType: "Fuerza Inferior", day: "Lunes" },
      { sessionType: "Fuerza Inferior", day: "Jueves" },
    ]);
    assert.ok(warnings.some((w) => /Cobertura fuerza incompleta/i.test(w)));
  });

  it("INF + SUP no avisa cobertura incompleta", () => {
    const { ok, warnings } = validateMuscleCoverage([
      { sessionType: "Fuerza Inferior", day: "Lunes" },
      { sessionType: "Fuerza Superior", day: "Jueves" },
    ]);
    assert.equal(ok, true);
    assert.equal(warnings.length, 0);
  });

  it("resolveSessionSplitVariant ya no alterna plantilla", () => {
    const r = resolveSessionSplitVariant("Fuerza Inferior", "lower", {});
    assert.equal(r.sessionType, "Fuerza Inferior");
    assert.equal(r.templateKey, "Fuerza Inferior");
    assert.equal(r.muscleGroupUsed, "lower");
  });

  it("applySplitAlternation adjunta templateKey sin cambiar tipo", () => {
    const { assignments, lastMuscleGroup } = applySplitAlternationToAssignments([
      { sessionType: "Fuerza Superior", day: "Viernes" },
    ]);
    assert.equal(assignments[0].templateKey, "Fuerza Superior");
    assert.equal(lastMuscleGroup, "upper");
  });
});
