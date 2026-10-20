import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { hasUnlimitedClubAccess, getEffectivePlanLimits } from "./clubUnlimitedAccess.js";
import { evaluateFeatureAccess } from "./featureAccess.js";

const coord = {
  role: "club",
  team_role: "coordinador",
  plan: "club-inicial",
  billingSource: "manual",
  subscriptionStatus: "activo",
  club: { id: "club1", plan: "club-inicial", billingSource: "manual" },
};

const coach = {
  role: "club",
  team_role: "entrenador",
  plan: "club-inicial",
  club: { id: "club1", plan: "club-inicial" },
};

const clubAdminManual = {
  role: "club",
  team_role: "administrador",
  plan: "club-inicial",
  billingSource: "manual",
  club: { id: "club1", plan: "club-inicial", billingSource: "manual" },
};

const clubAdminStripe = {
  role: "club",
  team_role: "administrador",
  plan: "club-inicial",
  billingSource: "stripe",
  stripeSubscriptionId: "sub_123",
  club: { id: "club1", plan: "club-inicial" },
};

const proCoach = {
  role: "club",
  isSoloCoach: true,
  plan: "coach-starter",
  billingSource: "manual",
  clubId: "coach_1",
  club: { id: "coach_1", isSoloCoach: true, plan: "coach-starter" },
};

describe("clubUnlimitedAccess — academias creadas a mano", () => {
  it("el coordinador no tiene tope de jugadores aunque el plan sea Inicial", () => {
    assert.equal(hasUnlimitedClubAccess(coord), true);
    assert.deepEqual(getEffectivePlanLimits(coord, coord.club), {
      maxTeams: null,
      maxPlayers: null,
    });
  });

  it("el entrenador de academia tampoco ve el paywall de plantilla", () => {
    assert.equal(hasUnlimitedClubAccess(coach), true);
    assert.equal(getEffectivePlanLimits(coach, coach.club).maxPlayers, null);
  });

  it("el administrador de un club manual tiene cupos ilimitados", () => {
    assert.equal(hasUnlimitedClubAccess(clubAdminManual), true);
    assert.equal(getEffectivePlanLimits(clubAdminManual, clubAdminManual.club).maxTeams, null);
  });

  it("un club Stripe sí respeta el tope del plan Inicial", () => {
    assert.equal(hasUnlimitedClubAccess(clubAdminStripe), false);
    assert.deepEqual(getEffectivePlanLimits(clubAdminStripe, clubAdminStripe.club), {
      maxTeams: 3,
      maxPlayers: 80,
    });
  });

  it("DEPRO Coach sigue con sus límites de equipos", () => {
    assert.equal(hasUnlimitedClubAccess(proCoach), false);
    assert.equal(getEffectivePlanLimits(proCoach, proCoach.club).maxTeams, 1);
  });

  it("el coordinador tiene las funciones del club sin contratar extras", () => {
    const base = { audience: "club", planId: "club-inicial", billingSource: "manual" };
    assert.equal(evaluateFeatureAccess({ ...base, featureId: "pdf_export" }), true);
    assert.equal(evaluateFeatureAccess({ ...base, featureId: "cargas" }), true);
    assert.equal(evaluateFeatureAccess({ ...base, featureId: "team_tests" }), true);
  });
});
