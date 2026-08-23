import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PLAYER_ADDONS, featuresForAddon, addonById } from "./playerAddons.js";
import { TRIAL_PDF_MAX } from "./trialPdfLimit.js";
import { PREMIUM_PLAYER_CAP } from "./premiumCapacity.js";
import { evaluateFeatureAccess } from "./featureAccess.js";

describe("accesos Standard / Premium / extras", () => {
  it("carrito de extras: 3 items a 5€ (PDF, tests, mis cargas)", () => {
    assert.equal(PLAYER_ADDONS.length, 3);
    assert.deepEqual(
      PLAYER_ADDONS.map((a) => a.id).sort(),
      ["addon-cargas", "addon-pdf", "addon-progression"],
    );
    PLAYER_ADDONS.forEach((a) => assert.equal(a.price, 5));
    assert.ok(featuresForAddon("addon-progression").includes("physical_tests"));
    assert.ok(featuresForAddon("addon-pdf").includes("pdf_export"));
    assert.ok(featuresForAddon("addon-cargas").includes("cargas"));
  });

  it("alias legacy de tests sigue resolviendo", () => {
    assert.equal(addonById("addon-physical-tests")?.id, "addon-progression");
  });

  it("trial PDF máx. 1 y Premium 40 plazas", () => {
    assert.equal(TRIAL_PDF_MAX, 1);
    assert.equal(PREMIUM_PLAYER_CAP, 40);
  });

  it("Premium remarca sin prueba gratuita", async () => {
    const { PLANS } = await import("./checkoutPlans.js");
    assert.ok(PLANS["player-pro"].features.some((f) => /sin prueba/i.test(f)));
    assert.ok(/sin prueba/i.test(PLANS["player-pro"].tagline));
    assert.ok(PLANS["player-essential"].features.some((f) => /15 días/i.test(f)));
  });

  it("feedback solo Premium: Standard manual y trial bloqueados", () => {
    assert.equal(
      evaluateFeatureAccess({
        audience: "player",
        planId: "player-essential",
        billingSource: "manual",
        featureId: "feedback",
      }),
      false,
    );
    assert.equal(
      evaluateFeatureAccess({
        audience: "player",
        planId: "player-essential",
        billingSource: "manual",
        featureId: "ranking",
      }),
      true,
    );
    assert.equal(
      evaluateFeatureAccess({
        audience: "player",
        planId: "player-pro",
        billingSource: "manual",
        isPro: true,
        featureId: "feedback",
      }),
      true,
    );
    assert.equal(
      evaluateFeatureAccess({
        audience: "player",
        planId: "player-essential",
        billingSource: "stripe",
        isTrial: true,
        featureId: "feedback",
      }),
      false,
    );
    assert.equal(
      evaluateFeatureAccess({
        audience: "player",
        planId: "player-essential",
        billingSource: "stripe",
        isTrial: true,
        featureId: "ranking",
      }),
      true,
    );
  });
});

describe("entrenador Standard / Premium / extras", () => {
  it("carrito coach: 4 extras a 5€ y planes 30 / 45", async () => {
    const { COACH_ADDONS } = await import("./coachAddons.js");
    const { PLANS, getPlanLimits, plansForAudience } = await import("./checkoutPlans.js");
    assert.equal(COACH_ADDONS.length, 4);
    COACH_ADDONS.forEach((a) => assert.equal(a.price, 5));
    assert.equal(PLANS["coach-starter"].price, 30);
    assert.equal(PLANS["coach-premium"].price, 45);
    assert.deepEqual(plansForAudience("coach").map((p) => p.id), ["coach-starter", "coach-premium"]);
    assert.equal(getPlanLimits("coach-starter").maxTeams, 1);
    assert.equal(getPlanLimits("coach-starter", { purchasedAddons: ["addon-coach-teams"] }).maxTeams, 4);
    assert.equal(getPlanLimits("coach-premium").maxTeams, 4);
    const { planHasCheckoutTrial } = await import("./checkoutPlans.js");
    assert.equal(planHasCheckoutTrial("coach-starter"), true);
    assert.equal(planHasCheckoutTrial("coach-premium"), false);
  });

  it("tests y cargas bloqueados en Standard, abiertos con extra o Premium", () => {
    assert.equal(
      evaluateFeatureAccess({
        audience: "coach",
        planId: "coach-starter",
        billingSource: "stripe",
        featureId: "team_tests",
      }),
      false,
    );
    assert.equal(
      evaluateFeatureAccess({
        audience: "coach",
        planId: "coach-starter",
        billingSource: "stripe",
        purchasedAddons: ["addon-progression"],
        featureId: "team_tests",
      }),
      true,
    );
    assert.equal(
      evaluateFeatureAccess({
        audience: "coach",
        planId: "coach-premium",
        billingSource: "stripe",
        isPro: true,
        featureId: "cargas",
      }),
      true,
    );
    assert.equal(
      evaluateFeatureAccess({
        audience: "coach",
        planId: "coach-starter",
        billingSource: "stripe",
        purchasedAddons: ["addon-coach-ball-refresh"],
        featureId: "unlimited_ball_warmups",
      }),
      true,
    );
  });
});
