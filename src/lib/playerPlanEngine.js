import { buildSessionPrompt, buildFullPlanPrompt } from "./planAIPrompts";
import { filterExercisesEnriched } from "../data/exercises";
import { getTemplate, isV2Template } from "./planTemplates";
import {
  fillBlockSlots,
  refreshExercise as refreshExerciseInPool,
} from "./exerciseSelector";
import {
  DAY_ORDER,
  DAY_SHORT,
  assignSessionsToDays,
  getSessionTypesForUser,
  normalizeMatchDay,
  sessionIntensity,
} from "./planLoadRules";

export { DAY_ORDER, DAY_SHORT };

const SUBTIPO_TO_AREA = {
  acl: "rodilla", menisco: "rodilla", rotuliana: "rodilla", condromalacia: "rodilla",
  esguince: "tobillo", inestabilidad: "tobillo",
  manguito: "hombro", inestabilidad_h: "hombro",
  lumbar: "espalda", dorsal: "espalda", cervical: "espalda",
  pubis: "pubalgia", aductor: "pubalgia", pubalgia: "pubalgia",
};

const LESION_FOLDER_TAGS = {
  rodilla: "lesion_rodilla",
  tobillo: "lesion_tobillo",
  hombro: "lesion_hombro",
  espalda: "lesion_espalda",
  pubalgia: "lesion_pubalgia",
};

function normalizeMaterial(material) {
  if (Array.isArray(material)) {
    const first = material.find((m) => m && !/ninguno/i.test(m));
    return normalizeMaterial(first || "sin_material");
  }
  return (material || "sin_material")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s|\//g, "_")
    .replace("barra_gimnasio", "barra")
    .replace("gimnasio_completo", "barra")
    .replace("sin_material", "sin_material");
}

export function normalizeLesions(lesion, lesionSubtipo) {
  const base = (lesion || []).map((l) =>
    l.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  );
  const subAreas = (lesionSubtipo || []).map((s) => SUBTIPO_TO_AREA[s.toLowerCase()] || s.toLowerCase());
  return [...new Set([...base, ...subAreas])].filter((l) => l && l !== "ninguna");
}

function experienciaLevel(experiencia) {
  const e = (experiencia || "").toLowerCase();
  if (e.includes("nunca") || e.includes("<6") || e.includes("menos de 6")) return "novato";
  if (e.includes("6-12") || e.includes("6–12") || e.includes("1-3") || e.includes("1–3")) return "intermedio";
  return "avanzado";
}

function volumeForExperience(expLevel, blockType, blockTags) {
  const isResistencia = blockTags.some((t) => t.includes("resistencia"));
  if (expLevel === "novato") {
    return { sets: blockType === "calentamiento" ? 1 : 2, reps: isResistencia ? "30–45\"" : "10–15", rest: "60\"" };
  }
  if (expLevel === "intermedio") {
    return { sets: blockType === "calentamiento" ? 1 : 3, reps: isResistencia ? "30–45\"" : "8–12", rest: "45–60\"" };
  }
  return { sets: blockType === "calentamiento" ? 1 : 4, reps: isResistencia ? "20–30\"" : "6–10", rest: "45\"" };
}

function pickExercises(pool, count, usedIds, weekOffset = 0) {
  const available = pool.filter((ex) => !usedIds.has(ex.id));
  const start = (weekOffset * count) % Math.max(available.length, 1);
  const picked = [];
  for (let i = 0; i < count && available.length; i++) {
    const ex = available[(start + i) % available.length];
    if (!picked.find((p) => p.id === ex.id)) {
      picked.push(ex);
      usedIds.add(ex.id);
    }
  }
  return picked;
}

function injectLesionExercises(pool, lesiones, count) {
  const tags = lesiones.map((l) => LESION_FOLDER_TAGS[l]).filter(Boolean);
  if (!tags.length) return [];
  return pool.filter((ex) =>
    tags.some((t) => ex.etiquetas?.includes(t)) &&
    !lesiones.some((l) => ex.contraindicado?.includes(l))
  ).slice(0, count);
}

function parseCatalogId(id) {
  if (typeof id === "number") return id;
  const raw = String(id).split("_")[0].replace(/^v2_/, "");
  const num = parseInt(raw, 10);
  return Number.isNaN(num) ? null : num;
}

function buildUserProfile(filterParams) {
  const mat = filterParams.material;
  return {
    material: Array.isArray(mat) ? mat : [mat || "sin_material"],
    lesiones: filterParams.lesiones || [],
    edad: filterParams.edad || 18,
    experiencia: filterParams.experiencia || "intermedio",
  };
}

