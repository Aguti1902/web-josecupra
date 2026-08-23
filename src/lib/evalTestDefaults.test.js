import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { EVAL_TEST_DEFAULTS, mergeEvalTests } from "./evalTestDefaults.js";

describe("evalTestDefaults", () => {
  it("rellena protocolo aunque el admin no haya guardado description", () => {
    const merged = mergeEvalTests([]);
    assert.equal(merged.length, EVAL_TEST_DEFAULTS.length);
    merged.forEach((t) => {
      assert.ok(t.description.length > 20);
      assert.equal(t.videoUrl, "");
    });
  });

  it("conserva vídeo y texto del admin", () => {
    const merged = mergeEvalTests([
      { id: "cmj", description: "Salto propio", videoUrl: "https://youtu.be/cmjvideo12" },
    ]);
    const cmj = merged.find((t) => t.id === "cmj");
    assert.equal(cmj.description, "Salto propio");
    assert.equal(cmj.videoUrl, "https://youtu.be/cmjvideo12");
    const sprint = merged.find((t) => t.id === "sprint");
    assert.ok(sprint.description.includes("30m"));
  });
});
