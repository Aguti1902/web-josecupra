/**
 * Lectura/escritura del plan del jugador.
 * localStorage (caché) + API /api/player-plan (fuente de verdad cross-device).
 */

export function playerPlanKey(userId) {
  return `depro_plan_${userId}`;
}

/**
 * Normaliza el payload del motor (weeks[]) al formato día-array que consume
 * WeeklyPlanPage / Dashboard. Conserva weeks/assignment/profileSnapshot como meta.
 */
export function normalizePlayerPlan(raw) {
  if (!raw) return null;
  if (raw.premiumPending || raw.planPendingManual || raw.planError) return raw;

  const attachSnapshot = (view, source) => {
    const snap = source?.profileSnapshot
      || (Array.isArray(source) ? source.profileSnapshot : null)
      || null;
    if (snap) view.profileSnapshot = snap;
    return view;
  };

  // Ya es semana día-array
  if (Array.isArray(raw) && (raw.length === 0 || raw[0]?.day != null || raw[0]?.sessions != null)) {
    if (raw.startDate == null && raw._meta?.startDate) {
      raw.startDate = raw._meta.startDate;
    }
    return attachSnapshot(raw, raw);
  }

  // Objeto con weeks del motor / asignación admin
  const weeks = raw.weeks;
  if (Array.isArray(weeks) && weeks.length) {
    const weekIdx = Math.max(0, Math.min(weeks.length - 1, (Number(raw.semana_actual) || 1) - 1));
    const current = weeks[weekIdx];
    const days = Array.isArray(current?.days)
      ? current.days
      : Array.isArray(current)
        ? current
        : null;

    if (Array.isArray(days)) {
      const view = days.map((d) => ({ ...d }));
      view.weeks = weeks;
      view.assignment = raw.assignment || null;
      view.source = raw.source || "admin_manual";
      view.assignedTo = raw.assignedTo || null;
      view.sesiones = raw.sesiones || null;
      view.semana_actual = weekIdx + 1;
      view.startDate = raw.startDate || current?.startDate || weeks[0]?.startDate || null;
      view.premiumPending = false;
      view.planPendingManual = false;
      view.userId = raw.userId || raw.assignedTo || null;
      if (days.sesiones_semana) view.sesiones_semana = days.sesiones_semana;
      if (days.sesiones_pendientes_compensar) {
        view.sesiones_pendientes_compensar = days.sesiones_pendientes_compensar;
      }
      return attachSnapshot(view, raw);
    }

    // Fallback: construir días desde sessions planas de la semana
    if (Array.isArray(current?.sessions)) {
      const DAY_ORDER = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
      const byDay = Object.fromEntries(DAY_ORDER.map((d) => [d, []]));
      for (const s of current.sessions) {
        const day = s.dayName || s.day || s.assignedDay;
        if (day && byDay[day]) byDay[day].push(s);
      }
      const view = DAY_ORDER.map((day) => ({
        day,
        shortDay: day.slice(0, 1),
        date: "",
        sessions: byDay[day],
      }));
      view.weeks = weeks;
      view.assignment = raw.assignment || null;
      view.source = raw.source || "admin_manual";
      view.assignedTo = raw.assignedTo || null;
      view.semana_actual = weekIdx + 1;
      view.startDate = raw.startDate || current?.startDate || weeks[0]?.startDate || null;
      view.premiumPending = false;
      view.planPendingManual = false;
      return attachSnapshot(view, raw);
    }
  }

  return attachSnapshot(raw, raw);
}

export function loadPlayerPlan(userId) {
  if (!userId) return null;
  try {
    const raw = localStorage.getItem(playerPlanKey(userId));
    return raw ? normalizePlayerPlan(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function savePlayerPlan(userId, plan) {
  if (!userId || !plan) return;
  try {
    localStorage.setItem(playerPlanKey(userId), JSON.stringify(plan));
  } catch { /* ignore quota */ }
}

export function clearPlayerPlan(userId) {
  if (!userId) return;
  try {
    localStorage.removeItem(playerPlanKey(userId));
  } catch { /* ignore */ }
}

async function authHeaders() {
  try {
    const { supabase } = await import("./supabase.js");
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

/** Descarga el plan asignado desde el servidor y lo cachea localmente. */
export async function fetchPlayerPlan(userId) {
  if (!userId) return null;
  try {
    const headers = await authHeaders();
    const res = await fetch(`/api/player-plan?userId=${encodeURIComponent(userId)}`, { headers });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return null;
    if (!json.plan) return null;
    const normalized = normalizePlayerPlan(json.plan);
    savePlayerPlan(userId, normalized);
    return normalized;
  } catch {
    return null;
  }
}

/** Persiste el plan en el servidor (admin o el propio jugador). */
export async function persistPlayerPlanRemote(userId, plan) {
  if (!userId || !plan) return { ok: false, error: "datos incompletos" };
  try {
    const headers = {
      "Content-Type": "application/json",
      ...(await authHeaders()),
    };
    const res = await fetch("/api/player-plan", {
      method: "POST",
      headers,
      body: JSON.stringify({ userId, plan }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: json.error || "Error al guardar" };
    savePlayerPlan(userId, normalizePlayerPlan(plan));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e?.message || "Error de red" };
  }
}