function makeExerciseFromV2(ex, ei, blockType) {
  const isIso = ex.pool?.startsWith("ISO-") || ex.pool?.startsWith("CORE-ANTI");
  const tips = Array.isArray(ex.tips)
    ? ex.tips
    : [
        "Mantén la postura durante toda la serie",
        "Controla el movimiento en ambas fases",
        "Respira con normalidad",
      ];
  return {
    id: `v2_${ex.id}_${ei}`,
    catalogId: ex.id,
    pool: ex.pool,
    name: ex.nombre,
    duration: blockType === "calentamiento" ? "8–10 min" : blockType === "vuelta_calma" ? "5 min" : "40\"",
    sets: ex.sets,
    reps: isIso ? "25–30\"" : ex.reps,
    rest: ex.rest,
    description: ex.slotDescription || `Ejercicio del pool ${ex.pool}.`,
    tips,
    errorsToAvoid: ex.lesionesContra?.length
      ? `Evita si tienes: ${ex.lesionesContra.join(", ")}`
      : "No sacrifiques la técnica por añadir carga.",
    videoUrl: ex.videoUrl || "",
    blockType,
    blockTags: [],
  };
}

function fillTemplateV2(sessionType, filterParams, usedIds) {
  const template = getTemplate(sessionType);
  const userProfile = buildUserProfile(filterParams);
  const sessionUsedIds = [...usedIds].map(parseCatalogId).filter((n) => n != null);
  const sessionUsedPools = [];
  let globalIdx = 0;
  const blocks = [];

  for (const blockTemplate of template.blocks) {
    const { exercises: rawExercises, usedIds: newIds, usedPools } = fillBlockSlots(
      blockTemplate,
      userProfile,
      sessionUsedIds,
      sessionUsedPools,
    );
    sessionUsedIds.splice(0, sessionUsedIds.length, ...newIds);
    sessionUsedPools.splice(0, sessionUsedPools.length, ...usedPools);

    blocks.push({
      type: blockTemplate.type,
      label: blockTemplate.label,
      duration: blockTemplate.duration,
      exercises: rawExercises.map((ex, i) => {
        usedIds.add(ex.id);
        return makeExerciseFromV2(ex, globalIdx + i, blockTemplate.type);
      }),
    });
    globalIdx += rawExercises.length;
  }

  const intensity = template.intensityLevel || template.intensity;
  return {
    type: sessionType,
    title: template.title || sessionType,
    objective: `Sesión ${sessionType} según tu plan personalizado DEPRO.`,
    duration: template.duration,
    intensity,
    intensityLevel: intensity || sessionIntensity(sessionType),
    status: "pending",
    blocks,
    exercises: blocks.flatMap((b) => b.exercises),
  };
}

function makeExercise(ex, ei, blockType, blockTags, expLevel) {
  const isIso = ex.etiquetas?.includes("isometrico");
  const vol = volumeForExperience(expLevel, blockType, blockTags);
  const tipsRaw = ex.tips;
  const tips = Array.isArray(tipsRaw)
    ? tipsRaw
    : tipsRaw
      ? String(tipsRaw).split("\n").filter(Boolean)
      : [
          "Mantén la postura durante toda la serie",
          "Controla el movimiento en ambas fases",
          "Respira con normalidad",
        ];
  return {
    id: `${ex.id}_${ei}`,
    catalogId: ex.id,
    name: ex.nombre,
    duration: ex.duration || (blockType === "calentamiento" ? "8–10 min" : blockType === "vuelta_calma" ? "5 min" : "40\""),
    sets: vol.sets,
    reps: isIso ? "25–30\"" : vol.reps,
    rest: vol.rest,
    description: ex.description || `Ejercicio de ${(ex.etiquetas || []).slice(0, 2).join(" y ").replace(/_/g, " ")}.`,
    tips,
    errorsToAvoid: ex.contraindicado?.length
      ? `Evita si tienes: ${ex.contraindicado.join(", ")}`
      : "No sacrifiques la técnica por añadir carga.",
    videoUrl: ex.videoUrl || "",
    blockTags,
    blockType,
  };
}

