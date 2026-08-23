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
  injectPreventionExercises,
  normalizeMaterialList,
} from "./exerciseSelector.js";
import { normalizePlayerPlan, savePlayerPlan as savePlanLocal } from "./playerPlanStorage.js";
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
  const base = (lesion || []).map((l) =>
    l.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
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
    duration: blockType === "calentamiento" ? "8–10 min" : blockType === "vuelta_calma" ? "5 min" : "40\"",
    sets: ex.sets,
    reps: isIso ? "25–30\"" : ex.reps,
    rest: ex.rest,
    load: ex.load || null,
    description: ex.descripcion || ex.description || ex.slotDescription || `Ejercicio: ${ex.nombre}.`,
    tips,
    errorsToAvoid: (ex.etiquetas?.contraindicado || ex.lesionesContra)?.length
      ? `Evita si tienes: ${(ex.etiquetas?.contraindicado || ex.lesionesContra).join(", ")}`
      : "No sacrifiques la técnica por añadir carga.",
    videoUrl: ex.videoUrl || "",
    blockType,
    blockTags: [],
    slotConstraints: ex.slotConstraints || null,
    etiquetas: ex.etiquetas || null,
  };
}

function fillTemplateV2Once(sessionType, filterParams, usedIds, templateKey, titleOverride, meta, { allowReuseWeek = false } = {}) {
  const template = getTemplate(templateKey);
  const userProfile = buildUserProfile({
    ...filterParams,
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
    const {
      exercises: rawExercises,
      usedIds: newIds,
      usedPools,
      incomplete: blockIncomplete,
    } = fillBlockSlots(
      blockTemplate,
      userProfile,
      sessionUsedIds,
      sessionUsedPools,
    );
    sessionUsedIds.splice(0, sessionUsedIds.length, ...newIds);
    sessionUsedPools.splice(0, sessionUsedPools.length, ...usedPools);

    const expected = expectedSlotCount(blockTemplate);
    if (blockIncomplete || rawExercises.length < expected) incomplete = true;

    blocks.push({
      type: blockTemplate.type,
      label: blockTemplate.label,
      duration: blockTemplate.duration,
      exercises: rawExercises.map((ex, i) => {
        filledIds.push(ex.id);
        return makeExerciseFromV2(ex, globalIdx + i, blockTemplate.type);
      }),
    });
    globalIdx += rawExercises.length;
  }

  // Inyección prevención por lesión (sustituye complementarios — NO añade ni elimina slots)
  let flat = blocks.flatMap((b) => b.exercises);
  flat = injectPreventionExercises(flat, userProfile, 2);
  if (flat.length) {
    let cursor = 0;
    for (const b of blocks) {
      const n = b.exercises.length;
      b.exercises = flat.slice(cursor, cursor + n);
      cursor += n;
    }
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
    if (acc.length) {
      blocks.splice(blocks.length - 1, 0, {
        type: "complementario",
        label: accSlot.label,
        duration: accSlot.duration,
        exercises: acc.map((ex, i) => makeExerciseFromV2(ex, globalIdx + i, "complementario")),
      });
      globalIdx += acc.length;
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

function attachPlanMeta(weekPlan, meta) {
  weekPlan.userId = meta.userId || null;
  weekPlan.semana_actual = meta.week || 1;
  weekPlan.mesociclo_id = meta.mesocicloId || `meso_${meta.userId || "anon"}`;
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

export function refreshExercise(session, exerciseId, filterParams) {
  const target = (session.exercises || []).find((ex) => ex.id === exerciseId);
  if (!target) return session;

  const usedInSession = (session.exercises || [])
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
        // Normalizar weeks→días por si se asignó desde admin en este mismo navegador
        const normalized = normalizePlayerPlan(parsed);
        if (normalized && normalized !== parsed) {
          savePlanLocal(user.id, normalized);
          return normalized;
        }
        return normalized || parsed;
      }
    }
  } catch { /* ignore */ }

  // Premium: guardar marcador de pendiente hasta asignación manual desde el motor
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

  const plan = buildPlayerPlan(user);
  if (!plan.planError) {
    localStorage.setItem(planKey, JSON.stringify(plan));
  }
  return plan;
}

/**
 * Carga el plan preferiendo el servidor (asignación admin cross-device).
 * Sustituye premiumPending cuando ya hay plan asignado.
 */
export async function hydratePlayerPlan(user) {
  if (!user?.id) return null;
  try {
    const { fetchPlayerPlan } = await import("./playerPlanStorage.js");
    const remote = await fetchPlayerPlan(user.id);
    if (remote && !remote.premiumPending && !remote.planError) {
      const normalized = normalizePlayerPlan(remote);
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
