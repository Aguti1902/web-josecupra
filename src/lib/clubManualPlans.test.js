import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  clonePlans,
  isBroadcastTargetClub,
  resolveClubPanelPlans,
  pickPlansFromAdminClubsResponse,
  GLOBAL_PLANS_CLUB_ID,
} from "./clubManualPlans.js";

describe("clubManualPlans", () => {
  it("solo reparte a clubs academia llevados por mí", () => {
    assert.equal(isBroadcastTargetClub({
      id: "club_1",
      planningMode: "manual",
      origen: "manual",
    }), true);
    assert.equal(isBroadcastTargetClub({
      id: "club_auto",
      planningMode: "auto",
      origen: "automatico",
    }), false);
    assert.equal(isBroadcastTargetClub({
      id: "coach_1",
      isSoloCoach: true,
      planningMode: "manual",
    }), false);
    assert.equal(isBroadcastTargetClub({ id: GLOBAL_PLANS_CLUB_ID, planningMode: "manual" }), false);
  });

  it("el panel manual usa club.plans y no pisa con global si hay copia", () => {
    const own = [{ id: "mc_club", title: "Del club" }];
    const global = [{ id: "mc_global", title: "Global" }];
    assert.deepEqual(
      resolveClubPanelPlans({ planningMode: "manual", isSoloCoach: false, plans: own }, global),
      own,
    );
    assert.deepEqual(
      resolveClubPanelPlans({ planningMode: "manual", isSoloCoach: false, plans: [] }, global),
      global,
    );
    assert.deepEqual(
      resolveClubPanelPlans({ planningMode: "auto", origen: "automatico", plans: own }, global),
      global,
    );
  });

  it("pickPlansFromAdminClubsResponse prioriza el detalle del club manual", () => {
    const clubs = [
      { id: GLOBAL_PLANS_CLUB_ID, plans: [{ id: "g" }] },
      { id: "club_1", planningMode: "manual", plans: [{ id: "c" }] },
    ];
    const picked = pickPlansFromAdminClubsResponse(clubs, { id: "club_1", planningMode: "manual" }, []);
    assert.equal(picked[0].id, "c");
  });

  it("clonePlans no comparte referencia", () => {
    const src = [{ id: "a", sessions: [{ id: "s1" }] }];
    const copy = clonePlans(src);
    copy[0].sessions[0].id = "changed";
    assert.equal(src[0].sessions[0].id, "s1");
  });
});
