import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  selectMainTask,
  selectGeneralWarmup,
  sessionTypeForProtocol,
  ageBlockForNivel,
} from "./clubAutoTaskSelector.js";
import { CLUB_SIN_BALON_INTRO } from "../../data/clubAutoCatalog.js";
import { selectProtocolExercises } from "./clubAutoProtocolSelector.js";
import { getClubExerciseCatalog, SLOT_RULES } from "./clubExerciseCatalog.js";
import { variantIndexForWeek, generateClubAutoMicrociclo } from "./clubAutoEngine.js";

describe("clubAutoTaskSelector · filtros Depro 2.0", () => {
  it("mapea protocolo A/B/C a tipo de sesión", () => {
    assert.equal(sessionTypeForProtocol("A"), "extensiva");
    assert.equal(sessionTypeForProtocol("B"), "intensiva");
    assert.equal(sessionTypeForProtocol("C"), "reactiva");
  });

  it("mapea nivel a bloque de edad", () => {
    assert.equal(ageBlockForNivel("A"), "1");
    assert.equal(ageBlockForNivel("B"), "2");
    assert.equal(ageBlockForNivel("C"), "3");
  });

  it("sin vídeos subidos, el calentamiento sin balón es la descripción general", () => {
    const w = selectGeneralWarmup({ seed: "test-warmup" });
    assert.ok(w);
    assert.equal(w.placeholder, true);
    assert.equal(w.nombre, CLUB_SIN_BALON_INTRO.titulo);
    assert.ok(String(w.descripcion).length > 40);
  });

  it("sin tareas subidas, no inventa una tarea con balón", () => {
    const task = selectMainTask({ nivel: "B", protocolo: "B", seed: "filtros" });
    assert.equal(task, null);
  });
});

describe("clubAutoProtocolSelector · sin huecos vacíos", () => {
  it("no inserta placeholders missing", () => {
    const { exercises } = selectProtocolExercises({
      protocolo: "A",
      gymAccess: false,
      materials: ["Sin material", "Gomas"],
      seed: "proto-test",
    });
    assert.ok(exercises.every((ex) => !ex.missing));
    assert.ok(exercises.every((ex) => ex.catalogId));
  });
});

describe("catálogo club · etiquetas de plantilla", () => {
  it("duplica ejercicios individuales y etiqueta slots de plantilla", () => {
    const catalog = getClubExerciseCatalog();
    assert.ok(catalog.length > 50);
    const tagged = catalog.filter((ex) => ex.clubSlots.length);
    assert.ok(tagged.length > 20);
    const labels = new Set(tagged.flatMap((ex) => ex.clubSlots.map((s) => s.label)));
    assert.ok([...labels].some((l) => /cadera/i.test(l)));
    assert.ok([...labels].some((l) => /tobillo|bisagra/i.test(l)));
    assert.ok([...labels].some((l) => /glúteo|gluteo|posterior/i.test(l)));
    assert.ok(SLOT_RULES.some((r) => r.slot === "club_slot_movilidad_cadera"));
  });
});

describe("dos sesiones por tipo al mes", () => {
  it("variante 1 y 2 se alternan por semana", () => {
    assert.equal(variantIndexForWeek(0), 0);
    assert.equal(variantIndexForWeek(1), 1);
    assert.equal(variantIndexForWeek(2), 0);
    assert.equal(variantIndexForWeek(3), 1);
  });

  it("misma semana con distinta variante cambia el id de sesión", () => {
    const q = {
      nivel: "B",
      dias_exactos_entrenamiento: ["Lunes", "Miércoles", "Viernes"],
      dia_partido: "sabado",
      acceso_gimnasio: "no",
      duracion_sesion: "75",
      num_jugadores: "14-18",
      material: ["Sin material", "Gomas"],
    };
    const a = generateClubAutoMicrociclo(q, { weekOffset: 0, monthKey: "2026-08", variant: 0 });
    const b = generateClubAutoMicrociclo(q, { weekOffset: 1, monthKey: "2026-08", variant: 1 });
    assert.equal(a.ok, true);
    assert.equal(b.ok, true);
    assert.notEqual(a.sessions[0].id, b.sessions[0].id);
    assert.equal(a.sessions[0].sessionVariant, 1);
    assert.equal(b.sessions[0].sessionVariant, 2);
  });
});
