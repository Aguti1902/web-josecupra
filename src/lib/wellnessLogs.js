/**
 * Registros semanales de wellness (peso, cintura, fatiga, sueño).
 * Clave: lunes de la semana (YYYY-MM-DD).
 */

function storageKey(userId) {
  return `depro_wellness_${userId}`;
}

export function mondayOfDate(date = new Date()) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  const diff = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diff);
  return d.toISOString().slice(0, 10);
}

export function addDaysISO(iso, days) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Últimas N semanas (lunes), de más reciente a más antigua. */
export function recentWeekKeys(count = 8, fromDate = new Date()) {
  const start = mondayOfDate(fromDate);
  const keys = [];
  for (let i = 0; i < count; i++) {
    keys.push(addDaysISO(start, -7 * i));
  }
  return keys;
}

export function formatWeekLabel(mondayIso) {
  try {
    const start = new Date(`${mondayIso}T12:00:00`);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const fmt = (d) => d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
    return `${fmt(start)} – ${fmt(end)}`;
  } catch {
    return mondayIso;
  }
}

export function emptyWellnessEntry(weekKey) {
  return {
    weekKey,
    weightKg: "",
    waistCm: "",
    fatigue: "",
    sleep: "",
    updatedAt: null,
  };
}

/** Alias de mondayOfDate para UI. */
export function getCurrentWeekStart(date = new Date()) {
  return mondayOfDate(date);
}

/** Alias de formatWeekLabel. */
export function weekLabelEs(mondayIso) {
  return formatWeekLabel(mondayIso);
}

export function getWellnessMap(userId) {
  if (!userId) return {};
  try {
    const raw = JSON.parse(localStorage.getItem(storageKey(userId)) || "{}");
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return {};
  }
}

export function getWellnessEntry(userId, weekKey) {
  const map = getWellnessMap(userId);
  return map[weekKey] ? { ...emptyWellnessEntry(weekKey), ...map[weekKey] } : emptyWellnessEntry(weekKey);
}

export function saveWellnessEntry(userId, entry) {
  if (!userId || !entry?.weekKey) return null;
  const map = getWellnessMap(userId);
  const next = {
    weekKey: entry.weekKey,
    weightKg: entry.weightKg === "" || entry.weightKg == null ? "" : String(entry.weightKg),
    waistCm: entry.waistCm === "" || entry.waistCm == null ? "" : String(entry.waistCm),
    fatigue: entry.fatigue === "" || entry.fatigue == null ? "" : String(entry.fatigue),
    sleep: entry.sleep === "" || entry.sleep == null ? "" : String(entry.sleep),
    updatedAt: new Date().toISOString(),
  };
  map[entry.weekKey] = next;
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(map));
  } catch { /* ignore */ }
  return next;
}

export function clearWellnessLogs(userId) {
  if (!userId) return;
  try {
    localStorage.removeItem(storageKey(userId));
  } catch { /* ignore */ }
}
