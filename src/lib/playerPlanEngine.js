/**
 * DEPRO — Motor de planificación (3 fases estrictas).
 * Fase 1: compatibilidad → Fase 2: construcción sesiones → Fase 3: colocación + adaptación.
 */
import { pickDeterministic } from "./deterministicPick.js";
import { filterExercisesEnriched } from "../data/exercises.js";
import { getTemplate, isV2Template, getResistanceVariantKey } from "./planTemplates.js";
import {
  fillBlockSlots,
  expectedSlotCount,
  refreshExercise as refreshExerciseInPool,
  applyContraindicationSwaps,
  normalizeMaterialList,
} from "./exerciseSelector.js";
import { normalizePlayerPlan, savePlayerPlan as savePlanLocal } from "./playerPlanStorage.js";
import { needsMonthlyPlanRefresh, resetCycleCounters } from "./planSwapLimits.js";
import {
  DAY_ORDER,
  DAY_SHORT,
  assignSessionsToDays,
  getSessionTypesForUser,
  normalizeMatchDay,
  sessionIntensity,
  validatePlanCoherence,
  checkPlanCompatibility,
  placeSessionsOnCalendar,
  PLAN_COHERENCE_MESSAGE,
  resolveUserObjectives,
} from "./planLoadRules.js";
import { applySplitAlternationToAssignments, validateMuscleCoverage } from "./muscleSplitAlternation.js";
import { buildSessionPrompt, buildFullPlanPrompt } from "./planAIPrompts.js";
import { countBlockSlots } from "./planTemplates.js";

import { resolveExerciseVideo } from "./catalogMedia.js";
import { selectGeneralWarmup } from "./clubAuto/clubAutoTaskSelector.js";
import { CLUB_SIN_BALON_INTRO } from "../data/clubAutoCatalog.js";

export { DAY_ORDER, DAY_SHORT, PLAN_COHERENCE_MESSAGE, checkPlanCompatibility };

export const MIN_SESSION_EXERCISES = 5;

function countSessionExercises(session) {
  if (session?.exercises?.length) return session.exercises.length;
  return (session?.blocks || []).reduce((n, b) => n + (b.exercises?.length || 0), 0);
}

/** Cuenta slots esperados de una plantilla (qty por slot, sin opcional). */
export function countTemplateSlots(template) {
  if (!template?.blocks) return 0;
  return template.blocks.reduce((n, b) => n + countBlockSlots(b), 0);
}

/** Valida sesión generada vs plantilla (PDF §5.3). Ignora bloques accesorio extra. */
export function validateSessionAgainstTemplate(session, template) {
  const expected = countTemplateSlots(template);
  const coreBlocks = (session?.blocks || []).filter(
    (b) => !String(b.label || "").startsWith("Accesorio"),
  );
  const actual = coreBlocks.reduce((n, b) => n + (b.exercises?.length || 0), 0);
  let bi = 0;
  const blockMismatch = (template.blocks || []).some((tb) => {
    const sb = coreBlocks[bi++];
    if (!sb) return true;
    if (tb.type && sb.type && tb.type !== sb.type) return true;
    return (sb.exercises?.length || 0) < expectedSlotCount(tb);
  });
  return {
    ok: actual >= expected && !blockMismatch,
    expected,
    actual,
    blockMismatch,
    warning: actual < expected
      ? `Sesión incompleta: ${actual}/${expected} slots respecto a la plantilla`
      : null,
  };
}

const SUBTIPO_TO_AREA = {
  acl: "rodilla", menisco: "rodilla", rotuliana: "rodilla", condromalacia: "rodilla",
  esguince: "tobillo", inestabilidad: "tobillo",
  manguito: "hombro", inestabilidad_h: "hombro",
  lumbar: "espalda", dorsal: "espalda", cervical: "espalda",
  pubis: "pubalgia", aductor: "pubalgia", pubalgia: "pubalgia",
};

function normalizeMaterial(material) {
  return normalizeMaterialList(material);
}

export function normalizeLesions(lesion, lesionSubtipo) {
  const asList = (v) => (Array.isArray(v) ? v : (v ? [v] : []));
  const base = asList(lesion).map((l) =>
    String(l).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
  );
  const subAreas = asList(lesionSubtipo).map((s) => SUBTIPO_TO_AREA[String(s).toLowerCase()] || String(s).toLowerCase());
  return [...new Set([...base, ...subAreas])].filter((l) => l && l !== "ninguna");
}

function experienciaLevel(experiencia) {
  const e = (experiencia || "").toLowerCase();
  if (e.includes("nunca") || e.includes("<6") || e.includes("menos de 6")) return "novato";
  if (e.includes("6-12") || e.includes("6–12") || e.includes("1-3") || e.includes("1–3")) return "intermedio";
  return "avanzado";
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
    material: Array.isArray(mat) ? mat : normalizeMaterial(mat),
    lesiones: filterParams.lesiones || [],
    edad: filterParams.edad || 18,
    experiencia: filterParams.experiencia || "intermedio",
    userId: filterParams.userId || "",
    week: filterParams.week || 1,
    sessionObjective: filterParams.sessionObjective,
    adaptedIntensity: filterParams.adaptedIntensity,
    dayIntensity: filterParams.dayIntensity,
    objetivo: filterParams.objetivo,
  };
}

