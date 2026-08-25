import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  registerClubCodePlayer,
  registerPendingClubPlayer,
  activateClubPlayerInSquad,
  getClubCodePlayers,
  getPlayerClubAssoc,
} from "./clubPlayerRegistry.js";

function mockLocalStorage() {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => { store.set(String(k), String(v)); },
    removeItem: (k) => { store.delete(k); },
    clear: () => { store.clear(); },
    key: (i) => [...store.keys()][i] ?? null,
    get length() { return store.size; },
  };
}

describe("clubPlayerRegistry · código de club sin equipo", () => {
  beforeEach(() => {
    mockLocalStorage();
    localStorage.setItem("depro_clubs", JSON.stringify([{
      id: "udcedilacan",
      name: "UDC Edilacan",
      logo: "logo.png",
      primaryColor: "#112233",
    }]));
  });

  it("registerClubCodePlayer aplica branding y no crea plantilla", () => {
    registerClubCodePlayer({
      userId: "u1",
      clubId: "udcedilacan",
      name: "Ana",
      email: "ana@test.com",
      plan: "player-essential",
      status: "trialing",
    });
    const assoc = getPlayerClubAssoc("u1");
    assert.equal(assoc.clubId, "udcedilacan");
    assert.equal(assoc.teamId, null);
    assert.equal(assoc.linkKind, "code");
    assert.equal(assoc.status, "trialing");
    assert.equal(localStorage.getItem("depro_player_logo_u1"), "logo.png");
    assert.equal(localStorage.getItem("depro_squad_udcedilacan_sub10"), null);
    assert.equal(getClubCodePlayers("udcedilacan", "sub10").length, 0);
  });

  it("registerPendingClubPlayer sin teamId tampoco entra en squad", () => {
    registerPendingClubPlayer({
      userId: "u2",
      clubId: "udcedilacan",
      name: "Luis",
      email: "luis@test.com",
      plan: "player-essential",
    });
    assert.equal(getPlayerClubAssoc("u2").linkKind, "code");
    assert.equal(localStorage.length > 0, true);
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      assert.equal(String(key).startsWith("depro_squad_"), false);
      assert.equal(String(key).startsWith("depro_team_registry_"), false);
    }
  });

  it("activateClubPlayerInSquad sí escribe plantilla cuando hay equipo (flujo distinto)", () => {
    activateClubPlayerInSquad({
      userId: "u3",
      clubId: "udcedilacan",
      teamId: "sub10",
      name: "Coach-added",
      email: "c@test.com",
      plan: "club",
    });
    const squad = JSON.parse(localStorage.getItem("depro_squad_udcedilacan_sub10") || "[]");
    assert.equal(squad.length, 1);
    assert.equal(squad[0].id, "u3");
    assert.equal(getClubCodePlayers("udcedilacan", "sub10").length, 1);
  });
});
