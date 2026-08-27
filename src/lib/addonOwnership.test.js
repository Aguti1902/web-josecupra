import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { addonOwnershipState, isAddonPurchased } from "./addonOwnership.js";

const PDF = { id: "addon-pdf", featureId: "pdf_export", name: "Descarga en PDF" };

describe("addonOwnershipState", () => {
  it("trial Standard sin compra no marca PDF como incluido", () => {
    const user = {
      role: "player",
      plan: "player-essential",
      subscriptionStatus: "trialing",
      trialEndsAt: "2099-01-01T00:00:00.000Z",
      purchasedAddons: [],
    };
    assert.equal(isAddonPurchased(user, PDF), false);
    assert.equal(addonOwnershipState(user, PDF), "missing");
  });

  it("si compró el extra, está contratado", () => {
    const user = {
      role: "player",
      plan: "player-essential",
      purchasedAddons: ["addon-pdf"],
    };
    assert.equal(addonOwnershipState(user, PDF), "paid");
  });

  it("Premium incluye extras sin compra", () => {
    const user = { role: "player", plan: "player-pro", purchasedAddons: [] };
    assert.equal(addonOwnershipState(user, PDF), "plan_included");
  });
});
