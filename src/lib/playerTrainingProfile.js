/** Catálogo de objetivos del cuestionario / perfil (UI). */
export const CATALOG_OBJECTIVES = [
  "Fuerza",
  "Velocidad",
  "Resistencia",
  "Hipertrofia",
  "Prevención",
  "Movilidad",
];

const OBJECTIVE_ALIASES = {
  rendimiento: null, // placeholder de alta admin — no cuenta como selección
  strength: "Fuerza",
  speed: "Velocidad",
  endurance: "Resistencia",
  hypertrophy: "Hipertrofia",
  prevention: "Prevención",
  mobility: "Movilidad",
};

/** Normaliza listas guardadas como array, "a|b" o "a, b". */
export function normalizeStringList(value) {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  if (value == null || value === "") return [];
  const s = String(value).trim();
  if (!s) return [];
  if (s.includes("|")) return s.split("|").map((t) => t.trim()).filter(Boolean);
  if (s.includes(",")) return s.split(",").map((t) => t.trim()).filter(Boolean);
  return [s];
}

/** "3" / "3dias" / "3 días / sem" → etiqueta de chip del perfil. */
export function normalizeFrecuencia(value) {
  if (value == null || value === "") return "";
  const raw = String(value).trim();
  if (!raw) return "";
  const n = parseInt(raw.replace(/\D/g, ""), 10);
  if (!Number.isFinite(n) || n < 1) return raw.includes("día") ? raw : "";
  const clamped = Math.min(5, Math.max(1, n));
  return `${clamped} día${clamped === 1 ? "" : "s"} / sem`;
}

export function mapObjectiveLabel(raw) {
  const s = String(raw || "").trim();
  if (!s) return null;
  if (CATALOG_OBJECTIVES.includes(s)) return s;
  const key = s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (Object.prototype.hasOwnProperty.call(OBJECTIVE_ALIASES, key)) {
    return OBJECTIVE_ALIASES[key];
  }
  const hit = CATALOG_OBJECTIVES.find((o) => o.toLowerCase() === s.toLowerCase());
  return hit || null;
}

/** Solo objetivos del catálogo (máx. 2). Descarta fantasmas como "Rendimiento". */
export function filterCatalogObjetivos(list) {
  const out = [];
  for (const item of normalizeStringList(list)) {
    const mapped = mapObjectiveLabel(item);
    if (mapped && !out.includes(mapped)) out.push(mapped);
    if (out.length >= 2) break;
  }
  return out;
}

/** Objetivos del cuestionario / motor / profiles.objective. */
export function resolveObjetivos(data = {}) {
  const fromArr = filterCatalogObjetivos(data.objetivos);
  if (fromArr.length) return fromArr;
  return filterCatalogObjetivos([
    data.objetivo || data.objective || "",
    data.objetivoSecundario || "",
  ]);
}

export function resolveEdad(data = {}) {
  const raw = data.edad ?? data.age;
  if (raw == null || raw === "") return "";
  return String(raw).trim();
}

/** Teléfono del cuestionario / metadata (phone o telefono). */
export function resolvePhone(data = {}) {
  const raw = data.phone ?? data.telefono ?? data.tel ?? "";
  return String(raw || "").trim();
}

export function resolveLesiones(data = {}) {
  const list = normalizeStringList(data.lesion);
  if (!list.length || (list.length === 1 && /ninguna/i.test(list[0]))) return ["Ninguna"];
  return list.filter((l) => !/ninguna/i.test(l));
}

export function resolveMaterial(data = {}) {
  const list = normalizeStringList(data.material);
  return list.length ? list : ["Sin material"];
}

function firstNonEmpty(...vals) {
  for (const v of vals) {
    if (v == null || v === "") continue;
    if (Array.isArray(v) && v.length === 0) continue;
    return v;
  }
  return Array.isArray(vals[0]) ? [] : "";
}

/** Snapshot canónico editable (cuestionario o motor de planes). */
export function trainingProfileSnapshotFromAny(data = {}) {
  const objetivos = resolveObjetivos(data);
  const materialRaw = normalizeStringList(data.material);
  const lesionRaw = normalizeStringList(data.lesion);
  const lesion = (!lesionRaw.length || (lesionRaw.length === 1 && /ninguna/i.test(lesionRaw[0])))
    ? []
    : lesionRaw.filter((l) => !/ninguna/i.test(l));
  return {
    edad: resolveEdad(data),
    phone: resolvePhone(data),
    telefono: resolvePhone(data),
    deporte: data.deporte || "",
    frecuencia: normalizeFrecuencia(data.frecuencia),
    objetivos,
    objetivo: objetivos[0] || "",
    objetivoSecundario: objetivos[1] || "",
    material: materialRaw.length ? materialRaw : ["Sin material"],
    experiencia: data.experiencia || "",
    lesion,
    lesionSubtipo: lesion.length ? normalizeStringList(data.lesionSubtipo) : [],
    diaCompeticion: data.diaCompeticion || data.dia_competicion || "",
    disponibles: normalizeStringList(data.disponibles),
  };
}