function makeExerciseFromV2(ex, ei, blockType) {
  const isIso = ex.etiquetas?.patron?.includes("isometrico") || ex.pool?.startsWith("ISO-");
  const tips = Array.isArray(ex.tips)
    ? ex.tips
    : ["Mantén la postura durante toda la serie", "Controla el movimiento en ambas fases", "Respira con normalidad"];
  return {
    id: `v2_${ex.id}_${ei}`,
    catalogId: ex.id,
    pool: ex.pool,
    name: ex.nombre,
    duration: ex.duration
      || (blockType === "calentamiento" ? "8–10 min" : blockType === "vuelta_calma" ? "5 min" : "40\""),
    sets: ex.sets,
    reps: isIso ? "25–30\"" : ex.reps,
    rest: ex.rest,
    load: ex.load || null,
    description: ex.descripcion || ex.description || ex.slotDescription || `Ejercicio: ${ex.nombre}.`,
    tips,
    errorsToAvoid: (ex.etiquetas?.contraindicado || ex.lesionesContra)?.length
      ? `Evita si tienes: ${(ex.etiquetas?.contraindicado || ex.lesionesContra).join(", ")}`
      : "No sacrifiques la técnica por añadir carga.",
    videoUrl: resolveExerciseVideo({
      ...ex,
      catalogId: ex.id,
      v2Id: ex.id,
      name: ex.nombre,
      nombre: ex.nombre,
      videoUrl: ex.videoUrl,
    }) || ex.videoUrl || "",
    blockType,
    blockTags: [],
    slotConstraints: ex.slotConstraints || null,
    etiquetas: ex.etiquetas || null,
  };
}

function makeWarmupFromTemplate(warmup, ei) {
  const url = warmup?.videoUrl || warmup?.video || "";
  const id = warmup?.id || `sin_balon_${ei}`;
  return {
    id: `warmup_${id}_${ei}`,
    catalogId: id,
    pool: "WARMUP-SIN-BALON",
    name: warmup?.nombre || CLUB_SIN_BALON_INTRO.titulo,
    duration: "5–6 min",
    sets: 1,
    reps: "—",
    rest: "—",
    description: warmup?.descripcion || warmup?.description || CLUB_SIN_BALON_INTRO.descripcion,
    tips: ["Movilidad articular suave", "Activa sin fatiga", "Respira con normalidad"],
    errorsToAvoid: "No fuerces el rango ni copies la carga del trabajo principal.",
    videoUrl: url,
    blockType: "calentamiento",
    warmupSource: "sin_balon",
    blockTags: [],
    slotConstraints: { rol: "calentamiento", warmupSource: "sin_balon" },
    etiquetas: { rol: "calentamiento", objetivo: ["movilidad"] },
  };
}

function isSinBalonWarmup(ex) {
  if (!ex) return false;
  return ex.warmupSource === "sin_balon"
    || ex.pool === "WARMUP-SIN-BALON"
    || ex.slotConstraints?.warmupSource === "sin_balon";
}

