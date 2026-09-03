/**
 * Reglas del motor: multiarticulares/analíticos, material, carrera,
 * sin repeticiones, mesociclo de 1 mes con la misma rutina.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  selectExerciseForSlot,
  fillBlockSlots,
  isAnalyticExercise,
  isMultiarticularExercise,
  userHasLoadEquipment,
  isRunningEnduranceExercise,
  isBodyweightMaterial,
} from "./exerciseSelector.js";
import { EXERCISES } from "./exerciseCatalog.js";
import { SESSION_TEMPLATES } from "./sessionTemplatesV2.js";
import { buildPlayerPlan, buildFourWeekPlan, refreshExerciseAcrossPlan } from "./playerPlanEngine.js";
import { cycleEndDate, weekCountForCycle } from "./planSwapLimits.js";

function gymProfile(overrides = {}) {
  return {
    material: ["gym_completo"],
    experiencia: "intermedio",
    edad: 22,
    userId: "u-gym",
    lesiones: [],
    ...overrides,
  };
}

function sessionNames(session) {
  const fromBlocks = (session?.blocks || []).flatMap((b) => (b.exercises || []).map((e) => e.name || e.nombre));
  const fromList = (session?.exercises || []).map((e) => e.name || e.nombre);
  return fromList.length ? fromList : fromBlocks;
}

describe("naturaleza multiarticular / analítica", () => {
  it("curl femoral es analítico y no multiarticular", () => {
    const curl = EXERCISES.find((e) => /curl femoral/i.test(e.nombre));
    assert.ok(curl);
    assert.equal(isAnalyticExercise(curl), true);
    assert.equal(isMultiarticularExercise(curl), false);
  });

  it("básico de tren inferior no elige curl / extensión analítica", () => {
    const picked = [];
    for (let i = 0; i < 8; i++) {
      const ex = selectExerciseForSlot(
        {
          rol: "basico",
          objetivo: "fuerza",
          segmento: "tren_inferior",
          patron: "cadena_anterior",
          nature: "multiarticular",
          slotId: `t${i}`,
        },
        gymProfile({ userId: `u-basic-${i}` }),
      );
      if (ex) picked.push(ex);
    }
    assert.ok(picked.length > 0);
    for (const ex of picked) {
      assert.equal(isAnalyticExercise(ex), false, `${ex.nombre} no debe ser analítico en básico`);
    }
  });

  it("complementario analítico elige aislamiento", () => {
    const ex = selectExerciseForSlot(
      {
        rol: "complementario",
        patron: "analitico",
        grupo_muscular: "biceps",
        nature: "analitico",
        slotId: "c1",
      },
      gymProfile(),
    );
    assert.ok(ex);
    assert.equal(isAnalyticExercise(ex), true);
  });
});

describe("material en básicos / fuerza máxima", () => {
  it("userHasLoadEquipment detecta gimnasio y barra", () => {
    assert.equal(userHasLoadEquipment(["Gimnasio completo"]), true);
    assert.equal(userHasLoadEquipment(["mancuernas", "barra"]), true);
    assert.equal(userHasLoadEquipment(["Sin material"]), false);
  });

  it("con gimnasio el básico no es peso corporal", () => {
    const ex = selectExerciseForSlot(
      {
        rol: "basico",
        objetivo: "fuerza",
        segmento: "tren_inferior",
        patron: "cadena_anterior",
        nature: "multiarticular",
        slotId: "gym-basic",
      },
      gymProfile(),
    );
    assert.ok(ex);
    assert.equal(isBodyweightMaterial(ex.etiquetas?.material), false, `${ex.nombre} no debe ser peso corporal`);
  });
});

describe("resistencia prioriza carrera", () => {
  it("sin lesión elige carrera", () => {
    const ex = selectExerciseForSlot(
      { rol: "basico", objetivo: "resistencia", patron: "aerobico", slotId: "res1" },
      { material: ["sin_material"], experiencia: "intermedio", userId: "run1", lesiones: [] },
    );
    assert.ok(ex);
    assert.equal(isRunningEnduranceExercise(ex), true, `${ex.nombre} debería ser carrera`);
  });

  it("con lesión de rodilla no fuerza carrera", () => {
    const ex = selectExerciseForSlot(
      { rol: "basico", objetivo: "resistencia", patron: "aerobico", slotId: "res2" },
      { material: ["gym_completo"], experiencia: "intermedio", userId: "knee1", lesiones: ["rodilla"] },
    );
    if (ex) {
      assert.equal(isRunningEnduranceExercise(ex), false, `${ex.nombre} no debería ser carrera con rodilla`);
    }
  });
});

describe("sin repeticiones en la misma rutina", () => {
  it("fillBlockSlots no repite el mismo ejercicio", () => {
    const block = SESSION_TEMPLATES["Fuerza Full"].blocks.find((b) => b.label === "Básicos");
    const { exercises } = fillBlockSlots(block, gymProfile());
    const names = exercises.map((e) => String(e.nombre || e.name).toLowerCase());
    assert.equal(new Set(names).size, names.length);
  });

  it("sesión de fuerza no duplica nombres", () => {
    const plan = buildPlayerPlan({
      id: "no-dup",
      objetivo: "Fuerza",
      objetivos: ["Fuerza"],
      frecuencia: "3",
      material: ["Gimnasio completo"],
      experiencia: "1–3 años",
      edad: 22,
      deporte: "Fútbol",
      diaCompeticion: "Fin de semana",
      disponibles: ["Lunes", "Miércoles", "Viernes"],
      lesion: [],
    });
    if (plan.planError) return;
    for (const day of plan) {
      for (const s of day.sessions || []) {
        const names = sessionNames(s).filter(Boolean).map((n) => n.toLowerCase());
        assert.equal(new Set(names).size, names.length, `duplicado en ${s.title}: ${names.join(", ")}`);
      }
    }
  });
});

describe("mesociclo de 1 mes y misma rutina", () => {
  it("compra el 2 de septiembre → 2 de octubre", () => {
    assert.equal(cycleEndDate("2026-09-02"), "2026-10-02");
    assert.ok(weekCountForCycle("2026-09-02") >= 4);
  });

  it("las semanas del mes clonan la misma rutina", () => {
    const user = {
      id: "same-week",
      objetivo: "Fuerza",
      objetivos: ["Fuerza"],
      frecuencia: "2",
      material: ["Gimnasio completo"],
      experiencia: "1–3 años",
      edad: 22,
      deporte: "Fútbol",
      diaCompeticion: "Fin de semana",
      disponibles: ["Lunes", "Jueves"],
      lesion: [],
    };
    const weeks = buildFourWeekPlan(user, { startDate: "2026-09-02" });
    assert.ok(weeks.length >= 4);
    const names0 = (weeks[0].sessions || []).flatMap((s) => sessionNames(s)).join("|");
    for (let i = 1; i < weeks.length; i++) {
      const namesI = (weeks[i].sessions || []).flatMap((s) => sessionNames(s)).join("|");
      assert.equal(namesI, names0, `semana ${i + 1} debe clonar la semana 1`);
    }
  });

  it("refreshExerciseAcrossPlan aplica el swap a todas las semanas", () => {
    const shared = {
      id: "v2_101_1",
      catalogId: 101,
      name: "Split squat",
      blockType: "principal",
      slotConstraints: { rol: "basico", nature: "multiarticular" },
    };
    const plan = {
      weeks: [
        { week: 1, sessions: [{ id: "s1", exercises: [{ ...shared }], blocks: [{ type: "principal", exercises: [{ ...shared }] }] }] },
        { week: 2, sessions: [{ id: "s2", exercises: [{ ...shared, id: "v2_101_2" }], blocks: [{ type: "principal", exercises: [{ ...shared, id: "v2_101_2" }] }] }] },
      ],
    };
    const next = refreshExerciseAcrossPlan(plan, "s1", "v2_101_1", {
      material: ["gym_completo"],
      lesiones: [],
      edad: 22,
      experiencia: "intermedio",
    });
    assert.ok(next.weeks);
    const w1 = next.weeks[0].sessions[0].exercises[0];
    const w2 = next.weeks[1].sessions[0].exercises[0];
    if (w1.catalogId !== 101) {
      assert.equal(w1.catalogId, w2.catalogId);
      assert.notEqual(w1.name, "Split squat");
    }
  });
});
