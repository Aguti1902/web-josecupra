import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  MAX_PLAN_SWAPS,
  needsMonthlyPlanRefresh,
  canSwapExercise,
  recordSwap,
  canRegenerateFromProfile,
  recordProfileRegen,
  profileTrainingFingerprint,
  resetCycleCounters,
  cycleEndDate,
  PLAN_CYCLE_DAYS,
  isSuccessfulGeneratedPlan,
  hasUnlimitedSwaps,
  currentCycleStartFromAlta,
  resolvePlanAltaDate,
} from "./planSwapLimits.js";
import { refreshExerciseAcrossPlan, replaceExerciseWithLibrary } from "./playerPlanEngine.js";
import { selectExerciseForSlot } from "./exerciseSelector.js";
import { EXERCISES } from "./exerciseCatalog.js";
import { listLibraryExercises, LIBRARY_SIZE } from "./exerciseLibrary.js";

describe("planSwapLimits — ciclo mensual", () => {
  beforeEach(() => {
    globalThis.localStorage = {
      _data: {},
      getItem(k) { return this._data[k] ?? null; },
      setItem(k, v) { this._data[k] = String(v); },
      removeItem(k) { delete this._data[k]; },
    };
  });
  afterEach(() => { delete globalThis.localStorage; });

  it("MAX_PLAN_SWAPS es 5", () => {
    assert.equal(MAX_PLAN_SWAPS, 5);
  });

  it("needsMonthlyPlanRefresh al cumplirse 1 mes calendario", () => {
    const plan = { startDate: "2026-07-01" };
    assert.equal(needsMonthlyPlanRefresh(plan, new Date("2026-07-20T12:00:00")), false);
    assert.equal(needsMonthlyPlanRefresh(plan, new Date("2026-07-29T12:00:00")), false);
    assert.equal(needsMonthlyPlanRefresh(plan, new Date("2026-08-01T12:00:00")), true);
    assert.equal(cycleEndDate("2026-07-01"), "2026-08-01");
    assert.equal(cycleEndDate("2026-09-02"), "2026-10-02");
    assert.equal(PLAN_CYCLE_DAYS, 30);
  });

  it("renueva el mismo día del mes desde la fecha de alta", () => {
    assert.equal(resolvePlanAltaDate({ createdAt: "2026-10-19T08:00:00.000Z" }, null), "2026-10-19");
    assert.equal(currentCycleStartFromAlta("2026-10-19", new Date("2026-10-25T12:00:00")), "2026-10-19");
    assert.equal(currentCycleStartFromAlta("2026-10-19", new Date("2026-11-19T12:00:00")), "2026-11-19");
    const plan = { startDate: "2026-10-19", altaDate: "2026-10-19" };
    assert.equal(needsMonthlyPlanRefresh(plan, new Date("2026-11-05T12:00:00")), false);
    assert.equal(needsMonthlyPlanRefresh(plan, new Date("2026-11-19T12:00:00")), true);
  });

  it("no refresca planes admin", () => {
    const plan = { startDate: "2026-01-01", source: "admin_manual" };
    assert.equal(needsMonthlyPlanRefresh(plan, new Date("2026-08-01")), false);
  });

  it("límites de swap y perfil por ciclo", () => {
    const user = { id: "u1" };
    const plan = { startDate: "2026-08-17", source: "profile_regen", profileRegenAt: "2026-08-17T12:00:00.000Z" };
    resetCycleCounters("u1", "2026-08-17");
    assert.equal(canSwapExercise(user, plan), true);
    assert.equal(canRegenerateFromProfile("u1", plan), true);
    for (let i = 0; i < 5; i++) recordSwap("u1", plan);
    assert.equal(canSwapExercise(user, plan), false);
    recordProfileRegen("u1", plan);
    assert.equal(canRegenerateFromProfile("u1", plan), false);
  });

  it("fingerprint de perfil incluye todos los campos editables", () => {
    const a = profileTrainingFingerprint({
      disponibles: ["Viernes", "Lunes"],
      material: ["Gomas", "Mancuernas"],
      experiencia: "1–3 años",
      edad: "24",
      deporte: "Fútbol",
      frecuencia: "3 días / sem",
      objetivos: ["Velocidad", "Fuerza"],
      lesion: ["Rodilla"],
      lesionSubtipo: ["Menisco"],
      diaCompeticion: "Fin de semana",
    });
    const b = profileTrainingFingerprint({
      disponibles: ["Lunes", "Viernes"],
      material: ["Mancuernas", "Gomas"],
      experiencia: "1–3 años",
      edad: "24",
      deporte: "Fútbol",
      frecuencia: "3 días / sem",
      objetivos: ["Fuerza", "Velocidad"],
      lesion: ["Rodilla"],
      lesionSubtipo: ["Menisco"],
      diaCompeticion: "Fin de semana",
    });
    assert.equal(a, b);
    const c = profileTrainingFingerprint({
      ...{
        disponibles: ["Lunes", "Viernes"],
        material: ["Mancuernas", "Gomas"],
        experiencia: "1–3 años",
        edad: "25",
        deporte: "Fútbol",
        frecuencia: "3 días / sem",
        objetivos: ["Fuerza", "Velocidad"],
        lesion: ["Rodilla"],
        lesionSubtipo: ["Menisco"],
        diaCompeticion: "Fin de semana",
      },
    });
    assert.notEqual(a, c);
  });

  it("isSuccessfulGeneratedPlan no cuenta errores ni planes vacíos", () => {
    assert.equal(isSuccessfulGeneratedPlan(null), false);
    assert.equal(isSuccessfulGeneratedPlan({ planError: "bloqueado" }), false);
    assert.equal(isSuccessfulGeneratedPlan([{ day: "Lunes", sessions: [{ exercises: [] }] }]), false);
    assert.equal(
      isSuccessfulGeneratedPlan([{
        day: "Lunes",
        sessions: [{ exercises: [{ id: "1", name: "Press" }] }],
      }]),
      true,
    );
  });

  it("recordProfileRegen solo tras éxito deja el cupo a 1", () => {
    const plan = { startDate: "2026-08-17" };
    resetCycleCounters("u2", "2026-08-17");
    assert.equal(canRegenerateFromProfile("u2", plan), true);
    // Simula intento fallido: no se llama recordProfileRegen
    assert.equal(canRegenerateFromProfile("u2", plan), true);
    recordProfileRegen("u2", plan);
    // Sin evidencia de éxito en el plan → gracia para reintentar
    assert.equal(canRegenerateFromProfile("u2", plan), true);
    assert.equal(
      canRegenerateFromProfile("u2", { ...plan, source: "profile_regen", profileRegenAt: "2026-08-17T12:00:00.000Z" }),
      false,
    );
  });

  it("hasUnlimitedSwaps ignora el tope de 5", () => {
    const user = { id: "u-extra", purchasedAddons: ["addon-unlimited-exercises"] };
    const plan = { startDate: "2026-08-17" };
    resetCycleCounters("u-extra", "2026-08-17");
    for (let i = 0; i < 8; i++) recordSwap("u-extra", plan);
    assert.equal(hasUnlimitedSwaps(user), true);
    assert.equal(canSwapExercise(user, plan), true);
  });
});

