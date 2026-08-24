import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isClubAdmin,
  isWideClubRole,
  canSeeClubEconomy,
  canSeeClubPricing,
  canSeeClubDiscountCode,
  canViewClubReferrals,
  isProCoachOverview,
  isClubGlobalView,
  resolveManagedTeamIds,
} from "./clubRoles.js";

describe("clubRoles economía", () => {
  const adminClub = { role: "club", team_role: "administrador" };
  const coord = { role: "club", team_role: "coordinador" };
  const coach = { role: "club", team_role: "entrenador" };
  const depro = { role: "admin", email: "jose@depro.es" };

  it("administrador del club es rol amplio y ve economía", () => {
    assert.equal(isClubAdmin(adminClub), true);
    assert.equal(isWideClubRole("administrador"), true);
    assert.equal(isWideClubRole("coordinador"), true);
    assert.equal(isWideClubRole("entrenador"), false);
    assert.equal(canSeeClubEconomy(adminClub), true);
    assert.equal(canViewClubReferrals(adminClub), true);
  });

  it("coordinador y entrenador no ven economía ni precios Stripe", () => {
    assert.equal(canSeeClubEconomy(coord), false);
    assert.equal(canSeeClubEconomy(coach), false);
    assert.equal(canSeeClubPricing(coord), false);
    assert.equal(canSeeClubPricing(adminClub), false);
  });

  it("admin DEPRO ve economía y catálogo de precios", () => {
    assert.equal(canSeeClubEconomy(depro), true);
    assert.equal(canSeeClubPricing(depro), true);
  });

  it("ProCoach con 2+ equipos entra en vista coordinador", () => {
    const coach = {
      isSoloCoach: true,
      club: { isSoloCoach: true, id: "coach_1", teams: [{ id: "a" }, { id: "b" }] },
    };
    assert.equal(isProCoachOverview(coach, null), true);
    assert.equal(isClubGlobalView(coach, null), true);
    assert.equal(isProCoachOverview(coach, { id: "a" }), false);
    assert.equal(isClubGlobalView({
      isSoloCoach: true,
      club: { isSoloCoach: true, teams: [{ id: "a" }] },
    }, null), false);
  });
});

describe("resolveManagedTeamIds", () => {
  const club = {
    coordinator: { email: "coord@club.com", managedTeamIds: ["t2"] },
    users: [{ email: "otro@club.com", managedTeamIds: ["t9"] }],
  };

  it("prioriza el blob del club sobre un JWT desfasado", () => {
    const user = { email: "coord@club.com", managedTeamIds: ["t1"] };
    assert.deepEqual(resolveManagedTeamIds(user, club), ["t2"]);
  });

  it("respeta array vacío del admin (todos los equipos)", () => {
    const user = { email: "coord@club.com", managedTeamIds: ["t1"] };
    const cleared = { coordinator: { email: "coord@club.com", managedTeamIds: [] } };
    assert.deepEqual(resolveManagedTeamIds(user, cleared), []);
  });

  it("cae al JWT si el club aún no está cargado", () => {
    const user = { email: "coord@club.com", managedTeamIds: ["t1", "t3"] };
    assert.deepEqual(resolveManagedTeamIds(user, null), ["t1", "t3"]);
  });
});

describe("canSeeClubDiscountCode", () => {
  it("admin DEPRO, admin/coord/entrenador del club y Pro Coach lo ven", () => {
    assert.equal(canSeeClubDiscountCode({ role: "admin" }), true);
    assert.equal(canSeeClubDiscountCode({ role: "club", team_role: "administrador" }), true);
    assert.equal(canSeeClubDiscountCode({ role: "club", team_role: "coordinador" }), true);
    assert.equal(canSeeClubDiscountCode({ role: "club", team_role: "entrenador" }), true);
    assert.equal(canSeeClubDiscountCode({ isSoloCoach: true }), true);
    assert.equal(canSeeClubDiscountCode({ role: "player" }), false);
    assert.equal(canSeeClubDiscountCode({ role: "club", team_role: "ayudante" }), false);
  });
});
