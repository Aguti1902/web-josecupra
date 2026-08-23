import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isSessionPresenceEvent, isSignedOutEvent } from "./authSession.js";
import { shouldBlockAccountLogin } from "./adminAccountStatus.js";

describe("authSession", () => {
  it("reconoce eventos de sesión viva y de cierre", () => {
    assert.equal(isSessionPresenceEvent("INITIAL_SESSION"), true);
    assert.equal(isSessionPresenceEvent("SIGNED_IN"), true);
    assert.equal(isSessionPresenceEvent("TOKEN_REFRESHED"), true);
    assert.equal(isSessionPresenceEvent("SIGNED_OUT"), false);
    assert.equal(isSignedOutEvent("SIGNED_OUT"), true);
  });

  it("un club en borrador en localStorage no tumba a un usuario activo", () => {
    assert.equal(
      shouldBlockAccountLogin(
        { role: "club", email: "coach@club.com", subscriptionStatus: "activo" },
        { status: "borrador", subscriptionStatus: "borrador" },
      ),
      false,
    );
    assert.equal(
      shouldBlockAccountLogin(
        { role: "player", email: "j@j.com", subscriptionStatus: "borrador" },
        null,
      ),
      true,
    );
  });
});
