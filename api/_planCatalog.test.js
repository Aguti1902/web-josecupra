import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PRICES, buildCheckoutLineItem, buildSubscriptionItemUpdate, planHasCheckoutTrial } from "./_planCatalog.js";

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

  it("jugador Standard 29€ no reutiliza el Price ID antiguo de 19,99", () => {
    const item = buildCheckoutLineItem("player-essential", 2900);
    assert.ok(item.price_data);
    assert.equal(item.price_data.unit_amount, 2900);
    assert.equal(item.price_data.product_data.name, "DEPRO Jugador Standard");
    assert.ok(!/pdf/i.test(item.price_data.product_data.description));
    assert.equal(item.price, undefined);

    const update = buildSubscriptionItemUpdate("player-essential", "si_player");
    assert.ok(update.price_data);
    assert.equal(update.price_data.unit_amount, 2900);
  });

  it("jugador Premium 99€ no reutiliza un Price ID antiguo (p. ej. 39€)", () => {
    assert.equal(PRICES["player-pro"].amount, 9900);
    const item = buildCheckoutLineItem("player-pro", 9900);
    assert.ok(item.price_data);
    assert.equal(item.price_data.unit_amount, 9900);
    assert.equal(item.price_data.product_data.name, "DEPRO Jugador Premium");
    assert.equal(item.price, undefined);

    const update = buildSubscriptionItemUpdate("player-pro", "si_premium");
    assert.ok(update.price_data);
    assert.equal(update.price_data.unit_amount, 9900);
  });

  it("trial en Standard y Premium de jugador y entrenador; no en club", () => {
    assert.equal(planHasCheckoutTrial("player-essential"), true);
    assert.equal(planHasCheckoutTrial("player-pro"), true);
    assert.equal(planHasCheckoutTrial("coach-starter"), true);
    assert.equal(planHasCheckoutTrial("coach-pro"), true);
    assert.equal(planHasCheckoutTrial("coach-premium"), true);
    assert.equal(planHasCheckoutTrial("club-inicial"), false);
  });
});
