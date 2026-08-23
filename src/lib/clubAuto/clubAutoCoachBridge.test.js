import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  usesClubAutoEngine,
  coachConfigToQuestionnaire,
  generateClubAutoWeekForCoach,
  generateClubAutoMesocicloForCoach,
  categoryForNivel,
  CLUB_AUTO_MATERIALS,
  isProCoachUser,
  serializeCoachAutoForMeta,
  parseCoachAutoFromMeta,
  questionnaireToCoachConfig,
  isManualPlanningClub,
} from "./clubAutoCoachBridge.js";
import { CLUB_MAIN_TASKS, CLUB_TASK_FOLDERS } from "../../data/clubAutoCatalog.js";

describe("clubAutoCoachBridge", () => {
  it("detecta engine club_auto y respeta modo personalizado/manual", () => {
    assert.equal(usesClubAutoEngine({ coachConfig: { engine: "club_auto", nivel: "B" } }), true);
    // Config suelta con nivel A/B/C (sin wrapper club)
    assert.equal(usesClubAutoEngine({ nivel: "A", engine: "club_auto" }), true);
    assert.equal(usesClubAutoEngine({ nivel: "A" }), true);
    assert.equal(usesClubAutoEngine({ coachConfig: { trainingsPerWeek: 3 } }), false);
    // Solo nivel dentro de club sin engine/planningMode → no fuerza motor
    assert.equal(usesClubAutoEngine({ coachConfig: { nivel: "A" } }), false);
    assert.equal(usesClubAutoEngine({
      mode: "personalizado",
      planningMode: "manual",
      coachConfig: { engine: "club_auto", nivel: "B" },
    }), false);
    assert.equal(usesClubAutoEngine({
      coachConfig: { engine: "club_auto", nivel: "B", mode: "personalizado" },
    }), false);
    assert.equal(usesClubAutoEngine({
      planningMode: "auto",
      isSoloCoach: true,
      coachConfig: { nivel: "B" },
    }), true);
    assert.equal(usesClubAutoEngine({
      planningMode: "auto",
      coachConfig: { engine: "club_auto", nivel: "C" },
    }), true);
  });

  it("isManualPlanningClub detecta clubs llevados por mí", () => {
    assert.equal(isManualPlanningClub({ planningMode: "manual" }), true);
    assert.equal(isManualPlanningClub({ origen: "manual" }), true);
    assert.equal(isManualPlanningClub({ mode: "personalizado" }), true);
    assert.equal(isManualPlanningClub({ planningMode: "auto", origen: "automatico" }), false);
  });

  it("mapea cuestionario corto y genera semana con estructura 5 bloques", () => {
    const config = {
      engine: "club_auto",
      nivel: "B",
      dias_entrenamiento_semana: 3,
      dias_exactos_entrenamiento: ["Lunes", "Miércoles", "Viernes"],
      dia_partido: "sabado",
      acceso_gimnasio: "no",
    };
    const q = coachConfigToQuestionnaire(config);
    assert.equal(q.nivel, "B");
    assert.equal(q.dias_entrenamiento_semana, 3);

    const week = generateClubAutoWeekForCoach(config, { weekStart: "2026-08-03" });
    assert.equal(week.engine, "club_auto");
    assert.equal(week.sessions.length, 3);
    const types = week.sessions[0].structure.map((b) => b.type);
    assert.deepEqual(types, [
      "calentamiento_general",
      "calentamiento_balon",
      "protocolo",
      "tarea_principal",
      "observaciones",
    ]);
    assert.equal(week.sessions[0].exercises.length, 6);
    assert.equal(week.sessions[0].duration, "75 min");
    assert.equal(week.sessions[0].duracionEstimada, "75 min");
    assert.equal(week.sessions[0].taskDesigner, undefined);
  });

  it("usa la duración del cuestionario en el resumen de sesión", () => {
    const week = generateClubAutoWeekForCoach({
      engine: "club_auto",
      nivel: "B",
      dias_exactos_entrenamiento: ["Lunes", "Miércoles"],
      dia_partido: "sabado",
      duracion_sesion: "90+",
      num_jugadores: "14-18",
      material: ["Gomas"],
    }, { weekStart: "2026-08-03" });
    assert.equal(week.sessions[0].duration, "Más de 90 min");
  });

  it("questionnaireToCoachConfig rellena engine club_auto", () => {
    const packed = questionnaireToCoachConfig({
      nivel: "A",
      dias_exactos_entrenamiento: ["Martes", "Jueves"],
      dia_partido: "sabado",
      duracion_sesion: "60",
      num_jugadores: "10-14",
      material: ["Sin material"],
      acceso_gimnasio: "no",
    });
    assert.equal(packed.ok, true);
    assert.equal(packed.config.engine, "club_auto");
    assert.equal(packed.config.duracion_sesion, "60");
  });

  it("mesociclo ProCoach cubre el mes calendario con sesión por día de entreno", () => {
    const config = {
      engine: "club_auto",
      nivel: "B",
      dias_entrenamiento_semana: 3,
      dias_exactos_entrenamiento: ["Lunes", "Miércoles", "Viernes"],
      dia_partido: "sabado",
      acceso_gimnasio: "no",
    };
    const meso = generateClubAutoMesocicloForCoach(config, { startDate: "2026-08-01", endDate: "2026-08-31" });
    assert.equal(meso.startDate, "2026-08-01");
    assert.equal(meso.endDate, "2026-08-31");
    assert.ok(meso.weeks.length >= 5);
    const first = meso.weeks[1];
    assert.equal(first.weekStart, "2026-08-03");
    assert.ok(first.sessions.length >= 1);
    assert.ok(first.sessions[0].assignedDay);
    assert.ok(["A", "B", "C"].includes(first.sessions[0].framework));
  });

  it("categoryForNivel", () => {
    assert.equal(categoryForNivel("A"), "Sub-11");
    assert.equal(categoryForNivel("C"), "Juvenil");
  });

  it("carpetas de tareas con balón vacías y etiquetas de sesión", () => {
    assert.equal(CLUB_MAIN_TASKS.length, 0);
    assert.ok(CLUB_TASK_FOLDERS.length >= 6);
    const rondo = CLUB_TASK_FOLDERS.find((f) => f.id === "rondo");
    const posesion = CLUB_TASK_FOLDERS.find((f) => f.id === "posesion");
    const circuito = CLUB_TASK_FOLDERS.find((f) => f.id === "circuito");
    assert.deepEqual(rondo.tipos_sesion, ["extensiva", "intensiva"]);
    assert.deepEqual(posesion.tipos_sesion, ["intensiva"]);
    assert.deepEqual(circuito.tipos_sesion, ["extensiva", "intensiva"]);
    assert.ok(CLUB_AUTO_MATERIALS.includes("Gomas"));
    assert.ok(CLUB_AUTO_MATERIALS.includes("Gimnasio completo"));
    assert.ok(!CLUB_AUTO_MATERIALS.includes("Conos"));
  });

  it("detecta ProCoach por role, isSoloCoach o clubId coach_", () => {
    assert.equal(isProCoachUser({ role: "coach" }), true);
    assert.equal(isProCoachUser({ role: "club", club: { isSoloCoach: true } }), true);
    assert.equal(isProCoachUser({ role: "club", clubId: "coach_abc" }), true);
    assert.equal(isProCoachUser({ role: "player", plan: "player-essential" }), false);
  });

  it("serializa y recupera el cuestionario compacto", () => {
    const raw = serializeCoachAutoForMeta({
      nivel: "B",
      dias_exactos_entrenamiento: ["Lunes", "Miércoles"],
      dia_partido: "sabado",
      acceso_gimnasio: "si",
      material: ["Gomas"],
      duracion_sesion: "75",
      num_jugadores: "14-18",
    });
    assert.ok(raw.length < 500);
    const q = parseCoachAutoFromMeta(raw);
    assert.equal(q.nivel, "B");
    assert.deepEqual(q.dias_exactos_entrenamiento, ["Lunes", "Miércoles"]);
    assert.equal(q.acceso_gimnasio, "si");
  });
});
