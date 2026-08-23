import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  playerFeedbackKey,
  getPlayerFeedback,
  getActivePlayerFeedback,
  getArchivedPlayerFeedback,
  addPlayerFeedback,
  archivePlayerFeedback,
  unarchivePlayerFeedback,
  deletePlayerFeedback,
  getLatestPlayerFeedback,
} from "./playerFeedback.js";

const USER = "u_fb_test";

describe("playerFeedback", () => {
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

  it("no inventa mensajes: lista vacía sin envíos", () => {
    assert.deepEqual(getPlayerFeedback(USER), []);
    assert.equal(getLatestPlayerFeedback(USER), null);
  });

  it("guarda solo lo enviado por el preparador", () => {
    const r = addPlayerFeedback(USER, {
      week: "Semana 3",
      message: "Buena adherencia. Subimos carga de fuerza inferior.",
      rating: 8,
      nextFocus: "Potencia en sentadilla",
      adjustments: ["+5% volumen fuerza"],
    }, { coachName: "Jose" });
    assert.ok(r.id);
    assert.equal(r.coach, "Jose");
    assert.equal(getActivePlayerFeedback(USER).length, 1);
    assert.equal(getLatestPlayerFeedback(USER).message.includes("fuerza"), true);
  });

  it("archiva y desarchiva", () => {
    const r = addPlayerFeedback(USER, { message: "Primera nota" });
    archivePlayerFeedback(USER, r.id);
    assert.equal(getActivePlayerFeedback(USER).length, 0);
    assert.equal(getArchivedPlayerFeedback(USER).length, 1);
    unarchivePlayerFeedback(USER, r.id);
    assert.equal(getActivePlayerFeedback(USER).length, 1);
  });

  it("borra feedback", () => {
    const r = addPlayerFeedback(USER, { message: "Borrar" });
    deletePlayerFeedback(USER, r.id);
    assert.equal(getPlayerFeedback(USER).length, 0);
    assert.equal(localStorage.getItem(playerFeedbackKey(USER)), "[]");
  });

  it("rechaza mensaje vacío", () => {
    assert.equal(addPlayerFeedback(USER, { message: "   " }), null);
  });
});
