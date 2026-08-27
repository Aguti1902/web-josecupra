import { getSupabaseAdmin } from "./_supabaseAdmin.js";
import { persistSoloCoachClub } from "./_soloCoachClub.js";
import { isProCoachUser } from "../src/lib/clubAuto/clubAutoCoachBridge.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const admin = getSupabaseAdmin();
    const auth = req.headers.authorization || req.headers.Authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: "No autorizado" });

    const { data, error } = await admin.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ error: "Sesión inválida" });

    const user = data.user;
    const meta = user.user_metadata || {};
    const like = {
      role: meta.role,
      plan: meta.plan,
      clubId: meta.clubId,
      isSoloCoach: meta.isSoloCoach,
    };
    if (!isProCoachUser(like) && meta.audience !== "coach" && !String(meta.plan || "").startsWith("coach-")) {
      return res.status(400).json({ error: "No es una cuenta DEPRO Coach" });
    }

    const result = await persistSoloCoachClub(admin, {
      userId: user.id,
      name: meta.name || user.email?.split("@")[0],
      email: user.email,
      plan: meta.plan || "coach-starter",
      coachAuto: meta.coachAuto || "",
      primaryColor: meta.primaryColor || "",
      secondaryColor: meta.secondaryColor || "",
      clubName: meta.clubName || meta.club || "",
      existingMeta: meta,
    });
    return res.status(200).json(result);
  } catch (err) {
    console.error("ensure-coach-club:", err.message);
    return res.status(500).json({ error: err.message || "No se pudo crear el club" });
  }
}
