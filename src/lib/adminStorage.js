/**
 * adminStorage — capa de persistencia para el panel admin
 *
 * Estrategia:
 *  1. localStorage es la fuente de verdad (siempre disponible)
 *  2. Supabase se usa como sincronización en segundo plano
 *  3. Si localStorage está vacío se intenta Supabase como seed inicial
 */
import { supabase } from "./supabase.js";


/**
 * Crea un usuario en Supabase Auth ya confirmado (sin email de verificación).
 * Llama al endpoint serverless /api/create-user que usa la service role key.
 * Returns { ok: true } o { ok: false, error }
 */
function isExistingUserError(message = "") {
  const m = String(message).toLowerCase();
  return m.includes("already registered")
    || m.includes("already been registered")
    || m.includes("user already registered");
}

/** Abreviatura (3 letras) + año → código de club para jugadores (ej. CDF2026) */
export function generateLoginCode(abbreviation = "") {
  const abbr = String(abbreviation || "CLB").replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 3) || "CLB";
  return `${abbr}${new Date().getFullYear()}`;
}

async function getAuthHeaders() {
  const headers = { "Content-Type": "application/json" };
  try {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (token) headers.Authorization = `Bearer ${token}`;
  } catch { /* sin sesión */ }
  return headers;
}

export async function createClubUser({
  email, password, name, role = "club", clubId, teamId, teamRole, managedTeamIds,
  plan, subscriptionStatus, billingSource, posicion, deporte, objetivo, edad,
  frecuencia, material, experiencia, disponibles, lesion, clubName, clubCode,
  purchasedAddons, manualPrice, isSoloCoach,
}) {
  const payload = {
    email, password, name, role, clubId, teamId, teamRole, managedTeamIds,
    plan, subscriptionStatus, billingSource, posicion, deporte, objetivo, edad,
    frecuencia, material, experiencia, disponibles, lesion, clubName, clubCode,
    purchasedAddons, manualPrice, isSoloCoach,
  };

  // 1. Endpoint serverless (cuenta confirmada, sin email de verificación)
  try {
    const res = await fetch("/api/create-user", {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (data.ok) {
      return {
        ok: true,
        userId: data.userId,
        created: !!data.created,
        updated: !!data.updated,
      };
    }
    // Si el email ya existe, re-provisionar con update-user (password + metadatos)
    if (isExistingUserError(data.error)) {
      const upd = await updateUserByEmail({
        email,
        password,
        name,
        teamRole,
        clubId,
        teamId,
        managedTeamIds,
        plan,
        subscriptionStatus,
        billingSource,
        purchasedAddons,
        manualPrice,
        isSoloCoach,
      });
      if (upd.ok) return { ok: true, userId: upd.userId, updated: true };
      return { ok: false, error: upd.error || data.error, alreadyExists: true };
    }
    if (data.error) return { ok: false, error: data.error };
  } catch {
    // API no disponible (p. ej. entorno local sin serverless) → fallback
  }

  // 2. Fallback: signUp directo (solo si la API no respondió)
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          clubId,
          teamId,
          teamRole,
          managedTeamIds,
          plan,
          subscriptionStatus,
          billingSource,
          posicion,
          deporte,
          objetivo,
          purchasedAddons: Array.isArray(purchasedAddons) ? purchasedAddons : undefined,
          manualPrice,
          isSoloCoach: isSoloCoach || undefined,
        },
        emailRedirectTo: undefined,
      },
    });
    if (error) {
      if (isExistingUserError(error.message)) {
        return {
          ok: false,
          alreadyExists: true,
          error: "Este email ya existe. Usa el panel con API admin para actualizar la cuenta.",
        };
      }
      return { ok: false, error: error.message };
    }
    return { ok: true, userId: data.user?.id, via: "signUp", created: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export async function updateUserByEmail(fields) {
  try {
    const res = await fetch("/api/update-user", {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify(fields),
    });
    const data = await res.json().catch(() => ({}));
    if (data.ok) return { ok: true, userId: data.userId };
    return { ok: false, error: data.error || "Error al actualizar" };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ── Utilidades ──────────────────────────────────────────────
function lsGet(key, fallback = []) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}
function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

/** Las semanas van en depro_coach_week_*; no caben en el blob del club. */
function withoutHeavyCoachPayload(club) {
  if (!club || typeof club !== "object") return club;
  const next = { ...club };
  delete next.coachWeeks;
  delete next.coachMesociclo;
  return next;
}

function mergeClubRecord(localClub, remote) {
  const local = localClub && typeof localClub === "object" ? localClub : {};
  const src = remote && typeof remote === "object" ? remote : {};
  return withoutHeavyCoachPayload({
    ...local,
    ...src,
    id: src.id || local.id,
    logo: src.logo ?? local.logo ?? null,
    banner: src.banner ?? local.banner ?? null,
    primaryColor: src.primaryColor ?? local.primaryColor ?? null,
    secondaryColor: src.secondaryColor ?? local.secondaryColor ?? null,
    slogan: src.slogan ?? local.slogan ?? null,
    teams: (src.teams?.length > 0 ? src.teams : null) ?? local.teams ?? [],
    users: (src.users?.length > 0 ? src.users : null) ?? local.users ?? [],
    plans: (src.plans?.length > 0 ? src.plans : null) ?? local.plans ?? [],
    coachConfig: (src.coachConfig?.nivel || src.coachConfig?.engine)
      ? src.coachConfig
      : (local.coachConfig || src.coachConfig || null),
    planningMode: src.planningMode || local.planningMode || null,
    origen: src.origen || local.origen || null,
    mode: src.mode || local.mode || null,
    isSoloCoach: src.isSoloCoach ?? local.isSoloCoach ?? false,
    manualPrice: src.manualPrice ?? local.manualPrice ?? null,
  });
}
function genId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `id_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

// ════════════════════════════════════════════════════════════
// CLUBS  — /api/admin-clubs es la ÚNICA fuente de verdad.
//          Supabase siempre es primero. localStorage = caché offline.
// ════════════════════════════════════════════════════════════

async function apiClubs(method, body) {
  const res = await fetch("/api/admin-clubs", {
    method,
    headers: await getAuthHeaders(),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const json = await res.json().catch(() => null);
  return { ok: res.ok, data: json };
}

export async function loadClubs() {
  // 1. SIEMPRE intentar Supabase primero via API (service role key, sin restricciones)
  try {
    const { ok, data } = await apiClubs("GET");
    if (ok && data?.clubs?.length > 0) {
      // Actualizar caché local — fusionar con datos locales para preservar campos (logo, colores)
      // que pudieran existir solo en localStorage si el último save a Supabase falló
      const local = lsGet("depro_clubs", []);
      const merged = data.clubs.map((remote) => {
        const localClub = local.find((c) => c.id === remote.id);
        const localDetail = remote?.id ? lsGet(`depro_club_${remote.id}`, null) : null;
        return mergeClubRecord(localDetail || localClub, remote);
      });
      lsSet("depro_clubs", merged.map((c) => withoutHeavyCoachPayload(c)));
      merged.forEach((c) => {
        if (!c?.id) return;
        const prevDetail = lsGet(`depro_club_${c.id}`, null);
        lsSet(`depro_club_${c.id}`, mergeClubRecord(prevDetail, c));
      });
      return merged;
    }
    // API disponible pero sin clubs → NO borrar localStorage (puede haber datos locales no sincronizados aún)
    if (ok && data?.clubs) {
      return lsGet("depro_clubs", []);
    }
  } catch (e) {
    console.warn("[adminStorage] loadClubs API error:", e.message);
  }

  // 2. Solo si la API no está disponible (offline), usar caché local
  return lsGet("depro_clubs", []);
}

export async function saveClub(clubData) {
  if (!clubData.id) {
    clubData = { ...clubData, id: genId(), created_at: new Date().toISOString() };
  }
  const { id } = clubData;

  const compact = withoutHeavyCoachPayload(clubData);

  // 1. Actualizar caché local inmediatamente (offline-first)
  const clubs = lsGet("depro_clubs", []);
  const idx = clubs.findIndex((c) => c.id === id);
  const prevDetail = lsGet(`depro_club_${id}`, null) || {};
  const localDetail = mergeClubRecord(prevDetail, compact);
  if (idx >= 0) clubs[idx] = withoutHeavyCoachPayload({ ...clubs[idx], ...compact, id });
  else clubs.unshift(withoutHeavyCoachPayload({ ...compact, id }));
  lsSet("depro_clubs", clubs);
  lsSet(`depro_club_${id}`, localDetail);

  // 2. Guardar en Supabase (fuente de verdad)
  const { ok, data } = await apiClubs("POST", { club: compact });
  if (!ok) {
    console.error("[adminStorage] saveClub falló en Supabase:", data?.error);
    // Marcar que este club tiene cambios pendientes de sincronizar
    const pending = lsGet("depro_sync_pending", []);
    if (!pending.includes(id)) { pending.push(id); lsSet("depro_sync_pending", pending); }
  } else {
    // Sincronización exitosa: eliminar de pendientes si estaba
    const pending = lsGet("depro_sync_pending", []).filter((x) => x !== id);
    lsSet("depro_sync_pending", pending);
  }

  return clubData;
}

export async function deleteClub(id) {
  // 1. Eliminar de Supabase
  await apiClubs("DELETE", { id });

  // 2. Limpiar caché local
  const clubs = lsGet("depro_clubs", []).filter((c) => c.id !== id);
  lsSet("depro_clubs", clubs);
  localStorage.removeItem(`depro_club_${id}`);
}

// ════════════════════════════════════════════════════════════
// CLUB DETAILS (equipos, usuarios, microciclos, sesiones)
// ════════════════════════════════════════════════════════════
export function loadClubDetail(clubId) {
  return lsGet(`depro_club_${clubId}`, null);
}

/** Parche compacto (p. ej. coachConfig) sin reenviar el club entero. */
export async function patchClubDetail(clubId, fields) {
  const compact = withoutHeavyCoachPayload({ id: clubId, ...fields });
  const prev = lsGet(`depro_club_${clubId}`, null) || {};
  lsSet(`depro_club_${clubId}`, mergeClubRecord(prev, compact));

  const clubs = lsGet("depro_clubs", []);
  const idx = clubs.findIndex((c) => c.id === clubId);
  if (idx >= 0) {
    clubs[idx] = withoutHeavyCoachPayload({ ...clubs[idx], ...compact, id: clubId });
    lsSet("depro_clubs", clubs);
  }

  const { ok, data: apiResult } = await apiClubs("POST", { club: compact });
  if (!ok) {
    console.warn("[adminStorage] patchClubDetail falló en Supabase:", apiResult?.error);
    return { ok: false, error: apiResult?.error, hint: apiResult?.hint };
  }
  return { ok: true };
}

export async function saveClubDetail(clubId, data) {
  const prev = lsGet(`depro_club_${clubId}`, null) || {};
  const localMerged = withoutHeavyCoachPayload({ id: clubId, ...prev, ...data });

  // 1. localStorage — caché local inmediata (offline-first)
  lsSet(`depro_club_${clubId}`, localMerged);

  // 2. Actualizar caché de lista principal (sin semanas completas)
  const clubs = lsGet("depro_clubs", []);
  const idx = clubs.findIndex((c) => c.id === clubId);
  const listPatch = withoutHeavyCoachPayload({
    ...((idx >= 0 ? clubs[idx] : {}) || {}),
    ...data,
    id: clubId,
  });
  if (idx >= 0) {
    clubs[idx] = listPatch;
    lsSet("depro_clubs", clubs);
  } else {
    clubs.unshift(listPatch);
    lsSet("depro_clubs", clubs);
  }

  // 3. Persistir en Supabase sin semanas (el cuestionario sí viaja).
  const { ok, data: apiResult } = await apiClubs("POST", { club: localMerged });
  if (!ok) {
    console.warn("[adminStorage] saveClubDetail falló en Supabase:", apiResult?.error);
    const pending = lsGet("depro_sync_pending", []);
    if (!pending.includes(clubId)) { pending.push(clubId); lsSet("depro_sync_pending", pending); }
    return { ok: false, error: apiResult?.error, hint: apiResult?.hint };
  }
  const pending = lsGet("depro_sync_pending", []).filter((x) => x !== clubId);
  lsSet("depro_sync_pending", pending);
  return { ok: true };
}

// ════════════════════════════════════════════════════════════
// MEDIA LIBRARY
// ════════════════════════════════════════════════════════════
export async function loadMedia() {
  const local = lsGet("depro_media", []);
  if (local.length > 0) return local;

  try {
    const { data, error } = await supabase
      .from("media")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data && data.length > 0) {
      lsSet("depro_media", data);
      return data;
    }
  } catch {}
  return local;
}

export async function uploadMedia({ file, title, type, tags, duration, pages }) {
  const id = genId();
  let url = null;
  let storagePath = null;

  // Intentar subir archivo a Supabase Storage
  if (file) {
    try {
      const ext = file.name.split(".").pop();
      storagePath = `${type}s/${id}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(storagePath, file, { contentType: file.type });

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("media").getPublicUrl(storagePath);
        url = urlData.publicUrl;
      }
    } catch {}
  }

  const sizeMb = file ? +(file.size / 1024 / 1024).toFixed(2) : 0;

  const mediaItem = {
    id,
    type,
    title,
    tags: tags || [],
    duration: duration || null,
    pages: pages || null,
    size_mb: sizeMb,
    storage_path: storagePath,
    url,
    created_at: new Date().toISOString(),
    // Guardamos el nombre del archivo localmente si no hay URL
    file_name: file?.name || null,
  };

  // Guardar en localStorage
  const media = lsGet("depro_media", []);
  media.unshift(mediaItem);
  lsSet("depro_media", media);

  // Intentar guardar en Supabase
  try {
    await supabase.from("media").insert([{
      id, type, title, tags: tags || [],
      duration, pages, size_mb: sizeMb,
      storage_path: storagePath, url,
    }]);
  } catch {}

  return mediaItem;
}

