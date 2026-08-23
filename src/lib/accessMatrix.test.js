import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PLAYER_ADDONS, featuresForAddon, addonById } from "./playerAddons.js";
import { TRIAL_PDF_MAX } from "./trialPdfLimit.js";
import { PREMIUM_PLAYER_CAP } from "./premiumCapacity.js";

describe("accesos Standard / Premium / extras", () => {
  it("carrito de extras: 3 items a 5€ (PDF, tests, mis cargas)", () => {
    assert.equal(PLAYER_ADDONS.length, 3);
    assert.deepEqual(
      PLAYER_ADDONS.map((a) => a.id).sort(),
      ["addon-cargas", "addon-pdf", "addon-progression"],
    );
    PLAYER_ADDONS.forEach((a) => assert.equal(a.price, 5));
    assert.ok(featuresForAddon("addon-progression").includes("physical_tests"));
    assert.ok(featuresForAddon("addon-pdf").includes("pdf_export"));
    assert.ok(featuresForAddon("addon-cargas").includes("cargas"));
  });

  it("alias legacy de tests sigue resolviendo", () => {
    assert.equal(addonById("addon-physical-tests")?.id, "addon-progression");
  });

  it("trial PDF máx. 1 y Premium 40 plazas", () => {
    assert.equal(TRIAL_PDF_MAX, 1);
    assert.equal(PREMIUM_PLAYER_CAP, 40);
  });
});
