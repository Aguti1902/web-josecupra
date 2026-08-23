import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  PREMIUM_PLAYER_CAP,
  countPremiumPlayersFromUsers,
  premiumSpotsRemaining,
  canJoinPremium,
  isPremiumPlanId,
} from "./premiumCapacity.js";

describe("premiumCapacity", () => {
  it("cap es 40", () => {
    assert.equal(PREMIUM_PLAYER_CAP, 40);
  });

  it("cuenta solo jugadores premium", () => {
    const users = [
      { user_metadata: { role: "player", plan: "player-pro" } },
      { user_metadata: { role: "player", plan: "player-essential" } },
      { user_metadata: { role: "coach", plan: "coach-premium" } },
      { user_metadata: { role: "player", plan: "premium" } },
    ];
    assert.equal(countPremiumPlayersFromUsers(users), 2);
  });

  it("plazas restantes y canJoinPremium", () => {
    assert.equal(premiumSpotsRemaining(38), 2);
    assert.equal(canJoinPremium(40), false);
    assert.equal(canJoinPremium(39), true);
    assert.equal(canJoinPremium(40, { alreadyPremium: true }), true);
    assert.equal(isPremiumPlanId("player-pro"), true);
  });
});