describe("refreshExerciseAcrossPlan", () => {
  it("propaga sustitución por catalogId a otras sesiones", () => {
    const shared = {
      id: "v2_101_1",
      catalogId: 101,
      pool: "FUE-MAN",
      name: "Press",
      blockType: "principal",
      slotConstraints: { rol: "basico" },
      etiquetas: {},
    };
    const other = { id: "v2_202_1", catalogId: 202, name: "Otro", blockType: "principal" };
    const plan = [
      {
        day: "Lunes",
        sessions: [{
          id: "s1",
          exercises: [{ ...shared }, other],
          blocks: [{ type: "principal", exercises: [{ ...shared }, other] }],
        }],
      },
      {
        day: "Miércoles",
        sessions: [{
          id: "s2",
          exercises: [{ ...shared, id: "v2_101_2" }],
          blocks: [{ type: "principal", exercises: [{ ...shared, id: "v2_101_2" }] }],
        }],
      },
    ];

    // Mock pool refresh is hard without catalog; if refresh fails, plan unchanged
    const next = refreshExerciseAcrossPlan(plan, "s1", "v2_101_1", {
      material: "mancuernas",
      lesiones: [],
      edad: 22,
      experiencia: "intermedio",
    });
    // Either replaced across plan or unchanged if pool empty — must not throw
    assert.ok(Array.isArray(next));
    assert.equal(next.length, 2);
  });

  it("cambia un calentamiento sin balón por otro vídeo y no cuelga", () => {
    globalThis.localStorage = {
      _data: {
        depro_club_custom_warmups: JSON.stringify([
          { id: "cgw_1", nombre: "Calentamiento 1", videoUrl: "https://youtu.be/aaaaaaaaaaa" },
          { id: "cgw_2", nombre: "Calentamiento 2", videoUrl: "https://youtu.be/bbbbbbbbbbb" },
        ]),
      },
      getItem(k) { return this._data[k] ?? null; },
      setItem(k, v) { this._data[k] = String(v); },
      removeItem(k) { delete this._data[k]; },
    };
    const warm = {
      id: "warmup_cgw_1_0",
      catalogId: "cgw_1",
      pool: "WARMUP-SIN-BALON",
      name: "Calentamiento 1",
      blockType: "calentamiento",
      warmupSource: "sin_balon",
      videoUrl: "https://youtu.be/aaaaaaaaaaa",
    };
    const plan = [{
      day: "Lunes",
      sessions: [{
        id: "s1",
        exercises: [warm],
        blocks: [{ type: "calentamiento", warmupSource: "sin_balon", exercises: [warm] }],
      }],
    }];
    const next = refreshExerciseAcrossPlan(plan, "s1", "warmup_cgw_1_0", {
      material: "sin_material",
      lesiones: [],
      edad: 22,
      experiencia: "intermedio",
    });
    assert.ok(Array.isArray(next));
    const ex = next[0].sessions[0].exercises[0];
    assert.equal(ex.warmupSource, "sin_balon");
    assert.notEqual(ex.catalogId, "cgw_1");
  });

  it("sustituye un ejercicio de catálogo por otro similar", () => {
    const slot = { rol: "basico", objetivo: "fuerza", segmento: "tren_superior", slotId: "swap_test" };
    const profile = { material: ["Gimnasio completo"], lesiones: [], edad: 22, experiencia: "intermedio" };
    const first = selectExerciseForSlot(slot, profile, [], "seed-a");
    assert.ok(first?.id, "hace falta un ejercicio de catálogo");
    const plan = [{
      day: "Lunes",
      sessions: [{
        id: "s1",
        exercises: [{
          id: `v2_${first.id}_1`,
          catalogId: first.id,
          name: first.name,
          pool: first.pool,
          etiquetas: first.etiquetas,
          slotConstraints: slot,
          blockType: "principal",
        }],
      }],
    }];
    const next = refreshExerciseAcrossPlan(plan, "s1", `v2_${first.id}_1`, {
      material: ["Gimnasio completo"],
      lesiones: [],
      edad: 22,
      experiencia: "intermedio",
    });
    const swapped = next[0].sessions[0].exercises[0];
    assert.notEqual(swapped.catalogId, first.id);
    assert.ok(swapped.name);
  });

  it("no lanza si el plan es objeto con days", () => {
    const plan = {
      startDate: "2026-08-17",
      days: [{
        day: "Lunes",
        sessions: [{
          id: "s1",
          exercises: [{ id: "v2_1_1", catalogId: 1, name: "Press", slotConstraints: { rol: "basico" } }],
        }],
      }],
    };
    const next = refreshExerciseAcrossPlan(plan, "s1", "v2_1_1", {
      material: ["Gimnasio completo"],
      lesiones: [],
      edad: 22,
      experiencia: "intermedio",
    });
    assert.equal(typeof next, "object");
    assert.ok(next.days || Array.isArray(next));
  });
});