function fillTemplateV2Once(sessionType, filterParams, usedIds, templateKey, titleOverride, meta, { allowReuseWeek = false } = {}) {
  const template = getTemplate(templateKey);
  const realLesiones = filterParams.lesiones || [];
  // Primero se genera el plan como si no hubiera lesión; luego se cambian solo los contraindicados.
  const userProfile = buildUserProfile({
    ...filterParams,
    lesiones: [],
    sessionObjective: template.objective || filterParams.objetivo,
    adaptedIntensity: meta.adaptedIntensity || null,
    dayIntensity: meta.dayIntensity || null,
  });
  const injuryProfile = buildUserProfile({
    ...filterParams,
    lesiones: realLesiones,
    sessionObjective: template.objective || filterParams.objetivo,
    adaptedIntensity: meta.adaptedIntensity || null,
    dayIntensity: meta.dayIntensity || null,
  });
  // En reintento: no bloquear por ids de la semana para poder completar slots
  const sessionUsedIds = allowReuseWeek
    ? []
    : [...usedIds].map(parseCatalogId).filter((n) => n != null);
  const sessionUsedPools = [];
  let globalIdx = 0;
  const blocks = [];
  let incomplete = false;
  const filledIds = [];

  for (const blockTemplate of template.blocks) {
    if (blockTemplate.warmupSource === "sin_balon") {
      const seed = `${templateKey}|${sessionType}|${filterParams.week || 1}|${usedIds.size}|${globalIdx}`;
      const warmup = selectGeneralWarmup({ seed });
      const ex = makeWarmupFromTemplate(warmup, globalIdx);
      filledIds.push(ex.catalogId);
      blocks.push({
        type: blockTemplate.type,
        label: blockTemplate.label,
        duration: blockTemplate.duration,
        warmupSource: "sin_balon",
        exercises: [ex],
      });
      globalIdx += 1;
      continue;
    }

    const prevUsed = [...sessionUsedIds];
    const {
      exercises: rawExercises,
      usedPools,
      incomplete: blockIncomplete,
    } = fillBlockSlots(
      blockTemplate,
      userProfile,
      sessionUsedIds,
      sessionUsedPools,
    );
    const swapped = applyContraindicationSwaps(rawExercises, injuryProfile, prevUsed);
    // El resto de slots/sesiones se rellena con los ids originales para no reescribir el plan.
    const originalIds = [...prevUsed, ...rawExercises.map((ex) => ex.id)];
    sessionUsedIds.splice(0, sessionUsedIds.length, ...originalIds);
    sessionUsedPools.splice(0, sessionUsedPools.length, ...usedPools);

    const expected = expectedSlotCount(blockTemplate);
    if (blockIncomplete || swapped.length < expected) incomplete = true;

    blocks.push({
      type: blockTemplate.type,
      label: blockTemplate.label,
      duration: blockTemplate.duration,
      exercises: swapped.map((ex, i) => {
        filledIds.push(rawExercises[i]?.id ?? ex.id);
        return makeExerciseFromV2(ex, globalIdx + i, blockTemplate.type);
      }),
    });
    globalIdx += swapped.length;
  }

  // Bloque accesorio secundario incrustado (extra, no forma parte del conteo de plantilla)
  if (meta.embedSecondary && meta.secondaryObjective) {
    const accSlot = {
      type: "complementario",
      label: `Accesorio · ${meta.secondaryObjective}`,
      duration: "10 min",
      slots: [
        {
          rol: "complementario",
          objetivo: String(meta.secondaryObjective).toLowerCase(),
          description: `Bloque accesorio ${meta.secondaryObjective}`,
          slotId: "embed_sec",
        },
      ],
    };
    const { exercises: acc } = fillBlockSlots(accSlot, userProfile, sessionUsedIds, []);
    const accSwapped = applyContraindicationSwaps(acc, injuryProfile, sessionUsedIds);
    if (accSwapped.length) {
      blocks.splice(blocks.length - 1, 0, {
        type: "complementario",
        label: accSlot.label,
        duration: accSlot.duration,
        exercises: accSwapped.map((ex, i) => makeExerciseFromV2(ex, globalIdx + i, "complementario")),
      });
      globalIdx += accSwapped.length;
      acc.forEach((ex) => filledIds.push(ex.id));
    }
  }

  let variantInfo = null;
  if (template.variants) {
    const vKey = getResistanceVariantKey(templateKey, filterParams.week || 1);
    variantInfo = vKey ? { key: vKey, ...template.variants[vKey] } : null;
  }

  const intensity = template.intensityLevel || template.intensity;
  const session = {
    type: sessionType,
    title: titleOverride || template.title || sessionType,
    templateKey,
    templateCode: template.templateCode || null,
    objective: variantInfo
      ? `${variantInfo.label}. ${variantInfo.description}`
      : `Sesión ${sessionType} según tu plan personalizado DEPRO.`,
    duration: template.duration,
    intensity,
    intensityLevel: meta.adaptedIntensity || intensity || sessionIntensity(sessionType),
    adaptedIntensity: meta.adaptedIntensity || null,
    resistanceVariant: variantInfo,
    status: "pending",
    incomplete: incomplete || undefined,
    blocks,
    exercises: blocks.flatMap((b) => b.exercises),
  };

  const validation = validateSessionAgainstTemplate(session, template);
  if (!validation.ok) {
    session.incomplete = true;
    session.templateWarning = validation.warning;
  }

  filledIds.forEach((id) => usedIds.add(id));
  return session;
}

function fillTemplateV2(sessionType, filterParams, usedIds, templateKey = sessionType, titleOverride = null, meta = {}) {
  const template = getTemplate(templateKey);
  // Primer intento con dedupe semanal
  let session = fillTemplateV2Once(sessionType, filterParams, usedIds, templateKey, titleOverride, meta, {
    allowReuseWeek: false,
  });
  const firstCheck = validateSessionAgainstTemplate(session, template);

  // Reintento si faltan slots (PDF §5.3): relajar dedupe semanal y rellenar
  if (!firstCheck.ok) {
    console.warn(`[DEPRO] Reintento llenado plantilla «${templateKey}»: ${firstCheck.warning}`);
    const retryUsed = new Set();
    session = fillTemplateV2Once(sessionType, filterParams, retryUsed, templateKey, titleOverride, meta, {
      allowReuseWeek: true,
    });
    retryUsed.forEach((id) => usedIds.add(id));
    const second = validateSessionAgainstTemplate(session, template);
    if (!second.ok) {
      session.adminNotice = `Plantilla «${templateKey}» incompleta tras reintento (${second.actual}/${second.expected} slots).`;
      console.warn(`[DEPRO] ${session.adminNotice}`);
    } else {
      delete session.templateWarning;
      session.incomplete = undefined;
    }
  }

  // Solo pad si la plantilla es genuinamente corta (< MIN); no alterar estructura de plantillas grandes
  const expected = countTemplateSlots(template);
  if (expected < MIN_SESSION_EXERCISES) {
    return ensureMinimumExercises(session, filterParams, usedIds);
  }
  return session;
}

