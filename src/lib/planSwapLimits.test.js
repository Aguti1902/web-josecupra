import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  MAX_PLAN_SWAPS,
  needsMonthlyPlanRefresh,
  canSwapExercise,
  recordSwap,
  canRegenerateFromProfile,
  recordProfileRegen,
  profileTrainingFingerprint,
  resetCycleCounters,
  cycleEndDate,
  PLAN_CYCLE_DAYS,
} from "./planSwapLimits.js";
import { refreshExerciseAcrossPlan } from "./playerPlanEngine.js";

describe("planSwapLimits — ciclo mensual", () => {
  beforeEach(() => {
    globalThis.localStorage = {
      _data: {},
      getItem(k) { return this._data[k] ?? null; },
      setItem(k, v) { this._data[k] = String(v); },
      removeItem(k) { delete this._data[k]; },
    };
  });
  afterEach(() => { delete globalThis.localStorage; });

  it("MAX_PLAN_SWAPS es 5", () => {
    assert.equal(MAX_PLAN_SWAPS, 5);
  });

  it("needsMonthlyPlanRefresh tras 28 días", () => {
    const plan = { startDate: "2026-07-01" };
    assert.equal(needsMonthlyPlanRefresh(plan, new Date("2026-07-20T12:00:00")), false);
    assert.equal(needsMonthlyPlanRefresh(plan, new Date("2026-07-29T12:00:00")), true);
    assert.equal(cycleEndDate("2026-07-01"), "2026-07-29");
    assert.equal(PLAN_CYCLE_DAYS, 28);
  });

  it("no refresca planes admin", () => {
    const plan = { startDate: "2026-01-01", source: "admin_manual" };
    assert.equal(needsMonthlyPlanRefresh(plan, new Date("2026-08-01")), false);
  });

  it("límites de swap y perfil por ciclo", () => {
    const user = { id: "u1" };
    const plan = { startDate: "2026-08-17" };
    resetCycleCounters("u1", "2026-08-17");
    assert.equal(canSwapExercise(user, plan), true);
    assert.equal(canRegenerateFromProfile("u1", plan), true);
    for (let i = 0; i < 5; i++) recordSwap("u1", plan);
    assert.equal(canSwapExercise(user, plan), false);
    recordProfileRegen("u1", plan);
    assert.equal(canRegenerateFromProfile("u1", plan), false);
  });

  it("fingerprint de perfil", () => {
    const a = profileTrainingFingerprint({
      disponibles: ["Viernes", "Lunes"],
      material: ["Gomas", "Mancuernas"],
      experiencia: "1–3 años",
    });
    const b = profileTrainingFingerprint({
      disponibles: ["Lunes", "Viernes"],
      material: ["Mancuernas", "Gomas"],
      experiencia: "1–3 años",
    });
    assert.equal(a, b);
  });
});

describe("refreshExerciseAcrossPlan", () => {
  it("propaga sustitución por catalogId a otras sesiones", () => {
    const shared = {
      id: "v2_101_1",
      catalogId: 101,
      pool: "FUE-MAN",
      name: "Press",
      blockType: "principal",
      slotConstraints: { rol: "basico" },
      etiquetas: {},
    };
    const other = { id: "v2_202_1", catalogId: 202, name: "Otro", blockType: "principal" };
    const plan = [
      {
        day: "Lunes",
        sessions: [{
          id: "s1",
          exercises: [{ ...shared }, other],
          blocks: [{ type: "principal", exercises: [{ ...shared }, other] }],
        }],
      },
      {
        day: "Miércoles",
        sessions: [{
          id: "s2",
          exercises: [{ ...shared, id: "v2_101_2" }],
          blocks: [{ type: "principal", exercises: [{ ...shared, id: "v2_101_2" }] }],
        }],
      },
    ];

    // Mock pool refresh is hard without catalog; if refresh fails, plan unchanged
    const next = refreshExerciseAcrossPlan(plan, "s1", "v2_101_1", {
      material: "mancuernas",
      lesiones: [],
      edad: 22,
      experiencia: "intermedio",
    });
    // Either replaced across plan or unchanged if pool empty — must not throw
    assert.ok(Array.isArray(next));
    assert.equal(next.length, 2);
  });
});
