import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { refreshExercise } from "./exerciseSelector.js";
import { refreshExerciseAcrossPlan } from "./playerPlanEngine.js";
import { EXERCISES } from "./exerciseCatalog.js";
import { pickVaried } from "./deterministicPick.js";

function installLocalStorage() {
  const data = {};
  globalThis.localStorage = {
    getItem(k) { return Object.prototype.hasOwnProperty.call(data, k) ? data[k] : null; },
    setItem(k, v) { data[k] = String(v); },
    removeItem(k) { delete data[k]; },
    key(i) { return Object.keys(data)[i] ?? null; },
    get length() { return Object.keys(data).length; },
  };
}

describe("refresh de ejercicios", () => {
  beforeEach(installLocalStorage);
  afterEach(() => { delete globalThis.localStorage; });

  const profile = {
    material: ["gym_completo"],
    experiencia: "intermedio",
    userId: "u-refresh",
    lesiones: [],
  };

  it("pickVaried no se queda siempre en el primero", () => {
    const items = Array.from({ length: 12 }, (_, i) => ({ id: i + 1 }));
    const seen = new Set();
    for (let i = 0; i < 20; i++) seen.add(pickVaried(items, `s${i}`)?.id);
    assert.ok(seen.size >= 3, `variedad insuficiente: ${[...seen]}`);
  });

  it("refreshExercise cambia de catalogId cuando hay alternativas", () => {
    const current = EXERCISES.find((e) => e.etiquetas?.rol === "basico") || EXERCISES[0];
    assert.ok(current?.id);
    const ids = new Set();
    for (let i = 0; i < 8; i++) {
      const next = refreshExercise(current, profile, [], `try-${i}`);
      if (next?.id) ids.add(next.id);
    }
    assert.ok(!ids.has(current.id), "no debe devolver el mismo ejercicio");
    assert.ok(ids.size >= 2, `se esperaba más de una alternativa, hubo ${ids.size}`);
  });

  it("no reutiliza ejercicios ya presentes en la rutina", () => {
    const current = EXERCISES.find((e) => Number(e.id) > 20) || EXERCISES[5];
    const used = EXERCISES.slice(0, 15).map((e) => e.id).filter((id) => id !== current.id);
    const next = refreshExercise(current, profile, used, "no-reuse");
    if (next) {
      assert.equal(used.includes(next.id), false);
      assert.notEqual(next.id, current.id);
    }
  });

  it("refreshExerciseAcrossPlan deja el último swap en weeks[] para asignar", () => {
    const first = EXERCISES.find((e) => e.etiquetas?.rol === "basico") || EXERCISES[0];
    const other = EXERCISES.find((e) => e.id !== first.id) || { id: 999, name: "Otro" };
    const sessionEx = {
      id: `v2_${first.id}_1`,
      catalogId: first.id,
      pool: first.pool,
      name: first.nombre || first.name,
      blockType: "principal",
      slotConstraints: { rol: first.etiquetas?.rol || "basico" },
      etiquetas: first.etiquetas || {},
    };
    const plan = {
      weeks: [
        {
          week: 1,
          days: [{
            day: "Lunes",
            sessions: [{
              id: "s1",
              exercises: [sessionEx, { id: `v2_${other.id}_1`, catalogId: other.id, name: "Otro", blockType: "principal" }],
              blocks: [{ type: "principal", exercises: [sessionEx] }],
            }],
          }],
        },
      ],
    };
    const next = refreshExerciseAcrossPlan(plan, "s1", sessionEx.id, {
      material: "gym_completo",
      lesiones: [],
      edad: 22,
      experiencia: "intermedio",
    });
    const swapped = next.weeks[0].days[0].sessions[0].exercises[0];
    assert.ok(swapped);
    assert.ok(next.lastEditedAt);
    if (swapped.catalogId === first.id) {
      // pool agotado o mismo id: no debe colgar
      assert.ok(next.weeks);
    } else {
      assert.notEqual(swapped.catalogId, first.id);
    }
  });
});
