/** Mapeo structure[] (motor club_auto) → bloques PDF calentamiento / principal. */

export function isClubAutoStructureSession(session) {
  return Array.isArray(session?.structure) && session.structure.some(
    (b) => b?.type === "calentamiento_general" || b?.type === "calentamiento_balon" || b?.type === "protocolo",
  );
}

export function exercisesFromClubAuto(session) {
  const structure = session?.structure || [];
  const warm = [];
  const main = [];
  for (const block of structure) {
    if (block.type === "calentamiento_general" || block.type === "calentamiento_balon") {
      const item = block.item;
      if (item && !item.placeholder && (item.nombre || item.name)) {
        warm.push({
          name: item.nombre || item.name,
          description: item.descripcion || item.description || "",
          videoUrl: item.videoUrl || item.video || "",
          subLabel: block.type === "calentamiento_balon" ? "Con balón" : "Sin balón",
        });
      }
    }
    if (block.type === "protocolo") {
      for (const ex of block.exercises || []) {
        if (ex.missing || !(ex.nombre || ex.name)) continue;
        main.push({
          name: ex.nombre || ex.name,
          description: ex.descripcion || ex.description || ex.label || "",
          sets: ex.sets,
          rest: ex.rest,
          videoUrl: ex.videoUrl || "",
          subLabel: ex.label || ex.slot || null,
        });
      }
    }
  }
  return { warm, main };
}
