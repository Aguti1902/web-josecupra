import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  validateCoachQuestionnaire,
  assignProtocolsToDays,
  generateClubAutoMicrociclo,
} from "./clubAutoEngine.js";

describe("clubAutoEngine — cuestionario", () => {
  it("valida coincidencia días exactos = nº entrenos", () => {
    const bad = validateCoachQuestionnaire({
      nivel: "B",
      dias_entrenamiento_semana: 3,
      dias_exactos_entrenamiento: ["Lunes", "Miércoles"],
      dia_partido: "sabado",
      acceso_gimnasio: "no",
    });
    assert.equal(bad.ok, false);

    const ok = validateCoachQuestionnaire({
      nivel: "B",
      dias_entrenamiento_semana: 3,
      dias_exactos_entrenamiento: ["Lunes", "Miércoles", "Viernes"],
      dia_partido: "sabado",
      acceso_gimnasio: false,
    });
    assert.equal(ok.ok, true);
    assert.equal(ok.normalized.nivel, "B");
  });
});

describe("clubAutoEngine — asignación A/B/C", () => {
  it("sábado · martes+jueves → B+C", () => {
    const plan = assignProtocolsToDays(["Martes", "Jueves"], "Sábado");
    const map = Object.fromEntries(plan.map((p) => [p.day, p.protocol]));
    assert.equal(map.Martes, "B");
    assert.equal(map.Jueves, "C");
  });

  it("sábado · lunes+miércoles → A+B", () => {
    const plan = assignProtocolsToDays(["Lunes", "Miércoles"], "Sábado");
    const map = Object.fromEntries(plan.map((p) => [p.day, p.protocol]));
    assert.equal(map.Lunes, "A");
    assert.equal(map.Miércoles, "B");
  });

  it("sábado · lunes+miércoles+viernes → A+B+C", () => {
    const plan = assignProtocolsToDays(["Lunes", "Miércoles", "Viernes"], "Sábado");
    const protocols = plan.map((p) => p.protocol).sort().join("");
    assert.equal(protocols, "ABC");
    const map = Object.fromEntries(plan.map((p) => [p.day, p.protocol]));
    assert.equal(map.Viernes, "C");
    assert.equal(map.Lunes, "A");
    assert.equal(map.Miércoles, "B");
  });

  it("sábado · 4 días → A+B+C+A", () => {
    const plan = assignProtocolsToDays(["Lunes", "Martes", "Jueves", "Viernes"], "Sábado");
    const counts = { A: 0, B: 0, C: 0 };
    plan.forEach((p) => { counts[p.protocol] += 1; });
    assert.equal(counts.A, 2);
    assert.equal(counts.B, 1);
    assert.equal(counts.C, 1);
  });

  it("domingo · martes+viernes → B+C", () => {
    const plan = assignProtocolsToDays(["Martes", "Viernes"], "Domingo");
    const map = Object.fromEntries(plan.map((p) => [p.day, p.protocol]));
    assert.equal(map.Martes, "B");
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
    });
    assert.equal(result.ok, true);
    const proto = result.sessions[0].structure.find((b) => b.type === "protocolo");
    assert.match(proto.template.id, /^gym_/);
  });
});
