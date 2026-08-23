import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getSessionBlocks, getNonEmptyBlocks, BLOCK_TYPES } from "./sessionBlocks.js";

describe("sessionBlocks · core del motor", () => {
  it("BLOCK_TYPES incluye core entre complementario y vuelta_calma", () => {
    assert.ok(BLOCK_TYPES.includes("core"));
    const iCore = BLOCK_TYPES.indexOf("core");
    assert.ok(iCore > BLOCK_TYPES.indexOf("complementario"));
    assert.ok(iCore < BLOCK_TYPES.indexOf("vuelta_calma"));
  });

  it("getNonEmptyBlocks conserva el bloque core (Plancha frontal)", () => {
    const session = {
      title: "Fuerza — Tren inferior",
      blocks: [
        { type: "calentamiento", exercises: [{ name: "Movilidad cadera" }, { name: "Movilidad tobillo" }, { name: "Estiramiento cuádriceps" }] },
        { type: "principal", exercises: [{ name: "Split squat" }, { name: "Hip thrust" }] },
        { type: "complementario", exercises: [{ name: "Saltos verticales" }, { name: "Drop landing" }] },
        { type: "core", exercises: [{ name: "Plancha frontal" }] },
      ],
    };
    const blocks = getNonEmptyBlocks(session);
    const types = blocks.map((b) => b.type);
    assert.deepEqual(types, ["calentamiento", "principal", "complementario", "core"]);
    const core = blocks.find((b) => b.type === "core");
    assert.equal(core.exercises[0].name, "Plancha frontal");
    const total = blocks.reduce((n, b) => n + b.exercises.length, 0);
    assert.equal(total, 8);
  });

  it("getSessionBlocks también reúne core desde exercises[].blockType", () => {
    const session = {
      exercises: [
        { name: "Split squat", blockType: "principal" },
        { name: "Plancha frontal", blockType: "core" },
      ],
    };
    const blocks = getNonEmptyBlocks(session);
    assert.ok(blocks.some((b) => b.type === "core" && b.exercises[0].name === "Plancha frontal"));
  });
});