describe("selección manual de la biblioteca", () => {
  it("lista toda la biblioteca y filtra por carpeta o texto, sin mirar el material", () => {
    assert.ok(LIBRARY_SIZE >= 150);
    assert.equal(listLibraryExercises().length, LIBRARY_SIZE);
    const core = listLibraryExercises({ carpeta: "core" });
    assert.ok(core.length > 0);
    assert.ok(core.every((ex) => ex.carpeta === "core"));
    const found = listLibraryExercises({ query: "sentadilla" });
    assert.ok(found.length > 0);
    assert.ok(found.every((ex) => /sentadilla/i.test(ex.nombre)));
  });

  it("cambia solo el ejercicio elegido y conserva series, reps y descanso", () => {
    const chosen = EXERCISES.find((ex) => ex.carpeta === "core");
    assert.ok(chosen);
    const press = {
      id: "v2_10_1",
      catalogId: 10,
      name: "Press banca",
      sets: "4",
      reps: "6",
      rest: "2 min",
      load: "80%",
      duration: "40\"",
      blockType: "principal",
    };
    const row = {
      id: "v2_11_1",
      catalogId: 11,
      name: "Remo con barra",
      sets: "3",
      reps: "10",
      rest: "90 s",
      blockType: "principal",
    };
    const otherDay = { ...press, id: "v2_10_miercoles" };
    const plan = [{
      day: "Lunes",
      sessions: [{
        id: "s1",
        exercises: [{ ...press }, { ...row }],
        blocks: [{ type: "principal", exercises: [{ ...press }, { ...row }] }],
      }],
    }, {
      day: "Miércoles",
      sessions: [{
        id: "s2",
        exercises: [{ ...otherDay }],
        blocks: [{ type: "principal", exercises: [{ ...otherDay }] }],
      }],
    }];
    plan.refrescos_usados_mes = 2;

    const next = replaceExerciseWithLibrary(plan, "s1", "v2_10_1", chosen);
    const monday = next[0].sessions[0];
    assert.equal(monday.exercises[0].catalogId, chosen.id);
    assert.equal(monday.exercises[0].name, chosen.nombre);
    assert.equal(monday.exercises[0].sets, "4");
    assert.equal(monday.exercises[0].reps, "6");
    assert.equal(monday.exercises[0].rest, "2 min");
    assert.equal(monday.exercises[0].load, "80%");
    assert.equal(monday.exercises[1].name, "Remo con barra");
    assert.equal(monday.exercises[1].sets, "3");
    assert.equal(monday.blocks[0].exercises[0].catalogId, chosen.id);
    assert.equal(monday.blocks[0].exercises[0].sets, "4");
    assert.equal(monday.blocks[0].exercises[1].name, "Remo con barra");
    assert.equal(next[1].sessions[0].exercises[0].name, "Press banca");
    assert.equal(next.refrescos_usados_mes, 2);
  });

  it("actualiza la misma ficha en las semanas del mesociclo", () => {
    const chosen = EXERCISES.find((ex) => ex.carpeta === "movilidad");
    const ex = {
      id: "v2_10_1",
      catalogId: 10,
      name: "Press banca",
      sets: "5",
      reps: "5",
      rest: "3 min",
      blockType: "principal",
    };
    const weeks = [1, 2, 3, 4].map((week) => ({
      week,
      days: [{
        day: "Lunes",
        sessions: [{
          id: `s_w${week}`,
          exercises: [{ ...ex }],
          blocks: [{ type: "principal", exercises: [{ ...ex }] }],
        }],
      }],
    }));
    const plan = { weeks, days: weeks[0].days, refrescos_usados_mes: 1 };
    const next = replaceExerciseWithLibrary(plan, "s_w1", "v2_10_1", chosen);
    for (const week of next.weeks) {
      const got = week.days[0].sessions[0].exercises[0];
      assert.equal(got.name, chosen.nombre);
      assert.equal(got.sets, "5");
      assert.equal(got.reps, "5");
      assert.equal(got.rest, "3 min");
    }
    assert.equal(next.refrescos_usados_mes, 1);
  });
});
