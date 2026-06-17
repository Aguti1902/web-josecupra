/**
 * adminStorage — capa de persistencia para el panel admin
 *
 * Estrategia:
 *  1. localStorage es la fuente de verdad (siempre disponible)
 *  2. Supabase se usa como sincronización en segundo plano
 *  3. Si localStorage está vacío se intenta Supabase como seed inicial
 */
import { supabase } from "./supabase";


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

export async function createClubUser({ email, password, name, role = "club", clubId, teamId, teamRole, managedTeamIds }) {
  const payload = { email, password, name, role, clubId, teamId, teamRole, managedTeamIds };

  // 1. Endpoint serverless (cuenta confirmada, sin email de verificación)
  try {
    const res = await fetch("/api/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (data.ok) return { ok: true, userId: data.userId };
    if (isExistingUserError(data.error)) return { ok: true, alreadyExists: true };
    if (data.error) return { ok: false, error: data.error };
  } catch {
    // API no disponible (p. ej. entorno local sin serverless) → fallback
  }

  // 2. Fallback: signUp directo (solo si la API no respondió)
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role, clubId, teamId, teamRole, managedTeamIds } },
    });
    if (error) {
      if (isExistingUserError(error.message)) return { ok: true, alreadyExists: true };
      return { ok: false, error: error.message };
    }
    return { ok: true, userId: data.user?.id, via: "signUp" };
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
    headers: { "Content-Type": "application/json" },
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
        // Prioridad: API (fuente de verdad), pero preservar logo/banner/colores locales si API no los tiene
        if (localClub) {
          return {
            ...localClub,
            ...remote,
            logo:           remote.logo           ?? localClub.logo           ?? null,
            banner:         remote.banner         ?? localClub.banner         ?? null,
            primaryColor:   remote.primaryColor   ?? localClub.primaryColor   ?? null,
            secondaryColor: remote.secondaryColor ?? localClub.secondaryColor ?? null,
            slogan:         remote.slogan         ?? localClub.slogan         ?? null,
            teams:          (remote.teams?.length > 0 ? remote.teams : null)  ?? localClub.teams ?? [],
          };
        }
        return remote;
      });
      lsSet("depro_clubs", merged);
      merged.forEach((c) => { if (c.id) lsSet(`depro_club_${c.id}`, c); });
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

  // 1. Actualizar caché local inmediatamente (offline-first)
  const clubs = lsGet("depro_clubs", []);
  const idx = clubs.findIndex((c) => c.id === id);
  if (idx >= 0) clubs[idx] = clubData; else clubs.unshift(clubData);
  lsSet("depro_clubs", clubs);
  lsSet(`depro_club_${id}`, clubData);

  // 2. Guardar en Supabase (fuente de verdad)
  const { ok, data } = await apiClubs("POST", { club: clubData });
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

export async function saveClubDetail(clubId, data) {
  // 1. localStorage — caché local inmediata (siempre funciona, offline-first)
  lsSet(`depro_club_${clubId}`, data);

  // 2. Actualizar caché de lista principal
  const clubs = lsGet("depro_clubs", []);
  const idx = clubs.findIndex((c) => c.id === clubId);
  let merged = { id: clubId, ...data };
  if (idx >= 0) {
    clubs[idx] = { ...clubs[idx], ...data };
    merged = { ...clubs[idx], id: clubId };
    lsSet("depro_clubs", clubs);
  }

  // 3. Persistir en Supabase via API (fuente de verdad)
  const { ok, data: apiResult } = await apiClubs("POST", { club: merged });
  if (!ok) {
    console.warn("[adminStorage] saveClubDetail falló en Supabase:", apiResult?.error);
    const pending = lsGet("depro_sync_pending", []);
    if (!pending.includes(clubId)) { pending.push(clubId); lsSet("depro_sync_pending", pending); }
    return { ok: false, error: apiResult?.error, hint: apiResult?.hint };
  }
  // Sincronización exitosa
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
