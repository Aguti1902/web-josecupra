import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  resolveMatrixSessionTypes,
  resolveUserObjectives,
  MATRIX_UNDEFINED_PREFIX,
  PRIMARY_ONLY_MATRIX,
  buildWeekSessionList,
} from "./objectiveSessionMatrix.js";

describe("objectiveSessionMatrix", () => {
  it("Resistencia + Prevención, 3 días → incluye Prevención", () => {
    const { sessionTypes, error } = resolveMatrixSessionTypes("Resistencia", "Prevención", "3 días / sem");
    assert.ifError(error);
    assert.equal(sessionTypes.length, 3);
    assert.ok(sessionTypes.some((s) => s === "Prevención" || s.startsWith("Resistencia")));
  });

  it("Fuerza solo (sin secundario), 3 días → A + B + FULL", () => {
    const { sessionTypes, error } = resolveMatrixSessionTypes("Fuerza", null, 3);
    assert.ifError(error);
    assert.deepEqual(sessionTypes, ["Fuerza Inferior", "Fuerza Superior", "Fuerza Full"]);
  });

  it("Fuerza solo con objetivoSecundario obsoleto → ignora si objetivos.length === 1", () => {
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

  it("Frecuencia 1 + secundario → incrusta (no bloquea)", () => {
    const { error, sessionTypes, embedSecondary } = buildWeekSessionList("Fuerza", "Velocidad", 1);
    assert.ifError(error);
    assert.deepEqual(sessionTypes, ["Fuerza Full"]);
    assert.equal(embedSecondary, true);
  });

  it("Combinación inexistente → error explícito", () => {
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
