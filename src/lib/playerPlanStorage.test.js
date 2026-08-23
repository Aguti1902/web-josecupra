import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalizePlayerPlan } from "./playerPlanStorage.js";

describe("normalizePlayerPlan", () => {
  it("deja pasar día-array intacto", () => {
    const days = [
      { day: "Lunes", sessions: [{ id: "s1", title: "Fuerza" }] },
      { day: "Martes", sessions: [] },
    ];
    const out = normalizePlayerPlan(days);
    assert.equal(out[0].day, "Lunes");
    assert.equal(out[0].sessions[0].title, "Fuerza");
  });

  it("convierte weeks del motor a día-array usable", () => {
    const payload = {
      source: "admin_manual",
      assignedTo: "u1",
      assignment: { assignedAt: "2026-01-01" },
      weeks: [
        {
          week: 1,
          days: [
            { day: "Lunes", sessions: [{ id: "a", type: "Fuerza" }] },
            { day: "Miércoles", sessions: [{ id: "b", type: "Velocidad" }] },
          ],
        },
        {
          week: 2,
          days: [{ day: "Lunes", sessions: [{ id: "c", type: "Resistencia" }] }],
        },
      ],
    };
    const out = normalizePlayerPlan(payload);
    assert.ok(Array.isArray(out));
    assert.equal(out[0].day, "Lunes");
    assert.equal(out[0].sessions[0].type, "Fuerza");
    assert.equal(out.source, "admin_manual");
    assert.equal(out.assignedTo, "u1");
    assert.equal(out.premiumPending, false);
    assert.equal(out.weeks.length, 2);
  });

  it("no rompe premiumPending", () => {
    const pending = { premiumPending: true, planPendingManual: true, sessions: [] };
    assert.deepEqual(normalizePlayerPlan(pending), pending);
  });
});