function ensureMinimumExercises(session, filterParams, usedIds) {
  let total = countSessionExercises(session);
  if (total >= MIN_SESSION_EXERCISES) return session;

  const userProfile = buildUserProfile(filterParams);
  let sessionUsedIds = [...usedIds].map(parseCatalogId).filter((n) => n != null);
  const fillerSlot = {
    type: "complementario",
    label: "Complementario",
    duration: "8 min",
    slots: [{ rol: "complementario", objetivo: "movilidad", qty: 1, description: "Complemento de sesión" }],
  };

  const blocks = [...(session.blocks || [])];
  let globalIdx = total;

  while (total < MIN_SESSION_EXERCISES) {
    const { exercises: raw, usedIds: newIds } = fillBlockSlots(fillerSlot, userProfile, sessionUsedIds, []);
    if (!raw.length) break;
    sessionUsedIds = newIds;
    const newExercises = raw.map((ex, i) => {
      usedIds.add(ex.id);
      return makeExerciseFromV2(ex, globalIdx + i, "complementario");
    });
    globalIdx += newExercises.length;
    total += newExercises.length;
    const last = blocks[blocks.length - 1];
    if (last?.type === "complementario" && last.label === fillerSlot.label) {
      blocks[blocks.length - 1] = { ...last, exercises: [...(last.exercises || []), ...newExercises] };
    } else {
      blocks.push({ type: fillerSlot.type, label: fillerSlot.label, duration: fillerSlot.duration, exercises: newExercises });
    }
  }

  return { ...session, blocks, exercises: blocks.flatMap((b) => b.exercises) };
}

function fillTemplate(sessionType, filterParams, usedIds, weekOffset = 0, templateKey = sessionType, titleOverride = null, meta = {}) {
  void weekOffset;
  const template = getTemplate(templateKey);
  if (isV2Template(template)) {
    return fillTemplateV2(sessionType, filterParams, usedIds, templateKey, titleOverride, meta);
  }
  // Legacy fallback mínimo
  return fillTemplateV2(sessionType, filterParams, usedIds, "Movilidad", titleOverride, meta);
}

export function assignTrainingDays(sessionTypes, availableDays) {
  return assignSessionsToDays(sessionTypes, availableDays, null)
    .map(({ sessionType, day }) => ({ sessionType, day }));
}

function emptyWeek(planError) {
  const week = DAY_ORDER.map((nombre, i) => ({
    day: nombre,
    shortDay: DAY_SHORT[i],
    date: nombre,
    sessions: [],
  }));
  week.planError = planError;
  week.hardBlock = true;
  return week;
}

/** Lunes ISO (YYYY-MM-DD) de la semana de `date`. */
export function mondayOfDate(date = new Date()) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  const diff = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diff);
  return d.toISOString().slice(0, 10);
}

/**
 * Fecha de inicio del mesociclo del plan (lunes).
 * Si no hay startDate guardado, ancla en el lunes de la semana actual
 * restando (semana_actual - 1) semanas.
 */
export function resolvePlayerPlanStartDate(plan, fallbackDate = new Date()) {
  if (plan?.startDate) return plan.startDate;
  if (plan?._meta?.startDate) return plan._meta.startDate;
  const thisMonday = mondayOfDate(fallbackDate);
  const semana = Math.max(1, Number(plan?.semana_actual) || 1);
  if (semana <= 1) return thisMonday;
  const d = new Date(`${thisMonday}T12:00:00`);
  d.setDate(d.getDate() - (semana - 1) * 7);
  return d.toISOString().slice(0, 10);
}

function attachPlanMeta(weekPlan, meta) {
  weekPlan.userId = meta.userId || null;
  weekPlan.semana_actual = meta.week || 1;
  weekPlan.mesociclo_id = meta.mesocicloId || `meso_${meta.userId || "anon"}`;
  weekPlan.startDate = meta.startDate || mondayOfDate();
  weekPlan.sesiones_semana = meta.sesionesSemana || [];
  weekPlan.sesiones_pendientes_compensar = meta.pendingCompensate || {
    fuerza: 0,
    velocidad: 0,
    hipertrofia: 0,
    resistencia_anaerobica: 0,
  };
  weekPlan.refrescos_usados_mes = meta.refrescos || 0;
  weekPlan.ultima_generacion = new Date().toISOString();
  weekPlan.qualityWarning = meta.qualityWarning || null;
  weekPlan.embedSecondary = !!meta.embedSecondary;
  return weekPlan;
}

/**
 * Interfaz pública: generatePlan(perfil) → Plan
 */
export function generatePlan(perfil, options = {}) {
  return buildPlayerPlan(perfil, options);
}

