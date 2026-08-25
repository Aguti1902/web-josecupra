import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search, PlayCircle, Save, CheckCircle, RefreshCw, X, Plus,
  Flame, Zap, Target, Shield, Dumbbell, ChevronDown, ChevronUp,
  Edit3, Info, Activity, TrendingUp, Trash2,
} from "lucide-react";
import { EXERCISES, TAGS } from "../../data/exercises";
import { CATALOG_FOLDERS } from "../../data/extraExercises";
import { getYouTubeId } from "../../lib/youtube";
import { invalidateCatalogMediaCache } from "../../lib/catalogMedia";

/* ── Helpers ──────────────────────────────────────────────── */
const CATALOG_OVERRIDES_KEY = "depro_catalog_overrides";
const CATALOG_CUSTOM_KEY = "depro_catalog_custom_exercises";
const CATALOG_CLOUD_ID = "CATALOG_OVERRIDES";

function loadCustomExercises() {
  try { return JSON.parse(localStorage.getItem(CATALOG_CUSTOM_KEY) || "[]"); }
  catch { return []; }
}
function saveCustomExercises(list) {
  localStorage.setItem(CATALOG_CUSTOM_KEY, JSON.stringify(list));
}

function loadOverrides() {
  try { return JSON.parse(localStorage.getItem(CATALOG_OVERRIDES_KEY) || "{}"); }
  catch { return {}; }
}

async function fetchOverridesFromCloud() {
  try {
    const r = await fetch(`/api/admin-clubs?id=${encodeURIComponent(CATALOG_CLOUD_ID)}`);
    if (r.ok) {
      const data = await r.json();
      const entry = (data.clubs || [])[0];
      if (entry?.overrides) return entry.overrides;
    }
  } catch { /* ignore */ }
  try {
    const r = await fetch("/api/admin-clubs");
    if (!r.ok) return null;
    const data = await r.json();
    const entry = (data.clubs || []).find((c) => c.id === CATALOG_CLOUD_ID);
    return entry?.overrides ?? null;
  } catch { return null; }
}
async function saveOverridesToCloud(overrides) {
  localStorage.setItem(CATALOG_OVERRIDES_KEY, JSON.stringify(overrides));
  const res = await fetch("/api/admin-clubs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      club: { id: CATALOG_CLOUD_ID, name: "Catalog Overrides" },
      detail: { overrides },
    }),
  });
  if (!res.ok) throw new Error(await res.text());
}

/* Etiqueta por tipo de material */
const MATERIAL_COLORS = {
  sin_material: "bg-gray-100 text-gray-600",
  gomas:        "bg-yellow-50 text-yellow-700",
  mancuernas:   "bg-blue-50 text-blue-700",
  barra:        "bg-purple-50 text-purple-700",
  maquina:      "bg-pink-50 text-pink-700",
  maquina_polea: "bg-pink-50 text-pink-700",
  maquina_disco: "bg-fuchsia-50 text-fuchsia-700",
  gym_completo: "bg-indigo-50 text-indigo-700",
};

function multi(e) {
  return e.etiquetasMulti || {};
}

function hasTag(e, key) {
  const et = multi(e);
  if (et.objetivo?.includes(key) || et.segmento === key || et.patron?.includes(key) || et.rol === key) return true;
  return (e.etiquetas || []).includes(key);
}

const SECTION_LABELS = [
  { key: "fuerza_tren_inferior", label: "Fuerza · Tren inferior", icon: Dumbbell, color: "#3B82F6",
    match: (e) => e.carpeta === "fuerza_tren_inferior" },
  { key: "fuerza_tren_superior", label: "Fuerza · Tren superior", icon: Dumbbell, color: "#8B5CF6",
    match: (e) => e.carpeta === "fuerza_tren_superior" },
  { key: "velocidad", label: "Velocidad", icon: Zap, color: "#F59E0B",
    match: (e) => e.carpeta === "velocidad" },
  { key: "resistencia", label: "Resistencia", icon: Activity, color: "#0EA5E9",
    match: (e) => e.carpeta === "resistencia" },
  { key: "pliometria", label: "Pliometría", icon: Flame, color: "#EF4444",
    match: (e) => e.carpeta === "pliometria" },
  { key: "core", label: "Core", icon: Shield, color: "#6366F1",
    match: (e) => e.carpeta === "core" },
  { key: "prevencion", label: "Prevención", icon: Shield, color: "#EC4899",
    match: (e) => e.carpeta === "prevencion" },
  { key: "movilidad", label: "Movilidad", icon: RefreshCw, color: "#059669",
    match: (e) => e.carpeta === "movilidad" },
];

