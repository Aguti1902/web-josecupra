import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  coerceContentList,
  countOverrideVideos,
  mergePreferVideo,
  mergeListsPreferVideo,
  countListVideos,
  protectContentList,
} from "./contentRestore.js";

describe("contentRestore", () => {
  it("recupera calentamientos convertidos en objeto por el purge", () => {
    const corrupted = {
      0: { id: "cgw_1", videoUrl: "https://youtu.be/aaaaaaaaaaa" },
      1: { id: "cgw_2", videoUrl: "https://youtu.be/bbbbbbbbbbb" },
      purgedPlayers: [{ userId: "u1" }],
    };
    const list = coerceContentList(corrupted);
    assert.equal(list.length, 2);
    assert.equal(list[0].id, "cgw_1");
  });

  it("POST de overrides nunca pisa un vídeo existente con vacío", () => {
    const merged = mergePreferVideo(
      { v2_1: { videoUrl: "" }, v2_3: { videoUrl: "https://youtu.be/nuevo123456" } },
      { v2_1: { videoUrl: "https://youtu.be/keepme12345" }, v2_2: { videoUrl: "https://youtu.be/otroexist12" } },
    );
    assert.equal(merged.v2_1.videoUrl, "https://youtu.be/keepme12345");
    assert.equal(merged.v2_2.videoUrl, "https://youtu.be/otroexist12");
    assert.equal(merged.v2_3.videoUrl, "https://youtu.be/nuevo123456");
  });

  it("no pisa un vídeo local con un override vacío de la nube", () => {
    const merged = mergePreferVideo(
      { v2_1: { videoUrl: "https://youtu.be/keepme12345" } },
      { v2_1: { description: "x" }, v2_2: { videoUrl: "https://youtu.be/fromcloud12" } },
    );
    assert.equal(merged.v2_1.videoUrl, "https://youtu.be/keepme12345");
    assert.equal(merged.v2_2.videoUrl, "https://youtu.be/fromcloud12");
    assert.equal(countOverrideVideos(merged), 2);
  });

  it("une listas sin perder vídeos locales ni duplicar URLs", () => {
    const local = [{ id: "cgw_1", videoUrl: "https://youtu.be/keepme12345" }];
    const cloud = [
      { id: "cgw_1", videoUrl: "" },
      { id: "cgw_2", videoUrl: "https://youtu.be/fromcloud12" },
    ];
    const merged = mergeListsPreferVideo(local, cloud);
    assert.equal(merged.find((x) => x.id === "cgw_1").videoUrl, "https://youtu.be/keepme12345");
    assert.equal(merged.find((x) => x.id === "cgw_2").videoUrl, "https://youtu.be/fromcloud12");
    assert.equal(countListVideos(merged), 2);
  });

  it("protectContentList no deja un POST vacío borrar vídeos existentes", () => {
    const existing = [{ id: "cgw_1", videoUrl: "https://youtu.be/keepme12345" }];
    const kept = protectContentList([], existing);
    assert.equal(kept.length, 1);
    assert.equal(kept[0].videoUrl, "https://youtu.be/keepme12345");
    const replaced = protectContentList(
      [{ id: "cgw_2", videoUrl: "https://youtu.be/nuevo123456" }],
      existing,
    );
    assert.equal(replaced.length, 1);
    assert.equal(replaced[0].id, "cgw_2");
  });
});
