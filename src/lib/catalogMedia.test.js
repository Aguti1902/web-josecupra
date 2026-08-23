import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  mergeCatalogMedia,
  resolveExerciseVideo,
  normalizeExerciseName,
  youtubeEmbedUrl,
} from "./catalogMedia.js";

describe("catalogMedia", () => {
  it("normaliza nombres y arma embed de YouTube", () => {
    assert.equal(normalizeExerciseName("Sentadilla clásica"), "sentadilla clasica");
    assert.equal(
      youtubeEmbedUrl("https://youtu.be/dQw4w9wgxcQ"),
      "https://www.youtube.com/embed/dQw4w9wgxcQ",
    );
  });

  it("resuelve vídeo por nombre aunque el id del motor no coincida con el admin", () => {
    const media = mergeCatalogMedia({
      v2_1: { videoUrl: "https://youtu.be/abcde123456" },
    });
    const url = resolveExerciseVideo({ id: 1, nombre: "Sentadilla clásica" }, media);
    assert.equal(url, "https://youtu.be/abcde123456");
    const byName = resolveExerciseVideo({ name: "Sentadilla clásica" }, media);
    assert.equal(byName, "https://youtu.be/abcde123456");
  });

  it("respeta videoUrl ya presente en el ejercicio", () => {
    const media = mergeCatalogMedia({});
    assert.equal(
      resolveExerciseVideo({ nombre: "X", videoUrl: "https://youtu.be/zzzzzzzzzzz" }, media),
      "https://youtu.be/zzzzzzzzzzz",
    );
  });
});
