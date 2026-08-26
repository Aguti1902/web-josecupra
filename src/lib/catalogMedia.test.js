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
      "https://www.youtube.com/embed/dQw4w9wgxcQ?rel=0&modestbranding=1",
    );
    assert.equal(
      youtubeEmbedUrl("https://www.youtube.com/shorts/dQw4w9wgxcQ"),
      "https://www.youtube.com/embed/dQw4w9wgxcQ?rel=0&modestbranding=1",
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

  it("no pisa un vídeo de override con el catálogo vacío", () => {
    const media = mergeCatalogMedia({
      v2_1: { videoUrl: "https://youtu.be/abcde123456" },
    });
    assert.equal(
      resolveExerciseVideo({ id: 1, catalogId: 1, name: "Sentadilla clásica" }, media),
      "https://youtu.be/abcde123456",
    );
    assert.equal(
      resolveExerciseVideo({ id: "v2_1_0", catalogId: 1, nombre: "Sentadilla clásica" }, media),
      "https://youtu.be/abcde123456",
    );
  });

  it("resuelve Saltos verticales simples por override v2_73 (id del admin)", () => {
    const media = mergeCatalogMedia({
      v2_73: { videoUrl: "https://youtu.be/abcdefghijk" },
    });
    const url = resolveExerciseVideo({
      id: "v2_73_0",
      catalogId: 73,
      name: "Saltos verticales simples",
    }, media);
    assert.equal(url, "https://youtu.be/abcdefghijk");
  });

  it("respeta videoUrl ya presente en el ejercicio", () => {
    const media = mergeCatalogMedia({});
    assert.equal(
      resolveExerciseVideo({ nombre: "X", videoUrl: "https://youtu.be/zzzzzzzzzzz" }, media),
      "https://youtu.be/zzzzzzzzzzz",
    );
  });
});
