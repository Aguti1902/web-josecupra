/** Selección determinista (sin aleatoriedad) para ejercicios compatibles. */

export function hashSeed(seed = "") {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

export function pickDeterministic(candidates, seed = "") {
  if (!candidates?.length) return null;
  const sorted = [...candidates].sort((a, b) => a.id - b.id);
  return sorted[hashSeed(seed) % sorted.length];
}

/**
 * Refresco: no reutilizar la misma semilla. Excluye el actual y rota.
 */
export function pickVaried(candidates, seed = "") {
  if (!candidates?.length) return null;
  const sorted = [...candidates].sort((a, b) => String(a.id).localeCompare(String(b.id), "en"));
  const extra = `${Date.now()}|${Math.random()}|${seed}`;
  return sorted[hashSeed(extra) % sorted.length];
}
