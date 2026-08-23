/**
 * Tests: mejoras prácticas de cargas (fuerza %, tiempo/FC).
 */
import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  parseTimeToSeconds,
  pctChange,
  extractFuerzaSnapshot,
  classifyTimeHrImprovement,
  getFuerzaExerciseProgress,
  getTimeHrExerciseProgress,
} from "./loadAnalytics.js";
import { loadLogsKey } from "./loadLogs.js";

const USER = "test_cargas_mejoras";

function seedLogs(entries) {
  localStorage.setItem(loadLogsKey(USER), JSON.stringify(entries));
}

describe("loadAnalytics — mejoras prácticas", () => {
  beforeEach(() => {
    globalThis.localStorage = {
      _data: {},
      getItem(k) { return this._data[k] ?? null; },
      setItem(k, v) { this._data[k] = String(v); },
      removeItem(k) { delete this._data[k]; },
    };
  });
  afterEach(() => {
    delete globalThis.localStorage;
  });

  it("parseTimeToSeconds entiende formatos habituales", () => {
    assert.equal(parseTimeToSeconds("1.85 s"), 1.85);
    assert.equal(parseTimeToSeconds("1:25"), 85);
    assert.equal(parseTimeToSeconds("3'20\""), 200);
    assert.equal(parseTimeToSeconds("90"), 90);
  });

  it("pctChange calcula porcentaje", () => {
    assert.equal(pctChange(80, 88), 10);
    assert.equal(pctChange(100, 90), -10);
    assert.equal(pctChange(0, 10), null);
  });

  it("extractFuerzaSnapshot usa series y coge el peso máximo", () => {
    const snap = extractFuerzaSnapshot({
      series: [
        { weight: "80", reps: "5" },
        { weight: "85", reps: "3" },
        { weight: "82", reps: "4" },
      ],
      recordedAt: "2026-08-01T10:00:00Z",
    });
    assert.equal(snap.maxWeight, 85);
    assert.equal(snap.repsAtMax, 3);
    assert.equal(snap.totalReps, 12);
  });

  it("classifyTimeHrImprovement: tiempo no mejora pero FC sí", () => {
    const r = classifyTimeHrImprovement(
      { timeSec: 60, heartRate: 170 },
      { timeSec: 62, heartRate: 158 },
    );
    assert.equal(r.verdict, "peor_tiempo_mejor_fc");
    assert.equal(r.tone, "positive");
    assert.ok(r.hrPctBetter > 0);
    assert.ok(r.timePctBetter < 0);
  });

  it("classifyTimeHrImprovement: más rápido y menos FC", () => {
    const r = classifyTimeHrImprovement(
      { timeSec: 12, heartRate: 180 },
      { timeSec: 11, heartRate: 170 },
    );
    assert.equal(r.verdict, "tiempo_y_fc");
    assert.equal(r.tone, "positive");
  });

  it("getFuerzaExerciseProgress detecta % de peso entre sesiones", () => {
    seedLogs([
      {
        id: "2",
        exerciseName: "Press banca",
        tipoRegistro: "fuerza",
        recordedAt: "2026-08-20T10:00:00Z",
        series: [{ weight: "88", reps: "5" }],
      },
      {
        id: "1",
        exerciseName: "Press banca",
        tipoRegistro: "fuerza",
        recordedAt: "2026-08-10T10:00:00Z",
        series: [{ weight: "80", reps: "5" }],
      },
    ]);
    const rows = getFuerzaExerciseProgress(USER);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].exerciseName, "Press banca");
    assert.equal(rows[0].primary.metric, "peso");
    assert.equal(rows[0].primary.pct, 10);
    assert.equal(rows[0].tone, "positive");
  });

  it("getTimeHrExerciseProgress marca eficiencia con FC a la baja", () => {
    seedLogs([
      {
        id: "b",
        exerciseName: "Sprint 20m",
        tipoRegistro: "velocidad",
        recordedAt: "2026-08-21T10:00:00Z",
        time: "3.20 s",
        heartRate: "160",
      },
      {
        id: "a",
        exerciseName: "Sprint 20m",
        tipoRegistro: "velocidad",
        recordedAt: "2026-08-14T10:00:00Z",
        time: "3.20 s",
        heartRate: "172",
      },
    ]);
    const rows = getTimeHrExerciseProgress(USER, "velocidad");
    assert.equal(rows.length, 1);
    assert.equal(rows[0].verdict, "misma_eficiencia");
    assert.equal(rows[0].tone, "positive");
  });
});
