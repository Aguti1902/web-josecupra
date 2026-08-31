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
  canManageClubBilling,
  canEditSquadRoster,
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

  it("entrenador no ve economía aunque la metadata diga administrador", () => {
    const stale = {
      role: "club",
      email: "marcoslopezotero2002@gmail.com",
      team_role: "administrador",
      club: {
        users: [{ email: "marcoslopezotero2002@gmail.com", role: "entrenador" }],
      },
    };
    assert.equal(canSeeClubEconomy(stale), false);
    assert.equal(isClubAdmin(stale), false);
  });

  it("ayudante tampoco ve cuota ni comisiones", () => {
    assert.equal(canSeeClubEconomy({ role: "club", team_role: "ayudante" }), false);
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

  it("coordinador puede añadir plantilla en vista global y por equipo", () => {
    const coord = { role: "club", team_role: "coordinador" };
    assert.equal(canEditSquadRoster(coord, null), true);
    assert.equal(canEditSquadRoster(coord, { id: "team_1", name: "Alevín" }), true);
    assert.equal(canEditSquadRoster({ role: "club", team_role: "entrenador" }, { id: "t" }), true);
    assert.equal(canEditSquadRoster(null, null), false);
  });

  it("jugador y DEPRO Coach gestionan su suscripción", () => {
    assert.equal(canManageClubBilling({ role: "player" }), true);
    assert.equal(canManageClubBilling({ role: "coach", plan: "coach-starter" }), true);
    assert.equal(canManageClubBilling({ role: "club", club: { isSoloCoach: true } }), true);
    assert.equal(canManageClubBilling({ role: "club", team_role: "entrenador" }), false);
  });
});
