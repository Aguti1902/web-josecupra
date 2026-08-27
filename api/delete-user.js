import { getSupabaseAdmin, findUserByEmail } from "./_supabaseAdmin.js";
import { stripPlayerFromClubData } from "../src/lib/clubPlayerPurge.js";
import { removePlayerFromReferralRegistry } from "./_clubReferrals.js";

function playerRowMatches(entry, userId, email) {
  if (!entry || typeof entry !== "object") return false;
  const id = String(entry.id || entry.userId || entry.player_id || "");
  const em = String(entry.email || "").toLowerCase();
  if (userId && id && id === String(userId)) return true;
  if (email && em && em === String(email).toLowerCase()) return true;
  return false;
}

function parseBody(req) {
  const raw = req.body;
  if (!raw) return {};
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return {}; }
  }
  return raw;
}

async function resolveCaller(req, admin) {
  const auth = req.headers.authorization || req.headers.Authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return { error: "No autorizado", status: 401 };

  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return { error: "Sesión inválida", status: 401 };

  const meta = data.user.user_metadata || {};
  const role = meta.role || (data.user.email === "jose@depro.es" ? "admin" : null);
  return {
    user: data.user,
    isAdmin: role === "admin" || data.user.email === "jose@depro.es",
  };
}

async function stripFromClubs(admin, userId, email, homeClubId) {
  try {
    const { data: details } = await admin.from("clubs_detail").select("club_id, data");
    for (const row of details || []) {
      const clubId = row.club_id;
      if (!clubId || clubId.startsWith("GLOBAL_") || clubId.startsWith("PLAYER_PLAN_")) {
        continue;
      }
      if (clubId === "CLUB_REFERRAL_REGISTRY") continue;
      if (clubId === "PLAYER_SOCIAL_REGISTRY") {
        const social = row.data && typeof row.data === "object" ? { ...row.data } : { byCode: {}, byUserId: {} };
        let socialChanged = false;
        if (social.byUserId && userId && social.byUserId[userId]) {
          delete social.byUserId[userId];
          socialChanged = true;
        }
        for (const [code, prof] of Object.entries(social.byCode || {})) {
          if (playerRowMatches(prof, userId, email)) {
            delete social.byCode[code];
            socialChanged = true;
          }
        }
        if (socialChanged) {
          await admin.from("clubs_detail").upsert(
            { club_id: clubId, data: social, updated_at: new Date().toISOString() },
            { onConflict: "club_id" },
          );
        }
        continue;
      }
      const data = row.data && typeof row.data === "object" ? row.data : {};
      const { data: next, changed } = stripPlayerFromClubData(data, userId, email);
      if (changed || clubId === homeClubId) {
        await admin.from("clubs_detail").upsert(
          { club_id: clubId, data: next, updated_at: new Date().toISOString() },
          { onConflict: "club_id" },
        );
      }
    }
    if (homeClubId?.startsWith("coach_")) {
      try { await admin.from("clubs_detail").delete().eq("club_id", homeClubId); } catch { /* ignore */ }
      try { await admin.from("clubs").delete().eq("id", homeClubId); } catch { /* ignore */ }
    } else if (homeClubId) {
      const { data: home } = await admin.from("clubs_detail").select("club_id, data").eq("club_id", homeClubId).maybeSingle();
      if (!home?.club_id) {
        const { data: next } = stripPlayerFromClubData({}, userId, email);
        await admin.from("clubs_detail").upsert(
          { club_id: homeClubId, data: next, updated_at: new Date().toISOString() },
          { onConflict: "club_id" },
        );
      }
    }
  } catch (stripErr) {
    console.warn("delete-user strip clubs:", stripErr.message);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const admin = getSupabaseAdmin();
  const caller = await resolveCaller(req, admin);
  if (caller.error) return res.status(caller.status).json({ error: caller.error });
  if (!caller.isAdmin) return res.status(403).json({ error: "Solo administradores" });

  const body = parseBody(req);
  const userId = String(body.userId || req.query?.userId || "").trim();
  const emailHint = String(body.email || "").trim().toLowerCase();
  if (!userId && !emailHint) return res.status(400).json({ error: "userId requerido" });
  if (userId && userId === caller.user.id) {
    return res.status(400).json({ error: "No puedes eliminar tu propia cuenta" });
  }

  try {
    let targetUser = null;
    if (userId) {
      const { data: byId } = await admin.auth.admin.getUserById(userId);
      targetUser = byId?.user || null;
    }
    if (!targetUser && emailHint) {
      targetUser = await findUserByEmail(admin, emailHint);
    }

    const resolvedId = String(targetUser?.id || userId || "");
    const email = String(targetUser?.email || emailHint || "").toLowerCase();
    const role = targetUser?.user_metadata?.role;
    if (email === "jose@depro.es" || role === "admin") {
      return res.status(403).json({ error: "No se puede eliminar un administrador" });
    }

    const homeClubId = String(targetUser?.user_metadata?.clubId || "");

    try {
      await removePlayerFromReferralRegistry(admin, { userId: resolvedId, email });
    } catch (refErr) {
      console.warn("delete-user referrals:", refErr.message);
    }

    if (resolvedId) {
      try { await admin.from("clubs_detail").delete().eq("club_id", `PLAYER_PLAN_${resolvedId}`); } catch { /* ignore */ }
      try { await admin.from("player_team_links").delete().eq("player_id", resolvedId); } catch { /* ignore */ }
      try { await admin.from("profiles").delete().eq("id", resolvedId); } catch { /* ignore */ }
    }
    if (email) {
      try { await admin.from("player_team_links").delete().eq("email", email); } catch { /* ignore */ }
    }

    await stripFromClubs(admin, resolvedId, email, homeClubId);

    if (resolvedId) {
      const { error } = await admin.auth.admin.deleteUser(resolvedId);
      if (error && !/not found|does not exist/i.test(error.message || "")) {
        return res.status(400).json({ error: error.message });
      }
    }

    return res.status(200).json({ ok: true, userId: resolvedId, email, alreadyGone: !targetUser });
  } catch (err) {
    return res.status(500).json({ error: err.message || "No se pudo eliminar" });
  }
}