function getSection(exercise) {
  // La carpeta es la fuente de verdad; no clasificar por grupo muscular (p. ej. "core").
  if (exercise.carpeta && SECTION_LABELS.some((s) => s.key === exercise.carpeta)) {
    return exercise.carpeta;
  }
  for (const s of SECTION_LABELS) {
    if (s.match(exercise)) return s.key;
  }
  if (hasTag(exercise, "resistencia")) return "resistencia";
  if (hasTag(exercise, "velocidad")) return "velocidad";
  if (hasTag(exercise, "pliometria")) return "pliometria";
  if (hasTag(exercise, "movilidad")) return "movilidad";
  if (hasTag(exercise, "prevencion")) return "prevencion";
  if (hasTag(exercise, "fuerza") && hasTag(exercise, "tren_superior")) return "fuerza_tren_superior";
  if (hasTag(exercise, "fuerza")) return "fuerza_tren_inferior";
  return "fuerza_tren_inferior";
}

function catalogDescription(exercise, override) {
  return override?.description || exercise.description || exercise.descripcion || "";
}

function catalogTips(exercise, override) {
  if (override?.tips) return override.tips;
  if (typeof exercise.tips === "string") return exercise.tips;
  if (Array.isArray(exercise.tips)) return exercise.tips.join("\n");
  return "";
}

