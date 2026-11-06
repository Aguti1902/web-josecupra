import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { EXERCISES } from "./exerciseCatalog.js";
import { SESSION_TEMPLATES } from "./sessionTemplatesV2.js";
import {
  fillBlockSlots,
  matchSlotTags,
  isExerciseContraindicated,
} from "./exerciseSelector.js";
import { expandBlockSlots, cyclePatternsForCount } from "./templateSlotCycle.js";

const gym = {
  material: ["gym_completo"],
  experiencia: "intermedio",
  edad: 22,
  userId: "u-gym",
};
const dumbbells = {
  material: ["mancuernas"],
  experiencia: "intermedio",
  edad: 22,
  userId: "u-db",
};

function jumpName(ex) {
  return /salto|drop jump|depth jump|bounding|pogo|patinador|pliometr/i.test(String(ex?.nombre || ""));
}

describe("secuencias cíclicas N=1..6", () => {
  it("empuje/tracción no redistribuye al aumentar N", () => {
    const cycle = [{ patron: "empuje" }, { patron: "traccion" }];
    const n2 = cyclePatternsForCount(cycle, 2).map((s) => s.patron);
    const n3 = cyclePatternsForCount(cycle, 3).map((s) => s.patron);
    const n4 = cyclePatternsForCount(cycle, 4).map((s) => s.patron);
    assert.deepEqual(n2, ["empuje", "traccion"]);
    assert.deepEqual(n3.slice(0, 2), n2);
    assert.deepEqual(n4, ["empuje", "traccion", "empuje", "traccion"]);
    for (let n = 1; n <= 6; n++) {
      const seq = cyclePatternsForCount(cycle, n).map((s) => s.patron);
      assert.equal(seq.length, n);
      assert.equal(seq[0], "empuje");
      if (n >= 2) assert.equal(seq[1], "traccion");
    }
  });

  it("F_FUERZA_INF básicos y complementarios respetan el ciclo al cambiar N", () => {
    const inf = SESSION_TEMPLATES["Fuerza Inferior"];
    const basicos = inf.blocks.find((b) => b.label === "Básicos");
    const comps = inf.blocks.find((b) => b.label === "Complementarios");
    for (let n = 1; n <= 6; n++) {
      const slots = expandBlockSlots({ ...basicos, count: n });
      assert.equal(slots.length, n);
      assert.equal(slots[0].patron, "cadena_anterior");
      if (n >= 2) assert.equal(slots[1].patron, "cadena_posterior");
      if (n >= 3) assert.equal(slots[2].patron, "cadena_anterior");
    }
    const byN = {};
    for (let n = 1; n <= 6; n++) {
      const slots = expandBlockSlots({ ...comps, count: n });
      assert.equal(slots.length, n);
      byN[n] = slots.map((s) => s.grupo_muscular);
    }
    assert.deepEqual(byN[3], ["cuadriceps", "isquios", "gemelos"]);
    assert.deepEqual(byN[4].slice(0, 3), byN[3]);
    assert.equal(byN[4][3], "cuadriceps");
    assert.equal(byN[6][5], "gemelos");
  });
});

describe("F_FUERZA_INF complementarios analíticos", () => {
  it("gimnasio: extensión, curl y gemelos; cero saltos", () => {
    const inf = SESSION_TEMPLATES["Fuerza Inferior"];
    const comps = inf.blocks.find((b) => b.label === "Complementarios");
    const filled = fillBlockSlots({ ...comps, count: 3 }, gym, []);
    assert.equal(filled.exercises.length, 3, filled.exercises.map((e) => e.nombre).join(" | "));
    const names = filled.exercises.map((e) => e.nombre);
    assert.equal(filled.exercises.some(jumpName), false, names.join(" | "));
    assert.equal(filled.exercises.some((e) => e.carpeta === "pliometria"), false, names.join(" | "));
    const muscles = filled.exercises.map((e) => e.etiquetas.grupo_principal);
    assert.ok(muscles.includes("cuadriceps") || names.some((n) => /extensi[oó]n|cuadr/i.test(n)), names.join(" | "));
    assert.ok(muscles.includes("isquios") || names.some((n) => /curl femoral|isquio|nordic/i.test(n)), names.join(" | "));
    assert.ok(muscles.includes("gemelos") || names.some((n) => /gemelo/i.test(n)), names.join(" | "));
  });

  it("no etiqueta un salto como analítico de fuerza", () => {
    const plyo = EXERCISES.filter((e) => e.carpeta === "pliometria");
    assert.ok(plyo.length > 0);
    const slot = {
      rol: "complementario",
      patron: "analitico",
      grupo_muscular: "cuadriceps",
      excludePatrons: ["pliometria"],
      forbidCompounds: true,
    };
    assert.ok(plyo.every((e) => matchSlotTags(e, slot) === false));
  });
});

