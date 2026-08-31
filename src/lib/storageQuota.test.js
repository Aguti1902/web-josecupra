import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { isQuotaError, reclaimLocalStorage, safeSetItem } from "./storageQuota.js";

describe("storageQuota", () => {
  beforeEach(() => {
    const store = new Map();
    globalThis.localStorage = {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => { store.set(k, String(v)); },
      removeItem: (k) => { store.delete(k); },
      key: (i) => [...store.keys()][i] ?? null,
      get length() { return store.size; },
    };
  });

  it("detecta el mensaje de Safari", () => {
    const err = new Error("The quota has been exceeded.");
    err.name = "QuotaExceededError";
    assert.equal(isQuotaError(err), true);
    assert.equal(isQuotaError(new Error("boom")), false);
  });

  it("reclaim borra logos y deja el token de sesión", () => {
    localStorage.setItem("depro_player_logo_u1", "data:image/png;base64,AAA");
    localStorage.setItem("depro_player_banner_u1", "data:image/png;base64,BBB");
    localStorage.setItem("sb-xyz-auth-token", "keep");
    assert.equal(reclaimLocalStorage(), 2);
    assert.equal(localStorage.getItem("sb-xyz-auth-token"), "keep");
    assert.equal(localStorage.getItem("depro_player_logo_u1"), null);
  });

  it("reclaim agresivo borra planes cacheados y deja el token", () => {
    localStorage.setItem("depro_plan_u1", "{\"weeks\":[]}");
    localStorage.setItem("depro_onboarding_draft_v1", "{}");
    localStorage.setItem("sb-xyz-auth-token", "keep");
    assert.equal(reclaimLocalStorage({ aggressive: true }), 2);
    assert.equal(localStorage.getItem("sb-xyz-auth-token"), "keep");
    assert.equal(localStorage.getItem("depro_plan_u1"), null);
    assert.equal(localStorage.getItem("depro_onboarding_draft_v1"), null);
  });

  it("safeSetItem no lanza si la cuota está llena", () => {
    globalThis.localStorage.setItem = () => {
      const err = new Error("The quota has been exceeded.");
      err.name = "QuotaExceededError";
      throw err;
    };
    assert.equal(safeSetItem(localStorage, "k", "v"), false);
  });
});
