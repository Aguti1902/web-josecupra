import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isPremiumPlayerPlan,
  compareUsersForAdminList,
  canImpersonateUser,
  canDeleteUser,
} from "./adminImpersonation.js";

describe("adminImpersonation", () => {
  it("detecta planes Premium de jugador", () => {
    assert.equal(isPremiumPlayerPlan("player-pro"), true);
    assert.equal(isPremiumPlayerPlan("premium"), true);
    assert.equal(isPremiumPlayerPlan("player-essential"), false);
  });

  it("ordena jugadores Premium primero", () => {
    const list = [
      { id: "1", type: "player", plan: "player-essential", created_at: "2026-08-20" },
      { id: "2", type: "player", plan: "player-pro", created_at: "2026-08-01" },
      { id: "3", type: "player", plan: "player-essential", created_at: "2026-08-22" },
    ].sort(compareUsersForAdminList);
    assert.equal(list[0].id, "2");
    assert.equal(list[1].id, "3");
    assert.equal(list[2].id, "1");
  });

  it("no permite impersonar ni borrar admins", () => {
    const admin = { id: "a", type: "admin", role: "admin", email: "jose@depro.es" };
    assert.equal(canImpersonateUser(admin), false);
    assert.equal(canDeleteUser(admin, "otro@depro.es"), false);
    assert.equal(canDeleteUser({ id: "x", email: "yo@depro.es", type: "player" }, "yo@depro.es"), false);
    assert.equal(canDeleteUser({ id: "x", email: "p@depro.es", type: "player" }, "yo@depro.es"), true);
  });
});
