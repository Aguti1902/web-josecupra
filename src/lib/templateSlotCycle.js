/**
 * Secuencia cíclica de patrones por posición del bloque (PDF etiquetas).
 * N posiciones: patrón i = cycle[i % cycle.length]. +/- añade/quita la última; no redistribuye.
 */

export function countPrototypeSlots(block) {
  if (block?.warmupSource === "sin_balon") return 1;
  return (block?.slots || []).reduce((n, s) => n + (typeof s === "object" ? (s.qty || 1) : 1), 0);
}

export function resolveBlockCount(block) {
  if (Number.isFinite(block?.count) && block.count >= 1) return Math.max(1, Math.min(12, block.count));
  return Math.max(1, countPrototypeSlots(block));
}

function cloneSlot(slot, i, overlay = {}) {
  const next = { ...slot, ...overlay, qty: 1, cycleIndex: i };
  if ("patron" in overlay && !("patronOr" in overlay)) delete next.patronOr;
  if ("patronOr" in overlay && !("patron" in overlay)) delete next.patron;
  const baseId = overlay.slotId || slot.slotId || slot.description || "slot";
  next.slotId = `${baseId}_${i}`;
  if (overlay.description) next.description = overlay.description;
  return next;
}

/**
 * Expande el bloque a N slots concretos. Si hay patternCycle, la posición i
 * usa cycle[i % len] encima del prototipo (primer slot).
 */
export function expandBlockSlots(block) {
  const slots = Array.isArray(block?.slots) ? block.slots : [];
  if (!slots.length) return [];
  if (block?.warmupSource === "sin_balon") {
    return slots.map((s, i) => cloneSlot(s, i));
  }

  const n = resolveBlockCount(block);
  const cycle = Array.isArray(block.patternCycle) ? block.patternCycle : null;
  if (cycle?.length) {
    const proto = { ...slots[0] };
    delete proto.qty;
    const out = [];
    for (let i = 0; i < n; i++) {
      const step = cycle[i % cycle.length] || {};
      out.push(cloneSlot(proto, i, step));
    }
    return out;
  }

  const flat = [];
  for (const s of slots) {
    const q = s.qty || 1;
    for (let i = 0; i < q; i++) flat.push(cloneSlot(s, flat.length));
  }
  if (flat.length === n) return flat;
  if (flat.length > n) return flat.slice(0, n);
  const last = flat[flat.length - 1] || slots[0];
  while (flat.length < n) {
    flat.push(cloneSlot(last, flat.length));
  }
  return flat;
}

/** Para tests: patrones resueltos al pasar de N a N+1 sin reordenar los anteriores. */
export function cyclePatternsForCount(cycle, count) {
  const seq = Array.isArray(cycle) ? cycle : [];
  if (!seq.length) return [];
  const n = Math.max(1, count);
  return Array.from({ length: n }, (_, i) => seq[i % seq.length]);
}
