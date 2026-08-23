import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PRICES, buildCheckoutLineItem, buildSubscriptionItemUpdate, planHasCheckoutTrial } from "./_planCatalog.js";
import { checkoutUsesTrial } from "../src/lib/checkoutPlans.js";

describe("_planCatalog · precios entrenador", () => {
  it("Standard 30€ y Premium 45€", () => {
    assert.equal(PRICES["coach-starter"].amount, 3000);
    assert.equal(PRICES["coach-premium"].amount, 4500);
  });

  it("no reutiliza Price IDs antiguos de entrenador: usa 30€/45€ en price_data", () => {
    const starter = buildCheckoutLineItem("coach-starter", 3000);
    assert.ok(starter.price_data);
    assert.equal(starter.price_data.unit_amount, 3000);
    assert.equal(starter.price, undefined);

    const premium = buildCheckoutLineItem("coach-premium", 4500);
    assert.ok(premium.price_data);
    assert.equal(premium.price_data.unit_amount, 4500);

    const update = buildSubscriptionItemUpdate("coach-starter", "si_test");
    assert.ok(update.price_data);
    assert.equal(update.price_data.unit_amount, 3000);
  });

  it("trial solo en Standard jugador y Standard entrenador", () => {
    assert.equal(planHasCheckoutTrial("player-essential"), true);
    assert.equal(planHasCheckoutTrial("coach-starter"), true);
    assert.equal(planHasCheckoutTrial("coach-pro"), true);
    assert.equal(planHasCheckoutTrial("coach-premium"), false);
    assert.equal(planHasCheckoutTrial("player-pro"), false);
    assert.equal(planHasCheckoutTrial("club-inicial"), false);
    assert.equal(checkoutUsesTrial("player-essential", true), false);
    assert.equal(checkoutUsesTrial("coach-starter", false), true);
  });
});