describe("F_HIP_TORSO N=4", () => {
  it("2 empuje + 2 tracciones de familia distinta", () => {
    const tpl = SESSION_TEMPLATES["Hipertrofia Torso"];
    const basicos = tpl.blocks.find((b) => b.label === "Básicos");
    const filled = fillBlockSlots({ ...basicos, count: 4 }, gym, []);
    assert.equal(filled.exercises.length, 4, filled.exercises.map((e) => e.nombre).join(" | "));
    const push = filled.exercises.filter((e) => (e.etiquetas.patron || []).includes("empuje"));
    const pull = filled.exercises.filter((e) => (e.etiquetas.patron || []).includes("traccion"));
    assert.equal(push.length, 2, filled.exercises.map((e) => `${e.nombre}:${e.etiquetas.patron}`).join(" | "));
    assert.equal(pull.length, 2, filled.exercises.map((e) => `${e.nombre}:${e.etiquetas.patron}`).join(" | "));
    const families = pull.map((e) => e.etiquetas.familia);
    assert.equal(new Set(families).size, 2, families.join(","));
  });
});

describe("F_HIP_PIERNA mancuernas", () => {
  it("C/D no cuela máquina ni pliometría", () => {
    const tpl = SESSION_TEMPLATES["Hipertrofia Pierna"];
    const anal = tpl.blocks.find((b) => /Anal/i.test(b.label));
    const filled = fillBlockSlots(anal, dumbbells, []);
    assert.ok(filled.exercises.length >= 1);
    for (const ex of filled.exercises) {
      const mat = (ex.etiquetas.material || []).map((m) => String(m).toLowerCase());
      const ok = mat.every((m) => /mancuern|sin.?material|peso.?corporal|gomas|banda|campo|ninguno/.test(m));
      assert.ok(ok, `${ex.nombre} exige [${mat}]`);
      assert.notEqual(ex.carpeta, "pliometria");
      assert.equal(jumpName(ex), false, ex.nombre);
    }
  });
});

describe("lesiones hombro/rodilla", () => {
  it("excluye no_seleccionar_automaticamente de rodilla y hombro", () => {
    const squat = EXERCISES.find((e) => /sentadilla cl/i.test(e.nombre));
    assert.ok(squat);
    assert.equal(isExerciseContraindicated(squat, ["rodilla"]), true);

    const press = EXERCISES.find((e) => /press banca/i.test(e.nombre) || /press plano/i.test(e.nombre));
    assert.ok(press);
    assert.equal(isExerciseContraindicated(press, ["hombro"]), true);

    const inf = SESSION_TEMPLATES["Fuerza Inferior"];
    const basicos = inf.blocks.find((b) => b.label === "Básicos");
    const filled = fillBlockSlots(basicos, { ...gym, lesiones: ["rodilla"] }, []);
    for (const ex of filled.exercises) {
      assert.equal(isExerciseContraindicated(ex, ["rodilla"]), false, ex.nombre);
    }
  });
});

describe("F_RES no mezcla protocolos", () => {
  it("aeróbica no trae umbral ni anaeróbico", () => {
    const tpl = SESSION_TEMPLATES["Resistencia aeróbica"];
    const block = tpl.blocks.find((b) => /aer/i.test(b.label));
    const filled = fillBlockSlots(block, gym, []);
    assert.ok(filled.exercises.length >= 1);
    for (const ex of filled.exercises) {
      assert.ok((ex.etiquetas.patron || []).includes("aerobico"), ex.nombre);
      assert.equal((ex.etiquetas.patron || []).includes("umbral"), false, ex.nombre);
      assert.equal((ex.etiquetas.patron || []).includes("anaerobico"), false, ex.nombre);
    }
  });

  it("umbral no trae aeróbico ni anaeróbico", () => {
    const tpl = SESSION_TEMPLATES["Resistencia umbral"];
    const block = tpl.blocks.find((b) => /umbr/i.test(b.label));
    const filled = fillBlockSlots(block, gym, []);
    assert.ok(filled.exercises.length >= 1);
    for (const ex of filled.exercises) {
      assert.ok((ex.etiquetas.patron || []).includes("umbral"), ex.nombre);
      assert.equal((ex.etiquetas.patron || []).includes("aerobico"), false, ex.nombre);
      assert.equal((ex.etiquetas.patron || []).includes("anaerobico"), false, ex.nombre);
    }
  });
});

describe("etiquetas enriquecidas sin inventar ejercicios", () => {
  it("conserva IDs y añade familia/rol_funcional", () => {
    const ids = EXERCISES.map((e) => e.id);
    assert.equal(new Set(ids).size, ids.length);
    assert.equal(EXERCISES.length, 182);
    const curl = EXERCISES.find((e) => /curl femoral/i.test(e.nombre));
    assert.ok(curl);
    assert.equal(curl.rol || curl.etiquetas.rol, "complementario");
    assert.ok((curl.etiquetas.patron || []).includes("analitico"));
    assert.equal(curl.etiquetas.familia, "curl_femoral");
    const sent = EXERCISES.find((e) => e.id === 1);
    assert.equal(sent.etiquetas.familia, "sentadilla");
    assert.ok((sent.etiquetas.patron || []).includes("dominante_rodilla"));
  });
});
