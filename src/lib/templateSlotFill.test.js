import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildPlayerPlan, validateSessionAgainstTemplate, countTemplateSlots } from "./playerPlanEngine.js";
import { getTemplate } from "./planTemplates.js";

function profile(overrides = {}) {
  return {
    id: "test-user",
    edad: 22,
    objetivo: "Fuerza",
    objetivos: ["Fuerza"],
    deporte: "Fútbol",
    frecuencia: "3 días / sem",
    material: ["Gimnasio completo"],
    experiencia: "1–3 años",
    lesion: [],
    diaCompeticion: "Fin de semana",
    disponibles: ["Lunes", "Miércoles", "Viernes"],
    ...overrides,
  };
}

const CASES = [
  { key: "Fuerza Full", objetivo: "Fuerza" },
  { key: "Fuerza Inferior", objetivo: "Fuerza" },
  { key: "Fuerza Superior", objetivo: "Fuerza" },
  { key: "Hipertrofia Full", objetivo: "Hipertrofia" },
  { key: "Velocidad", objetivo: "Velocidad" },
];

describe("Plantillas aplicadas TAL CUAL (PDF §5)", () => {
  for (const { key, objetivo } of CASES) {
    it(`sesión generada cubre slots de plantilla (${key})`, () => {
      const template = getTemplate(key);
      assert.ok(template, `plantilla ${key} existe`);
      const expected = countTemplateSlots(template);
      assert.ok(expected > 0);

      const plan = buildPlayerPlan(profile({
        objetivo,
        objetivos: [objetivo],
        material: ["Gimnasio completo"],
      }));
      if (plan.planError) {
        assert.ok(plan.planError);
        return;
      }

      const sessions = plan.flatMap((d) => d.sessions || []);
      assert.ok(sessions.length > 0, "hay sesiones");

      for (const session of sessions) {
        const tpl = getTemplate(session.templateKey || session.type || key);
        if (!tpl?.blocks) continue;
        const check = validateSessionAgainstTemplate(session, tpl);
        assert.ok(
          check.actual >= check.expected,
          `${session.templateKey || session.type}: ${check.actual}/${check.expected} slots — ${check.warning || ""}`,
        );
        const warmBlock = (session.blocks || []).find((b) => b.type === "calentamiento");
        if (warmBlock) {
          assert.equal(warmBlock.warmupSource, "sin_balon");
          assert.equal(warmBlock.exercises.length, 1);
          assert.equal(warmBlock.exercises[0].warmupSource, "sin_balon");
        }
      }
    });
  }
});
