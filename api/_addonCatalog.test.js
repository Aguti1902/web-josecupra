import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getAddonDef,
  buildAddonLineItem,
  resolveAddonId,
  ADDON_CATALOG,
} from "./_addonCatalog.js";

describe("_addonCatalog", () => {
  it("resuelve extras jugador actuales", () => {
    assert.ok(getAddonDef("addon-pdf"));
    assert.ok(getAddonDef("addon-cargas"));
    assert.ok(getAddonDef("addon-progression"));
    assert.equal(resolveAddonId("addon-physical-tests"), "addon-progression");
  });

  it("buildAddonLineItem con price_data si no hay Price ID", () => {
    const item = buildAddonLineItem("addon-cargas");
    assert.ok(item);
    assert.equal(item.quantity, 1);
    assert.ok(item.price || item.price_data);
  });

  it("catálogo alineado con 3 extras de producción", () => {
    const ids = ["addon-pdf", "addon-cargas", "addon-progression"];
    ids.forEach((id) => {
      assert.ok(ADDON_CATALOG[id]);
      assert.equal(ADDON_CATALOG[id].amount, 500);
    });
  });
});
