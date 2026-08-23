import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { EXERCISES, CATALOG_CARPETAS } from "./exerciseCatalog.js";
import { matchSlotTags } from "./exerciseSelector.js";
import { SESSION_TEMPLATES } from "./sessionTemplatesV2.js";
import { blockAllowsLoadLogging, objectiveAllowsLoadLogging } from "./loadAnalytics.js";
import { buildClubExerciseTagIndex, CLUB_TAG_VALUES } from "./clubAuto/clubExerciseTags.js";

describe("taxonomía carpetas", () => {
  it("define las carpetas funcionales (incluye resistencia)", () => {
    assert.deepEqual(CATALOG_CARPETAS, [
      "fuerza_tren_inferior",
      "fuerza_tren_superior",
      "velocidad",
      "resistencia",
      "pliometria",
      "core",
      "prevencion",
      "movilidad",
    ]);
  });

  it("todos los ejercicios tienen carpeta y grupo_principal", () => {
    for (const ex of EXERCISES) {
      assert.ok(CATALOG_CARPETAS.includes(ex.carpeta), `${ex.nombre} carpeta inválida: ${ex.carpeta}`);
      assert.ok(ex.etiquetas.grupo_principal, `${ex.nombre} sin grupo_principal`);
      assert.deepEqual(ex.etiquetas.grupo_muscular, [ex.etiquetas.grupo_principal]);
    }
  });
});

describe("etiquetado — casos críticos", () => {
  it("Isometría de remo con banda = tracción/espalda, no bíceps", () => {
    const remo = EXERCISES.find((e) => e.id === 126 || /isometr[ií]a de remo/i.test(e.nombre));
    assert.ok(remo);
    assert.equal(remo.etiquetas.grupo_principal, "espalda");
    assert.ok(remo.etiquetas.patron.includes("traccion"));
    assert.ok(remo.etiquetas.patron.includes("isometrico"));
    assert.equal(matchSlotTags(remo, { rol: "complementario", patron: "analitico", grupo_muscular: "biceps" }), false);
  });

  it("Bird dog = core + estabilidad lumbopélvica", () => {
    const bird = EXERCISES.find((e) => /^bird dog$/i.test(e.nombre));
    assert.ok(bird);
    assert.equal(bird.carpeta, "core");
    assert.equal(bird.etiquetas.grupo_principal, "core");
    assert.ok(bird.etiquetas.accion_secundaria?.includes("estabilidad_lumbopelvica"));
  });

  it("Y-T-W = prevención escapular", () => {
    const ytw = EXERCISES.find((e) => /y-?t-?w escapular en suelo/i.test(e.nombre));
    assert.ok(ytw);
    assert.equal(ytw.carpeta, "prevencion");
    assert.equal(ytw.etiquetas.grupo_principal, "escapular");
  });

  it("slots bíceps analítico solo curls", () => {
    const bicepsSlot = { rol: "complementario", patron: "analitico", grupo_muscular: "biceps" };
    const hits = EXERCISES.filter((e) => matchSlotTags(e, bicepsSlot));
    assert.ok(hits.length >= 1);
    assert.ok(hits.every((e) => /b[ií]ceps|curl/i.test(e.nombre)));
  });

  it("slots tríceps analítico solo aislamiento de tríceps", () => {
    const tricepsSlot = { rol: "complementario", patron: "analitico", grupo_muscular: "triceps" };
    const hits = EXERCISES.filter((e) => matchSlotTags(e, tricepsSlot));
    assert.ok(hits.length >= 1);
    assert.ok(hits.every((e) => e.etiquetas.grupo_principal === "triceps"));
    assert.ok(hits.every((e) => e.etiquetas.patron.includes("analitico")));
    assert.ok(hits.every((e) => /tr[ií]ceps|franc[eé]s|fondos?/i.test(e.nombre)));
  });

  it("prevención/rotadores/movilidad no entran como analítico de brazo", () => {
    const armSlots = [
      { rol: "complementario", patron: "analitico", grupo_muscular: "biceps" },
      { rol: "complementario", patron: "analitico", grupo_muscular: "triceps" },
    ];
    for (const slot of armSlots) {
      const hits = EXERCISES.filter((e) => matchSlotTags(e, slot));
      assert.ok(hits.every((e) => e.carpeta !== "prevencion" && e.carpeta !== "movilidad"));
      assert.ok(hits.every((e) => !/rotador|escapular|Y-?T-?W|monster|lateral walk/i.test(e.nombre)));
    }
  });

  it("tracción básica no incluye prevención escapular mal etiquetada", () => {
    const slot = { rol: "basico", objetivo: "fuerza", segmento: "tren_superior", patron: "traccion" };
    const hits = EXERCISES.filter((e) => matchSlotTags(e, slot));
    assert.ok(hits.length >= 1);
    assert.ok(hits.every((e) => e.carpeta !== "prevencion"));
    assert.ok(hits.every((e) => !/superman|Y-?T-?W|trap.?3|elevaci[oó]n escapular/i.test(e.nombre)));
  });

  it("plantillas Fuerza Superior/Full exigen patrón analítico en bíceps", () => {
    for (const key of ["Fuerza Superior", "Fuerza Full", "Hipertrofia Full"]) {
      const tpl = SESSION_TEMPLATES[key];
      const biceps = tpl.blocks
        .flatMap((b) => b.slots || [])
        .find((s) => s.grupo_muscular === "biceps" || (Array.isArray(s.grupo_muscular) && s.grupo_muscular.includes("biceps")));
      assert.ok(biceps, `${key} tiene slot bíceps`);
      assert.equal(biceps.patron, "analitico");
    }
  });

  it("plantillas no incluyen vuelta_calma ni Técnica Media", () => {
    assert.equal(SESSION_TEMPLATES["Técnica Media"], undefined);
    for (const [key, tpl] of Object.entries(SESSION_TEMPLATES)) {
      if (!tpl?.blocks) continue;
      for (const b of tpl.blocks) {
        assert.notEqual(b.type, "vuelta_calma", `${key} no debe tener bloque vuelta_calma`);
        for (const s of b.slots || []) {
          assert.notEqual(s.rol, "vuelta_calma", `${key} no debe tener slot vuelta_calma`);
        }
      }
    }
  });
});

