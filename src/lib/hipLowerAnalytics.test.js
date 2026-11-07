import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { selectExerciseForSlot, fillBlockSlots } from "./exerciseSelector.js";
import { getTemplate, updateTemplateBlockSlots, distributeSlotQtys, countBlockSlots } from "./planTemplates.js";
import { SESSION_TEMPLATES } from "./sessionTemplatesV2.js";

const gym = {
  material: ["Gimnasio completo"],
  lesiones: [],
  edad: 22,
  experiencia: "intermedio",
  sessionObjective: "hipertrofia",
};

describe("analíticos hipertrofia tren inferior", () => {
  it("la plantilla de pierna marca segmento inferior en analíticos", () => {
    const slots = SESSION_TEMPLATES["Hipertrofia Pierna"].blocks
      .find((b) => /anal/i.test(b.label))
      .slots;
    assert.equal(slots.length, 3);
    for (const slot of slots) {
      assert.equal(slot.segmento, "tren_inferior");
      assert.equal(slot.carpeta, "fuerza_tren_inferior");
      assert.equal(slot.patron, "analitico");
    }
  });

  it("no cuela tren superior en analíticos de hipertrofia de pierna", () => {
    const block = getTemplate("Hipertrofia Pierna").blocks.find((b) => /anal/i.test(b.label));
    assert.ok(block);
    const { exercises } = fillBlockSlots(block, gym, [], []);
    assert.ok(exercises.length >= 3, `esperaba ≥3 analíticos, hay ${exercises.length}`);
    for (const ex of exercises) {
      assert.notEqual(ex.etiquetas?.segmento, "tren_superior", ex.nombre);
      assert.notEqual(ex.carpeta, "fuerza_tren_superior", ex.nombre);
      assert.equal(ex.etiquetas?.segmento, "tren_inferior", ex.nombre);
    }
  });

  it("un slot gemelo (singular) encuentra gemelos y no un curl", () => {
    const ex = selectExerciseForSlot({
      rol: "complementario",
      patron: "analitico",
      grupo_muscular: "gemelo",
      slotId: "gemelo_alias",
    }, gym, [], "g1");
    assert.ok(ex, "debe haber elevación de gemelos");
    assert.notEqual(ex.etiquetas?.segmento, "tren_superior", ex.nombre);
    assert.match(String(ex.nombre), /gemelo/i);
  });
});

describe("plantillas: número de ejercicios", () => {
  beforeEach(() => {
    globalThis.localStorage = {
      _data: {},
      getItem(k) { return this._data[k] ?? null; },
      setItem(k, v) { this._data[k] = String(v); },
      removeItem(k) { delete this._data[k]; },
    };
  });
  afterEach(() => { delete globalThis.localStorage; });

  it("reparte 4 básicos en 2+2", () => {
    assert.deepEqual(distributeSlotQtys(2, 4), [2, 2]);
    assert.deepEqual(distributeSlotQtys(3, 4), [2, 1, 1]);
  });

  it("si configuro 4 básicos de hipertrofia pierna, el motor pide 4", () => {
    const tpl = getTemplate("Hipertrofia Pierna");
    const basicosIdx = tpl.blocks.findIndex((b) => /b[aá]sic/i.test(b.label));
    assert.ok(basicosIdx >= 0);
    assert.equal(countBlockSlots(tpl.blocks[basicosIdx]), 2);
    updateTemplateBlockSlots("Hipertrofia Pierna", basicosIdx, 4);
    const next = getTemplate("Hipertrofia Pierna");
    assert.equal(countBlockSlots(next.blocks[basicosIdx]), 4);
    const { exercises } = fillBlockSlots(next.blocks[basicosIdx], gym, [], []);
    assert.equal(exercises.length, 4);
    for (const ex of exercises) {
      assert.equal(ex.etiquetas?.segmento, "tren_inferior", ex.nombre);
    }
  });
});
