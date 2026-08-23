import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  selectMainTask,
  selectGeneralWarmup,
  sessionTypeForProtocol,
  ageBlockForNivel,
} from "./clubAutoTaskSelector.js";
import { CLUB_GENERAL_WARMUPS, CLUB_MAIN_TASKS } from "../../data/clubAutoCatalog.js";
import { selectProtocolExercises } from "./clubAutoProtocolSelector.js";

describe("clubAutoTaskSelector · filtros Depro 2.0", () => {
  it("mapea protocolo A/B/C a tipo de sesión", () => {
    assert.equal(sessionTypeForProtocol("A"), "extensiva");
    assert.equal(sessionTypeForProtocol("B"), "intensiva");
    assert.equal(sessionTypeForProtocol("C"), "reactiva");
  });

  it("mapea nivel a bloque de edad", () => {
    assert.equal(ageBlockForNivel("A"), "1");
    assert.equal(ageBlockForNivel("B"), "2");
    assert.equal(ageBlockForNivel("C"), "3");
  });

  it("elige calentamiento sin balón del pool YouTube", () => {
    const w = selectGeneralWarmup({ seed: "test-warmup" });
    assert.ok(w);
    assert.ok(CLUB_GENERAL_WARMUPS.some((x) => x.id === w.id));
    assert.ok(String(w.carpeta).includes("sin_balon"));
    assert.ok(w.videoUrl || w.video);
  });

  it("filtra tarea por bloque y tipo de sesión", () => {
    const task = selectMainTask({ nivel: "B", protocolo: "B", seed: "filtros" });
    assert.ok(task);
    assert.equal(task.tipo_sesion, "intensiva");
    assert.ok(task.bloques_edad.map(String).includes("2"));
    assert.equal(CLUB_MAIN_TASKS.length, 45);
  });
});

describe("clubAutoProtocolSelector · sin huecos vacíos", () => {
  it("no inserta placeholders missing", () => {
    const { exercises } = selectProtocolExercises({
      protocolo: "A",
      gymAccess: false,
      seed: "proto-test",
    });
    assert.ok(exercises.every((ex) => !ex.missing));
    assert.ok(exercises.every((ex) => ex.catalogId));
  });
});
