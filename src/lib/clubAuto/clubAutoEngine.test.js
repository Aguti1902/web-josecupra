import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  validateCoachQuestionnaire,
  assignProtocolsToDays,
  generateClubAutoMicrociclo,
} from "./clubAutoEngine.js";

function protoMap(plan) {
  return Object.fromEntries(plan.map((p) => [p.day, p.protocol]));
}

describe("clubAutoEngine — cuestionario", () => {
  it("exige días + material + campos clave", () => {
    const bad = validateCoachQuestionnaire({
      nivel: "B",
      dias_exactos_entrenamiento: [],
      dia_partido: "sabado",
      acceso_gimnasio: "no",
      duracion_sesion: "75",
      num_jugadores: "14-18",
      material: [],
    });
    assert.equal(bad.ok, false);

    const ok = validateCoachQuestionnaire({
      nivel: "B",
      dias_exactos_entrenamiento: ["Martes", "Jueves", "Viernes"],
      dia_partido: "sabado",
      acceso_gimnasio: false,
      duracion_sesion: "75",
      num_jugadores: "14-18",
      material: ["Sin material", "Gomas"],
    });
    assert.equal(ok.ok, true);
    assert.equal(ok.normalized.nivel, "B");
    assert.equal(ok.normalized.dias_entrenamiento_semana, 3);
  });
});

describe("clubAutoEngine — asignación A/B/C (ejemplos documento)", () => {
  it("sábado · martes+jueves → B+C", () => {
    const map = protoMap(assignProtocolsToDays(["Martes", "Jueves"], "Sábado"));
    assert.equal(map.Martes, "B");
    assert.equal(map.Jueves, "C");
  });

  it("sábado · lunes+miércoles → A+B", () => {
    const map = protoMap(assignProtocolsToDays(["Lunes", "Miércoles"], "Sábado"));
    assert.equal(map.Lunes, "A");
    assert.equal(map.Miércoles, "B");
  });

  it("sábado · lunes+miércoles+viernes → A+B+C", () => {
    const map = protoMap(assignProtocolsToDays(["Lunes", "Miércoles", "Viernes"], "Sábado"));
    assert.equal(map.Lunes, "A");
    assert.equal(map.Miércoles, "B");
    assert.equal(map.Viernes, "C");
  });

  it("sábado · lunes+martes+jueves+viernes → A+B+C+A (orden calendario)", () => {
    const plan = assignProtocolsToDays(["Lunes", "Martes", "Jueves", "Viernes"], "Sábado");
    assert.deepEqual(plan.map((p) => p.protocol), ["A", "B", "C", "A"]);
  });

  it("domingo · martes+viernes → B+C", () => {
    const map = protoMap(assignProtocolsToDays(["Martes", "Viernes"], "Domingo"));
    assert.equal(map.Martes, "B");
    assert.equal(map.Viernes, "C");
  });

  it("domingo · lunes+miércoles → A+B", () => {
    const map = protoMap(assignProtocolsToDays(["Lunes", "Miércoles"], "Domingo"));
    assert.equal(map.Lunes, "A");
    assert.equal(map.Miércoles, "B");
  });

  it("entre_semana · lunes+martes+viernes → A+B+C", () => {
    const map = protoMap(assignProtocolsToDays(["Lunes", "Martes", "Viernes"], "entre_semana"));
    assert.equal(map.Lunes, "A");
    assert.equal(map.Martes, "B");
    assert.equal(map.Viernes, "C");
  });

  it("entre_semana · lunes+viernes → post A + cercano C", () => {
    const map = protoMap(assignProtocolsToDays(["Lunes", "Viernes"], "entre_semana"));
    assert.equal(map.Lunes, "A");
    assert.equal(map.Viernes, "C");
  });
});

describe("clubAutoEngine — generación sesión completa", () => {
  it("genera estructura 5 bloques sin tocar motor individual", () => {
    const result = generateClubAutoMicrociclo({
      nivel: "B",
      dias_entrenamiento_semana: 3,
      dias_exactos_entrenamiento: ["Lunes", "Miércoles", "Viernes"],
      dia_partido: "sabado",
      acceso_gimnasio: "no",
      duracion_sesion: "75",
      num_jugadores: "14-18",
      material: ["Sin material", "Gomas"],
    });
    assert.equal(result.ok, true);
    assert.equal(result.sessions.length, 3);
    const s = result.sessions[0];
    assert.equal(s.structure.length, 5);
    assert.equal(s.structure[0].type, "calentamiento_general");
    assert.equal(s.structure[1].type, "calentamiento_balon");
    assert.equal(s.structure[2].type, "protocolo");
    assert.equal(s.structure[2].exercises.length, 6);
    assert.equal(s.structure[3].type, "tarea_principal");
    assert.equal(s.structure[4].type, "observaciones");
  });

  it("con gimnasio usa plantilla gym_*", () => {
    const result = generateClubAutoMicrociclo({
      nivel: "C",
      dias_entrenamiento_semana: 2,
      dias_exactos_entrenamiento: ["Martes", "Jueves"],
      dia_partido: "sabado",
      acceso_gimnasio: "si",
      duracion_sesion: "90",
      num_jugadores: "18-24",
      material: ["Gomas", "Gimnasio completo"],
    });
    assert.equal(result.ok, true);
    const proto = result.sessions[0].structure.find((b) => b.type === "protocolo");
    assert.match(proto.template.id, /^gym_/);
  });

  it("ejemplo real documento: M+J+V · sábado · 16 jugadores · 75 min", () => {
    const result = generateClubAutoMicrociclo({
      nivel: "B",
      dias_exactos_entrenamiento: ["Martes", "Jueves", "Viernes"],
      dia_partido: "sabado",
      acceso_gimnasio: "no",
      duracion_sesion: "75",
      num_jugadores: "14-18",
      material: ["Sin material", "Gomas"],
    });
    assert.equal(result.ok, true);
    assert.equal(result.sessions.length, 3);
    const byDay = Object.fromEntries(result.sessions.map((s) => [s.assignedDay, s.protocol]));
    // 3 días: post más cercano → A, víspera → C, resto → B
    assert.equal(byDay.Martes, "A");
    assert.equal(byDay.Jueves, "B");
    assert.equal(byDay.Viernes, "C");
    assert.equal(result.sessions[0].structure.length, 5);
  });
});
