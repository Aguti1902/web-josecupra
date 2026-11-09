import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { findLatestLoadLog, saveLoadLog } from "./loadLogs.js";
import { getExerciseProgressDetail, getConditioningExerciseDetail } from "./loadAnalytics.js";

function withStore(fn) {
  const orig = globalThis.localStorage;
  const store = {};
  globalThis.localStorage = {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
  };
  try {
    return fn();
  } finally {
    globalThis.localStorage = orig;
  }
}

describe("registros por entreno", () => {
  it("no copia el registro de la semana 1 al abrir la semana 2", () => {
    withStore(() => {
      saveLoadLog("u1", {
        exerciseId: "v2_7_0",
        catalogId: 7,
        exerciseName: "Sentadilla",
        sessionId: "w0_fuerza",
        weekNumber: 1,
        tipoRegistro: "fuerza",
        series: [{ weight: "80", reps: "5" }],
      });
      const week2 = findLatestLoadLog("u1", {
        exerciseId: "v2_7_0",
        catalogId: 7,
        exerciseName: "Sentadilla",
        sessionId: "w1_fuerza",
        weekNumber: 2,
      });
      assert.equal(week2, null);
      const same = findLatestLoadLog("u1", {
        exerciseId: "v2_7_0",
        catalogId: 7,
        exerciseName: "Sentadilla",
        sessionId: "w0_fuerza",
        weekNumber: 1,
      });
      assert.equal(same.series[0].weight, "80");
    });
  });

  it("cada entreno de fuerza, velocidad y resistencia es un registro nuevo", () => {
    withStore(() => {
      saveLoadLog("u1", {
        exerciseName: "Sentadilla",
        catalogId: 1,
        exerciseId: "ex_sq",
        sessionId: "s_w1",
        weekNumber: 1,
        tipoRegistro: "fuerza",
        recordedAt: "2026-11-02T10:00:00.000Z",
        series: [{ weight: "80", reps: "5" }],
      });
      saveLoadLog("u1", {
        exerciseName: "Sentadilla",
        catalogId: 1,
        exerciseId: "ex_sq",
        sessionId: "s_w2",
        weekNumber: 2,
        tipoRegistro: "fuerza",
        recordedAt: "2026-11-09T10:00:00.000Z",
        series: [{ weight: "85", reps: "5" }],
      });
      saveLoadLog("u1", {
        exerciseName: "Sentadilla",
        catalogId: 1,
        exerciseId: "ex_sq",
        sessionId: "s_w2",
        weekNumber: 2,
        tipoRegistro: "fuerza",
        series: [{ weight: "86", reps: "5" }],
      });
      const fuerza = getExerciseProgressDetail("u1", "Sentadilla");
      assert.equal(fuerza.sessions.length, 2);
      assert.equal(fuerza.deltaWeight, 6);

      saveLoadLog("u1", {
        exerciseName: "Sprint 10 m",
        exerciseId: "sp10",
        sessionId: "v1",
        weekNumber: 1,
        tipoRegistro: "velocidad",
        time: "2.20",
      });
      saveLoadLog("u1", {
        exerciseName: "Sprint 10 m",
        exerciseId: "sp10",
        sessionId: "v2",
        weekNumber: 2,
        tipoRegistro: "velocidad",
        time: "2.08",
      });
      const vel = getConditioningExerciseDetail("u1", "Sprint 10 m", "velocidad", { weeks: 0 });
      assert.equal(vel.chrono.length, 2);

      saveLoadLog("u1", {
        exerciseName: "Carrera continua",
        exerciseId: "cc",
        sessionId: "r1",
        weekNumber: 1,
        tipoRegistro: "resistencia",
        distance: "5 km",
        time: "25:00",
      });
      const copied = findLatestLoadLog("u1", {
        exerciseName: "Carrera continua",
        exerciseId: "cc",
        sessionId: "r2",
        weekNumber: 2,
      });
      assert.equal(copied, null);
    });
  });
});
