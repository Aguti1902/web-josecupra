import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { shouldCancelSubscriptionImmediately } from "./subscriptionCancel.js";

describe("shouldCancelSubscriptionImmediately", () => {
  const now = Date.parse("2026-08-31T12:00:00.000Z");

  it("cancela al momento si Stripe está en trial", () => {
    assert.equal(shouldCancelSubscriptionImmediately({ status: "trialing" }, now), true);
  });

  it("cancela al momento si trial_end de Stripe es futuro", () => {
    assert.equal(
      shouldCancelSubscriptionImmediately({ status: "active", trial_end: Math.floor(now / 1000) + 3600 }, now),
      true,
    );
  });

  it("cancela al final del periodo si ya pagó y no hay trial activo", () => {
    assert.equal(shouldCancelSubscriptionImmediately({ status: "active" }, now), false);
    assert.equal(
      shouldCancelSubscriptionImmediately({ status: "active", trial_end: Math.floor(now / 1000) - 86400 }, now),
      false,
    );
  });

  it("usa trialEndsAt local", () => {
    assert.equal(
      shouldCancelSubscriptionImmediately({ status: "active", trialEndsAt: "2026-09-10T00:00:00.000Z" }, now),
      true,
    );
  });
});
