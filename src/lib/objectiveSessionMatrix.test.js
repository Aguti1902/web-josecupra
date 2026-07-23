import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  resolveMatrixSessionTypes,
  resolveUserObjectives,
  SECONDARY_BLOCKED_FREQ1_MESSAGE,
  MATRIX_UNDEFINED_PREFIX,
  PRIMARY_ONLY_MATRIX,
} from "./objectiveSessionMatrix.js";

describe("objectiveSessionMatrix", () => {
  it("Resistencia + Prevención, 3 días → incluye Prevención en la secuencia", () => {
    const { sessionTypes, error } = resolveMatrixSessionTypes("Resistencia", "Prevención", "3 días / sem");
    assert.ifError(error);
    assert.deepEqual(sessionTypes, [
      "Resistencia aeróbica",
      "Prevención",
      "Resistencia umbral",
    ]);
    assert.ok(sessionTypes.some((s) => s === "Prevención"), "Prevención debe aparecer");
  });

  it("Fuerza solo (sin secundario), 3 días → fila solo principal, sin Velocidad", () => {
    const { sessionTypes, error } = resolveMatrixSessionTypes("Fuerza", null, 3);
    assert.ifError(error);
    assert.deepEqual(sessionTypes, PRIMARY_ONLY_MATRIX.fuerza.slice(0, 3));
    assert.ok(!sessionTypes.includes("Velocidad"), "No debe inyectar Velocidad");
  });

  it("Fuerza solo con objetivoSecundario obsoleto en perfil → ignora secundario si objetivos.length === 1", () => {
    const { secondary } = resolveUserObjectives({
      objetivo: "Fuerza",
      objetivoSecundario: "Velocidad",
      objetivos: ["Fuerza"],
      frecuencia: "3 días / sem",
    });
    assert.equal(secondary, null);

    const { sessionTypes } = resolveMatrixSessionTypes("Fuerza", secondary, 3);
    assert.deepEqual(sessionTypes, PRIMARY_ONLY_MATRIX.fuerza.slice(0, 3));
  });

  it("Frecuencia 1 + secundario → bloquea con mensaje de negocio", () => {
    const { error, sessionTypes } = resolveMatrixSessionTypes("Fuerza", "Velocidad", 1);
    assert.equal(sessionTypes, undefined);
    assert.equal(error, SECONDARY_BLOCKED_FREQ1_MESSAGE);
  });

  it("Combinación inexistente → error explícito, sin sesiones", () => {
    const { error, sessionTypes } = resolveMatrixSessionTypes("ObjetivoInventado", null, 3);
    assert.match(error, new RegExp(MATRIX_UNDEFINED_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.equal(sessionTypes, undefined);
  });

  it("Mismos inputs → mismo output (determinismo)", () => {
    const a = resolveMatrixSessionTypes("Hipertrofia", "Movilidad", 4);
    const b = resolveMatrixSessionTypes("Hipertrofia", "Movilidad", 4);
    assert.deepEqual(a.sessionTypes, b.sessionTypes);
  });
});
