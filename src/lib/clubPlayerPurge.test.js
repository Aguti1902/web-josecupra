import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  stripPlayerFromClubData,
  filterPurgedFromList,
  isPurgedPlayer,
  purgePlayerClubArtifacts,
  applyPurgedPlayersToStorage,
} from "./clubPlayerPurge.js";
import { activateClubPlayerInSquad, getPlayerClubAssoc } from "./clubPlayerRegistry.js";

describe("clubPlayerPurge", () => {
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

  it("stripPlayerFromClubData quita squad, users y deja tombstone", () => {
    const club = {
      users: [{ id: "u1", email: "a@test.com" }, { id: "u2", email: "b@test.com" }],
      teams: [{ id: "t1", squad: [{ id: "u1", email: "a@test.com" }, { id: "manual" }] }],
    };
    const { data, changed } = stripPlayerFromClubData(club, "u1", "a@test.com");
    assert.equal(changed, true);
    assert.equal(data.users.length, 1);
    assert.equal(data.users[0].id, "u2");
    assert.equal(data.teams[0].squad.length, 1);
    assert.equal(data.teams[0].squad[0].id, "manual");
    assert.equal(isPurgedPlayer({ id: "u1", email: "a@test.com" }, data.purgedPlayers), true);
  });

  it("filterPurgedFromList oculta tombstones", () => {
    const purged = [{ userId: "gone", email: "gone@test.com" }];
    const list = [{ id: "gone" }, { id: "keep" }, { email: "gone@test.com" }];
    assert.deepEqual(filterPurgedFromList(list, purged).map((p) => p.id || p.email), ["keep"]);
  });

  it("purgePlayerClubArtifacts limpia depro_club y squad", () => {
    activateClubPlayerInSquad({
      userId: "u-del",
      clubId: "club_udv",
      teamId: "team_1",
      name: "Renato",
      email: "renato@test.com",
      plan: "player-essential",
    });
    localStorage.setItem("depro_club_club_udv", JSON.stringify({
      id: "club_udv",
      teams: [{ id: "team_1", squad: [{ id: "u-del", email: "renato@test.com" }] }],
    }));
    assert.ok(getPlayerClubAssoc("u-del"));
    purgePlayerClubArtifacts("u-del", "renato@test.com");
    assert.equal(getPlayerClubAssoc("u-del"), null);
    const squad = JSON.parse(localStorage.getItem("depro_squad_club_udv_team_1") || "[]");
    assert.equal(squad.some((p) => p.id === "u-del"), false);
    const detail = JSON.parse(localStorage.getItem("depro_club_club_udv"));
    assert.equal(detail.teams[0].squad.some((p) => p.id === "u-del"), false);
  });

  it("purgePlayerClubArtifacts no borra calentamientos ni tareas del club", () => {
    localStorage.setItem("depro_club_custom_warmups", JSON.stringify([
      { id: "cgw_1", videoUrl: "https://youtu.be/aaaaaaaaaaa" },
    ]));
    localStorage.setItem("depro_club_custom_tasks", JSON.stringify([
      { id: "task_1", videoUrl: "https://youtu.be/bbbbbbbbbbb" },
    ]));
    localStorage.setItem("depro_club_club_udv", JSON.stringify({
      id: "club_udv",
      teams: [{ id: "team_1", squad: [{ id: "u-del", email: "renato@test.com" }] }],
    }));
    purgePlayerClubArtifacts("u-del", "renato@test.com");
    const warmups = JSON.parse(localStorage.getItem("depro_club_custom_warmups"));
    const tasks = JSON.parse(localStorage.getItem("depro_club_custom_tasks"));
    assert.equal(warmups[0].videoUrl, "https://youtu.be/aaaaaaaaaaa");
    assert.equal(tasks[0].videoUrl, "https://youtu.be/bbbbbbbbbbb");
    assert.equal(Array.isArray(warmups), true);
  });

  it("applyPurgedPlayersToStorage limpia plantilla local del club", () => {
    localStorage.setItem("depro_squad_club_udv_team_1", JSON.stringify([
      { id: "dead", email: "x@test.com" },
      { id: "alive" },
    ]));
    applyPurgedPlayersToStorage("club_udv", [{ userId: "dead", email: "x@test.com" }]);
    const squad = JSON.parse(localStorage.getItem("depro_squad_club_udv_team_1"));
    assert.deepEqual(squad.map((p) => p.id), ["alive"]);
  });
});
