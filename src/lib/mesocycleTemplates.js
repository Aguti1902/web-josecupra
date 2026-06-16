/**
 * Plantillas múltiples por marco condicional (A/B/C/D).
 * A, B, C son marcos — cada uno tiene variantes A1, A2, A3…
 * El mesociclo combina variantes por semana: Semana 1 → A1/B1/C1, etc.
 */

export const FRAMEWORKS = ["A", "B", "C", "D"];
export const FRAMEWORK_LABELS = {
  A: "Extensiva",
  B: "Intensiva",
  C: "Reactiva",
  D: "Complementaria",
};
export const FRAMEWORK_COLORS = {
  A: "#3B82F6",
  B: "#F59E0B",
  C: "#EF4444",
  D: "#10B981",
};

function frameworkFromIntensity(intensity) {
  const i = (intensity || "").toLowerCase();
  if (i.includes("complementaria") || i === "d") return "D";
  if (["baja", "media", "media-baja"].includes(i)) return "A";
  if (["media-alta", "alta"].includes(i)) return "B";
  return "C";
}

export function getFrameworkFromIntensity(intensity) {
  return frameworkFromIntensity(intensity);
}

export const FRAMEWORK_DEFAULT_INTENSITY = {
  A: "Media",
  B: "Media-alta",
  C: "Máxima",
  D: "Complementaria-D",
};

export function intensityFromFramework(framework) {
  return FRAMEWORK_DEFAULT_INTENSITY[framework] || "Media";
}

/** Opciones A1, A2… para el selector de plantilla (marca las ya usadas) */
export function buildTemplateKeyOptions(framework, sessions, { excludeId = null, isEditing = false } = {}) {
  const usedKeys = new Set(
    (sessions || [])
      .filter((s) => {
        if (excludeId && s.id === excludeId) return false;
        const sfw = s.framework || frameworkFromIntensity(s.intensity);
        return sfw === framework;
      })
      .map((s) => s.templateKey)
      .filter(Boolean)
  );
  const maxUsed = [...usedKeys].reduce(
    (m, k) => Math.max(m, parseInt(String(k).replace(/\D/g, ""), 10) || 0),
    0
  );
  const limit = Math.max(maxUsed + 2, 5);
  const options = [];
  for (let n = 1; n <= limit; n++) {
    const key = `${framework}${n}`;
    const used = usedKeys.has(key);
    options.push({ key, used, disabled: used && !isEditing });
  }
  return options;
}

function mesocicloWeekCount(startDate, endDate) {
  if (!startDate || !endDate) return 1;
  const start = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");
  const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, Math.ceil(diffDays / 7));
}

export function getSessionDisplayKey(session) {
  const s = ensureSessionTemplateFields(session);
  return s.templateKey || s.framework || "A1";
}

export function ensureSessionTemplateFields(session) {
  if (!session) return session;
  const framework = session.framework || frameworkFromIntensity(session.intensity);
  let templateKey = session.templateKey;
  if (!templateKey) {
    const num = (session.title || "").match(/\b([ABC])\s*(\d+)\b/i);
    templateKey = num ? `${num[1].toUpperCase()}${num[2]}` : `${framework}1`;
  }
  return { ...session, framework, templateKey };
}

export function groupSessionsByFramework(sessions) {
  const groups = { A: [], B: [], C: [], D: [] };
  (sessions || []).forEach((raw) => {
    const s = ensureSessionTemplateFields(raw);
    if (groups[s.framework]) groups[s.framework].push(s);
    else groups.C.push(s);
  });
  for (const fw of FRAMEWORKS) {
    groups[fw].sort((a, b) => {
      const na = parseInt(String(a.templateKey).replace(/\D/g, ""), 10) || 0;
      const nb = parseInt(String(b.templateKey).replace(/\D/g, ""), 10) || 0;
      return na - nb || String(a.templateKey).localeCompare(String(b.templateKey));
    });
  }
  return groups;
}

