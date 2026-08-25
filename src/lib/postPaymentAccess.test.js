import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  POST_PAYMENT_FLAG,
  markPaymentCompleted,
  isPaymentJustCompleted,
  hasPaidAccess,
  shouldBlockDashboardForUnpaid,
  panelPathForUser,
  safeNextPath,
  loginPathToPanel,
  withPaymentActivated,
  loginPasswordFromCheckout,
  authUpdateAfterCheckout,
} from "./postPaymentAccess.js";

describe("postPaymentAccess", () => {
  const memory = new Map();

  beforeEach(() => {
    memory.clear();
    globalThis.sessionStorage = {
      getItem: (k) => (memory.has(k) ? memory.get(k) : null),
      setItem: (k, v) => { memory.set(k, String(v)); },
      removeItem: (k) => { memory.delete(k); },
    };
  });

  afterEach(() => {
    delete globalThis.sessionStorage;
  });

  it("marca el pago y no bloquea el panel aunque pendingPayment siga en el JWT", () => {
    assert.equal(shouldBlockDashboardForUnpaid({ pendingPayment: true }), true);
    markPaymentCompleted();
    assert.equal(isPaymentJustCompleted(), true);
    assert.equal(sessionStorage.getItem(POST_PAYMENT_FLAG), "1");
    assert.equal(shouldBlockDashboardForUnpaid({ pendingPayment: true }), false);
  });

  it("no bloquea si Stripe ya dejó la suscripción activa o en trial", () => {
    assert.equal(hasPaidAccess({ subscriptionStatus: "trialing" }), true);
    assert.equal(
      shouldBlockDashboardForUnpaid({ pendingPayment: true, subscriptionStatus: "trialing" }),
      false,
    );
    assert.equal(
      shouldBlockDashboardForUnpaid({ pendingPayment: true, stripeSubscriptionId: "sub_1" }),
      false,
    );
  });

  it("sí bloquea Google/legacy sin pagar", () => {
    assert.equal(shouldBlockDashboardForUnpaid({ pendingPayment: true }), true);
    assert.equal(shouldBlockDashboardForUnpaid({ pendingPayment: false }), false);
    assert.equal(shouldBlockDashboardForUnpaid({ pendingPayment: true, impersonating: true }), false);
    assert.equal(shouldBlockDashboardForUnpaid(null), false);
  });

  it("elige el panel correcto y sanitiza ?next=", () => {
    assert.equal(panelPathForUser({ role: "player" }), "/dashboard");
    assert.equal(panelPathForUser({ role: "admin" }), "/admin");
    assert.equal(panelPathForUser({ role: "player", email: "jose@depro.es" }), "/admin");
    assert.equal(safeNextPath("/dashboard/plan"), "/dashboard/plan");
    assert.equal(safeNextPath("https://evil.test"), "/dashboard");
    assert.equal(safeNextPath("//evil.test"), "/dashboard");
    assert.equal(safeNextPath("/login"), "/dashboard");
    assert.equal(loginPathToPanel(), "/login?next=/dashboard");
  });

  it("limpia pendingPayment y devuelve la contraseña del checkout para auto-login", () => {
    assert.deepEqual(withPaymentActivated({ pendingPayment: true, plan: "player-essential" }), {
      pendingPayment: false,
      plan: "player-essential",
    });
    assert.equal(
      loginPasswordFromCheckout({ created: false, tempPassword: "Abcdefg1", generatedPassword: "xxxx" }),
      "Abcdefg1",
    );
    assert.equal(
      loginPasswordFromCheckout({ created: true, tempPassword: "", generatedPassword: "GenPass12" }),
      "GenPass12",
    );
    assert.equal(
      loginPasswordFromCheckout({ created: false, tempPassword: "", generatedPassword: "GenPass12" }),
      null,
    );
    const patch = authUpdateAfterCheckout({
      prevMeta: { pendingPayment: true, name: "Ana" },
      userMeta: { plan: "player-essential" },
      tempPassword: "MiClave99",
    });
    assert.equal(patch.password, "MiClave99");
    assert.equal(patch.user_metadata.pendingPayment, false);
    assert.equal(patch.user_metadata.plan, "player-essential");
  });
});
