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

/** Objetivos del cuestionario: array, pipe-string, objetivo + secundario u objective (profiles). */
export function resolveObjetivos(data = {}) {
  const fromArr = normalizeStringList(data.objetivos);
  if (fromArr.length) return [...new Set(fromArr)].slice(0, 2);
  const primary = String(data.objetivo || data.objective || "").trim();
  const secondary = String(data.objetivoSecundario || "").trim();
  return [primary, secondary].filter(Boolean).slice(0, 2);
}

export function resolveEdad(data = {}) {
  const raw = data.edad ?? data.age;
  if (raw == null || raw === "") return "";
  return String(raw).trim();
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

/** Snapshot editable del cuestionario de entrenamiento (para precargar Perfil). */
export function trainingFieldsFromUser(user = {}) {
  const objetivos = resolveObjetivos(user);
  return {
    edad: resolveEdad(user),
    deporte: user.deporte || "",
    frecuencia: user.frecuencia || "",
    objetivos,
    objetivo: objetivos[0] || "",
    objetivoSecundario: objetivos[1] || "",
    material: resolveMaterial(user),
    experiencia: user.experiencia || "",
    lesion: resolveLesiones(user),
    lesionSubtipo: normalizeStringList(user.lesionSubtipo),
    diaCompeticion: user.diaCompeticion || user.dia_competicion || "",
    disponibles: normalizeStringList(user.disponibles),
  };
}

export function trainingFieldsKey(fields) {
  const f = fields || {};
  return [
    f.edad || "",
    f.deporte || "",
    f.frecuencia || "",
    normalizeStringList(f.objetivos).slice().sort().join(","),
    normalizeStringList(f.material).slice().sort().join(","),
    f.experiencia || "",
    normalizeStringList(f.lesion).slice().sort().join(","),
    normalizeStringList(f.lesionSubtipo).slice().sort().join(","),
    f.diaCompeticion || "",
    normalizeStringList(f.disponibles).slice().sort().join(","),
  ].join("|");
}