/** Campos de formulario a partir del usuario auth (sin plan). */
export function trainingFieldsFromUser(user = {}) {
  const snap = trainingProfileSnapshotFromAny(user);
  return {
    ...snap,
    lesion: resolveLesiones(user),
    lesionSubtipo: snap.lesion.length ? snap.lesionSubtipo : [],
    material: resolveMaterial(user),
  };
}

/**
 * Une metadata del jugador + snapshot del plan (motor / asignación admin).
 * Prioridad: valor no vacío del usuario; si falta, el del plan.
 */
export function mergeTrainingSources(user = {}, plan = null) {
  const snap = plan?.profileSnapshot
    || plan?._meta?.profileSnapshot
    || (Array.isArray(plan) ? plan.profileSnapshot : null)
    || null;
  const fromUser = trainingProfileSnapshotFromAny(user);
  const fromPlan = snap ? trainingProfileSnapshotFromAny(snap) : null;

  if (!fromPlan) {
    return {
      ...fromUser,
      lesion: resolveLesiones(fromUser),
      material: resolveMaterial(fromUser),
    };
  }

  const objetivos = fromUser.objetivos.length ? fromUser.objetivos : fromPlan.objetivos;
  const materialUser = normalizeStringList(user.material);
  const lesionUser = normalizeStringList(user.lesion);
  const disponiblesUser = normalizeStringList(user.disponibles);

  const phone = firstNonEmpty(fromUser.phone || fromUser.telefono, fromPlan.phone || fromPlan.telefono) || "";
  const merged = {
    edad: firstNonEmpty(fromUser.edad, fromPlan.edad) || "",
    phone,
    telefono: phone,
    deporte: firstNonEmpty(fromUser.deporte, fromPlan.deporte) || "",
    frecuencia: firstNonEmpty(fromUser.frecuencia, fromPlan.frecuencia) || "",
    objetivos,
    objetivo: objetivos[0] || "",
    objetivoSecundario: objetivos[1] || "",
    material: materialUser.length ? resolveMaterial(user) : resolveMaterial(fromPlan),
    experiencia: firstNonEmpty(fromUser.experiencia, fromPlan.experiencia) || "",
    lesion: lesionUser.length ? resolveLesiones(user) : resolveLesiones(fromPlan),
    lesionSubtipo: lesionUser.length
      ? normalizeStringList(user.lesionSubtipo)
      : normalizeStringList(fromPlan.lesionSubtipo),
    diaCompeticion: firstNonEmpty(fromUser.diaCompeticion, fromPlan.diaCompeticion) || "",
    disponibles: disponiblesUser.length ? disponiblesUser : fromPlan.disponibles,
  };
  return merged;
}

export function trainingFieldsKey(fields) {
  const f = fields || {};
  return [
    f.edad || "",
    f.deporte || "",
    normalizeFrecuencia(f.frecuencia) || "",
    filterCatalogObjetivos(f.objetivos).slice().sort().join(","),
    normalizeStringList(f.material).slice().sort().join(","),
    f.experiencia || "",
    normalizeStringList(f.lesion).slice().sort().join(","),
    normalizeStringList(f.lesionSubtipo).slice().sort().join(","),
    f.diaCompeticion || "",
    normalizeStringList(f.disponibles).slice().sort().join(","),
  ].join("|");
}

/** Payload para user_metadata / sync desde asignación admin. */
export function trainingFieldsToAuthMetadata(fields = {}) {
  const snap = trainingProfileSnapshotFromAny(fields);
  return {
    edad: snap.edad,
    phone: snap.phone,
    telefono: snap.telefono || snap.phone,
    deporte: snap.deporte,
    frecuencia: snap.frecuencia,
    objetivos: snap.objetivos,
    objetivo: snap.objetivo,
    objetivoSecundario: snap.objetivoSecundario,
    material: snap.material,
    experiencia: snap.experiencia,
    lesion: snap.lesion,
    lesionSubtipo: snap.lesionSubtipo,
    diaCompeticion: snap.diaCompeticion,
    disponibles: snap.disponibles,
  };
}
