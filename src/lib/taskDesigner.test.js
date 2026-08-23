import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  resolveTaskCues,
  resolveTaskRecommendations,
  normalizeTaskDesigner,
} from "./taskDesigner.js";

describe("taskDesigner — datos sucios no tumban el diseñador", () => {
  it("acepta consignas en string en vez de array", () => {
    const cues = resolveTaskCues({
      cuesByTask: { "Rondo simple": { A: "Circula sin prisa" } },
    }, "Rondo simple", "A");
    assert.deepEqual(cues, ["Circula sin prisa"]);
  });

  it("cae a consignas por defecto si cuesByTask está vacío", () => {
    const cues = resolveTaskCues(null, "Rondo simple", "A");
    assert.ok(Array.isArray(cues) && cues.length >= 1);
  });

  it("recomendaciones no-array no lanzan", () => {
    const recs = resolveTaskRecommendations({
      recommendationsByFramework: { A: "Trabaja amplio" },
    }, "A");
    assert.deepEqual(recs, ["Trabaja amplio"]);
  });

  it("normalizeTaskDesigner tolera raw vacío", () => {
    const td = normalizeTaskDesigner(undefined);
    assert.ok(td.taskTypes.length > 0);
    assert.ok(td.paramsByFramework.A);
  });
});
