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
  estimate1RM,
  listLoggedExercises,
  getExerciseProgressDetail,
  getWeeklyLoadControl,
  getConditioningExerciseDetail,
  parseDistanceToKm,
  formatPace,
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

  it("estimate1RM usa Epley", () => {
    assert.equal(estimate1RM(80, 1), 80);
    assert.equal(estimate1RM(80, 6), 96);
    assert.equal(estimate1RM(0, 6), null);
  });

  it("getExerciseProgressDetail calcula última carga, récord y 1RM", () => {
    seedLogs([
      {
        id: "a",
        exerciseName: "Press banca con barra",
        tipoRegistro: "fuerza",
        recordedAt: "2026-10-12T10:00:00Z",
        series: [{ weight: "65", reps: "6" }, { weight: "65", reps: "6" }, { weight: "65", reps: "6" }, { weight: "65", reps: "6" }],
      },
      {
        id: "b",
        exerciseName: "Press banca con barra",
        tipoRegistro: "fuerza",
        recordedAt: "2026-10-19T10:00:00Z",
        series: [{ weight: "70", reps: "6" }, { weight: "70", reps: "6" }, { weight: "70", reps: "6" }, { weight: "70", reps: "6" }],
      },
      {
        id: "c",
        exerciseName: "Press banca con barra",
        tipoRegistro: "fuerza",
        recordedAt: "2026-10-26T10:00:00Z",
        series: [{ weight: "75", reps: "6" }, { weight: "75", reps: "6" }, { weight: "75", reps: "6" }, { weight: "75", reps: "6" }],
      },
      {
        id: "d",
        exerciseName: "Press banca con barra",
        tipoRegistro: "fuerza",
        recordedAt: "2026-11-02T10:00:00Z",
        series: [{ weight: "80", reps: "6" }, { weight: "80", reps: "6" }, { weight: "80", reps: "6" }, { weight: "80", reps: "6" }],
      },
    ]);
    const names = listLoggedExercises(USER);
    assert.equal(names[0].name, "Press banca con barra");
    const detail = getExerciseProgressDetail(USER, "Press banca con barra");
    assert.equal(detail.last.maxWeight, 80);
    assert.equal(detail.prev.maxWeight, 75);
    assert.equal(detail.deltaWeight, 5);
    assert.equal(detail.record.maxWeight, 80);
    assert.equal(detail.epley, 96);
    assert.equal(detail.sessions.length, 4);
  });

  it("getWeeklyLoadControl calcula ACWR descriptivo con ≥3 semanas", () => {
    const mondayOf = (iso) => {
      const d = new Date(`${iso}T12:00:00`);
      const day = d.getDay() || 7;
      d.setDate(d.getDate() - day + 1);
      return d.toISOString().slice(0, 10);
    };
    const addDays = (iso, days) => {
      const d = new Date(`${iso}T12:00:00`);
      d.setDate(d.getDate() + days);
      return d.toISOString().slice(0, 10);
    };
    const thisMon = mondayOf(new Date().toISOString().slice(0, 10));
    const weeks = [3, 2, 1, 0].map((i) => addDays(thisMon, -7 * i));
    const loads = [2000, 2500, 3000, 2400];
    seedLogs(weeks.map((week, i) => ({
      id: `w${i}`,
      exerciseName: "Sentadilla",
      tipoRegistro: "fuerza",
      sessionId: `s${i}`,
      recordedAt: `${week}T10:00:00.000Z`,
      series: [{ weight: String(loads[i]), reps: "1" }],
      rpe: "7",
      duration: "60",
    })));
    const control = getWeeklyLoadControl(USER, { weeks: 4 });
    assert.equal(control.current.units, 2400);
    assert.ok(control.acwr != null);
    assert.equal(control.acwrBand.label, "Óptima");
    assert.ok(control.distribution.some((d) => d.key === "fuerza" && d.units > 0));
  });
});

describe("condicionamiento por ejercicio", () => {
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

  it("parsea distancia y ritmo", () => {
    assert.equal(parseDistanceToKm("8 km"), 8);
    assert.equal(parseDistanceToKm("8000"), 8);
    assert.equal(parseDistanceToKm("400 m"), 0.4);
    assert.equal(formatPace(332), "5'32\"/km");
  });

  it("la resistencia de un ejercicio no mezcla otras sesiones", () => {
    seedLogs([
      { id: "a", exerciseName: "Carrera continua", tipoRegistro: "resistencia", recordedAt: "2026-10-20T10:00:00Z", distance: "6.4", time: "32:10", heartRate: "162", rpe: "8" },
      { id: "b", exerciseName: "Carrera continua", tipoRegistro: "resistencia", recordedAt: "2026-11-05T10:00:00Z", distance: "8", time: "44:16", heartRate: "157", rpe: "7" },
      { id: "c", exerciseName: "Intervalos 400 m", tipoRegistro: "resistencia", recordedAt: "2026-11-05T11:00:00Z", distance: "4", time: "16:00", heartRate: "175", rpe: "9" },
    ]);
    const detail = getConditioningExerciseDetail(USER, "Carrera continua", "resistencia", {
      weeks: 4,
      now: new Date("2026-11-07T12:00:00Z"),
    });
    assert.equal(detail.sessions.length, 2);
    assert.equal(detail.sessions.some((s) => s.distanceKm === 4), false);
    assert.equal(Math.round(detail.totals.distanceKm * 10) / 10, 14.4);
    assert.equal(formatPace(detail.sessions[0].paceSec), "5'32\"/km");
    assert.equal(detail.charts.distance.at(-1).value, 8);
  });

  it("en velocidad el tiempo baja cuando hay mejora y cada sprint va aparte", () => {
    seedLogs([
      { id: "s1", exerciseName: "Sprint 10 m", tipoRegistro: "velocidad", recordedAt: "2026-11-01T10:00:00Z", time: "2.30", reps: "4", rest: "90 s", heartRate: "160" },
      { id: "s2", exerciseName: "Sprint 10 m", tipoRegistro: "velocidad", recordedAt: "2026-11-06T10:00:00Z", time: "2.08", reps: "5", rest: "90 s", heartRate: "155" },
      { id: "s3", exerciseName: "Sprint 20 m", tipoRegistro: "velocidad", recordedAt: "2026-11-06T10:05:00Z", time: "3.40", reps: "3", rest: "2 min" },
    ]);
    const detail = getConditioningExerciseDetail(USER, "Sprint 10 m", "velocidad", {
      weeks: 4,
      now: new Date("2026-11-07T12:00:00Z"),
    });
    assert.equal(detail.sessions.length, 2);
    assert.equal(detail.best.timeSec, 2.08);
    assert.equal(detail.charts.time[0].value, 2.3);
    assert.equal(detail.charts.time.at(-1).value, 2.08);
    assert.ok(detail.charts.time.at(-1).value < detail.charts.time[0].value);
    assert.equal(detail.last.reps, 5);
    assert.equal(detail.last.rest, "90 s");
    const other = getConditioningExerciseDetail(USER, "Sprint 20 m", "velocidad", {
      weeks: 4,
      now: new Date("2026-11-07T12:00:00Z"),
    });
    assert.equal(other.sessions.length, 1);
    assert.equal(other.best.timeSec, 3.4);
  });
});
