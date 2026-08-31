import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeStringList,
  normalizeFrecuencia,
  resolveObjetivos,
  resolveEdad,
  resolvePhone,
  filterCatalogObjetivos,
  trainingFieldsFromUser,
  mergeTrainingSources,
  trainingProfileSnapshotFromAny,
  trainingFieldsToAuthMetadata,
} from "./playerTrainingProfile.js";

describe("playerTrainingProfile", () => {
  it("normaliza listas pipe / coma / array", () => {
    assert.deepEqual(normalizeStringList("Fuerza|Velocidad"), ["Fuerza", "Velocidad"]);
    assert.deepEqual(normalizeStringList([" Fuerza ", "Velocidad"]), ["Fuerza", "Velocidad"]);
    assert.deepEqual(normalizeStringList("Gomas, Mancuernas"), ["Gomas", "Mancuernas"]);
  });

  it("normaliza frecuencia del motor (\"3\") a chip de perfil", () => {
    assert.equal(normalizeFrecuencia("3"), "3 días / sem");
    assert.equal(normalizeFrecuencia(2), "2 días / sem");
    assert.equal(normalizeFrecuencia("1 día / sem"), "1 día / sem");
    assert.equal(normalizeFrecuencia("4 días / sem"), "4 días / sem");
  });

  it("resuelve objetivos y descarta fantasmas como Rendimiento", () => {
    assert.deepEqual(resolveObjetivos({ objetivos: "Fuerza|Velocidad" }), ["Fuerza", "Velocidad"]);
    assert.deepEqual(
      resolveObjetivos({ objetivo: "Fuerza", objetivoSecundario: "Prevención" }),
      ["Fuerza", "Prevención"],
    );
    assert.deepEqual(resolveObjetivos({ objective: "Resistencia" }), ["Resistencia"]);
    assert.deepEqual(resolveObjetivos({ objetivo: "Rendimiento" }), []);
    assert.deepEqual(filterCatalogObjetivos(["Rendimiento", "Fuerza", "Velocidad"]), ["Fuerza", "Velocidad"]);
  });

  it("resuelve edad desde age o edad", () => {
    assert.equal(resolveEdad({ age: 22 }), "22");
    assert.equal(resolveEdad({ edad: "19" }), "19");
  });

  it("resuelve teléfono desde phone o telefono", () => {
    assert.equal(resolvePhone({ phone: "600123123" }), "600123123");
    assert.equal(resolvePhone({ telefono: " 611222333 " }), "611222333");
    assert.equal(resolvePhone({}), "");
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

  it("mergeTrainingSources usa snapshot del motor si el user está vacío", () => {
    const plan = {
      profileSnapshot: trainingProfileSnapshotFromAny({
        edad: "25",
        phone: "600999888",
        frecuencia: "3",
        objetivos: ["Fuerza", "Velocidad"],
        deporte: "Fútbol",
        experiencia: "6–12 meses",
        material: ["Gomas"],
        disponibles: ["Lunes", "Miércoles", "Viernes"],
        diaCompeticion: "Fin de semana",
      }),
    };
    const merged = mergeTrainingSources({ objetivo: "Rendimiento" }, plan);
    assert.equal(merged.edad, "25");
    assert.equal(merged.phone, "600999888");
    assert.equal(merged.frecuencia, "3 días / sem");
    assert.deepEqual(merged.objetivos, ["Fuerza", "Velocidad"]);
    assert.equal(merged.deporte, "Fútbol");
  });

  it("mergeTrainingSources prioriza metadata del usuario si está completa", () => {
    const plan = {
      profileSnapshot: { edad: "18", frecuencia: "2", objetivos: ["Hipertrofia"] },
    };
    const merged = mergeTrainingSources({
      edad: "30",
      frecuencia: "4 días / sem",
      objetivos: ["Fuerza", "Prevención"],
    }, plan);
    assert.equal(merged.edad, "30");
    assert.equal(merged.frecuencia, "4 días / sem");
    assert.deepEqual(merged.objetivos, ["Fuerza", "Prevención"]);
  });

  it("trainingFieldsToAuthMetadata exporta forma lista para Supabase", () => {
    const meta = trainingFieldsToAuthMetadata({
      edad: 22,
      phone: "600111222",
      frecuencia: "3",
      objetivos: ["Fuerza", "Velocidad"],
      material: ["Mancuernas"],
      lesion: ["Ninguna"],
      disponibles: ["Lunes", "Jueves"],
    });
    assert.equal(meta.frecuencia, "3 días / sem");
    assert.equal(meta.phone, "600111222");
    assert.equal(meta.telefono, "600111222");
    assert.deepEqual(meta.objetivos, ["Fuerza", "Velocidad"]);
    assert.equal(meta.objetivo, "Fuerza");
    assert.equal(meta.objetivoSecundario, "Velocidad");
    assert.deepEqual(meta.lesion, []);
  });
});
