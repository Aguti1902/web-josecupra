import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getTipoRegistro, fieldsForTipoRegistro, isLoadRegistrable } from "./tipoRegistro.js";

describe("tipo_registro", () => {
  it("marca movilidad / prevención / calentamiento como no_registrable", () => {
    assert.equal(getTipoRegistro({ carpeta: "movilidad", nombre: "Rotación torácica" }), "no_registrable");
    assert.equal(getTipoRegistro({ carpeta: "prevencion", nombre: "Prevención rodilla" }), "no_registrable");
    assert.equal(getTipoRegistro({
      etiquetas: { rol: "calentamiento", objetivo: ["movilidad"] },
      nombre: "Movilidad cadera",
    }), "no_registrable");
    assert.equal(isLoadRegistrable({ carpeta: "movilidad" }), false);
  });

  it("fuerza / velocidad / resistencia tienen campos correctos", () => {
    assert.equal(getTipoRegistro({
      carpeta: "fuerza_tren_inferior",
      etiquetas: { objetivo: ["fuerza"], rol: "basico" },
    }), "fuerza");
    assert.ok(fieldsForTipoRegistro("fuerza").includes("weight"));
    assert.ok(fieldsForTipoRegistro("fuerza").includes("reps"));
    assert.equal(fieldsForTipoRegistro("fuerza").includes("rpe"), false);
    assert.ok(fieldsForTipoRegistro("velocidad").includes("time"));
    assert.ok(fieldsForTipoRegistro("velocidad").includes("heartRate"));
    assert.equal(fieldsForTipoRegistro("velocidad").includes("distance"), false);
    assert.ok(fieldsForTipoRegistro("resistencia").includes("heartRate"));
  });
});
