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
export async function createClubUser({ email, password, name, role = "club", clubId, teamId, teamRole }) {
  // 1. Intentar con el endpoint serverless (no envía email de confirmación)
  try {
    const res = await fetch("/api/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, role, clubId, teamId, teamRole }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.ok) return data;
    }
  } catch {}

  // 2. Fallback: signUp directo (funciona si "Confirm email" está desactivado en Supabase)
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role, clubId, teamId, teamRole } },
    });
    if (error) return { ok: false, error: error.message };
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
// CLUBS  — Supabase (via serverless) es la fuente primaria
//          localStorage actúa como caché offline
// ════════════════════════════════════════════════════════════

async function apiClubs(method, body) {
  try {
    const res = await fetch("/api/admin-clubs", {
      method,
      headers: { "Content-Type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (res.ok) return await res.json();
  } catch {}
  return null;
}

export async function loadClubs() {
  // 1. Intentar cargar desde Supabase via serverless (siempre actualizado)
  const remote = await apiClubs("GET");
  if (remote?.clubs && remote.clubs.length > 0) {
    lsSet("depro_clubs", remote.clubs);
    // Actualizar también los detalles en localStorage
    remote.clubs.forEach((club) => {
      if (club.teams || club.primaryColor || club.logo) {
        const existing = lsGet(`depro_club_${club.id}`, null);
        if (!existing) lsSet(`depro_club_${club.id}`, club);
      }
    });
    return remote.clubs;
  }

  // 2. Fallback: localStorage (datos del dispositivo actual)
  const local = lsGet("depro_clubs", []);
  if (local.length > 0) return local;

  // 3. Último recurso: Supabase directo con anon key
  try {
    const { data, error } = await supabase
      .from("clubs")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data && data.length > 0) {
      lsSet("depro_clubs", data);
      return data;
    }
  } catch {}
  return [];
}

export async function saveClub(clubData) {
  // Si no tiene id, generamos uno aquí (consistencia entre devices)
  if (!clubData.id) {
    clubData = { ...clubData, id: genId(), created_at: new Date().toISOString() };
  }
  const { id, teams, users, mediaAssigned } = clubData;

  // 1. Guardar en localStorage (caché inmediata)
  const clubs = lsGet("depro_clubs", []);
  const idx = clubs.findIndex((c) => c.id === id);
  if (idx >= 0) clubs[idx] = clubData; else clubs.unshift(clubData);
  lsSet("depro_clubs", clubs);

  const ext = lsGet("depro_clubs_ext", {});
  ext[id] = { teams, users, mediaAssigned };
  lsSet("depro_clubs_ext", ext);

  // 2. Persistir en Supabase via serverless (disponible en todos los devices)
  await apiClubs("POST", { club: clubData });

  return clubData;
}

export async function deleteClub(id) {
  // localStorage
  const clubs = lsGet("depro_clubs", []).filter((c) => c.id !== id);
  lsSet("depro_clubs", clubs);
  const ext = lsGet("depro_clubs_ext", {});
  delete ext[id];
  lsSet("depro_clubs_ext", ext);

  // Supabase
  await apiClubs("DELETE", { id });
}

// ════════════════════════════════════════════════════════════
// CLUB DETAILS (equipos, usuarios, microciclos, sesiones)
// ════════════════════════════════════════════════════════════
export function loadClubDetail(clubId) {
  return lsGet(`depro_club_${clubId}`, null);
}

export function saveClubDetail(clubId, data) {
  lsSet(`depro_club_${clubId}`, data);

  // Sincronizar identity de vuelta a la lista principal en localStorage
  const clubs = lsGet("depro_clubs", []);
  const idx = clubs.findIndex((c) => c.id === clubId);
  if (idx >= 0) {
    clubs[idx] = {
      ...clubs[idx],
      ...(data.logo !== undefined           && { logo: data.logo }),
      ...(data.banner !== undefined         && { banner: data.banner }),
      ...(data.primaryColor !== undefined   && { primaryColor: data.primaryColor }),
      ...(data.secondaryColor !== undefined && { secondaryColor: data.secondaryColor }),
      ...(data.slogan !== undefined         && { slogan: data.slogan }),
      ...(data.teams !== undefined          && { teams: data.teams }),
    };
    lsSet("depro_clubs", clubs);
  }

  // Sincronizar en clubs_ext
  const ext = lsGet("depro_clubs_ext", {});
  ext[clubId] = { ...(ext[clubId] || {}), teams: data.teams, users: data.users, mediaAssigned: data.mediaAssigned };
  lsSet("depro_clubs_ext", ext);

  // Persistir detalles en Supabase (incluye teams, identidad, planes)
  apiClubs("POST", { club: { id: clubId, ...clubs[idx] }, detail: data }).catch(() => {});
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
