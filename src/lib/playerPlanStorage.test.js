import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalizePlayerPlan, weekDaysFromPlan, toPersistablePlan, savePlayerPlan, loadPlayerPlan } from "./playerPlanStorage.js";

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

describe("toPersistablePlan", () => {
  it("no pierde weeks al serializar un día-array con meta", () => {
    const days = [
      { day: "Lunes", sessions: [{ id: "s1", exercises: [{ id: "v2_1_0", catalogId: 1, name: "Press" }] }] },
    ];
    days.weeks = [
      { week: 1, days, sessions: days[0].sessions },
      { week: 2, days, sessions: days[0].sessions },
    ];
    days.startDate = "2026-09-01";
    const payload = toPersistablePlan(days);
    assert.equal(payload.weeks.length, 2);
    assert.equal(payload.startDate, "2026-09-01");
    const json = JSON.parse(JSON.stringify(payload));
    const view = normalizePlayerPlan(json);
    assert.equal(view.weeks.length, 2);
    assert.equal(view.startDate, "2026-09-01");
  });

  it("save/load roundtrip conserva el mesociclo", () => {
    const orig = globalThis.localStorage;
    const store = {};
    globalThis.localStorage = {
      getItem: (k) => store[k] ?? null,
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; },
    };
    const days = [{ day: "Lunes", sessions: [{ id: "s1", title: "Fuerza" }] }];
    days.weeks = [{ week: 1, days }, { week: 2, days }, { week: 3, days }, { week: 4, days }];
    days.startDate = "2026-09-01";
    savePlayerPlan("u9", days);
    const loaded = loadPlayerPlan("u9");
    assert.equal(loaded.weeks.length, 4);
    assert.equal(loaded.startDate, "2026-09-01");
    globalThis.localStorage = orig;
  });
});