export function suggestTemplateKey(sessions, framework) {
  const existing = (sessions || [])
    .filter((s) => (s.framework || frameworkFromIntensity(s.intensity)) === framework)
    .map((s) => s.templateKey)
    .filter(Boolean);
  const nums = existing
    .map((k) => parseInt(String(k).replace(/[^\d]/g, ""), 10))
    .filter((n) => !Number.isNaN(n));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `${framework}${next}`;
}

export function buildDefaultWeekSchedule(numWeeks, sessions) {
  const groups = groupSessionsByFramework(sessions);
  const weeks = Math.max(1, numWeeks || 1);
  const schedule = [];
  for (let w = 0; w < weeks; w++) {
    const row = { week: w + 1, A: null, B: null, C: null, D: null };
    for (const fw of FRAMEWORKS) {
      const templates = groups[fw];
      if (templates.length > 0) {
        row[fw] = templates[w % templates.length].id;
      }
    }
    schedule.push(row);
  }
  return schedule;
}

export function ensureWeekSchedule(mesocycle, numWeeks) {
  const weeks = Math.max(1, numWeeks || 1);
  const sessions = (mesocycle?.sessions || []).map(ensureSessionTemplateFields);
  if (mesocycle?.weekSchedule?.length >= weeks) {
    return mesocycle.weekSchedule.slice(0, weeks);
  }
  const base = mesocycle?.weekSchedule?.length
    ? [...mesocycle.weekSchedule]
    : buildDefaultWeekSchedule(weeks, sessions);
  while (base.length < weeks) {
    const extra = buildDefaultWeekSchedule(base.length + 1, sessions);
    base.push(extra[extra.length - 1]);
  }
  return base.slice(0, weeks);
}

export function resolveWeekSessions(mesocycle, weekIndex, numWeeks) {
  const sessions = (mesocycle?.sessions || []).map(ensureSessionTemplateFields);
  if (!sessions.length) return [];

  const sessionById = Object.fromEntries(sessions.map((s) => [s.id, s]));
  const schedule = ensureWeekSchedule(mesocycle, numWeeks);
  const row = schedule[weekIndex] ?? schedule[schedule.length - 1] ?? {};

  const resolved = [];
  for (const fw of FRAMEWORKS) {
    const id = row[fw];
    if (!id) continue;
    const template = sessionById[id];
    if (!template) continue;
    resolved.push({
      ...template,
      id: `${template.id}_w${weekIndex}`,
      _weekIdx: weekIndex,
      _sourceTemplateId: template.id,
      templateVariant: template.templateKey,
      framework: fw,
    });
  }

  if (resolved.length > 0) return resolved;

  // Legacy: lista plana sin weekSchedule — rotar plantillas por índice
  const byFw = groupSessionsByFramework(sessions);
  for (const fw of FRAMEWORKS) {
    const templates = byFw[fw];
    if (!templates.length) continue;
    const template = templates[weekIndex % templates.length];
    resolved.push({
      ...template,
      id: `${template.id}_w${weekIndex}`,
      _weekIdx: weekIndex,
      _sourceTemplateId: template.id,
      templateVariant: template.templateKey,
      framework: fw,
    });
  }
  return resolved;
}

export function formatWeekCombination(row, sessions) {
  if (!row) return "";
  const byId = Object.fromEntries((sessions || []).map((s) => [s.id, s]));
  return FRAMEWORKS.map((fw) => {
    const id = row[fw];
    if (!id) return null;
    const t = byId[id];
    return t?.templateKey || fw;
  }).filter(Boolean).join(" / ");
}

export function normalizeMesocycle(mc) {
  if (!mc) return mc;
  const sessions = (mc.sessions || []).map(ensureSessionTemplateFields);
  const numWeeks = mesocicloWeekCount(mc.startDate, mc.endDate);
  return {
    ...mc,
    sessions,
    weekSchedule: ensureWeekSchedule({ ...mc, sessions }, numWeeks),
  };
}

export function prepareSessionPayload(session, existingSessions = []) {
  const framework = session.framework || frameworkFromIntensity(session.intensity);
  const intensity = session.intensity || intensityFromFramework(framework);
  const base = ensureSessionTemplateFields({ ...session, framework, intensity });
  const templateKey = base.templateKey || suggestTemplateKey(existingSessions, framework);
  return { ...base, framework, templateKey, intensity };
}
