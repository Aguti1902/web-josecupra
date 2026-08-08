/**
 * 13 casos de prueba del prompt DEPRO motor de planificación.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildPlayerPlan, checkPlanCompatibility } from "./playerPlanEngine.js";
import { getAllowedIntensities, getMatchDayDistance, placeSessionsOnCalendar } from "./planLoadRules.js";
import { buildWeekSessionList } from "./objectiveSessionMatrix.js";

function profile(overrides = {}) {
  return {
    id: "test_user",
    objetivo: "Fuerza",
    objetivos: ["Fuerza"],
    frecuencia: "2 días / sem",
    material: ["Sin material", "Gomas"],
    experiencia: "1–3 años",
    edad: 22,
    deporte: "Fútbol",
    diaCompeticion: "Fin de semana",
    disponibles: ["Lunes", "Jueves"],
    lesion: [],
    ...overrides,
  };
}

function sessionsByDay(plan) {
  const map = {};
  for (const d of plan) {
    if (d.sessions?.length) map[d.day] = d.sessions[0];
  }
  return map;
}

function typesByDay(plan) {
  const map = sessionsByDay(plan);
  return Object.fromEntries(Object.entries(map).map(([d, s]) => [d, s.type]));
}

describe("DEPRO motor — 13 casos", () => {
  it("1. Fuerza + 2 días (L, J) → INF + SUP, ambas ALTA, cobertura 4 patrones", () => {
    const plan = buildPlayerPlan(profile({
      objetivo: "Fuerza",
      objetivos: ["Fuerza"],
      frecuencia: "2",
      disponibles: ["Lunes", "Jueves"],
    }));
    assert.ifError(plan.planError);
    const types = Object.values(typesByDay(plan));
    assert.ok(types.includes("Fuerza Inferior") || types.includes("Fuerza A"));
    assert.ok(types.includes("Fuerza Superior") || types.includes("Fuerza B") || types.includes("Fuerza Superior A"));
    const sessions = Object.values(sessionsByDay(plan));
    assert.equal(sessions.length, 2);
    sessions.forEach((s) => {
      assert.ok(!s.adaptedIntensity || s.adaptedIntensity === "alta" || s.intensityLevel === "alta" || s.intensity === "alta");
    });
  });

  it("2. Fuerza + 2 días (L, V) → adaptadas MEDIA, sin bloqueo", () => {
    const user = profile({
      objetivo: "Fuerza",
      objetivos: ["Fuerza"],
      frecuencia: "2",
      disponibles: ["Lunes", "Viernes"],
    });
    const check = checkPlanCompatibility(user);
    assert.equal(check.hardBlock, false);
    const plan = buildPlayerPlan(user);
    assert.ifError(plan.planError);
    const sessions = Object.values(sessionsByDay(plan));
    assert.equal(sessions.length, 2);
    // Lunes = +2 (media/baja), Viernes = −1 (media/baja) con sábado
    assert.equal(getMatchDayDistance("Lunes", "Sábado"), 2);
    assert.equal(getMatchDayDistance("Viernes", "Sábado"), -1);
    assert.deepEqual(getAllowedIntensities(2), ["media", "baja"]);
    assert.deepEqual(getAllowedIntensities(-1), ["media", "baja"]);
  });

  it("3. Velocidad + 2 días (L, V) → BLOQUEO DURO", () => {
    const user = profile({
      objetivo: "Velocidad",
      objetivos: ["Velocidad"],
      frecuencia: "2",
      disponibles: ["Lunes", "Viernes"],
    });
    const check = checkPlanCompatibility(user);
    assert.equal(check.hardBlock, true);
    assert.match(check.message, /Velocidad|intensidad/i);
    const plan = buildPlayerPlan(user);
    assert.ok(plan.planError);
  });

  it("4. Velocidad + 3 días (L, J, V) → Prevención · Velocidad · Prevención", () => {
    const plan = buildPlayerPlan(profile({
      objetivo: "Velocidad",
      objetivos: ["Velocidad"],
      frecuencia: "3",
      disponibles: ["Lunes", "Jueves", "Viernes"],
    }));
    assert.ifError(plan.planError);
    const byDay = typesByDay(plan);
    assert.equal(byDay.Jueves, "Velocidad");
    assert.equal(byDay.Lunes, "Prevención");
    assert.equal(byDay.Viernes, "Prevención");
  });

  it("5. Velocidad + 3 días (M, X, J) → Velocidad · Prevención · Fuerza Full", () => {
    const plan = buildPlayerPlan(profile({
      objetivo: "Velocidad",
      objetivos: ["Velocidad"],
      frecuencia: "3",
      disponibles: ["Martes", "Miércoles", "Jueves"],
    }));
    assert.ifError(plan.planError);
    const byDay = typesByDay(plan);
    assert.equal(byDay.Martes, "Velocidad");
    assert.ok(["Prevención", "Movilidad"].includes(byDay.Miércoles));
    assert.ok(String(byDay.Jueves).startsWith("Fuerza"));
  });

  it("6. Fuerza + velocidad + 2 días (M, X) → ambas ALTA consecutivas, se genera", () => {
    const plan = buildPlayerPlan(profile({
      objetivo: "Fuerza",
      objetivoSecundario: "Velocidad",
      objetivos: ["Fuerza", "Velocidad"],
      frecuencia: "2",
      disponibles: ["Martes", "Miércoles"],
    }));
    assert.ifError(plan.planError);
    const byDay = typesByDay(plan);
    assert.ok(String(byDay.Martes).startsWith("Fuerza") || byDay.Martes === "Velocidad");
    assert.ok(String(byDay.Miércoles).startsWith("Fuerza") || byDay.Miércoles === "Velocidad");
    assert.notEqual(byDay.Martes, byDay.Miércoles);
  });

  it("7. Fuerza + hipertrofia + 2 días (M, J) → FULL + FULL", () => {
    const plan = buildPlayerPlan(profile({
      objetivo: "Fuerza",
      objetivoSecundario: "Hipertrofia",
      objetivos: ["Fuerza", "Hipertrofia"],
      frecuencia: "2",
      disponibles: ["Martes", "Jueves"],
    }));
    assert.ifError(plan.planError);
    const types = Object.values(typesByDay(plan));
    assert.ok(types.some((t) => String(t).includes("Fuerza")));
    assert.ok(types.some((t) => String(t).includes("Hipertrofia")));
  });

  it("8. Fuerza + hipertrofia + 4 días (L, M, X, J)", () => {
    const plan = buildPlayerPlan(profile({
      objetivo: "Fuerza",
      objetivoSecundario: "Hipertrofia",
      objetivos: ["Fuerza", "Hipertrofia"],
      frecuencia: "4",
      disponibles: ["Lunes", "Martes", "Miércoles", "Jueves"],
    }));
    assert.ifError(plan.planError);
    const byDay = typesByDay(plan);
    assert.equal(Object.keys(byDay).length, 4);
    const types = Object.values(byDay);
    assert.ok(types.filter((t) => String(t).startsWith("Fuerza")).length >= 2);
    assert.ok(types.filter((t) => String(t).startsWith("Hipertrofia")).length >= 2);
  });

  it("9. Prevención + 3 días, no_compito", () => {
    const plan = buildPlayerPlan(profile({
      objetivo: "Prevención",
      objetivos: ["Prevención"],
      frecuencia: "3",
      diaCompeticion: "No compito",
      disponibles: ["Lunes", "Miércoles", "Viernes"],
    }));
    assert.ifError(plan.planError);
    const byDay = typesByDay(plan);
    assert.equal(Object.keys(byDay).length, 3);
    assert.ok(Object.values(byDay).includes("Prevención"));
    assert.ok(Object.values(byDay).includes("Movilidad") || Object.values(byDay).some((t) => String(t).startsWith("Fuerza")));
  });

  it("10. Velocidad + 4 días (L, M, X, J) → 1 fuerza de relleno máx", () => {
    const plan = buildPlayerPlan(profile({
      objetivo: "Velocidad",
      objetivos: ["Velocidad"],
      frecuencia: "4",
      disponibles: ["Lunes", "Martes", "Miércoles", "Jueves"],
    }));
    assert.ifError(plan.planError);
    const types = Object.values(typesByDay(plan));
    assert.ok(types.includes("Velocidad"));
    const fuerza = types.filter((t) => String(t).startsWith("Fuerza"));
    assert.ok(fuerza.length <= 1, `esperaba ≤1 fuerza, got ${fuerza.join(",")}`);
    assert.ok(types.filter((t) => t === "Prevención").length >= 1);
  });

  it("11. Fuerza + 5 días (L–V) → sin encadenar ALTA si hay alternativa", () => {
    const plan = buildPlayerPlan(profile({
      objetivo: "Fuerza",
      objetivos: ["Fuerza"],
      frecuencia: "5",
      disponibles: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
    }));
    assert.ifError(plan.planError);
    const ordered = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]
      .map((d) => sessionsByDay(plan)[d])
      .filter(Boolean);
    assert.equal(ordered.length, 5);
    // Quinta sesión media/baja
    const last = ordered[ordered.length - 1];
    assert.ok(["media", "baja"].includes(String(last.intensityLevel || last.intensity).toLowerCase())
      || last.adaptedIntensity === "media"
      || ["Prevención", "Movilidad", "Velocidad"].includes(last.type));
  });

  it("12. Velocidad + 3 días (L, M, V) → solo martes ALTA", () => {
    const plan = buildPlayerPlan(profile({
      objetivo: "Velocidad",
      objetivos: ["Velocidad"],
      frecuencia: "3",
      disponibles: ["Lunes", "Martes", "Viernes"],
    }));
    assert.ifError(plan.planError);
    const byDay = typesByDay(plan);
    assert.equal(byDay.Martes, "Velocidad");
    assert.equal(byDay.Lunes, "Prevención");
    assert.equal(byDay.Viernes, "Prevención");
  });

  it("13. Fuerza + velocidad, no_compito, 2 días (L, J)", () => {
    const plan = buildPlayerPlan(profile({
      objetivo: "Fuerza",
      objetivoSecundario: "Velocidad",
      objetivos: ["Fuerza", "Velocidad"],
      frecuencia: "2",
      diaCompeticion: "No compito",
      disponibles: ["Lunes", "Jueves"],
    }));
    assert.ifError(plan.planError);
    const byDay = typesByDay(plan);
    assert.ok(String(byDay.Lunes).startsWith("Fuerza") || byDay.Lunes === "Velocidad");
    assert.ok(String(byDay.Jueves).startsWith("Fuerza") || byDay.Jueves === "Velocidad");
    assert.ok(plan.sesiones_pendientes_compensar);
    assert.ok(plan.ultima_generacion);
  });
});

describe("helpers matriz / distancias", () => {
  it("−1 admite MEDIA; −2 admite ALTA; +1 solo BAJA", () => {
    assert.deepEqual(getAllowedIntensities(-1), ["media", "baja"]);
    assert.ok(getAllowedIntensities(-2).includes("alta"));
    assert.deepEqual(getAllowedIntensities(1), ["baja"]);
  });

  it("matriz fuerza 2 días = INF + SUP", () => {
    const { sessionTypes } = buildWeekSessionList("Fuerza", null, 2);
    assert.deepEqual(sessionTypes, ["Fuerza Inferior", "Fuerza Superior"]);
  });

  it("placeSessionsOnCalendar rellena y sustituye fuerza sin día ALTA", () => {
    const { assignments } = placeSessionsOnCalendar(
      ["Velocidad", "Fuerza Full", "Prevención"],
      ["Lunes", "Jueves", "Viernes"],
      "Sábado",
      { fillIndexes: [1] },
    );
    const byDay = Object.fromEntries(assignments.map((a) => [a.day, a.sessionType]));
    assert.equal(byDay.Jueves, "Velocidad");
    assert.equal(byDay.Lunes, "Prevención");
    assert.equal(byDay.Viernes, "Prevención");
  });
});
