import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeStringList,
  resolveObjetivos,
  resolveEdad,
  trainingFieldsFromUser,
} from "./playerTrainingProfile.js";

describe("playerTrainingProfile", () => {
  it("normaliza listas pipe / coma / array", () => {
    assert.deepEqual(normalizeStringList("Fuerza|Velocidad"), ["Fuerza", "Velocidad"]);
    assert.deepEqual(normalizeStringList([" Fuerza ", "Velocidad"]), ["Fuerza", "Velocidad"]);
    assert.deepEqual(normalizeStringList("Gomas, Mancuernas"), ["Gomas", "Mancuernas"]);
  });

  it("resuelve objetivos desde pipe-string y secundario", () => {
    assert.deepEqual(resolveObjetivos({ objetivos: "Fuerza|Velocidad" }), ["Fuerza", "Velocidad"]);
    assert.deepEqual(
      resolveObjetivos({ objetivo: "Fuerza", objetivoSecundario: "Prevención" }),
      ["Fuerza", "Prevención"],
    );
    assert.deepEqual(resolveObjetivos({ objective: "Resistencia" }), ["Resistencia"]);
  });

  it("resuelve edad desde age o edad", () => {
    assert.equal(resolveEdad({ age: 22 }), "22");
    assert.equal(resolveEdad({ edad: "19" }), "19");
  });

  it("trainingFieldsFromUser marca respuestas del cuestionario", () => {
    const f = trainingFieldsFromUser({
      edad: "24",
      deporte: "Fútbol",
      frecuencia: "3 días / sem",
      objetivos: "Fuerza|Velocidad",
      material: "Gomas|Mancuernas",
      experiencia: "1–3 años",
      lesion: [],
      diaCompeticion: "Fin de semana",
      disponibles: "Lunes|Miércoles|Viernes",
    });
    assert.equal(f.edad, "24");
    assert.deepEqual(f.objetivos, ["Fuerza", "Velocidad"]);
    assert.deepEqual(f.material, ["Gomas", "Mancuernas"]);
    assert.deepEqual(f.disponibles, ["Lunes", "Miércoles", "Viernes"]);
    assert.deepEqual(f.lesion, ["Ninguna"]);
  });
});
