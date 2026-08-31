import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalizePlayerPlan, weekDaysFromPlan } from "./playerPlanStorage.js";

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

  it("conserva startDate al normalizar weeks", () => {
    const payload = {
      startDate: "2026-08-17",
      weeks: [
        {
          week: 1,
          days: [{ day: "Lunes", sessions: [{ id: "a", type: "Fuerza" }] }],
        },
      ],
    };
    const out = normalizePlayerPlan(payload);
    assert.equal(out.startDate, "2026-08-17");
  });
});

describe("weekDaysFromPlan", () => {
  it("nunca devuelve un objeto suelto (evita pantalla en blanco en admin)", () => {
    const empty = weekDaysFromPlan({ premiumPending: true });
    assert.equal(Array.isArray(empty), true);
    assert.equal(empty.length, 7);
    const fromDays = weekDaysFromPlan({ days: [{ day: "Lunes", sessions: [] }] });
    assert.equal(fromDays[0].day, "Lunes");
  });
});
