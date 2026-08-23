import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getSessionBlocks } from "./sessionBlocks.js";
import { exercisesFromClubAuto, isClubAutoStructureSession } from "./sessionPdfClubAuto.js";

describe("sessionPdfClubAuto", () => {
  const session = {
    engine: "club_auto",
    structure: [
      { type: "calentamiento_general", item: { nombre: "Movilidad general" } },
      { type: "calentamiento_balon", item: { nombre: "Rondo activación" } },
      {
        type: "protocolo",
        exercises: [
          { nombre: "Ejercicio protocolo 1", slot: "slot_1" },
          { nombre: "Ejercicio protocolo 2", slot: "slot_2" },
          { nombre: "Ejercicio protocolo 3", slot: "slot_3" },
        ],
      },
    ],
    exercises: [
      { name: "Ejercicio protocolo 1" },
      { name: "Ejercicio protocolo 2" },
      { name: "Ejercicio protocolo 3" },
    ],
  };

  it("detecta sesiones club_auto por structure[]", () => {
    assert.equal(isClubAutoStructureSession(session), true);
    assert.equal(isClubAutoStructureSession({ blocks: [{ type: "calentamiento", exercises: [] }] }), false);
  });

  it("getSessionBlocks reparte mal exercises[] sin blockType (causa raíz del bug PDF)", () => {
    const warm = getSessionBlocks(session).find((b) => b.type === "calentamiento");
    assert.deepEqual(warm.exercises.map((ex) => ex.name), [
      "Ejercicio protocolo 1",
      "Ejercicio protocolo 2",
    ]);
  });

  it("exercisesFromClubAuto mapea calentamiento vs protocolo correctamente", () => {
    const { warm, main } = exercisesFromClubAuto(session);
    assert.equal(warm.length, 2);
    assert.ok(warm.some((ex) => ex.name === "Movilidad general"));
    assert.ok(warm.some((ex) => ex.name === "Rondo activación"));
    assert.equal(main.length, 3);
    assert.ok(main.every((ex) => ex.name.includes("protocolo")));
  });
});