/* ── Modal alta de ejercicio nuevo ───────────────────────── */
function AddExerciseModal({ onSave, onClose }) {
  const [form, setForm] = useState({
    nombre: "",
    material: "sin_material",
    etiquetas: [],
    carpeta: "core",
    description: "",
  });

  const toggleTag = (tag) => {
    setForm((f) => ({
      ...f,
      etiquetas: f.etiquetas.includes(tag)
        ? f.etiquetas.filter((t) => t !== tag)
        : [...f.etiquetas, tag],
    }));
  };

  const canSave = form.nombre.trim().length >= 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-depro-border">
          <h3 className="font-bold text-depro-dark">Añadir ejercicio</h3>
          <button type="button" onClick={onClose} className="text-depro-gray hover:text-depro-dark"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto">
          <div>
            <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5 block">Nombre *</label>
            <input
              className="w-full border border-depro-border rounded-xl px-3 py-2.5 text-sm"
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              placeholder="Nombre del ejercicio"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5 block">Material</label>
            <select
              className="w-full border border-depro-border rounded-xl px-3 py-2.5 text-sm bg-white"
              value={form.material}
              onChange={(e) => setForm((f) => ({ ...f, material: e.target.value }))}
            >
              {TAGS.material.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5 block">Carpeta / sección</label>
            <select
              className="w-full border border-depro-border rounded-xl px-3 py-2.5 text-sm bg-white"
              value={form.carpeta}
              onChange={(e) => setForm((f) => ({ ...f, carpeta: e.target.value }))}
            >
              {SECTION_LABELS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5 block">Etiquetas</label>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
              {TAGS.objetivo.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTag(t)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold ${
                    form.etiquetas.includes(t)
                      ? "bg-depro-blue border-depro-blue text-white"
                      : "border-depro-border text-depro-gray"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5 block">Descripción</label>
            <textarea
              rows={3}
              className="w-full border border-depro-border rounded-xl px-3 py-2.5 text-sm resize-none"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Explicación breve (opcional)"
            />
          </div>
        </div>
        <div className="flex gap-2 px-5 py-4 border-t border-depro-border">
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-depro-border text-sm">Cancelar</button>
          <button
            type="button"
            disabled={!canSave}
            onClick={() => onSave(form)}
            className="flex-1 py-2.5 rounded-xl bg-depro-blue text-white text-sm font-bold disabled:opacity-40"
          >
            Guardar ejercicio
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Modal editor de ejercicio ────────────────────────────── */
function ExerciseEditModal({ exercise, override, onSave, onClose }) {
  const [form, setForm] = useState({
    videoUrl:    override?.videoUrl || exercise.videoUrl || "",
    description: catalogDescription(exercise, override),
    tips:        catalogTips(exercise, override),
  });
  const ytId = getYouTubeId(form.videoUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-depro-border flex-shrink-0">
          <div>
            <div className="font-black text-depro-dark">{exercise.nombre}</div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {(exercise.materiales || [exercise.material].filter(Boolean)).map((m) => (
                <span key={m} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${MATERIAL_COLORS[m] || "bg-gray-100 text-gray-600"}`}>
                  {m}
                </span>
              ))}
              {exercise.etiquetasMulti ? (
                <>
                  {(exercise.etiquetasMulti.objetivo || []).map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-depro-blue/10 text-depro-blue font-medium">{t}</span>
                  ))}
                  {exercise.etiquetasMulti.rol && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-medium">{exercise.etiquetasMulti.rol}</span>
                  )}
                </>
              ) : (
                (exercise.etiquetas || []).slice(0, 3).map((t) => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-depro-blue/10 text-depro-blue font-medium">{t}</span>
                ))
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-depro-gray hover:text-depro-dark p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Vídeo */}
          <div>
            <label className="text-[10px] font-bold text-depro-gray uppercase tracking-wide mb-1.5 flex items-center gap-1 block">
              <PlayCircle size={10} className="text-depro-blue" /> URL vídeo YouTube
            </label>
            <input
              className="w-full border border-depro-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
              placeholder="https://youtu.be/…"
              value={form.videoUrl}
              onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
            />
            {ytId ? (
              <div className="relative w-full rounded-xl overflow-hidden bg-black mt-2" style={{ paddingBottom: "56.25%" }}>
                <iframe src={`https://www.youtube.com/embed/${ytId}`}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen title={exercise.nombre} />
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-xl bg-gray-50 border-2 border-dashed border-depro-border text-depro-gray text-xs mt-2" style={{ minHeight: "80px" }}>
                <span className="flex items-center gap-2"><PlayCircle size={14} /> Pega una URL para previsualizar</span>
              </div>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="text-[10px] font-bold text-depro-gray uppercase tracking-wide block mb-1.5">
              Descripción del ejercicio
            </label>
            <textarea rows={3}
              className="w-full border border-depro-border rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
              placeholder="Explica brevemente cómo se ejecuta correctamente…"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          {/* Tips */}
          <div>
            <label className="text-[10px] font-bold text-depro-gray uppercase tracking-wide block mb-1.5">
              Tips técnicos (3–5 puntos clave, uno por línea)
            </label>
            <textarea rows={5}
              className="w-full border border-depro-border rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
              placeholder={"- Mantén la espalda recta\n- Rodillas alineadas con los pies\n- Baja controlado en 3 segundos…"}
              value={form.tips}
              onChange={(e) => setForm((f) => ({ ...f, tips: e.target.value }))}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-depro-border flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-depro-border text-depro-gray font-medium text-sm hover:border-depro-dark transition-colors">
            Cancelar
          </button>
          <button onClick={() => { onSave(form); onClose(); }}
            className="flex-1 py-2.5 rounded-xl bg-depro-blue text-white font-bold text-sm hover:bg-depro-blue-dark transition-colors flex items-center justify-center gap-2">
            <Save size={14} /> Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Componente principal ─────────────────────────────────── */
export default function AdminCatalogPage({ embedded = false }) {
  const [searchParams] = useSearchParams();
  const [overrides, setOverrides] = useState(loadOverrides);
  const [customExercises, setCustomExercises] = useState(loadCustomExercises);
  const [search, setSearch]     = useState(() => searchParams.get("q") || "");
  const [filterMat, setFilterMat] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [filterFolder, setFilterFolder] = useState("");
  const [collapsed, setCollapsed] = useState({});
  const [editing, setEditing]   = useState(null); // exercise object
  const [adding, setAdding]     = useState(false);
  const [syncing, setSyncing]   = useState(false);
  const [saved, setSaved]       = useState(false);

  const allExercises = useMemo(
    () => [...EXERCISES, ...customExercises],
    [customExercises],
  );

  // Cargar overrides desde la nube al montar
  useEffect(() => {
    fetchOverridesFromCloud().then((cloud) => {
      if (cloud && Object.keys(cloud).length > 0) {
        setOverrides(cloud);
        localStorage.setItem(CATALOG_OVERRIDES_KEY, JSON.stringify(cloud));
        invalidateCatalogMediaCache();
      }
    });
  }, []);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearch(q);
  }, [searchParams]);

  // Guardar override de un ejercicio
  const handleSaveOverride = (exerciseId, data, exercise = null) => {
    const updated = { ...overrides, [exerciseId]: { ...overrides[exerciseId], ...data } };
    const aliases = new Set([String(exerciseId)]);
    const ex = exercise || allExercises.find((e) => String(e.id) === String(exerciseId));
    if (ex?.v2Id != null) {
      aliases.add(String(ex.v2Id));
      aliases.add(`v2_${ex.v2Id}`);
    }
    const raw = String(exerciseId);
    if (raw.startsWith("v2_")) aliases.add(raw.replace(/^v2_/, "").split("_")[0]);
    else if (/^\d+$/.test(raw)) aliases.add(`v2_${raw}`);
    for (const key of aliases) {
      updated[key] = { ...updated[key], ...data };
    }
    setOverrides(updated);
    localStorage.setItem(CATALOG_OVERRIDES_KEY, JSON.stringify(updated));
    invalidateCatalogMediaCache();
    saveOverridesToCloud(updated).catch(() => {});
  };

  const handleAddExercise = (form) => {
    const id = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const tags = form.etiquetas?.length ? form.etiquetas : [form.carpeta].filter(Boolean);
    const exercise = {
      id,
      nombre: form.nombre.trim(),
      etiquetas: tags,
      material: form.material || "sin_material",
      materiales: [form.material || "sin_material"],
      carpeta: form.carpeta || "core",
      contraindicado: [],
      custom: true,
      description: form.description || "",
    };
    const next = [exercise, ...customExercises];
    setCustomExercises(next);
    saveCustomExercises(next);
    if (form.description) {
      handleSaveOverride(id, { description: form.description });
    }
    setAdding(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDeleteCustom = (id) => {
    const next = customExercises.filter((e) => e.id !== id);
    setCustomExercises(next);
    saveCustomExercises(next);
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    try {
      await saveOverridesToCloud(overrides);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error("[DEPRO] Error sync catálogo", e);
    } finally {
      setSyncing(false);
    }
  };

  const toggleCollapsed = (key) =>
    setCollapsed((c) => ({ ...c, [key]: !c[key] }));

  const matchesFolder = (e, folderId) => {
    if (!folderId) return true;
    // Carpetas funcionales (taxonomía actual)
    const functional = [
      "fuerza_tren_inferior", "fuerza_tren_superior", "velocidad", "resistencia",
      "pliometria", "core", "prevencion", "movilidad",
    ];
    if (functional.includes(folderId)) {
      return e.carpeta === folderId;
    }
    if (folderId.startsWith("lesion_")) {
      return (e.etiquetas || []).includes(folderId)
        || (e.lesionesContra || []).some((l) => `lesion_${l}` === folderId || l === folderId.replace(/^lesion_/, ""));
    }
    return (e.etiquetas || []).includes(folderId);
  };

  // Filtrar ejercicios
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return allExercises.filter((e) => {
      const mats = e.materiales || [e.material].filter(Boolean);
      const multiStr = JSON.stringify(e.etiquetasMulti || {}).toLowerCase();
      if (
        q
        && !e.nombre.toLowerCase().includes(q)
        && !(e.etiquetas || []).join(" ").includes(q)
        && !multiStr.includes(q)
      ) return false;
      if (filterMat && !mats.includes(filterMat) && e.material !== filterMat) return false;
      if (filterTag && !hasTag(e, filterTag) && !(e.etiquetas || []).includes(filterTag)) return false;
      if (!matchesFolder(e, filterFolder)) return false;
      return true;
    });
  }, [allExercises, search, filterMat, filterTag, filterFolder]);

  // Agrupar por sección
  const grouped = useMemo(() => {
    const map = {};
    SECTION_LABELS.forEach((s) => { map[s.key] = []; });
    filtered.forEach((e) => {
      const sec = getSection(e);
      if (map[sec]) map[sec].push(e);
      else map.fuerza_tren_inferior.push(e);
    });
    return map;
  }, [filtered]);

  const totalWithVideo = Object.values(overrides).filter((o) => o?.videoUrl).length;

  return (
    <div className={embedded ? "space-y-6" : "min-h-screen bg-[#F8F9FB] p-6 space-y-6"}>
      {!embedded && (
      <>
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-depro-dark">Catálogo de ejercicios</h1>
          <p className="text-sm text-depro-gray mt-0.5">
            {allExercises.length} ejercicios · {customExercises.length} añadidos · {totalWithVideo} con vídeo
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-depro-blue text-depro-blue font-bold text-sm hover:bg-depro-blue-light"
          >
            <Plus size={15} /> Añadir ejercicio
          </button>
          <button onClick={handleSyncNow} disabled={syncing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-depro-blue text-white font-bold text-sm hover:bg-depro-blue-dark transition-colors disabled:opacity-50">
            {syncing ? <RefreshCw size={15} className="animate-spin" /> : saved ? <CheckCircle size={15} /> : <Save size={15} />}
            {syncing ? "Guardando…" : saved ? "¡Guardado!" : "Guardar en la nube"}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-start gap-3 bg-depro-blue-light/30 border border-depro-blue/20 rounded-2xl px-4 py-3">
        <Info size={16} className="text-depro-blue flex-shrink-0 mt-0.5" />
        <p className="text-xs text-depro-dark/70">
          Catálogo multi-eje del motor (objetivo · segmento · patrón · grupo muscular · rol · material).
          Las «carpetas» son vistas filtradas por objetivo; un ejercicio puede aparecer en varias.
          Añade vídeo, descripción y tips — el motor rellena slots con filtrado AND.
        </p>
      </div>
      </>
      )}

      {embedded && (
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <p className="text-sm text-depro-gray">
            {allExercises.length} ejercicios para planes de jugadores · {totalWithVideo} con vídeo
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-depro-blue text-depro-blue font-bold text-sm"
            >
              <Plus size={14} /> Añadir ejercicio
            </button>
            <button onClick={handleSyncNow} disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-depro-blue text-white font-bold text-sm hover:bg-depro-blue-dark disabled:opacity-50">
              {syncing ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
              Guardar
            </button>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-depro-gray" />
          <input
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-depro-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
            placeholder="Buscar ejercicio…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-depro-gray hover:text-depro-dark">
              <X size={13} />
            </button>
          )}
        </div>

        <select value={filterMat} onChange={(e) => setFilterMat(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-depro-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30 text-depro-dark">
          <option value="">Todo el material</option>
          {TAGS.material.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>

        <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-depro-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30 text-depro-dark">
          <option value="">Todos los objetivos</option>
          {TAGS.objetivo.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        <select value={filterFolder} onChange={(e) => setFilterFolder(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-depro-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30 text-depro-dark">
          <option value="">Todas las carpetas PDF</option>
          {CATALOG_FOLDERS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
        </select>

        {(search || filterMat || filterTag || filterFolder) && (
          <button onClick={() => { setSearch(""); setFilterMat(""); setFilterTag(""); setFilterFolder(""); }}
            className="px-4 py-2.5 rounded-xl border border-depro-border bg-white text-sm text-depro-gray hover:text-depro-dark transition-colors flex items-center gap-1.5">
            <X size={13} /> Limpiar filtros · {filtered.length} resultados
          </button>
        )}
      </div>

      {/* Secciones */}
      <div className="space-y-4">
        {SECTION_LABELS.map((section) => {
          const exercises = grouped[section.key] || [];
          if (exercises.length === 0) return null;
          const Icon = section.icon;
          const isCollapsed = collapsed[section.key];

          return (
            <div key={section.key} className="bg-white rounded-2xl border border-depro-border shadow-sm overflow-hidden">
              {/* Header sección */}
              <button
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                onClick={() => toggleCollapsed(section.key)}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: section.color + "15" }}>
                  <Icon size={16} style={{ color: section.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-depro-dark">{section.label}</div>
                  <div className="text-xs text-depro-gray">
                    {exercises.length} ejercicios · {exercises.filter((e) => overrides[e.id]?.videoUrl).length} con vídeo
                  </div>
                </div>
                {isCollapsed ? <ChevronDown size={16} className="text-depro-gray flex-shrink-0" /> : <ChevronUp size={16} className="text-depro-gray flex-shrink-0" />}
              </button>

              {/* Lista de ejercicios */}
              {!isCollapsed && (
                <div className="border-t border-depro-border/50 divide-y divide-depro-border/30">
                  {exercises.map((exercise) => {
                    const ov = overrides[exercise.id] || {};
                    const desc = catalogDescription(exercise, ov);
                    const tipsText = catalogTips(exercise, ov);
                    const hasVideo = !!(ov.videoUrl || exercise.videoUrl);
                    const hasContent = hasVideo || !!desc || !!tipsText;

                    return (
                      <div key={exercise.id}
                        className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/70 transition-colors group">
                        {/* Indicador */}
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${hasVideo ? "bg-green-400" : "bg-gray-200"}`} />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-depro-dark text-sm truncate">{exercise.nombre}</span>
                            {(exercise.materiales || [exercise.material].filter(Boolean)).slice(0, 2).map((m) => (
                              <span key={m} className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${MATERIAL_COLORS[m] || "bg-gray-100 text-gray-600"}`}>
                                {m}
                              </span>
                            ))}
                          </div>
                          {desc && (
                            <p className="text-[11px] text-depro-gray mt-0.5 line-clamp-2">{desc}</p>
                          )}
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            {exercise.etiquetasMulti ? (
                              <>
                                {(exercise.etiquetasMulti.objetivo || []).slice(0, 2).map((t) => (
                                  <span key={`o-${t}`} className="text-[10px] text-depro-blue font-medium">{t}</span>
                                ))}
                                {exercise.etiquetasMulti.segmento && (
                                  <span className="text-[10px] text-depro-gray">{exercise.etiquetasMulti.segmento}</span>
                                )}
                                {(exercise.etiquetasMulti.patron || []).slice(0, 2).map((t) => (
                                  <span key={`p-${t}`} className="text-[10px] text-depro-gray">{t}</span>
                                ))}
                                {exercise.etiquetasMulti.rol && (
                                  <span className="text-[10px] text-amber-700 font-medium">{exercise.etiquetasMulti.rol}</span>
                                )}
                              </>
                            ) : (
                              (exercise.etiquetas || []).slice(0, 4).map((t) => (
                                <span key={t} className="text-[10px] text-depro-gray">{t}</span>
                              ))
                            )}
                            {hasVideo && (
                              <span className="text-[10px] text-green-600 font-medium flex items-center gap-0.5">
                                <PlayCircle size={10} /> Vídeo
                              </span>
                            )}
                            {desc && (
                              <span className="text-[10px] text-depro-blue font-medium">· Descripción</span>
                            )}
                            {tipsText && (
                              <span className="text-[10px] text-depro-blue font-medium">· Tips</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {exercise.custom && (
                            <button
                              type="button"
                              onClick={() => handleDeleteCustom(exercise.id)}
                              className="p-1.5 rounded-lg text-depro-gray hover:text-depro-red hover:bg-depro-red-light"
                              title="Eliminar ejercicio añadido"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                          <button
                            onClick={() => setEditing(exercise)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all
                              ${hasContent
                                ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                                : "bg-depro-gray-light text-depro-gray border border-depro-border hover:border-depro-blue hover:text-depro-blue opacity-0 group-hover:opacity-100"
                              }`}>
                            <Edit3 size={11} />
                            {hasContent ? "Editar" : "Vídeo/tips"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {adding && (
        <AddExerciseModal
          onSave={handleAddExercise}
          onClose={() => setAdding(false)}
        />
      )}

      {/* Modal de edición */}
      {editing && (
        <ExerciseEditModal
          exercise={editing}
          override={overrides[editing.id]}
          onSave={(data) => handleSaveOverride(editing.id, data, editing)}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

/* ── Exportar función para fusionar ejercicios con overrides ─ */
export function mergeExercisesWithOverrides(exercises, overrides) {
  return exercises.map((e) => ({
    ...e,
    ...(overrides[e.id] || {}),
  }));
}
