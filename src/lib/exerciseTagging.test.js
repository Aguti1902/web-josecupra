import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { EXERCISES } from "./exerciseCatalog.js";
import { matchSlotTags } from "./exerciseSelector.js";
import { SESSION_TEMPLATES } from "./sessionTemplatesV2.js";
import { blockAllowsLoadLogging, objectiveAllowsLoadLogging } from "./loadAnalytics.js";

describe("etiquetado ejercicios — slots bíceps", () => {
  it("Isometría de remo con banda no entra en slot bíceps analítico", () => {
    const remo = EXERCISES.find((e) => e.id === 126 || /isometr[ií]a de remo/i.test(e.nombre));
    assert.ok(remo, "ejercicio remo isométrico existe");
    assert.ok(remo.etiquetas.grupo_muscular.includes("espalda"));
    assert.equal(remo.etiquetas.grupo_muscular.includes("biceps"), false);

    const bicepsSlot = {
      rol: "complementario",
      patron: "analitico",
      grupo_muscular: "biceps",
    };
    assert.equal(matchSlotTags(remo, bicepsSlot), false);
  });

  it("plantillas Fuerza Superior/Full exigen patrón analítico en bíceps", () => {
    for (const key of ["Fuerza Superior", "Fuerza Full", "Hipertrofia Full"]) {
      const tpl = SESSION_TEMPLATES[key];
      const biceps = tpl.blocks
        .flatMap((b) => b.slots || [])
        .find((s) => s.grupo_muscular === "biceps" || (Array.isArray(s.grupo_muscular) && s.grupo_muscular.includes("biceps")));
      assert.ok(biceps, `${key} tiene slot bíceps`);
      assert.equal(biceps.patron, "analitico");
    }
  });
});

describe("registro de carga — ubicación", () => {
  it("no permite logging en calentamiento / vuelta a la calma", () => {
    assert.equal(blockAllowsLoadLogging("calentamiento"), false);
    assert.equal(blockAllowsLoadLogging("vuelta_calma"), false);
    assert.equal(blockAllowsLoadLogging("principal"), true);
  });

  it("solo objetivos medibles", () => {
    assert.equal(objectiveAllowsLoadLogging("fuerza"), true);
    assert.equal(objectiveAllowsLoadLogging("velocidad"), true);
    assert.equal(objectiveAllowsLoadLogging("movilidad"), false);
  });
});