function fillTemplate(sessionType, filterParams, usedIds, weekOffset = 0) {
  const template = getTemplate(sessionType);
  if (isV2Template(template)) {
    return fillTemplateV2(sessionType, filterParams, usedIds);
  }
  let globalIdx = 0;
  const lesiones = filterParams.lesiones || [];
  const expLevel = filterParams.experiencia || "intermedio";

  const blocks = template.blocks.map((slot) => {
    let pool = filterExercisesEnriched({
      ...filterParams,
      etiquetas: slot.tags,
    }).filter((ex) => !usedIds.has(ex.id));

    const lesionRec = injectLesionExercises(pool, lesiones, Math.min(2, slot.slots));
    lesionRec.forEach((ex) => usedIds.add(ex.id));

    const remaining = slot.slots - lesionRec.length;
    const picked = pickExercises(pool, remaining, usedIds, weekOffset);
    const allPicked = [...lesionRec, ...picked];

    return {
      type: slot.type,
      label: slot.label,
      duration: slot.duration,
      exercises: allPicked.map((ex, i) => makeExercise(ex, globalIdx + i, slot.type, slot.tags, expLevel)),
    };
  });

  globalIdx += blocks.reduce((n, b) => n + b.exercises.length, 0);

  return {
    type: sessionType,
    title: sessionType,
    objective: `Sesión ${sessionType} según tu plan personalizado DEPRO.`,
    duration: template.duration,
    intensity: template.intensity,
    intensityLevel: sessionIntensity(sessionType),
    status: "pending",
    blocks,
    exercises: blocks.flatMap((b) => b.exercises),
  };
}

/** @deprecated Usar assignSessionsToDays de planLoadRules */
export function assignTrainingDays(sessionTypes, availableDays) {
  return assignSessionsToDays(sessionTypes, availableDays, null)
    .map(({ sessionType, day }) => ({ sessionType, day }));
}

export function buildPlayerPlan(user, options = {}) {
  const { weekOffset = 0, sessionTypesOverride = null } = options;
  const frecuencia = user?.frecuencia || "3";
  const material = normalizeMaterial(user?.material);
  const lesiones = normalizeLesions(user?.lesion, user?.lesionSubtipo);
  const edad = parseInt(user?.edad) || 20;
  const deporte = user?.deporte || "";
  const objetivo = user?.objetivo || "Fuerza";
  const availableDays = user?.disponibles?.length ? user.disponibles : null;
  const expLevel = experienciaLevel(user?.experiencia);
  const matchDay = normalizeMatchDay(user?.diaCompeticion || user?.dia_competicion);

  const sessionTypes = sessionTypesOverride || getSessionTypesForUser(objetivo, frecuencia, user?.objetivoSecundario);
  const assignments = assignSessionsToDays(sessionTypes, availableDays, matchDay);
  const filterParams = { material, lesiones, edad, deporte, experiencia: expLevel };
  const usedIds = new Set();

  const dayMap = {};
  assignments.forEach(({ sessionType, day }, i) => {
    const session = fillTemplate(sessionType, filterParams, usedIds, weekOffset + i);
    session.id = `gen_${day}_w${weekOffset}_${i}`;
    session.sessionNumber = i + 1;
    session.assignedDay = day;
    dayMap[day] = session;
  });

  const todayName = DAY_ORDER[(new Date().getDay() + 6) % 7];

  return DAY_ORDER.map((nombre, i) => {
    const session = dayMap[nombre];
    if (!session) {
      return { day: nombre, shortDay: DAY_SHORT[i], date: nombre, sessions: [] };
    }
    const isToday = nombre === todayName;
    return {
      day: nombre,
      shortDay: DAY_SHORT[i],
      date: nombre,
      sessions: [{
        ...session,
        status: session.status === "completed" ? "completed" : isToday ? "today" : "pending",
      }],
    };
  });
}

/** Plan completo de 4 semanas (PDF §9.1 paso 5) */
export function buildFourWeekPlan(user) {
  const weeks = [];
  for (let w = 0; w < 4; w++) {
    const weekPlan = buildPlayerPlan(user, { weekOffset: w });
    const sessions = weekPlan
      .filter((d) => d.sessions.length)
      .map((d) => ({
        ...d.sessions[0],
        dayName: d.day,
        week: w + 1,
      }));
    weeks.push({ week: w + 1, label: `Semana ${w + 1}`, sessions, days: weekPlan });
  }
  return weeks;
}

