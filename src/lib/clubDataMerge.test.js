import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  mergeSquadPlayers,
  pickSquadForRead,
  pickSquadForWrite,
  mergeTeamsForRead,
  mergeTeamsForWrite,
  mergeTeamCargasMaps,
  mergeSeasonTestsMaps,
} from "./clubDataMerge.js";

describe("clubDataMerge", () => {
  it("une jugadores de plantilla por id", () => {
    const merged = mergeSquadPlayers(
      [{ id: "a", name: "Ana" }],
      [{ id: "a", number: "10" }, { id: "b", name: "Beto" }],
    );
    assert.equal(merged.length, 2);
    assert.equal(merged.find((p) => p.id === "a").name, "Ana");
    assert.equal(merged.find((p) => p.id === "a").number, "10");
  });

  it("en lectura no deja que una plantilla remota vacía borre la local", () => {
    const local = [{ id: "p1", name: "Local" }];
    assert.deepEqual(pickSquadForRead([], local), local);
    assert.equal(pickSquadForRead([{ id: "p2" }], []).length, 1);
  });

  it("en escritura un cliente vacío sin marca no pisa la plantilla del servidor", () => {
    const existing = { squad: [{ id: "p1", name: "Guardado" }], squadUpdatedAt: "2026-01-01T00:00:00.000Z" };
    const incoming = { squad: [] };
    const out = pickSquadForWrite(existing, incoming);
    assert.equal(out.length, 1);
    assert.equal(out[0].id, "p1");
  });

  it("en escritura una plantilla más reciente (borrado incluido) gana", () => {
    const existing = { squad: [{ id: "p1" }], squadUpdatedAt: "2026-01-01T00:00:00.000Z" };
    const incoming = { squad: [{ id: "p2" }], squadUpdatedAt: "2026-06-01T00:00:00.000Z" };
    const out = pickSquadForWrite(existing, incoming);
    assert.equal(out.length, 1);
    assert.equal(out[0].id, "p2");
  });

  it("mergeTeamsForRead une equipos y plantillas", () => {
    const remote = [{ id: "t1", name: "A", squad: [{ id: "p1" }] }];
    const local = [{ id: "t1", name: "A", squad: [{ id: "p2" }] }, { id: "t2", name: "B", squad: [{ id: "p3" }] }];
    const teams = mergeTeamsForRead(remote, local);
    const t1 = teams.find((t) => t.id === "t1");
    assert.ok(t1.squad.some((p) => p.id === "p1"));
    assert.ok(t1.squad.some((p) => p.id === "p2"));
    assert.ok(teams.find((t) => t.id === "t2"));
  });

  it("mergeTeamsForWrite conserva equipos no enviados", () => {
    const existing = [
      { id: "t1", squad: [{ id: "old" }], squadUpdatedAt: "2026-01-01T00:00:00.000Z" },
      { id: "t2", squad: [{ id: "keep" }] },
    ];
    const incoming = [
      { id: "t1", squad: [{ id: "new" }], squadUpdatedAt: "2026-08-01T00:00:00.000Z" },
    ];
    const teams = mergeTeamsForWrite(existing, incoming);
    assert.equal(teams.find((t) => t.id === "t1").squad[0].id, "new");
    assert.equal(teams.find((t) => t.id === "t2").squad[0].id, "keep");
  });

  it("fusiona cargas y marcas de tests por equipo", () => {
    const cargas = mergeTeamCargasMaps(
      { t1: { "2026-W01": { a: { rpe: 5 } } } },
      { t1: { "2026-W02": { a: { rpe: 7 } } }, t2: { "2026-W01": {} } },
    );
    assert.equal(cargas.t1["2026-W01"].a.rpe, 5);
    assert.equal(cargas.t1["2026-W02"].a.rpe, 7);
    assert.ok(cargas.t2);

    const season = mergeSeasonTestsMaps(
      { t1: { p1: { sprint: ["1", "", ""] } } },
      { t1: { p1: { cmj: ["40", "", ""] }, p2: { sprint: ["2"] } } },
    );
    assert.deepEqual(season.t1.p1.sprint, ["1", "", ""]);
    assert.deepEqual(season.t1.p1.cmj, ["40", "", ""]);
    assert.equal(season.t1.p2.sprint[0], "2");
  });
});
