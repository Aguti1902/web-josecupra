import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mergeSubscriptionState } from "./subscriptionState.js";
import { checkoutUsesTrial, planHasCheckoutTrial } from "./checkoutPlans.js";

describe("saltar prueba gratis", () => {
  it("el JWT en trialing no gana si el usuario ya saltó el trial en local", () => {
    const sub = mergeSubscriptionState(
      { plan: "player-essential", subscriptionStatus: "trialing", trialEndsAt: "2099-01-01T00:00:00.000Z" },
      { plan: "player-essential", status: "active", trialEndsAt: null, skippedTrial: true },
    );
    assert.equal(sub.status, "active");
    assert.equal(sub.trialEndsAt, null);
    assert.equal(sub.skippedTrial, true);
  });

  it("sigue en trial si no lo ha saltado", () => {
    const sub = mergeSubscriptionState(
      { plan: "player-essential", subscriptionStatus: "trialing", trialEndsAt: "2099-01-01T00:00:00.000Z" },
      { plan: "player-essential", status: "trialing", trialEndsAt: "2099-01-01T00:00:00.000Z" },
    );
    assert.equal(sub.status, "trialing");
    assert.ok(sub.trialEndsAt);
    assert.equal(sub.skippedTrial, false);
  });

  it("checkoutUsesTrial respeta skipTrial", () => {
    assert.equal(planHasCheckoutTrial("player-essential"), true);
    assert.equal(checkoutUsesTrial("player-essential", false), true);
    assert.equal(checkoutUsesTrial("player-essential", true), false);
    assert.equal(checkoutUsesTrial("player-pro", false), false);
  });
});