export function buildPlayerPlan(user, options = {}) {
  const {
    weekOffset = 0,
    sessionTypesOverride = null,
    lastMuscleGroup = null,
    pendingCompensate: prevPending = null,
  } = options;

  const week = (weekOffset % 4) + 1;
  const material = normalizeMaterial(user?.material);
  const lesiones = normalizeLesions(user?.lesion, user?.lesionSubtipo);
  const edad = parseInt(user?.edad, 10) || 20;
  const deporte = user?.deporte || "";
  const { principal, secondary } = resolveUserObjectives(user);
  const availableDays = user?.disponibles?.length ? user.disponibles : null;
  const expLevel = experienciaLevel(user?.experiencia);
  const matchDay = normalizeMatchDay(user?.diaCompeticion || user?.dia_competicion);

  // ── FASE 1 ──
  const phase1 = checkPlanCompatibility(user);
  if (!phase1.ok || phase1.hardBlock) {
    return emptyWeek(phase1.message || PLAN_COHERENCE_MESSAGE);
  }

  // ── FASE 2 ──
  let sessionTypes = sessionTypesOverride || phase1.sessionTypes
    || getSessionTypesForUser(principal, user?.frecuencia, secondary);

  // Compensar sesiones pendientes de semanas anteriores
  const pending = { ...(prevPending || {}) };
  for (const [obj, count] of Object.entries(pending)) {
    if (count > 0 && sessionTypes.length < 5) {
      const extra = obj === "fuerza" ? "Fuerza Full"
        : obj === "velocidad" ? "Velocidad"
          : obj === "hipertrofia" ? "Hipertrofia Full"
            : null;
      if (extra) {
        sessionTypes = [...sessionTypes, extra].slice(0, parseInt(String(user?.frecuencia).replace(/\D/g, ""), 10) || sessionTypes.length);
        pending[obj] = count - 1;
      }
    }
  }

  // ── FASE 3 ──
  const { assignments: placed, pendingCompensate } = placeSessionsOnCalendar(
    sessionTypes,
    availableDays || phase1.availableDays,
    matchDay,
    { fillSessions: phase1.fillSessions, fillIndexes: phase1.fillIndexes },
  );

  // Merge pending compensate
  for (const [k, v] of Object.entries(pendingCompensate || {})) {
    pending[k] = (pending[k] || 0) + v;
  }

  const filterParams = {
    material,
    lesiones,
    edad,
    deporte,
    experiencia: expLevel,
    userId: user?.id || "",
    week,
    objetivo: principal,
  };

  const { assignments: resolvedAssignments, lastMuscleGroup: nextLastGroup, warnings } =
    applySplitAlternationToAssignments(placed, filterParams, lastMuscleGroup);

  validateMuscleCoverage(resolvedAssignments);

  const usedIds = new Set();
  const dayMap = {};
  const sesionesSemana = [];

  resolvedAssignments.forEach((assignment, i) => {
    const {
      sessionType, day, templateKey, titleOverride, adaptedIntensity, distance, allowedIntensities,
    } = assignment;

    const session = fillTemplate(
      sessionType,
      filterParams,
      usedIds,
      weekOffset + i,
      templateKey || sessionType,
      titleOverride,
      {
        adaptedIntensity,
        dayIntensity: allowedIntensities?.includes("alta") ? "alta" : allowedIntensities?.[0],
        embedSecondary: phase1.embedSecondary && i === 0,
        secondaryObjective: secondary,
      },
    );
    session.id = `gen_${day}_w${weekOffset}_${i}`;
    session.sessionNumber = i + 1;
    session.assignedDay = day;
    session.matchDistance = distance;
    dayMap[day] = session;
    sesionesSemana.push({
      day,
      sessionType,
      templateKey: templateKey || sessionType,
      adaptedIntensity: adaptedIntensity || null,
    });
  });

  const todayName = DAY_ORDER[(new Date().getDay() + 6) % 7];

  const weekPlan = DAY_ORDER.map((nombre, i) => {
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

  weekPlan._lastMuscleGroup = nextLastGroup;
  weekPlan._warnings = warnings;
  if (phase1.qualityWarning) {
    weekPlan.qualityWarning = phase1.qualityWarning;
  }

  return attachPlanMeta(weekPlan, {
    userId: user?.id,
    week,
    startDate: mondayOfDate(),
    pendingCompensate: {
      fuerza: pending.fuerza || 0,
      velocidad: pending.velocidad || 0,
      hipertrofia: pending.hipertrofia || 0,
      resistencia_anaerobica: pending.resistencia_anaerobica || pending.resistencia || 0,
    },
    sesionesSemana,
    qualityWarning: phase1.qualityWarning,
    embedSecondary: phase1.embedSecondary,
  });
}

export function buildFourWeekPlan(user) {
  const weeks = [];
  let lastMuscleGroup = null;
  let pendingCompensate = null;
  for (let w = 0; w < 4; w++) {
    const weekPlan = buildPlayerPlan(user, { weekOffset: w, lastMuscleGroup, pendingCompensate });
    lastMuscleGroup = weekPlan._lastMuscleGroup ?? lastMuscleGroup;
    pendingCompensate = weekPlan.sesiones_pendientes_compensar || pendingCompensate;
    const sessions = weekPlan
      .filter((d) => d.sessions.length)
      .map((d) => ({
        ...d.sessions[0],
        dayName: d.day,
        week: w + 1,
      }));
    weeks.push({
      week: w + 1,
      label: `Semana ${w + 1}`,
      sessions,
      days: weekPlan,
      sesiones_pendientes_compensar: weekPlan.sesiones_pendientes_compensar,
    });
  }
  return weeks;
}

function sessionExerciseList(session) {
  const fromBlocks = (session?.blocks || []).flatMap((b) => b.exercises || []);
  const fromList = session?.exercises || [];
  return fromList.length ? fromList : fromBlocks;
}

function findSessionExercise(session, exerciseId) {
  return sessionExerciseList(session).find((ex) => ex.id === exerciseId)
    || (session?.blocks || []).flatMap((b) => b.exercises || []).find((ex) => ex.id === exerciseId)
    || null;
}

export function refreshExercise(session, exerciseId, filterParams) {
  const target = findSessionExercise(session, exerciseId);
  if (!target) return session;

  const usedInSession = sessionExerciseList(session)
    .map((ex) => ex.catalogId ?? parseCatalogId(ex.id))
    .filter((id) => id != null);

  const userProfile = buildUserProfile({
    ...filterParams,
    material: normalizeMaterial(filterParams.material),
  });
  const excludeIds = usedInSession.filter((id) => id !== target.catalogId);
  const replacement = refreshExerciseInPool(
    {
      id: target.catalogId,
      catalogId: target.catalogId,
      pool: target.pool,
      slotConstraints: target.slotConstraints,
      etiquetas: target.etiquetas,
    },
    userProfile,
    excludeIds,
    String(Date.now()),
  );
  if (!replacement) return session;

  const newEx = makeExerciseFromV2(replacement, Date.now(), target.blockType);
  newEx.id = `v2_${replacement.id}_${Date.now()}`;
  newEx.slotConstraints = target.slotConstraints || replacement.slotConstraints;

  const mapEx = (ex) => (ex.id === exerciseId ? newEx : ex);
  const updateBlocks = (session.blocks || []).map((block) => ({
    ...block,
    exercises: (block.exercises || []).map(mapEx),
  }));
  const nextExercises = (session.exercises || []).length
    ? (session.exercises || []).map(mapEx)
    : updateBlocks.flatMap((b) => b.exercises);

  return {
    ...session,
    blocks: updateBlocks,
    exercises: nextExercises,
    refreshedAt: Date.now(),
  };
}

export function buildMinimalSession(user) {
  const material = normalizeMaterial(user?.material);
  const lesiones = normalizeLesions(user?.lesion, user?.lesionSubtipo);
  const usedIds = new Set();
  return fillTemplate("Movilidad", {
    material,
    lesiones,
    edad: parseInt(user?.edad, 10) || 20,
    deporte: user?.deporte || "",
    experiencia: experienciaLevel(user?.experiencia),
    userId: user?.id || "",
  }, usedIds);
}

/** Premium = intervención humana: no generar rutina automática. */
function isPremiumManualUser(user) {
  const plan = String(user?.plan || user?.subscription?.plan || "").toLowerCase();
  return plan === "player-pro" || plan === "premium" || plan === "pro";
}

function isAdminAssignedPlan(plan) {
  return !!(plan?.source === "admin_manual" || plan?.assignment || plan?.hasAssignedPlan);
}

function shouldAutoRegenerateMonthly(user, plan) {
  if (!user || !plan) return false;
  if (isPremiumManualUser(user) || user?.hasAssignedPlan) return false;
  if (isAdminAssignedPlan(plan)) return false;
  return needsMonthlyPlanRefresh(plan);
}

/**
 * Sustituye un ejercicio y propaga el mismo cambio (mismo catalogId)
 * a todas las sesiones del microciclo y weeks[] del mesociclo.
 */
export function refreshExerciseAcrossPlan(plan, sessionId, exerciseId, filterParams) {
  const days = Array.isArray(plan)
    ? plan
    : (Array.isArray(plan?.days) ? plan.days : null);
  if (!days || !exerciseId) return plan;

  const allDaySessions = days.flatMap((d) => d.sessions || []);
  let targetSession = sessionId
    ? allDaySessions.find((s) => s.id === sessionId)
    : null;
  if (!targetSession) {
    targetSession = allDaySessions.find((s) => findSessionExercise(s, exerciseId));
  }
  if (!targetSession) {
    const weeksSource = Array.isArray(plan) ? plan.weeks : plan?.weeks;
    if (Array.isArray(weeksSource)) {
      for (const w of weeksSource) {
        const weekSessions = [
          ...(w.days || []).flatMap((d) => d.sessions || []),
          ...(w.sessions || []),
        ];
        targetSession = weekSessions.find((s) => (sessionId && s.id === sessionId) || findSessionExercise(s, exerciseId));
        if (targetSession) break;
      }
    }
  }
  const target = targetSession ? findSessionExercise(targetSession, exerciseId) : null;
  if (!target) return plan;

  const oldCatalogId = target.catalogId ?? parseCatalogId(target.id);

  const matchesOld = (ex) => {
    if (!ex) return false;
    if (ex.id === exerciseId) return true;
    const cid = ex.catalogId ?? parseCatalogId(ex.id);
    return oldCatalogId != null && cid === oldCatalogId;
  };

  let makeNew;
  if (isSinBalonWarmup(target) || (target.blockType === "calentamiento" && target.warmupSource === "sin_balon")) {
    const seed = `${sessionId}|${exerciseId}|${oldCatalogId || ""}`;
    let replacement = selectGeneralWarmup({ seed, avoidId: target.catalogId });
    if (!replacement || replacement.placeholder || replacement.id === target.catalogId) {
      replacement = selectGeneralWarmup({ seed: `${seed}|alt` });
    }
    if (!replacement || replacement.id === target.catalogId) return plan;
    makeNew = (idx) => makeWarmupFromTemplate(replacement, idx);
  } else {
    const usedInSession = sessionExerciseList(targetSession)
      .map((ex) => ex.catalogId ?? parseCatalogId(ex.id))
      .filter((id) => id != null);

    const userProfile = buildUserProfile({
      ...filterParams,
      material: normalizeMaterial(filterParams.material),
    });
    const excludeIds = usedInSession.filter((id) => id !== oldCatalogId);
    const replacement = refreshExerciseInPool(
      {
        id: target.catalogId,
        pool: target.pool,
        slotConstraints: target.slotConstraints,
        etiquetas: target.etiquetas,
      },
      userProfile,
      excludeIds,
      `${sessionId}|${exerciseId}|${oldCatalogId || ""}`,
    );
    if (!replacement) return plan;
    makeNew = (seed) => {
      const newEx = makeExerciseFromV2(replacement, seed, target.blockType);
      newEx.id = `v2_${replacement.id}_${seed}`;
      newEx.slotConstraints = target.slotConstraints || replacement.slotConstraints;
      return newEx;
    };
  }

  const mapSession = (session, seed) => {
    if (!session?.exercises?.length && !session?.blocks?.length) return session;
    const has = (session.exercises || []).some(matchesOld)
      || (session.blocks || []).some((b) => (b.exercises || []).some(matchesOld));
    if (!has) return session;
    let i = 0;
    const mapList = (list) => (list || []).map((ex) => {
      if (!matchesOld(ex)) return ex;
      return makeNew(seed + (++i));
    });
    const blocks = (session.blocks || []).map((block) => ({
      ...block,
      exercises: mapList(block.exercises),
    }));
    const exercises = (session.exercises || []).length
      ? mapList(session.exercises)
      : (blocks.length ? blocks.flatMap((b) => b.exercises) : []);
    return { ...session, blocks, exercises, refreshedAt: Date.now() };
  };

  const seed = Number.parseInt(String(oldCatalogId).replace(/\D/g, ""), 10) || 1;
  const mappedDays = days.map((day, di) => ({
    ...day,
    sessions: (day.sessions || []).map((s, si) => mapSession(s, seed + di * 20 + si)),
  }));

  const next = Array.isArray(plan)
    ? mappedDays
    : { ...plan, days: mappedDays };

  // Conservar meta del array
  if (Array.isArray(plan)) {
    for (const key of Object.keys(plan)) {
      if (Number.isNaN(Number(key)) && next[key] === undefined) {
        next[key] = plan[key];
      }
    }
  }

  const weeksSource = Array.isArray(plan) ? plan.weeks : plan?.weeks;
  if (Array.isArray(weeksSource)) {
    next.weeks = weeksSource.map((w, wi) => {
      const mapped = { ...w };
      if (Array.isArray(w.days)) {
        mapped.days = w.days.map((day, di) => ({
          ...day,
          sessions: (day.sessions || []).map((s, si) => mapSession(s, seed + 5000 + wi * 100 + di * 10 + si)),
        }));
      }
      if (Array.isArray(w.sessions)) {
        mapped.sessions = w.sessions.map((s, si) => mapSession(s, seed + 8000 + wi * 50 + si));
      }
      return mapped;
    });
  }

  next.refrescos_usados_mes = (Number(plan.refrescos_usados_mes) || 0) + 1;
  return next;
}

function regenerateEssentialPlan(user) {
  const plan = buildPlayerPlan(user);
  if (!plan.planError) {
    const start = plan.startDate || mondayOfDate();
    resetCycleCounters(user.id, start);
    plan.refrescos_usados_mes = 0;
    plan.semana_actual = 1;
    plan.monthlyRefreshAt = new Date().toISOString();
    savePlanLocal(user.id, plan);
  }
  return plan;
}

export function ensurePlayerPlan(user) {
  if (!user?.id) return null;
  const planKey = `depro_plan_${user.id}`;
  try {
    const existing = localStorage.getItem(planKey);
    if (existing) {
      const parsed = JSON.parse(existing);
      if (parsed?.planError) {
        localStorage.removeItem(planKey);
      } else if (parsed?.premiumPending && !isPremiumManualUser(user)) {
        localStorage.removeItem(planKey);
      } else if (parsed?.premiumPending || parsed?.planPendingManual) {
        return parsed;
      } else {
        const normalized = normalizePlayerPlan(parsed);
        const plan = normalized || parsed;
        if (Array.isArray(plan) && !plan.startDate) {
          plan.startDate = resolvePlayerPlanStartDate(plan);
        }
        if (shouldAutoRegenerateMonthly(user, plan)) {
          localStorage.removeItem(planKey);
          return regenerateEssentialPlan(user);
        }
        if (normalized && normalized !== parsed) {
          savePlanLocal(user.id, plan);
        } else if (Array.isArray(plan) && plan.startDate && !parsed.startDate) {
          savePlanLocal(user.id, plan);
        }
        return plan;
      }
    }
  } catch { /* ignore */ }

  if (isPremiumManualUser(user)) {
    const pending = {
      premiumPending: true,
      planPendingManual: true,
      message:
        "Tu plan Premium se diseña manualmente tras la videollamada. Compromiso: contacto + rutina en menos de 48h. Mientras tanto la rutina no está disponible.",
      sessions: [],
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(planKey, JSON.stringify(pending));
    return pending;
  }

  return regenerateEssentialPlan(user);
}

/**
 * Carga el plan preferiendo el servidor (asignación admin cross-device).
 * Sustituye premiumPending cuando ya hay plan asignado.
 * Regenera Essential automáticamente al vencer el mesociclo (~28 días).
 */
export async function hydratePlayerPlan(user) {
  if (!user?.id) return null;
  try {
    const { fetchPlayerPlan } = await import("./playerPlanStorage.js");
    const remote = await fetchPlayerPlan(user.id);
    if (remote && !remote.premiumPending && !remote.planError) {
      const normalized = normalizePlayerPlan(remote);
      if (normalized && Array.isArray(normalized) && !normalized.startDate) {
        normalized.startDate = resolvePlayerPlanStartDate(normalized);
      }
      if (shouldAutoRegenerateMonthly(user, normalized)) {
        return regenerateEssentialPlan(user);
      }
      savePlanLocal(user.id, normalized);
      return normalized;
    }
  } catch { /* ignore */ }
  return ensurePlayerPlan(user);
}

export function buildPlanAIPayload(user) {
  const frecuencia = user?.frecuencia || "3";
  const { principal, secondary } = resolveUserObjectives(user);
  const sessionTypes = getSessionTypesForUser(principal, frecuencia, secondary);
  const material = normalizeMaterial(user?.material);
  const lesiones = normalizeLesions(user?.lesion, user?.lesionSubtipo);
  const expLevel = experienciaLevel(user?.experiencia);
  const matchDay = normalizeMatchDay(user?.diaCompeticion || user?.dia_competicion);
  const assignments = assignSessionsToDays(sessionTypes, user?.disponibles, matchDay);
  const allEx = filterExercisesEnriched({
    material: material[0],
    lesiones,
    edad: parseInt(user?.edad, 10) || 20,
    deporte: user?.deporte || "",
    experiencia: expLevel,
    etiquetas: [],
  });

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
      }),
    ),
    fullPlanPrompt: buildFullPlanPrompt({
      user: { ...user, experiencia: expLevel },
      sessionTypes,
      plantillas: sessionTypes.map((st) => getTemplate(st)),
      ejercicios: allEx,
    }),
  };
}

