import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  clonePlans,
  normalizeAgeBlock,
  ageBlockForCategory,
  filterPlansForTeam,
  resolveClubPanelPlans,
  pickPlansFromAdminClubsResponse,
  activateMesocycleInList,
  pickActiveMesocycles,
  pickCurrentMesocycle,
  GLOBAL_PLANS_CLUB_ID,
} from "./clubManualPlans.js";

describe("clubManualPlans — una fuente global", () => {
  it("normaliza ageBlock label e id", () => {
    assert.equal(normalizeAgeBlock("Bloque 1"), "Bloque 1");
    assert.equal(normalizeAgeBlock("Bloque 1 · Fútbol Base"), "Bloque 1");
    assert.equal(normalizeAgeBlock("Bloque 2 · Fútbol Formativo"), "Bloque 2");
    assert.equal(ageBlockForCategory("Sub-11"), "Bloque 1");
    assert.equal(ageBlockForCategory("Juvenil"), "Bloque 3");
  });

  it("filtra planes por categoría del equipo", () => {
    const plans = [
      { id: "b1", ageBlock: "Bloque 1" },
      { id: "b1b", ageBlock: "Bloque 1 · Fútbol Base" },
      { id: "b3", ageBlock: "Bloque 3" },
      { id: "old", ageBlock: null },
    ];
    const sub11 = filterPlansForTeam(plans, "Sub-11").map((p) => p.id);
    assert.deepEqual(sub11, ["b1", "b1b"]);
    const juv = filterPlansForTeam(plans, "Juvenil").map((p) => p.id);
    assert.deepEqual(juv, ["b3"]);
  });

  it("activar un mesociclo completa los del mismo bloque y el panel solo ve activos", () => {
    const plans = [
      { id: "old", ageBlock: "Bloque 1", status: "activo", startDate: "2026-08-01", endDate: "2026-08-31" },
      { id: "new", ageBlock: "Bloque 1", status: "borrador", startDate: "2026-10-01", endDate: "2026-10-31" },
      { id: "other", ageBlock: "Bloque 3", status: "activo" },
    ];
    const next = activateMesocycleInList(plans, "new");
    assert.equal(next.find((p) => p.id === "new").status, "activo");
    assert.equal(next.find((p) => p.id === "old").status, "completado");
    assert.equal(next.find((p) => p.id === "other").status, "activo");
    assert.deepEqual(pickActiveMesocycles(next).map((p) => p.id).sort(), ["new", "other"]);
    assert.equal(pickCurrentMesocycle(next.filter((p) => p.ageBlock === "Bloque 1")).id, "new");
  });

  it("el panel ignora club.plans y usa GLOBAL_PLANS", () => {
    const own = [{ id: "mc_club" }];
    const global = [{ id: "mc_global" }];
    assert.deepEqual(
      resolveClubPanelPlans({ planningMode: "manual", plans: own }, global),
      global,
    );
    const clubs = [
      { id: GLOBAL_PLANS_CLUB_ID, plans: global },
      { id: "club_1", planningMode: "manual", plans: own },
    ];
    const picked = pickPlansFromAdminClubsResponse(clubs, { id: "club_1", planningMode: "manual" }, []);
    assert.equal(picked[0].id, "mc_global");
  });

  it("clonePlans no comparte referencia", () => {
    const src = [{ id: "a", sessions: [{ id: "s1" }] }];
    const copy = clonePlans(src);
    copy[0].sessions[0].id = "changed";
    assert.equal(src[0].sessions[0].id, "s1");
  });
});
