import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  sameTrainingNature,
  injectPreventionExercises,
  getPreventionInjectionIds,
  selectExerciseForSlot,
} from "./exerciseSelector.js";
import { EXERCISES } from "./exerciseCatalog.js";

describe("adaptación por lesiones · misma categoría", () => {
  it("no considera rower/carrera/bici de la misma naturaleza que fuerza tren superior", () => {
    const rower = EXERCISES.find((e) => e.id === 145);
    const road = EXERCISES.find((e) => e.id === 146);
    const bike = EXERCISES.find((e) => e.id === 148);
    const slot = { objetivo: "fuerza", segmento: "tren_superior", rol: "basico", carpeta: "fuerza_tren_superior" };
    assert.ok(rower, "RowErg en catálogo");
    assert.equal(sameTrainingNature(rower, slot), false);
    assert.equal(sameTrainingNature(road, slot), false);
    assert.equal(sameTrainingNature(bike, slot), false);
  });

  it("curl femoral no encaja en un slot de tren superior", () => {
    const curl = EXERCISES.find((e) => /curl femoral/i.test(e.nombre));
    assert.ok(curl);
    const slot = { objetivo: "fuerza", segmento: "tren_superior", rol: "basico", carpeta: "fuerza_tren_superior" };
    assert.equal(sameTrainingNature(curl, slot), false);
  });

  it("inyección de hombro usa carpeta prevencion, nunca resistencia", () => {
    const ids = getPreventionInjectionIds(["hombro"]);
    assert.ok(ids.length > 0);
    const picked = EXERCISES.filter((e) => ids.includes(e.id));
    assert.ok(picked.every((e) => e.carpeta === "prevencion"));
    assert.ok(!picked.some((e) => /rower|roadwork|bikeerg|carrera continua/i.test(e.nombre)));
  });

  it("no mete rower en una sesión de fuerza aunque haya lesión de hombro", () => {
    const session = [
      {
        id: 10,
        nombre: "Press banca",
        carpeta: "fuerza_tren_superior",
        etiquetas: { rol: "complementario", segmento: "tren_superior", objetivo: ["fuerza"] },
        slotConstraints: { rol: "complementario", segmento: "tren_superior", objetivo: "fuerza" },
      },
    ];
    const out = injectPreventionExercises(session, {
      lesiones: ["hombro"],
      material: ["gym_completo"],
      userId: "u1",
    }, 2);
    const names = out.map((e) => String(e.nombre || e.name || "")).join(" ");
    assert.equal(/rower|roadwork|bikeerg|carrera continua/i.test(names), false);
    assert.equal(out[0].carpeta === "resistencia", false);
  });

  it("selectExerciseForSlot de tren superior no devuelve resistencia ni tren inferior", () => {
    const ex = selectExerciseForSlot(
      { rol: "basico", objetivo: "fuerza", segmento: "tren_superior", carpeta: "fuerza_tren_superior" },
      { material: ["gym_completo"], lesiones: ["hombro"], experiencia: "intermedio", userId: "u-hombro" },
    );
    assert.ok(ex);
    assert.notEqual(ex.carpeta, "resistencia");
    assert.notEqual(ex.etiquetas?.segmento, "tren_inferior");
    assert.ok(!/rower|roadwork|bikeerg|curl femoral/i.test(ex.nombre));
  });

  it("curl de bíceps no entra en un slot de velocidad", () => {
    const curl = EXERCISES.find((e) => e.id === 125);
    assert.ok(curl);
    const slot = { rol: "basico", objetivo: "velocidad", patron: "aceleracion", description: "Aceleración" };
    assert.equal(sameTrainingNature(curl, slot), false);
    const picked = selectExerciseForSlot(
      slot,
      { material: ["gym_completo"], experiencia: "intermedio", userId: "u-vel" },
    );
    if (picked) {
      assert.notEqual(picked.carpeta, "fuerza_tren_superior");
      assert.ok(!/curl|b[ií]ceps/i.test(picked.nombre));
    }
  });

  it("lesión de hombro no mete tren inferior en un slot de tren superior", () => {
    const slot = { rol: "basico", objetivo: "fuerza", segmento: "tren_superior", carpeta: "fuerza_tren_superior" };
    const picked = selectExerciseForSlot(
      slot,
      { material: ["gym_completo"], lesiones: ["hombro"], experiencia: "intermedio", userId: "u-hombro-2" },
    );
    if (picked) {
      assert.notEqual(picked.etiquetas?.segmento, "tren_inferior");
      assert.notEqual(picked.carpeta, "fuerza_tren_inferior");
    }
  });
});
