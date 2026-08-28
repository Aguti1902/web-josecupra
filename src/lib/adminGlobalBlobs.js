/** Blobs globales en clubs_detail (no son clubs reales). */
export const META_CLUB_IDS = [
  "GLOBAL_PLANS",
  "GLOBAL_TESTS",
  "CATALOG_OVERRIDES",
  "GLOBAL_CLUB_WARMUPS",
  "GLOBAL_CLUB_TASKS",
];

export function isMetaClubId(id) {
  return META_CLUB_IDS.includes(String(id || ""));
}

/** Payload mínimo para no mezclar economía ni inflar el JSON. */
export function buildMetaClubPayload(club = {}, detail = null) {
  const id = club.id;
  const merged = { ...(detail || {}), ...club, id };
  const payload = { id, name: merged.name || id };
  if (id === "GLOBAL_PLANS") {
    payload.plans = Array.isArray(merged.plans) ? merged.plans : [];
  } else if (id === "GLOBAL_TESTS") {
    payload.tests = merged.tests ?? [];
  } else if (id === "CATALOG_OVERRIDES") {
    payload.overrides = merged.overrides && typeof merged.overrides === "object"
      ? merged.overrides
      : {};
  } else if (id === "GLOBAL_CLUB_WARMUPS") {
    payload.warmups = Array.isArray(merged.warmups) ? merged.warmups : [];
  } else if (id === "GLOBAL_CLUB_TASKS") {
    payload.tasks = Array.isArray(merged.tasks) ? merged.tasks : [];
  }
  return payload;
}

export function describeCloudSaveError(result) {
  if (!result) return "No se pudo guardar en la nube.";
  if (result.aborted) return "La nube no respondió a tiempo. Inténtalo de nuevo.";
  const status = result.status;
  const apiError = result.data?.error;
  if (status === 401 || status === 403) {
    return "Sesión caducada. Cierra sesión y entra de nuevo como admin.";
  }
  if (status === 413) return "La planificación es demasiado grande para guardarla de una vez.";
  return apiError || "No se pudo guardar en la nube.";
}
