import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { buildWellnessFeedback, entryHasData } from "./wellnessAnalytics.js";
import {
  mondayOfDate,
  recentWeekKeys,
  saveWellnessEntry,
  getWellnessEntry,
} from "./wellnessLogs.js";

describe("wellnessAnalytics", () => {
  it("detecta peso bajado y sueño mejor", () => {
    const { cards, summary } = buildWellnessFeedback(
      { weightKg: "74.2", waistCm: "78", fatigue: "2", sleep: "4" },
      { weightKg: "75.0", waistCm: "79", fatigue: "3", sleep: "3" },
    );
    assert.ok(cards.length >= 3);
    const weight = cards.find((c) => c.id === "weight");
    assert.equal(weight.tone, "positive");
    assert.match(weight.message, /bajado/i);
    const sleep = cards.find((c) => c.id === "sleep");
    assert.equal(sleep.tone, "positive");
    assert.ok(summary);
  });

  it("entryHasData", () => {
    assert.equal(entryHasData({ weightKg: "" }), false);
    assert.equal(entryHasData({ weightKg: "70" }), true);
    assert.equal(entryHasData({ musclePain: "2" }), true);
  });

  it("incluye dolor muscular percibido y su tendencia", () => {
    const { cards, overview } = buildWellnessFeedback(
      { weightKg: "95", waistCm: "90", fatigue: "3", sleep: "3", musclePain: "2" },
      { weightKg: "95.6", waistCm: "91", fatigue: "4", sleep: "3", musclePain: "3" },
    );
    const pain = cards.find((c) => c.id === "musclePain");
    assert.ok(pain);
    assert.equal(pain.tone, "positive");
    assert.match(pain.message, /menos dolor muscular/i);
    assert.ok(overview);
    assert.match(overview.message, /dolor muscular/i);
  });
});

describe("wellnessLogs", () => {
  beforeEach(() => {
    globalThis.localStorage = {
      _data: {},
      getItem(k) { return this._data[k] ?? null; },
      setItem(k, v) { this._data[k] = String(v); },
      removeItem(k) { delete this._data[k]; },
    };
  });
  afterEach(() => { delete globalThis.localStorage; });

  it("guarda y lee entrada semanal", () => {
    const week = mondayOfDate(new Date("2026-08-20T12:00:00"));
    saveWellnessEntry("u1", { weekKey: week, weightKg: "72", fatigue: "3", sleep: "4", waistCm: "80", musclePain: "2" });
    const e = getWellnessEntry("u1", week);
    assert.equal(e.weightKg, "72");
    assert.equal(e.musclePain, "2");
    assert.equal(recentWeekKeys(2, new Date("2026-08-20T12:00:00")).length, 2);
  });
});
