import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getSessionBlocks, getNonEmptyBlocks, BLOCK_TYPES, blockDisplayLabel, blockNavId } from "./sessionBlocks.js";
import { SESSION_TEMPLATES } from "./sessionTemplatesV2.js";

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

describe("sessionBlocks · copia exacta de plantilla individual", () => {
  const velocitySession = {
    title: "Velocidad",
    blocks: SESSION_TEMPLATES.Velocidad.blocks.map((b) => ({
      type: b.type,
      label: b.label,
      duration: b.duration,
      exercises: [{ name: `${b.label} · ejercicio` }],
    })),
  };

  it("Velocidad conserva 4 bloques con los nombres de la plantilla, sin reagrupar", () => {
    const blocks = getSessionBlocks(velocitySession);
    assert.equal(blocks.length, 4);
    assert.deepEqual(blocks.map(blockDisplayLabel), [
      "Warm-up",
      "Fuerza máxima",
      "Pliometría",
      "Velocidad",
    ]);
    assert.deepEqual(blocks.map((b) => b.type), [
      "calentamiento",
      "principal",
      "complementario",
      "principal",
    ]);
  });

  it("no sustituye etiquetas por Principal / Complementario genéricos", () => {
    const labels = getNonEmptyBlocks(velocitySession).map(blockDisplayLabel);
    assert.equal(labels.includes("Principal"), false);
    assert.equal(labels.includes("Complementario"), false);
    assert.equal(labels.includes("Bloque principal"), false);
  });

  it("pestañas tienen id único aunque dos bloques compartan type principal", () => {
    const blocks = getSessionBlocks(velocitySession);
    const ids = blocks.map((b, i) => blockNavId(b, i));
    assert.equal(new Set(ids).size, ids.length);
  });

  it("plantilla admin con 4 bloques custom se muestra tal cual", () => {
    const session = {
      blocks: [
        { type: "calentamiento", label: "calentamiento", exercises: [{ name: "Movilidad" }] },
        { type: "principal", label: "fuerza máxima", exercises: [{ name: "Sentadilla" }] },
        { type: "principal", label: "pliometría", exercises: [{ name: "Drop jump" }] },
        { type: "principal", label: "velocidad", exercises: [{ name: "Aceleración" }] },
      ],
    };
    const labels = getSessionBlocks(session).map(blockDisplayLabel);
    assert.deepEqual(labels, ["calentamiento", "fuerza máxima", "pliometría", "velocidad"]);
  });
});