/** Extrae sesiones de un plan día-array (microciclo guardado). */
export function extractSessionsFromWeekPlan(weekPlan) {
  if (!Array.isArray(weekPlan)) return [];
  return weekPlan
    .filter((d) => d?.sessions?.length)
    .map((d, i) => ({
      day: d.day,
      session: d.sessions[0],
      sessionNumber: i + 1,
    }));
}

/** Normaliza weeks[] (admin / motor) al formato del calendario mensual. */
export function mesoWeeksFromStoredWeeks(storedWeeks) {
  if (!Array.isArray(storedWeeks) || !storedWeeks.length) return [];
  return storedWeeks.map((w, i) => {
    const weekNum = w.week || i + 1;
    if (Array.isArray(w.sessions) && w.sessions.length) {
      return {
        week: weekNum,
        label: w.label || `Semana ${weekNum}`,
        sessions: w.sessions.map((s, si) => ({
          ...s,
          dayName: s.dayName || s.day || s.assignedDay,
          weekNumber: weekNum,
          sessionNumber: s.sessionNumber || si + 1,
        })),
      };
    }
    const sessions = (w.days || [])
      .filter((d) => d?.sessions?.length)
      .map((d, si) => ({
        ...d.sessions[0],
        dayName: d.day,
        weekNumber: weekNum,
        sessionNumber: si + 1,
      }));
    return {
      week: weekNum,
      label: w.label || `Semana ${weekNum}`,
      sessions,
    };
  });
}

