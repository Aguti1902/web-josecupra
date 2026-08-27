import { buildSoloCoachClub } from "../src/lib/provisionSoloCoach.js";

/** Crea o actualiza el club/equipo de un DEPRO Coach y escribe clubId/teamId en metadata. */
export async function persistSoloCoachClub(admin, {
  userId,
  name,
  email,
  plan,
  coachAuto,
  primaryColor,
  secondaryColor,
  clubName,
  existingMeta = {},
} = {}) {
  if (!admin || !userId) return { ok: false, reason: "missing_user" };
  const built = buildSoloCoachClub({
    userId,
    name,
    email,
    plan,
    coachAuto,
    primaryColor,
    secondaryColor,
    clubName,
  });
  const now = new Date().toISOString();
  const { data: existingRow } = await admin
    .from("clubs_detail")
    .select("data")
    .eq("club_id", built.clubId)
    .maybeSingle();
  const existing = existingRow?.data && typeof existingRow.data === "object" ? existingRow.data : {};
  const payload = {
    ...existing,
    ...built.club,
    id: built.clubId,
    coachConfig: existing.coachConfig?.nivel ? existing.coachConfig : built.club.coachConfig,
    teams: (existing.teams?.length ? existing.teams : built.club.teams),
  };
  await admin.from("clubs_detail").upsert(
    { club_id: built.clubId, data: payload, updated_at: now },
    { onConflict: "club_id" },
  );
  try {
    await admin.from("clubs").upsert({
      id: built.clubId,
      name: payload.name,
      abbreviation: payload.abbreviation,
      status: payload.status || "activo",
      plan: payload.plan,
      created_at: payload.created_at || now,
    }, { onConflict: "id" });
  } catch { /* tabla clubs opcional */ }

  await admin.auth.admin.updateUserById(userId, {
    user_metadata: {
      ...existingMeta,
      clubId: built.clubId,
      teamId: built.teamId,
      isSoloCoach: true,
      pendingPayment: false,
      clubName: payload.name,
    },
  });
  return { ok: true, club: payload, clubId: built.clubId, teamId: built.teamId };
}