/** Refrescar un ejercicio por otro compatible (v2: mismo pool; legacy: tags) */
export function refreshExercise(session, exerciseId, filterParams) {
  const target = (session.exercises || []).find((ex) => ex.id === exerciseId);
  if (!target) return session;

  const usedInSession = (session.exercises || [])
    .map((ex) => ex.catalogId ?? parseCatalogId(ex.id))
    .filter((id) => id != null);

  let newEx;

  if (target.pool) {
    const userProfile = buildUserProfile(filterParams);
    const excludeIds = usedInSession.filter((id) => id !== target.catalogId);
    const replacement = refreshExerciseInPool(
      { id: target.catalogId, pool: target.pool },
      userProfile,
      excludeIds,
    );
    if (!replacement) return session;
    newEx = makeExerciseFromV2(replacement, Date.now(), target.blockType);
    newEx.id = `v2_${replacement.id}_${Date.now()}`;
  } else {
    const usedSet = new Set(
      (session.exercises || []).map((ex) => ex.catalogId || ex.id?.split("_")[0]),
    );
    const pool = filterExercisesEnriched({
      ...filterParams,
      etiquetas: target.blockTags || [],
    }).filter((ex) => !usedSet.has(ex.id) && ex.id !== target.catalogId);

    if (!pool.length) return session;

    const replacement = pool[Math.floor(Math.random() * pool.length)];
    newEx = makeExercise(
      replacement,
      Date.now(),
      target.blockType,
      target.blockTags || [],
      filterParams.experiencia || "intermedio",
    );
  }

  const updateBlocks = (session.blocks || []).map((block) => ({
    ...block,
    exercises: (block.exercises || []).map((ex) => (ex.id === exerciseId ? newEx : ex)),
  }));

  return {
    ...session,
    blocks: updateBlocks,
    exercises: updateBlocks.flatMap((b) => b.exercises),
    refreshedAt: Date.now(),
  };
}

export function buildMinimalSession(user) {
  const material = normalizeMaterial(user?.material);
  const lesiones = normalizeLesions(user?.lesion, user?.lesionSubtipo);
  const usedIds = new Set();
  return fillTemplate("Sesión mínima", {
    material, lesiones,
    edad: parseInt(user?.edad) || 20,
    deporte: user?.deporte || "",
    experiencia: experienciaLevel(user?.experiencia),
  }, usedIds);
}

export function ensurePlayerPlan(user) {
  if (!user?.id) return null;
  const planKey = `depro_plan_${user.id}`;
  try {
    const existing = localStorage.getItem(planKey);
    if (existing) return JSON.parse(existing);
  } catch { /* ignore */ }
  const plan = buildPlayerPlan(user);
  localStorage.setItem(planKey, JSON.stringify(plan));
  return plan;
}

export function buildPlanAIPayload(user) {
  const frecuencia = user?.frecuencia || "3";
  const sessionTypes = getSessionTypesForUser(user?.objetivo, frecuencia, user?.objetivoSecundario);
  const material = normalizeMaterial(user?.material);
  const lesiones = normalizeLesions(user?.lesion, user?.lesionSubtipo);
  const expLevel = experienciaLevel(user?.experiencia);
  const matchDay = normalizeMatchDay(user?.diaCompeticion || user?.dia_competicion);
  const assignments = assignSessionsToDays(sessionTypes, user?.disponibles, matchDay);
  const allEx = filterExercisesEnriched({ material, lesiones, edad: parseInt(user?.edad) || 20, deporte: user?.deporte || "", experiencia: expLevel, etiquetas: [] });

  return {
    sessionPrompts: assignments.map(({ sessionType, day, distance }) =>
      buildSessionPrompt({
        user: { ...user, experiencia: expLevel },
        sessionType,
        diaSemana: day,
        distanciaPartido: distance,
        intensidadPermitida: sessionIntensity(sessionType),
        plantilla: getTemplate(sessionType),
        ejercicios: allEx.slice(0, 60),
      })
    ),
    fullPlanPrompt: buildFullPlanPrompt({
      user: { ...user, experiencia: expLevel },
      sessionTypes,
      plantillas: sessionTypes.map((st) => getTemplate(st)),
      ejercicios: allEx,
    }),
  };
}

export function buildMesoPlayerPlan(user, weeks = 4) {
  const baseWeek = buildPlayerPlan(user, { weekOffset: 0 });
  const baseSessions = baseWeek
    .filter((d) => d.sessions.length)
    .map((d, i) => ({
      day: d.day,
      session: d.sessions[0],
      sessionNumber: i + 1,
    }));

  const result = [];
  for (let w = 0; w < weeks; w++) {
    const sessions = baseSessions.map(({ day, session, sessionNumber }) => ({
      ...session,
      id: `meso_w${w}_${session.id}`,
      sessionNumber,
      dayName: day,
      weekNumber: w + 1,
      templateVariant: `S${w + 1}`,
    }));
    result.push({ week: w + 1, label: `Semana ${w + 1}`, sessions });
  }
  return result;
}