/**
 * Mesociclo (4 semanas) para planificaciones individuales.
 * Prioridad: weeks del plan guardado → clonar sesiones del microciclo → regenerar.
 * Así el calendario no queda vacío cuando el perfil (disponibles) no regenera bien.
 */
export function buildMesoPlayerPlan(user, weeks = 4, weekPlan = null) {
  const fromStored = mesoWeeksFromStoredWeeks(weekPlan?.weeks);
  if (fromStored.some((w) => w.sessions.length)) {
    return fromStored.slice(0, weeks);
  }

  let baseSessions = extractSessionsFromWeekPlan(weekPlan);
  if (!baseSessions.length) {
    try {
      const four = buildFourWeekPlan(user);
      if (four.some((w) => w.sessions?.length)) {
        return four.slice(0, weeks).map((w) => ({
          week: w.week,
          label: w.label || `Semana ${w.week}`,
          sessions: (w.sessions || []).map((s, si) => ({
            ...s,
            dayName: s.dayName || s.day || s.assignedDay,
            weekNumber: w.week,
            sessionNumber: s.sessionNumber || si + 1,
            templateVariant: s.templateVariant || `S${w.week}`,
          })),
        }));
      }
    } catch { /* fallback abajo */ }

    const baseWeek = buildPlayerPlan(user, { weekOffset: 0 });
    baseSessions = extractSessionsFromWeekPlan(baseWeek);
  }

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