export async function deleteMedia(id) {
  const media = lsGet("depro_media", []);
  const item = media.find((m) => m.id === id);
  lsSet("depro_media", media.filter((m) => m.id !== id));

  try {
    if (item?.storage_path) {
      await supabase.storage.from("media").remove([item.storage_path]);
    }
    await supabase.from("media").delete().eq("id", id);
  } catch {}
}

// ════════════════════════════════════════════════════════════
// PLAN BLOCKS
// ════════════════════════════════════════════════════════════
export async function loadPlanBlocks() {
  const local = lsGet("depro_plan_blocks", []);
  if (local.length > 0) return local;

  try {
    const { data, error } = await supabase
      .from("plan_blocks")
      .select("*, plan_block_exercises(id,name,sets,reps,rest,sort_order)")
      .order("priority", { ascending: true });
    if (!error && data && data.length > 0) {
      const blocks = data.map((b) => ({
        ...b,
        exercises: (b.plan_block_exercises || []).map((e) => ({ name: e.name, sets: e.sets, reps: e.reps, rest: e.rest })),
        linkedVideos: [],
      }));
      lsSet("depro_plan_blocks", blocks);
      return blocks;
    }
  } catch {}
  return local;
}

export async function savePlanBlock(blockData) {
  const { id, exercises = [], linkedVideos = [], ...row } = blockData;

  let savedId = id;

  // Intentar Supabase
  try {
    if (id) {
      await supabase.from("plan_blocks").update(row).eq("id", id);
      await supabase.from("plan_block_exercises").delete().eq("block_id", id);
    } else {
      savedId = genId();
      await supabase.from("plan_blocks").insert([{ id: savedId, ...row }]);
    }
    if (exercises.length > 0) {
      await supabase.from("plan_block_exercises").insert(
        exercises.map((e, i) => ({ block_id: savedId, ...e, sort_order: i }))
      );
    }
  } catch {}

  const final = { ...blockData, id: savedId, exercises, linkedVideos };

  // Guardar en localStorage
  const blocks = lsGet("depro_plan_blocks", []);
  if (id) {
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx >= 0) blocks[idx] = final; else blocks.push(final);
  } else {
    blocks.push(final);
  }
  lsSet("depro_plan_blocks", blocks);
  return final;
}

export async function deletePlanBlock(id) {
  const blocks = lsGet("depro_plan_blocks", []).filter((b) => b.id !== id);
  lsSet("depro_plan_blocks", blocks);
  try {
    await supabase.from("plan_blocks").delete().eq("id", id);
  } catch {}
}

export async function togglePlanBlock(id, active) {
  const blocks = lsGet("depro_plan_blocks", []).map((b) =>
    b.id === id ? { ...b, active } : b
  );
  lsSet("depro_plan_blocks", blocks);
  try { await supabase.from("plan_blocks").update({ active }).eq("id", id); } catch {}
  return blocks;
}
