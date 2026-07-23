import { getSupabaseAdmin } from "./_supabaseAdmin.js";

const REGISTRY_ID = "PLAYER_SOCIAL_REGISTRY";

async function loadRegistry(admin) {
  const { data } = await admin.from("clubs_detail").select("data").eq("club_id", REGISTRY_ID).maybeSingle();
  return data?.data || { byCode: {}, byUserId: {} };
}

async function saveRegistry(admin, registry) {
  await admin.from("clubs_detail").upsert(
    { club_id: REGISTRY_ID, data: registry, updated_at: new Date().toISOString() },
    { onConflict: "club_id" },
  );
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const admin = getSupabaseAdmin();

  try {
    if (req.method === "GET") {
      const { code, ids } = req.query;
      const registry = await loadRegistry(admin);

      if (code) {
        const profile = registry.byCode[String(code).toUpperCase()];
        if (!profile) return res.status(404).json({ error: "Código no encontrado" });
        return res.status(200).json(profile);
      }

      if (ids) {
        const idList = String(ids).split(",").filter(Boolean);
        const profiles = idList
          .map((id) => registry.byUserId[id])
          .filter(Boolean)
          .map(({ userId, name, plan, inviteCode, stats, updatedAt }) => ({
            userId, name, plan, inviteCode, stats, updatedAt,
          }));
        return res.status(200).json({ profiles });
      }

      return res.status(400).json({ error: "code or ids required" });
    }

    if (req.method === "POST") {
      const body = req.body || {};
      const { action, userId, name, plan, inviteCode, stats } = body;
      if (!userId) return res.status(400).json({ error: "userId required" });

      const registry = await loadRegistry(admin);
      const existing = registry.byUserId[userId] || {};
      const code = String(inviteCode || existing.inviteCode || "").toUpperCase();
      if (!code && action === "register") return res.status(400).json({ error: "inviteCode required" });

      const profile = {
        userId,
        name: name || existing.name || "Jugador",
        plan: plan || existing.plan || null,
        inviteCode: code || existing.inviteCode,
        stats: action === "sync"
          ? { ...(existing.stats || {}), ...(stats || {}) }
          : (stats || existing.stats || {}),
        updatedAt: new Date().toISOString(),
      };

      if (profile.inviteCode) registry.byCode[profile.inviteCode] = profile;
      registry.byUserId[userId] = profile;
      await saveRegistry(admin, registry);

      return res.status(200).json({ ok: true, profile });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Error interno" });
  }
}
