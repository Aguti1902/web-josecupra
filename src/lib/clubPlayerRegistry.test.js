import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  registerClubCodePlayer,
  getPlayerClubAssoc,
  getClubCodePlayers,
} from "./clubPlayerRegistry.js";

describe("clubPlayerRegistry · código sin equipo", () => {
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

  it("guarda branding y trazabilidad sin plantilla ni teamId", () => {
    registerClubCodePlayer({
      userId: "u1",
      clubId: "club_udv",
      name: "Renato",
      email: "renatosanchez@gmail.com",
      plan: "player-essential",
      status: "pending",
    });
    const assoc = getPlayerClubAssoc("u1");
    assert.equal(assoc.clubId, "club_udv");
    assert.equal(assoc.teamId, null);
    assert.equal(assoc.linkKind, "code");
    assert.equal(localStorage.getItem("depro_squad_club_udv_undefined"), null);
    assert.equal(getClubCodePlayers("club_udv").length, 0);
    assert.equal(getClubCodePlayers("club_udv", null, { includeCodeOnly: true }).length, 1);
  });

  it("purgePlayerClubArtifacts quita al jugador del squad y de la asociación", async () => {
    const { purgePlayerClubArtifacts, activateClubPlayerInSquad, getPlayerClubAssoc } = await import("./clubPlayerRegistry.js");
    activateClubPlayerInSquad({
      userId: "u-del",
      clubId: "club_udv",
      teamId: "team_1",
      name: "Renato",
      email: "renato@test.com",
      plan: "player-essential",
    });
    assert.ok(getPlayerClubAssoc("u-del"));
    const squad = JSON.parse(localStorage.getItem("depro_squad_club_udv_team_1"));
    assert.equal(squad.some((p) => p.id === "u-del"), true);
    purgePlayerClubArtifacts("u-del", "renato@test.com");
    assert.equal(getPlayerClubAssoc("u-del"), null);
    const after = JSON.parse(localStorage.getItem("depro_squad_club_udv_team_1") || "[]");
    assert.equal(after.some((p) => p.id === "u-del"), false);
  });
});
