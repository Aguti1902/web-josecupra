import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeAdminStatus,
  canUserLogin,
  isAdminGrantedAccess,
  isDraftLoginBlocked,
  isAdminManagedStatus,
  parseManualPrice,
  monthlyBilledAmount,
} from "./adminAccountStatus.js";

describe("adminAccountStatus", () => {
  it("normaliza aliases a borrador | demo | activo", () => {
    assert.equal(normalizeAdminStatus("active"), "activo");
    assert.equal(normalizeAdminStatus("comp"), "demo");
    assert.equal(normalizeAdminStatus("pendiente"), "borrador");
    assert.equal(normalizeAdminStatus("trialing"), "activo");
    assert.equal(normalizeAdminStatus("borrador"), "borrador");
  });

  it("borrador no puede login; demo y activo sí", () => {
    assert.equal(canUserLogin("borrador"), false);
    assert.equal(canUserLogin("demo"), true);
    assert.equal(canUserLogin("activo"), true);
    assert.equal(isAdminGrantedAccess("demo"), true);
    assert.equal(isAdminGrantedAccess("borrador"), false);
  });

  it("isDraftLoginBlocked no pisa estados Stripe", () => {
    assert.equal(isDraftLoginBlocked("borrador"), true);
    assert.equal(isDraftLoginBlocked("pendiente"), true);
    assert.equal(isDraftLoginBlocked(""), false);
    assert.equal(isDraftLoginBlocked("trialing"), false);
    assert.equal(isDraftLoginBlocked("cancel_at_period_end"), false);
    assert.equal(isAdminManagedStatus("demo"), true);
    assert.equal(isAdminManagedStatus("active"), false);
  });

  it("monthlyBilledAmount usa precio manual solo en activo", () => {
    assert.equal(monthlyBilledAmount({ subscriptionStatus: "demo", manualPrice: 200 }, 99), 0);
    assert.equal(monthlyBilledAmount({ subscriptionStatus: "borrador", manualPrice: 200 }, 99), 0);
    assert.equal(monthlyBilledAmount({ subscriptionStatus: "activo", manualPrice: "150" }, 99), 150);
    assert.equal(monthlyBilledAmount({ subscriptionStatus: "activo" }, 99), 99);
  });

  it("parseManualPrice", () => {
    assert.equal(parseManualPrice("199"), 199);
    assert.equal(parseManualPrice("99,5"), 99.5);
    assert.equal(parseManualPrice(""), null);
  });
});
