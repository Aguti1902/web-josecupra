import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isClubAdmin,
  isWideClubRole,
  canSeeClubEconomy,
  canSeeClubPricing,
  canViewClubReferrals,
  isProCoachOverview,
  isClubGlobalView,
  canEditClubTeam,
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

  it("coordinador edita un equipo concreto como el entrenador", () => {
    const team = { id: "t1", name: "Alevín A" };
    assert.equal(canEditClubTeam(coord, team), true);
    assert.equal(canEditClubTeam(coord, null), false);
    assert.equal(canEditClubTeam(coach, null), true);
    assert.equal(canEditClubTeam(adminClub, team), true);
    assert.equal(canEditClubTeam(adminClub, null), false);
  });
});
