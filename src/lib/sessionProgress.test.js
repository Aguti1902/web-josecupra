import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  applySessionCompletionToPlan,
  applyProgressBlobToPlan,
  mergeSessionProgressBlobs,
  setSessionCompletion,
  isSessionCompleted,
} from "./sessionProgress.js";

function installLocalStorage() {
  const data = {};
  globalThis.localStorage = {
    getItem(k) { return Object.prototype.hasOwnProperty.call(data, k) ? data[k] : null; },
    setItem(k, v) { data[k] = String(v); },
    removeItem(k) { delete data[k]; },
    key(i) { return Object.keys(data)[i] ?? null; },
    get length() { return Object.keys(data).length; },
  };
  return data;
}

describe("sessionProgress persistencia", () => {
  let store;
  beforeEach(() => {
    store = installLocalStorage();
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ ok: true }) });
  });
  afterEach(() => {
    delete globalThis.localStorage;
    delete globalThis.fetch;
  });

  it("marca completed en días y weeks", () => {
    const plan = [
      { day: "Lunes", sessions: [{ id: "s1", status: "pending", completion: 0, exercises: [{}] }] },
    ];
    plan.weeks = [{ week: 1, days: [{ day: "Lunes", sessions: [{ id: "s1", status: "pending", completion: 0 }] }] }];
    const next = applySessionCompletionToPlan(plan, "s1", true);
    assert.equal(next[0].sessions[0].status, "completed");
    assert.equal(next[0].sessions[0].completion, 100);
    assert.equal(next.weeks[0].days[0].sessions[0].status, "completed");
  });

  it("reescribe el blob de progreso y el plan local al completar", () => {
    const plan = [
      { day: "Lunes", sessions: [{ id: "ses-1", status: "pending", completion: 0, exercises: [{}] }] },
    ];
    plan.weeks = [{ week: 1, days: plan.map((d) => ({ ...d })) }];
    localStorage.setItem("depro_plan_u1", JSON.stringify(plan));
    const updated = setSessionCompletion({
      userId: "u1",
      planKey: "depro_plan_u1",
      sessionId: "ses-1",
      dayLabel: "Lunes",
      completed: true,
    });
    assert.equal(isSessionCompleted(updated[0].sessions[0]), true);
    const blob = JSON.parse(store.depro_session_progress_u1);
    assert.equal(blob.sessions["ses-1"].completed, true);
    const rehydrated = applyProgressBlobToPlan(plan, blob);
    assert.equal(rehydrated[0].sessions[0].completion, 100);
  });

  it("merge conserva la marca más reciente", () => {
    const out = mergeSessionProgressBlobs(
      { sessions: { a: { completed: true, updatedAt: "2026-10-02T00:00:00.000Z" } }, weeks: {} },
      { sessions: { a: { completed: false, updatedAt: "2026-10-01T00:00:00.000Z" } }, weeks: {} },
    );
    assert.equal(out.sessions.a.completed, true);
  });
});