describe("isométricos nuevos", () => {
  it("incluye los 15 holds pedidos", () => {
    const required = [
      "Split squat hold",
      "Puente de glúteo unilateral isométrico",
      "Wall sit unilateral",
      "Isometría aductores con balón",
      "Copenhagen hold básico",
      "Copenhagen hold medio",
      "Isometría isquios supino talones en banco",
      "Press isométrico pared unilateral",
      "Rotación externa isométrica con banda",
      "Serrato wall hold",
      "Dead bug hold",
      "Bear plank hold",
      "Pallof hold",
      "Drop landing + hold",
      "Skater landing hold",
    ];
    for (const name of required) {
      const ex = EXERCISES.find((e) => e.nombre === name);
      assert.ok(ex, `falta ${name}`);
      assert.ok(ex.etiquetas.patron.includes("isometrico"), `${name} sin patron isometrico`);
      assert.notEqual(ex.carpeta, "isometricos");
    }
  });
});

describe("capa club_* aislada", () => {
  it("genera tags club_* sin mutar etiquetas base", () => {
    const idx = buildClubExerciseTagIndex();
    assert.ok(Object.keys(idx).length > 20);
    const sample = Object.values(idx)[0];
    assert.ok(sample.club_slot?.length);
    assert.ok(sample.club_entorno?.every((t) => t.startsWith("club_")));
    assert.ok(CLUB_TAG_VALUES.club_slot.length >= 15);
    // motor individual no ve club_* en etiquetas del ejercicio
    const remo = EXERCISES.find((e) => e.id === 126);
    assert.equal(remo.etiquetas.club_slot, undefined);
  });
});

describe("registro de carga — ubicación", () => {
  it("no permite logging en calentamiento / vuelta a la calma", () => {
    assert.equal(blockAllowsLoadLogging("calentamiento"), false);
    assert.equal(blockAllowsLoadLogging("vuelta_calma"), false);
    assert.equal(blockAllowsLoadLogging("principal"), true);
  });

  it("solo objetivos medibles", () => {
    assert.equal(objectiveAllowsLoadLogging("fuerza"), true);
    assert.equal(objectiveAllowsLoadLogging("velocidad"), true);
    assert.equal(objectiveAllowsLoadLogging("movilidad"), false);
  });
});
