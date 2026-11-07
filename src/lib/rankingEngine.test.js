import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  RANKING_POINTS,
  scoreSources,
  computeStreak,
  medalsForStreak,
  buildRankingBoard,
  positionHint,
  formatRecordValue,
} from "./rankingEngine.js";

const NOW = new Date("2026-11-07T12:00:00");

function plan({ start = "2026-11-02", weeks = 4, days = ["Lunes", "Jueves"], done = [] } = {}) {
  const weekArr = [];
  for (let w = 1; w <= weeks; w += 1) {
    const dayObjs = days.map((day) => {
      const id = `${day}_w${w}`;
      return {
        day,
        sessions: [{
          id,
          dayName: day,
          weekNumber: w,
          status: done.includes(id) ? "completed" : "pending",
          blocks: [{ exercises: [{ id: "e1" }] }],
        }],
      };
    });
    weekArr.push({
      week: w,
      days: dayObjs,
      sessions: dayObjs.flatMap((d) => d.sessions),
    });
  }
  return { startDate: start, weeks: weekArr };
}

describe("rankingEngine", () => {
  it("suma sesiones y la semana completa, y no arrastra el mes anterior", () => {
    const sources = {
      plan: plan({
        start: "2026-10-05",
        weeks: 6,
        done: ["Lunes_w1", "Jueves_w1", "Lunes_w5", "Jueves_w5"],
      }),
    };
    const november = scoreSources(sources, { mode: "monthly", anchorDate: NOW, now: NOW });
    assert.equal(november.sessionCount, 2);
    assert.equal(november.perfectWeeks, 1);
    assert.equal(november.points, 2 * RANKING_POINTS.session + RANKING_POINTS.perfectWeek);

    const october = scoreSources(sources, {
      mode: "monthly",
      anchorDate: new Date("2026-10-15T12:00:00"),
      now: NOW,
    });
    assert.equal(october.sessionCount, 2);
    assert.equal(october.points, 2 * RANKING_POINTS.session + RANKING_POINTS.perfectWeek);
    assert.notEqual(october.window.label, november.window.label);
  });

  it("cuenta la sesión si el jugador la registra, aunque no esté marcada a mano", () => {
    const sources = {
      plan: plan({ done: [] }),
      loadLogs: [{
        sessionId: "Lunes_w1",
        recordedAt: "2026-11-02T18:00:00.000Z",
        tipoRegistro: "fuerza",
        exerciseName: "Sentadilla",
        weight: "100",
        reps: "5",
      }],
    };
    const score = scoreSources(sources, { mode: "monthly", anchorDate: NOW, now: NOW });
    assert.equal(score.sessionCount, 1);
    assert.equal(score.points, RANKING_POINTS.session + RANKING_POINTS.record);
    assert.equal(score.records.fuerza.value, "100 kg");
    assert.equal(score.records.fuerza.label, "Sentadilla");
  });

  it("premia mejorar la marca y no premia un tiempo de velocidad peor", () => {
    const sources = {
      plan: plan({ done: ["Lunes_w1"] }),
      loadLogs: [
        { recordedAt: "2026-10-02T10:00:00.000Z", tipoRegistro: "fuerza", exerciseName: "Press banca", weight: "80", reps: "5" },
        { recordedAt: "2026-11-03T10:00:00.000Z", tipoRegistro: "fuerza", exerciseName: "Press banca", weight: "90", reps: "5" },
        { recordedAt: "2026-10-02T10:00:00.000Z", tipoRegistro: "velocidad", exerciseName: "Sprint 10 m", time: "2.10" },
        { recordedAt: "2026-11-04T10:00:00.000Z", tipoRegistro: "velocidad", exerciseName: "Sprint 10 m", time: "2.30" },
      ],
    };
    const score = scoreSources(sources, { mode: "monthly", anchorDate: NOW, now: NOW });
    assert.equal(score.records.fuerza.improved, true);
    assert.equal(score.records.velocidad.improved, false);
    assert.equal(score.records.velocidad.value, "2,10 s");
    assert.equal(score.breakdown.records, RANKING_POINTS.record);
  });

  it("la racha exige semanas completas y no se rompe a mitad de la semana en curso", () => {
    const later = new Date("2026-11-20T12:00:00");
    const done = ["Lunes_w1", "Jueves_w1", "Lunes_w2", "Jueves_w2", "Lunes_w3"];
    const sources = { plan: plan({ done }) };
    const score = scoreSources(sources, { mode: "monthly", anchorDate: later, now: later });
    assert.equal(score.streak, 2);
    assert.deepEqual(score.medals.map((m) => m.unlocked), [true, true, false, false]);
  });

  it("desbloquea la medalla de 8 semanas", () => {
    const map = {};
    const start = new Date("2026-09-14T12:00:00");
    for (let i = 1; i <= 8; i += 1) {
      const d = new Date(start);
      d.setDate(d.getDate() + (8 - i) * 7);
      const key = d.toISOString().slice(0, 10);
      map[key] = { scheduled: 2, completed: 2 };
    }
    const streak = computeStreak(map, new Date("2026-11-07T12:00:00"));
    assert.equal(streak, 8);
    assert.equal(medalsForStreak(streak).every((m) => m.unlocked), true);
  });

  it("dice cuántos puntos faltan para superar al siguiente", () => {
    const me = { id: "me", name: "Jose M.", mine: true, sources: { plan: plan({ done: ["Lunes_w1"] }) } };
    const rival = {
      id: "rival",
      name: "Marcos R.",
      sources: { plan: plan({ done: ["Lunes_w1", "Jueves_w1", "Lunes_w2", "Jueves_w2"] }) },
    };
    const board = buildRankingBoard({
      people: [me, rival],
      mode: "monthly",
      anchorDate: NOW,
      now: NOW,
    });
    assert.equal(board.mine.rank, 2);
    assert.ok(board.mine.gap > 0);
    assert.match(positionHint(board.mine, board.ranked.length), /Te faltan .+ pts para superar a Marcos R\./);
    assert.equal(board.reliableEvolution, true);
  });

  it("formatea tiempos largos de resistencia", () => {
    assert.equal(formatRecordValue({ kind: "time", value: 268, higher: false }), "4'28\"");
    assert.equal(formatRecordValue({ kind: "distance", value: 4000, higher: true }), "4 km");
  });
});
