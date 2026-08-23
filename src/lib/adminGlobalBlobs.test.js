import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isMetaClubId,
  buildMetaClubPayload,
  describeCloudSaveError,
} from "./adminGlobalBlobs.js";

describe("adminGlobalBlobs", () => {
  it("reconoce ids meta", () => {
    assert.equal(isMetaClubId("GLOBAL_PLANS"), true);
    assert.equal(isMetaClubId("GLOBAL_TESTS"), true);
    assert.equal(isMetaClubId("club_1"), false);
  });

  it("GLOBAL_PLANS solo guarda id, name y plans", () => {
    const payload = buildMetaClubPayload(
      { id: "GLOBAL_PLANS", name: "Global Plans", plans: [{ id: "mc1" }], payoutIban: "ES00" },
      { referralCommissionPct: 10 },
    );
    assert.deepEqual(payload, {
      id: "GLOBAL_PLANS",
      name: "Global Plans",
      plans: [{ id: "mc1" }],
    });
  });

  it("acepta plans en detail (formato antiguo)", () => {
    const payload = buildMetaClubPayload(
      { id: "GLOBAL_PLANS", name: "Global Plans" },
      { plans: [{ id: "mc2" }] },
    );
    assert.equal(payload.plans[0].id, "mc2");
  });

  it("explica timeout y 401", () => {
    assert.match(describeCloudSaveError({ aborted: true }), /no respondió/);
    assert.match(describeCloudSaveError({ status: 401, data: {} }), /Sesión caducada/);
  });
});
