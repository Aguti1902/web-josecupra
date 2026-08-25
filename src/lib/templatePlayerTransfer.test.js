import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { SESSION_TEMPLATES } from "./sessionTemplatesV2.js";
import { getTemplate, updateTemplateBlockVolume } from "./planTemplates.js";
import { fillBlockSlots } from "./exerciseSelector.js";
import { getNonEmptyBlocks } from "./sessionBlocks.js";
import { buildPlayerPlan } from "./playerPlanEngine.js";

function memoryStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => { map.set(k, String(v)); },
    removeItem: (k) => { map.delete(k); },
    clear: () => { map.clear(); },
  };
}

describe("traslado de plantillas admin → usuario", () => {
  it("Velocidad conserva Warm-up, Fuerza máxima, Pliometría y Velocidad", () => {
    const labels = SESSION_TEMPLATES.Velocidad.blocks.map((b) => b.label);
    assert.deepEqual(labels, ["Warm-up", "Fuerza máxima", "Pliometría", "Velocidad"]);
  });

  it("todas las plantillas de resistencia tienen Activación (1 core + 3 sin material) antes del principal", () => {
    for (const key of ["Resistencia aeróbica", "Resistencia umbral", "Resistencia anaeróbica"]) {
      const blocks = SESSION_TEMPLATES[key].blocks;
      const actIdx = blocks.findIndex((b) => b.label === "Activación");
      const mainIdx = blocks.findIndex((b) => b.type === "principal");
      assert.ok(actIdx >= 0, `${key} sin bloque Activación`);
      assert.ok(actIdx < mainIdx, `${key}: Activación debe ir antes del trabajo principal`);
      const slots = blocks[actIdx].slots;
      assert.equal(slots.length, 4);
      assert.equal(slots.filter((s) => s.rol === "core").length, 1);
      assert.equal(slots.filter((s) => s.material === "sin_material").length, 3);
    }
  });

  it("Pliometría incluye 2 fuerza máxima antes del bloque pliométrico", () => {
    const blocks = SESSION_TEMPLATES.Pliometría.blocks;
    const fm = blocks.find((b) => b.label === "Fuerza máxima");
    const plio = blocks.find((b) => /pliometr/i.test(b.label));
    assert.ok(fm, "falta bloque Fuerza máxima");
    assert.ok(plio, "falta bloque Pliometría");
    assert.ok(blocks.indexOf(fm) < blocks.indexOf(plio));
    assert.equal(fm.slots.length, 2);
    assert.ok(fm.slots.every((s) => s.rol === "basico" && s.objetivo === "fuerza"));
  });
});

describe("volumen editable de plantillas", () => {
  beforeEach(() => {
    globalThis.localStorage = memoryStorage();
  });
  afterEach(() => {
    delete globalThis.localStorage;
  });

  it("el override de series/reps/descanso se aplica a los slots del bloque", () => {
    updateTemplateBlockVolume("Fuerza Inferior", 1, { sets: "3", reps: "4-6", rest: "3 min" });
    const tpl = getTemplate("Fuerza Inferior");
    const basics = tpl.blocks.find((b) => b.label === "Básicos");
    assert.ok(basics);
    for (const s of basics.slots) {
      assert.equal(s.volume.sets, "3");
      assert.equal(s.volume.reps, "4-6");
      assert.equal(s.volume.rest, "3 min");
    }
  });

  it("fillBlockSlots usa el volumen del slot (3x4-6, 3 min)", () => {
    const block = {
      type: "principal",
      label: "Básicos",
      slots: [{
        rol: "basico",
        objetivo: "fuerza",
        segmento: "tren_inferior",
        patron: "cadena_anterior",
        volume: { sets: "3", reps: "4-6", rest: "3 min" },
        description: "test",
        slotId: "vol_test",
      }],
    };
    const { exercises } = fillBlockSlots(block, {
      material: ["gym_completo"],
      experiencia: "intermedio",
      edad: 22,
      sessionObjective: "fuerza",
    });
    assert.ok(exercises.length >= 1);
    assert.equal(String(exercises[0].sets), "3");
    assert.equal(exercises[0].reps, "4-6");
    assert.equal(exercises[0].rest, "3 min");
  });
});

describe("sesión generada respeta labels de plantilla", () => {
  it("plan de velocidad no reagrupa a calentamiento/principal genéricos", () => {
    const plan = buildPlayerPlan({
      id: "tpl-transfer",
      objetivo: "Velocidad",
      objetivos: ["Velocidad"],
      frecuencia: "1",
      material: ["Gimnasio completo"],
      experiencia: "1–3 años",
      edad: 22,
      deporte: "Fútbol",
      diaCompeticion: "Fin de semana",
      disponibles: ["Lunes"],
      lesion: [],
    });
    if (plan.planError) {
      assert.ok(plan.planError);
      return;
    }
    const session = plan.flatMap((d) => d.sessions || []).find((s) => /velocidad/i.test(s.type || s.title || ""));
    assert.ok(session, "hay sesión de velocidad");
    const labels = getNonEmptyBlocks(session).map((b) => b.label);
    for (const needed of ["Warm-up", "Fuerza máxima", "Pliometría", "Velocidad"]) {
      assert.ok(labels.includes(needed), `falta bloque ${needed}: ${labels.join(", ")}`);
    }
  });
});
