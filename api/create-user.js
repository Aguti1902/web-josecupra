import { createClient } from "@supabase/supabase-js";
import { normalizeAdminStatus, parseManualPrice } from "../src/lib/adminAccountStatus.js";

const SUPABASE_URL = "https://lkbyybhtdeimktpaqgil.supabase.co";
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrYnl5Ymh0ZGVpbWt0cGFxZ2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODUyODUxOSwiZXhwIjoyMDk0MTA0NTE5fQ.IRMoSOH3zv_cXq0IlTQoW8oEtyGARNHV0v3u-tlB-iA";

function getAdmin() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Extrae Bearer token y resuelve el usuario Auth. */
async function resolveCaller(req, admin) {
  const auth = req.headers.authorization || req.headers.Authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return { error: "No autorizado", status: 401 };

  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return { error: "Sesión inválida", status: 401 };

  const meta = data.user.user_metadata || {};
  const role = meta.role || (data.user.email === "jose@depro.es" ? "admin" : null);
  const teamRole = meta.teamRole || null;
  const clubId = meta.clubId || null;
  return {
    user: data.user,
    role,
    teamRole,
    clubId,
    isAdmin: role === "admin" || data.user.email === "jose@depro.es",
    // Club admin o coordinador pueden crear staff de su club
    isCoordinator:
      role === "club"
      && !!clubId
      && (teamRole === "coordinador" || teamRole === "administrador"),
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const admin = getAdmin();
  const caller = await resolveCaller(req, admin);
  if (caller.error) return res.status(caller.status).json({ error: caller.error });

  const {
    email, password, name, role = "club",
    clubId, teamId, teamRole, managedTeamIds,
    plan, subscriptionStatus, billingSource,
    posicion, deporte, objetivo, edad, frecuencia, material, experiencia, disponibles, lesion,
    clubName, clubCode, purchasedAddons, manualPrice, isSoloCoach, phone, telefono,
  } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "email y password son obligatorios" });
  }

  // Autorización: admin puede todo; coordinador solo staff de su club
  if (!caller.isAdmin) {
    if (!caller.isCoordinator) {
      return res.status(403).json({ error: "Sin permiso para crear usuarios" });
    }
    if (clubId !== caller.clubId) {
      return res.status(403).json({ error: "Solo puedes crear usuarios de tu club" });
    }
    if (!["entrenador", "ayudante"].includes(teamRole)) {
      return res.status(403).json({ error: "Solo puedes invitar entrenadores o ayudantes" });
    }
    if (role !== "club") {
      return res.status(403).json({ error: "Rol no permitido" });
    }
  } else if (role === "player" || role === "coach") {
    // Solo admin puede provisionar jugadores o rol coach legacy
  } else if (role !== "club" && role !== "admin") {
    return res.status(400).json({ error: "Rol no válido" });
  }

  const userMeta = {
    name,
    role,
    clubId: clubId || undefined,
    teamId: teamId || undefined,
    teamRole: teamRole || undefined,
    managedTeamIds: Array.isArray(managedTeamIds) ? managedTeamIds : undefined,
    plan: plan || undefined,
    subscriptionStatus: caller.isAdmin
      ? normalizeAdminStatus(subscriptionStatus || "activo")
      : (subscriptionStatus || undefined),
    billingSource: billingSource || (caller.isAdmin && plan ? "manual" : undefined),
    posicion: posicion || undefined,
    deporte: deporte || undefined,
    objetivo: objetivo || undefined,
    edad: edad || undefined,
    phone: phone || telefono || undefined,
    telefono: telefono || phone || undefined,
    frecuencia: frecuencia || undefined,
    material: material || undefined,
    experiencia: experiencia || undefined,
    disponibles: Array.isArray(disponibles) ? disponibles : undefined,
    lesion: Array.isArray(lesion) ? lesion : undefined,
    clubName: clubName || undefined,
    clubCode: clubCode || undefined,
    purchasedAddons: Array.isArray(purchasedAddons) ? purchasedAddons : undefined,
    isSoloCoach: isSoloCoach === true ? true : undefined,
    ...(manualPrice !== undefined && manualPrice !== ""
      ? { manualPrice: parseManualPrice(manualPrice) }
      : {}),
  };

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    user_metadata: userMeta,
    email_confirm: true,
  });

  if (!error) {
    return res.status(200).json({ ok: true, userId: data.user?.id, created: true });
  }

  // Alta manual: si el email ya existe, actualizar metadatos + password + confirmar email
  // (no forzar login inmediato; el admin elige el estado final).
  const msg = String(error.message || "").toLowerCase();
  const alreadyExists =
    msg.includes("already registered")
    || msg.includes("already been registered")
    || msg.includes("user already registered")
    || msg.includes("already exists");

  if (!alreadyExists || !caller.isAdmin) {
    return res.status(400).json({ ok: false, error: error.message });
  }

  try {
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existing = list?.users?.find((u) => u.email?.toLowerCase() === String(email).toLowerCase());
    if (!existing) {
      return res.status(400).json({ ok: false, error: error.message });
    }
    const mergedMeta = { ...(existing.user_metadata || {}), ...userMeta };
    const { error: updErr } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: mergedMeta,
    });
    if (updErr) return res.status(400).json({ ok: false, error: updErr.message });
    return res.status(200).json({ ok: true, userId: existing.id, updated: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || error.message });
  }
}
