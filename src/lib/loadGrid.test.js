import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mesoWeekIndex, exerciseKey, buildLoadGrid, loadGridToCsv, sessionIndexFromLog } from "./loadGrid.js";

describe("loadGrid", () => {
  it("calcula S1–S4 desde la fecha de inicio del mesociclo", () => {
    assert.equal(mesoWeekIndex("2026-09-03T10:00:00.000Z", "2026-09-01", "", null), 1);
    assert.equal(mesoWeekIndex("2026-09-10T10:00:00.000Z", "2026-09-01", "", null), 2);
    assert.equal(mesoWeekIndex(null, null, "Semana 3", null), 3);
    assert.equal(mesoWeekIndex(null, null, "", 4), 4);
  });

  it("agrupa por catalogId para no perder el ejercicio si cambia el instance id", () => {
    assert.equal(exerciseKey({ catalogId: 44, exerciseId: "v2_44_99" }), "c:44");
    assert.equal(exerciseKey({ exerciseId: "v2_12_3", exerciseName: "Press" }), "c:12");
  });

  it("construye filas de fuerza con % vs semana 1 y CSV", () => {
    const orig = globalThis.localStorage;
    const store = {};
    globalThis.localStorage = {
      getItem: (k) => store[k] ?? null,
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; },
    };
    store.depro_load_logs_u1 = JSON.stringify([
      {
        id: "a",
        exerciseName: "Extensión de cuádriceps",
        catalogId: 7,
        tipoRegistro: "fuerza",
        weekNumber: 1,
        series: [{ weight: "40", reps: "10" }, { weight: "40", reps: "8" }],
        recordedAt: "2026-09-02T10:00:00.000Z",
        sessionId: "s1",
        sessionTitle: "Fuerza A",
      },
      {
        id: "b",
        exerciseName: "Extensión de cuádriceps",
        catalogId: 7,
        tipoRegistro: "fuerza",
        weekNumber: 2,
        series: [{ weight: "45", reps: "10" }],
        recordedAt: "2026-09-09T10:00:00.000Z",
        sessionId: "s2",
        sessionTitle: "Fuerza A",
      },
    ]);
    const grid = buildLoadGrid("u1", "fuerza", { startDate: "2026-09-01" });
    assert.equal(grid.rows.length, 1);
    assert.equal(grid.rows[0].cells[1].maxWeight, 40);
    assert.equal(grid.rows[0].cells[2].maxWeight, 45);
    assert.equal(grid.rows[0].cells[2].tone, "positive");
    assert.ok(grid.rows[0].pctFromS1 > 0);
    assert.ok(grid.sessionTotals.length >= 1);
    const csv = loadGridToCsv(grid, "fuerza");
    assert.match(csv, /Extensión/);
    assert.match(csv, /45/);
    globalThis.localStorage = orig;
  });

  it("agrupa gráficos por sesión y compara semanas", () => {
    assert.equal(sessionIndexFromLog({ sessionNumber: 2 }), 2);
    assert.equal(sessionIndexFromLog({ sessionTitle: "Sesión 3 · Fuerza" }), 3);
    const orig = globalThis.localStorage;
    const store = {};
    globalThis.localStorage = {
      getItem: (k) => store[k] ?? null,
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; },
    };
    store.depro_load_logs_u2 = JSON.stringify([
      {
        id: "s1w1",
        exerciseName: "Sentadilla",
        catalogId: 1,
        tipoRegistro: "fuerza",
        weekNumber: 1,
        sessionNumber: 1,
        sessionTitle: "Sesión 1",
        series: [{ weight: "80", reps: "5" }],
        recordedAt: "2026-10-01T10:00:00.000Z",
      },
      {
        id: "s1w2",
        exerciseName: "Sentadilla",
        catalogId: 1,
        tipoRegistro: "fuerza",
        weekNumber: 2,
        sessionNumber: 1,
        sessionTitle: "Sesión 1",
        series: [{ weight: "85", reps: "5" }],
        recordedAt: "2026-10-08T10:00:00.000Z",
      },
      {
        id: "s2w1",
        exerciseName: "Press banca",
        catalogId: 2,
        tipoRegistro: "fuerza",
        weekNumber: 1,
        sessionNumber: 2,
        sessionTitle: "Sesión 2",
        series: [{ weight: "60", reps: "5" }],
        recordedAt: "2026-10-02T10:00:00.000Z",
      },
    ]);
    const grid = buildLoadGrid("u2", "fuerza", { startDate: "2026-10-01" });
    assert.ok(grid.sessions.length >= 2);
    const s1 = grid.sessions.find((s) => s.sessionNumber === 1);
    assert.ok(s1);
    assert.equal(s1.rows.length, 1);
    assert.equal(s1.rows[0].cells[1].maxWeight, 80);
    assert.equal(s1.rows[0].cells[2].maxWeight, 85);
    const s2 = grid.sessions.find((s) => s.sessionNumber === 2);
    assert.ok(s2);
    assert.equal(s2.rows[0].name, "Press banca");
    globalThis.localStorage = orig;
  });
});
