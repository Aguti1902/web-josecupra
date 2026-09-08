import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  mergeLoadLogLists,
  mergeWellnessMaps,
  mergePlayerTestsMaps,
} from "./userDataSync.js";

describe("userDataSync merge", () => {
  it("une cargas por id y conserva la más reciente", () => {
    const local = [{ id: "a", recordedAt: "2026-01-02", rpe: 8, updatedAt: "2026-01-02T12:00:00.000Z" }];
    const remote = [
      { id: "a", recordedAt: "2026-01-02", rpe: 5, updatedAt: "2026-01-01T12:00:00.000Z" },
      { id: "b", recordedAt: "2026-01-01", rpe: 4 },
    ];
    const out = mergeLoadLogLists(local, remote);
    assert.equal(out.length, 2);
    assert.equal(out.find((e) => e.id === "a").rpe, 8);
    assert.ok(out.find((e) => e.id === "b"));
  });

  it("une wellness por semana con updatedAt", () => {
    const out = mergeWellnessMaps(
      { "2026-01-05": { weekKey: "2026-01-05", weightKg: "80", updatedAt: "2026-01-10T00:00:00.000Z" } },
      { "2026-01-05": { weekKey: "2026-01-05", weightKg: "79", updatedAt: "2026-01-08T00:00:00.000Z" },
        "2025-12-29": { weekKey: "2025-12-29", sleep: "7" } },
    );
    assert.equal(out["2026-01-05"].weightKg, "80");
    assert.equal(out["2025-12-29"].sleep, "7");
  });

  it("une historial de tests del jugador", () => {
    const out = mergePlayerTestsMaps(
      { sprint: [{ date: "1 ene", value: "3.1" }] },
      { sprint: [{ date: "2 ene", value: "3.0" }], cmj: [{ date: "1 ene", value: "40" }] },
    );
    assert.equal(out.sprint.length, 2);
    assert.equal(out.cmj.length, 1);
  });
});
