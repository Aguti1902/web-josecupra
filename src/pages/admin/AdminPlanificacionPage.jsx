import React, { useState, useEffect } from "react";
import {
  ClipboardList, Plus, X, Save, Shield, CheckCircle, Users,
  Flame, Dumbbell, Target, Wind, BarChart2, ChevronDown, ChevronUp,
  Trash2, Calendar, PlayCircle, Edit3, Copy, RefreshCw,
} from "lucide-react";

/* ── Constantes globales ─────────────────────────────────── */
const AGE_BLOCKS = [
  { id: "Bloque 1", label: "Bloque 1 · Fútbol Base",      ages: ["Sub-9","Sub-10","Sub-11","Sub-12"], color: "#3B82F6" },
  { id: "Bloque 2", label: "Bloque 2 · Fútbol Formativo", ages: ["Sub-13","Sub-14","Sub-15"],          color: "#8B5CF6" },
  { id: "Bloque 3", label: "Bloque 3 · Fútbol Juvenil",   ages: ["Sub-16","Juvenil"],                  color: "#EF4444" },
];

const INTENSITIES   = ["Baja","Media","Media-alta","Alta","Máxima"];
const SESSION_DAYS  = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

const SESSION_BLOCK_CONFIG = {
  calentamiento:  { label: "Calentamiento",    color: "#F59E0B", hasVideo: true },
  principal:      { label: "Bloque principal", color: "#3B82F6", hasVideo: false },
  complementario: { label: "Complementario",   color: "#8B5CF6", hasVideo: false },
  vuelta_calma:   { label: "Vuelta a la calma", color: "#10B981", hasVideo: true },
};

const SESSION_TYPE_OPTIONS = [
  { value: "Baja",       label: "A · Extensiva",  color: "#3B82F6" },
  { value: "Media",      label: "A · Extensiva",  color: "#3B82F6" },
  { value: "Media-alta", label: "B · Intensiva",  color: "#F59E0B" },
  { value: "Alta",       label: "B · Intensiva",  color: "#F59E0B" },
  { value: "Máxima",     label: "C · Reactiva",   color: "#EF4444" },
];

const PHYSICAL_TEST_FIELDS = [
  { id: "resistencia", label: "Resistencia aeróbica", unit: "m / min" },
  { id: "sprint",      label: "Sprint 30m",           unit: "seg" },
  { id: "cod",         label: "Cambio de dirección",  unit: "seg" },
  { id: "cmj",         label: "Salto CMJ",            unit: "cm" },
];

function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v=|\/embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

const emptyExercise = () => ({
  id: `ex_${Date.now()}_${Math.random().toString(36).slice(2)}`,
  name: "", sets: "3", reps: "10-12", rest: "60s", duration: "",
  videoUrl: "", description: "", tips: "",
});

const defaultBlocks = () => [
  { type: "calentamiento",  label: "Calentamiento",    duration: "10 min", videoUrl: "", exercises: [] },
  { type: "principal",      label: "Bloque principal", duration: "30 min", videoUrl: "", exercises: [emptyExercise()] },
  { type: "complementario", label: "Complementario",   duration: "15 min", videoUrl: "", exercises: [] },
  { type: "vuelta_calma",   label: "Vuelta a la calma", duration: "5 min",  videoUrl: "", exercises: [] },
];

/* ── Almacenamiento global ───────────────────────────────── */
const STORAGE_KEY = "depro_global_plans";
const GLOBAL_CLUB_ID = "GLOBAL_PLANS";

function loadGlobalPlans() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}

async function saveGlobalPlans(plans) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  try {
    await fetch("/api/admin-clubs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clubId: GLOBAL_CLUB_ID, data: { plans } }),
    });
  } catch {}
}

async function fetchGlobalPlansFromAPI() {
  try {
    const r = await fetch("/api/admin-clubs");
    if (!r.ok) return null;
    const data = await r.json();
    const global = (data.clubs || []).find((c) => c.id === GLOBAL_CLUB_ID);
    return global?.plans ?? null;
  } catch { return null; }
}

/* ── Editor de ejercicios de un bloque ───────────────────── */
function BlockExerciseEditor({ block, onUpdate }) {
  const exercises = block.exercises || [];
  const cfg = SESSION_BLOCK_CONFIG[block.type] || { color: "#3B82F6" };

  const add    = () => onUpdate({ exercises: [...exercises, emptyExercise()] });
  const remove = (i) => onUpdate({ exercises: exercises.filter((_, idx) => idx !== i) });
  const update = (i, field, val) =>
    onUpdate({ exercises: exercises.map((ex, idx) => idx === i ? { ...ex, [field]: val } : ex) });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label className="text-xs font-bold text-depro-gray uppercase tracking-wide w-20 flex-shrink-0">Duración</label>
        <input className="border border-depro-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-depro-blue/30 w-28"
          placeholder="10 min" value={block.duration || ""}
          onChange={(e) => onUpdate({ duration: e.target.value })} />
      </div>

      {cfg.hasVideo && (
        <div>
          <label className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5 flex items-center gap-1 block">
            <PlayCircle size={11} /> URL vídeo YouTube
          </label>
          <div className="flex items-center gap-2">
            <input className="flex-1 border border-depro-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
              placeholder="https://youtu.be/…" value={block.videoUrl || ""}
              onChange={(e) => onUpdate({ videoUrl: e.target.value })} />
            {getYouTubeId(block.videoUrl) && (
              <img src={`https://img.youtube.com/vi/${getYouTubeId(block.videoUrl)}/default.jpg`}
                alt="" className="w-16 h-12 rounded-lg object-cover border border-depro-border flex-shrink-0" />
            )}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-depro-gray uppercase tracking-wide">Ejercicios · {exercises.length}</span>
          <button onClick={add} className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border transition-colors"
            style={{ color: cfg.color, borderColor: cfg.color + "40" }}>
            <Plus size={11} /> Añadir
          </button>
        </div>
        {exercises.length === 0 && (
          <div className="py-6 border border-dashed border-depro-border rounded-xl flex flex-col items-center gap-2 text-depro-gray">
            <ClipboardList size={20} className="opacity-30" />
            <p className="text-xs">Sin ejercicios</p>
          </div>
        )}
        <div className="space-y-3">
          {exercises.map((ex, i) => {
            const ytId = getYouTubeId(ex.videoUrl);
            return (
              <div key={ex.id || i} className="border border-depro-border rounded-xl overflow-hidden bg-white">
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-black flex-shrink-0"
                      style={{ backgroundColor: cfg.color + "18", color: cfg.color }}>{i + 1}</div>
                    <input className="flex-1 border border-depro-border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                      placeholder="Nombre del ejercicio" value={ex.name}
                      onChange={(e) => update(i, "name", e.target.value)} />
                    <button onClick={() => remove(i)} className="text-depro-gray hover:text-red-500 transition-colors p-1"><Trash2 size={14} /></button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { field:"sets",     placeholder:"Series", label:"Series" },
                      { field:"reps",     placeholder:"10-12",  label:"Reps/T." },
                      { field:"rest",     placeholder:"60s",    label:"Descanso" },
                      { field:"duration", placeholder:"40\"",   label:"Duración" },
                    ].map(({ field, placeholder, label }) => (
                      <div key={field}>
                        <div className="text-[9px] font-bold text-depro-gray uppercase tracking-wide mb-0.5">{label}</div>
                        <input className="w-full border border-depro-border rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                          placeholder={placeholder} value={ex[field] || ""}
                          onChange={(e) => update(i, field, e.target.value)} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="px-3 pb-3 flex items-center gap-2 border-t border-depro-border/50 pt-2">
                  <PlayCircle size={13} className={ytId ? "text-red-500" : "text-depro-gray"} />
                  <input className="flex-1 border border-depro-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                    placeholder="URL YouTube (opcional)" value={ex.videoUrl || ""}
                    onChange={(e) => update(i, "videoUrl", e.target.value)} />
                  {ytId && <img src={`https://img.youtube.com/vi/${ytId}/default.jpg`} alt=""
                    className="w-14 h-10 rounded-lg object-cover border border-depro-border flex-shrink-0" />}
                </div>
                <div className="px-3 pb-3 space-y-2 border-t border-depro-border/50 pt-2">
                  <input className="w-full border border-depro-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                    placeholder="Descripción breve (opcional)" value={ex.description || ""}
                    onChange={(e) => update(i, "description", e.target.value)} />
                  <textarea rows={2} className="w-full border border-depro-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-depro-blue/30 resize-none"
                    placeholder="Consejos técnicos: una línea por consejo" value={ex.tips || ""}
                    onChange={(e) => update(i, "tips", e.target.value)} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Modal editor de sesión ──────────────────────────────── */
function SessionEditorModal({ onClose, onCreate }) {
  const [tab, setTab] = useState("resumen");
  const [form, setForm] = useState({
    title: "", duration: "75 min", intensity: "Media",
    objective: "", space: "",
    blocks: defaultBlocks(),
    tests: PHYSICAL_TEST_FIELDS.map((t) => ({ ...t, description: "", reference: "" })),
    exercises: [],
  });

  const getBlock  = (type) => form.blocks.find((b) => b.type === type) || { exercises: [] };
  const updateBlock = (type, changes) =>
    setForm((f) => ({ ...f, blocks: f.blocks.map((b) => b.type === type ? { ...b, ...changes } : b) }));

  const sessionTypeMeta = SESSION_TYPE_OPTIONS.find((o) => o.value === form.intensity) || SESSION_TYPE_OPTIONS[1];

  const TABS = [
    { id:"resumen",        label:"Resumen",          icon: BarChart2 },
    { id:"calentamiento",  label:"Calentamiento",    icon: Flame },
    { id:"principal",      label:"Principal",        icon: Dumbbell },
    { id:"complementario", label:"Complementario",   icon: Target },
    { id:"vuelta_calma",   label:"Vuelta a la calma", icon: Wind },
    { id:"tests",          label:"Tests",            icon: ClipboardList },
  ];

  const handleSave = () => {
    if (!form.title.trim()) return;
    const allExercises = form.blocks.flatMap((b) => b.exercises.map((ex) => ({
      ...ex, tips: ex.tips ? ex.tips.split("\n").filter(Boolean) : [],
    })));
    onCreate({ ...form, id: `s${Date.now()}`, exercises: allExercises });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch bg-black/50">
      <div className="relative bg-white w-full max-w-3xl mx-auto my-4 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-depro-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: sessionTypeMeta.color + "18" }}>
              <ClipboardList size={16} style={{ color: sessionTypeMeta.color }} />
            </div>
            <div>
              <div className="font-black text-depro-dark leading-none">{form.title || "Nueva sesión"}</div>
              <div className="text-[10px] text-depro-gray mt-0.5">
                <span className="font-bold" style={{ color: sessionTypeMeta.color }}>{sessionTypeMeta.label}</span>
                <span className="ml-2 opacity-60">· El día se asigna automáticamente</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-depro-gray hover:text-depro-dark p-1 rounded-lg hover:bg-depro-gray-light transition-colors"><X size={18} /></button>
        </div>

        <div className="flex border-b border-depro-border overflow-x-auto flex-shrink-0 bg-depro-gray-light/30">
          {TABS.map(({ id, label, icon: TIcon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-3 text-xs font-bold transition-colors border-b-2 ${
                tab === id ? "border-depro-blue text-depro-blue bg-white" : "border-transparent text-depro-gray hover:text-depro-dark"
              }`}>
              <TIcon size={12} /> {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === "resumen" && (
            <div className="space-y-4">
              <div className="rounded-2xl p-5 border flex items-center gap-4"
                style={{ background:`linear-gradient(135deg,${sessionTypeMeta.color}10 0%,white 80%)`, borderColor: sessionTypeMeta.color + "25" }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border"
                  style={{ backgroundColor: sessionTypeMeta.color + "18", borderColor: sessionTypeMeta.color + "30" }}>
                  <ClipboardList size={22} style={{ color: sessionTypeMeta.color }} />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-depro-gray mb-0.5">Vista previa</div>
                  <div className="font-black text-depro-dark text-lg leading-none">{form.title || "Sin título"}</div>
                  <div className="text-xs font-semibold mt-1" style={{ color: sessionTypeMeta.color }}>{sessionTypeMeta.label}</div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5">Título *</label>
                <input className="w-full border border-depro-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                  placeholder="Ej. Posesión · presión alta" value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5">Duración</label>
                  <input className="w-full border border-depro-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                    placeholder="75 min" value={form.duration}
                    onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5">
                    Intensidad <span className="font-semibold" style={{ color: sessionTypeMeta.color }}>({sessionTypeMeta.label})</span>
                  </label>
                  <select className="w-full border border-depro-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                    value={form.intensity} onChange={(e) => setForm((f) => ({ ...f, intensity: e.target.value }))}>
                    {INTENSITIES.map((i) => <option key={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5">Espacio</label>
                  <input className="w-full border border-depro-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                    placeholder="Medio campo" value={form.space}
                    onChange={(e) => setForm((f) => ({ ...f, space: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5">Objetivo</label>
                <textarea rows={3} className="w-full border border-depro-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30 resize-none"
                  placeholder="Describe el objetivo principal…" value={form.objective}
                  onChange={(e) => setForm((f) => ({ ...f, objective: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-depro-border">
                {form.blocks.map((b) => {
                  const cfg = SESSION_BLOCK_CONFIG[b.type] || { color: "#6B7280" };
                  return (
                    <button key={b.type} onClick={() => setTab(b.type)}
                      className="flex items-center gap-2.5 p-3 rounded-xl border border-depro-border hover:shadow-sm transition-all text-left">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: cfg.color + "15" }}>
                        <ClipboardList size={13} style={{ color: cfg.color }} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-depro-dark">{b.label}</div>
                        <div className="text-[10px] text-depro-gray">{b.exercises.length} ejercicios · {b.duration || "—"}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {["calentamiento","principal","complementario","vuelta_calma"].map((blockType) => {
            if (tab !== blockType) return null;
            const block = getBlock(blockType);
            const cfg = SESSION_BLOCK_CONFIG[blockType];
            return (
              <div key={blockType} className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-2xl border"
                  style={{ backgroundColor: cfg.color + "08", borderColor: cfg.color + "25" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0"
                    style={{ backgroundColor: cfg.color + "18", borderColor: cfg.color + "25" }}>
                    <ClipboardList size={18} style={{ color: cfg.color }} />
                  </div>
                  <div>
                    <div className="font-black text-depro-dark">{cfg.label}</div>
                    <div className="text-xs text-depro-gray">Edita los ejercicios y parámetros de este bloque</div>
                  </div>
                </div>
                <BlockExerciseEditor block={block} onUpdate={(changes) => updateBlock(blockType, changes)} />
              </div>
            );
          })}

          {tab === "tests" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-2xl border border-depro-blue/20 bg-depro-blue-light/30">
                <div className="w-10 h-10 rounded-xl bg-depro-blue/10 flex items-center justify-center flex-shrink-0 border border-depro-blue/20">
                  <ClipboardList size={18} className="text-depro-blue" />
                </div>
                <div>
                  <div className="font-black text-depro-dark">Tests físicos</div>
                  <div className="text-xs text-depro-gray">Protocolo y valores de referencia para este bloque de edad</div>
                </div>
              </div>
              <div className="space-y-3">
                {form.tests.map((test, i) => (
                  <div key={test.id} className="border border-depro-border rounded-xl p-4 space-y-3 bg-white">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-depro-dark text-sm">{test.label}</span>
                      <span className="text-xs text-depro-gray ml-auto">Unidad: {test.unit}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-depro-gray uppercase tracking-wide block mb-1">Protocolo</label>
                        <textarea rows={2} className="w-full border border-depro-border rounded-lg px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                          placeholder="Cómo se realiza…" value={test.description}
                          onChange={(e) => setForm((f) => ({
                            ...f, tests: f.tests.map((t, ti) => ti === i ? { ...t, description: e.target.value } : t)
                          }))} />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-depro-gray uppercase tracking-wide block mb-1">Valores de referencia</label>
                        <textarea rows={2} className="w-full border border-depro-border rounded-lg px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                          placeholder="Ej. ≥1200m es bueno…" value={test.reference}
                          onChange={(e) => setForm((f) => ({
                            ...f, tests: f.tests.map((t, ti) => ti === i ? { ...t, reference: e.target.value } : t)
                          }))} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 px-5 py-4 border-t border-depro-border flex-shrink-0 bg-white">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-depro-border text-depro-gray font-medium text-sm hover:border-depro-dark transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={!form.title.trim()}
            className="flex-1 py-2.5 rounded-xl bg-depro-blue text-white font-bold text-sm hover:bg-depro-blue-dark transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
            <Save size={14} /> Guardar sesión
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Modal nuevo microciclo ──────────────────────────────── */
function NewMicrocycleModal({ onClose, onCreate, initialAgeBlock = "" }) {
  const [form, setForm] = useState({
    label: "", ageBlock: initialAgeBlock,
    startDate: "", endDate: "",
    status: "borrador",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-depro w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-depro-border">
          <h2 className="font-bold text-depro-dark text-lg">Nuevo mesociclo</h2>
          <button onClick={onClose} className="text-depro-gray hover:text-depro-dark"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          {/* Selección de bloque */}
          <div>
            <label className="block text-sm font-medium text-depro-dark mb-2">Bloque de edad *</label>
            <div className="grid grid-cols-3 gap-2">
              {AGE_BLOCKS.map((b) => (
                <button key={b.id} type="button" onClick={() => setForm((f) => ({ ...f, ageBlock: b.id }))}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-colors text-left ${
                    form.ageBlock === b.id ? "text-white" : "border-depro-border text-depro-dark hover:border-current"
                  }`}
                  style={form.ageBlock === b.id ? { backgroundColor: b.color, borderColor: b.color } : { borderColor: "#E5E7EB" }}>
                  <div className="font-black text-[10px] uppercase tracking-wide mb-0.5">{b.id}</div>
                  <div className={`${form.ageBlock === b.id ? "opacity-80" : "text-depro-gray"}`} style={{ fontSize: "9px" }}>
                    {b.ages.join(" · ")}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-depro-dark mb-1">Nombre *</label>
              <input className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                placeholder="Mesociclo 1 · Adaptación" value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-depro-dark mb-1">Estado</label>
              <select className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                <option value="borrador">Borrador</option>
                <option value="activo">Activo</option>
                <option value="completado">Completado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-depro-dark mb-1">Fecha inicio *</label>
              <input type="date" className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-depro-dark mb-1">Fecha fin *</label>
              <input type="date" className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                value={form.endDate}
                min={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-depro-border">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-depro-border text-depro-gray font-medium text-sm hover:border-depro-dark transition-colors">Cancelar</button>
          <button
            onClick={() => {
              if (!form.label || !form.ageBlock || !form.startDate || !form.endDate) return;
              onCreate({ ...form, id: `mc${Date.now()}`, sessions: [] });
              onClose();
            }}
            disabled={!form.label || !form.ageBlock || !form.startDate || !form.endDate}
            className="flex-1 py-2.5 rounded-xl bg-depro-blue text-white font-semibold text-sm hover:bg-depro-blue-dark transition-colors disabled:opacity-40"
          >
            Crear mesociclo
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Card de microciclo ──────────────────────────────────── */
function MicrocycleCard({ mc, onAddSession, onDeleteSession, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [showNewSession, setShowNewSession] = useState(false);

  const bloque = AGE_BLOCKS.find((b) => b.id === mc.ageBlock);
  const statusStyle = {
    activo: "bg-green-50 text-green-700 border-green-200",
    borrador: "bg-yellow-50 text-yellow-700 border-yellow-200",
    completado: "bg-gray-100 text-gray-500 border-gray-200",
  }[mc.status] ?? "bg-gray-100 text-gray-500 border-gray-200";

  return (
    <div className="bg-white border border-depro-border rounded-xl overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono text-xs font-black text-depro-blue bg-depro-blue/10 px-2 py-0.5 rounded">{mc.code}</span>
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusStyle}`}>{mc.status}</span>
              {(mc.startDate || mc.dateRange) && (
                <span className="text-xs text-depro-gray flex items-center gap-1">
                  <Calendar size={10}/>
                  {mc.startDate ? `${mc.startDate} → ${mc.endDate}` : mc.dateRange}
                </span>
              )}
            </div>
            <p className="text-sm font-bold text-depro-dark truncate">{mc.label}</p>
            {mc.focus && <p className="text-xs text-depro-gray mt-0.5">{mc.focus}</p>}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => setExpanded((e) => !e)} className="text-depro-gray hover:text-depro-dark p-1.5 rounded-lg hover:bg-depro-gray-light transition-colors">
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <button onClick={() => onDelete(mc.id)} className="text-depro-gray hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Sesiones */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-depro-border space-y-2">
            {(mc.sessions || []).length === 0 && (
              <p className="text-xs text-depro-gray italic">Sin sesiones — añade la primera</p>
            )}
            {(mc.sessions || []).map((s, si) => (
              <div key={s.id || si} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-depro-gray-light/50 border border-depro-border">
                <div className="w-6 h-6 rounded-lg bg-depro-blue/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-black text-depro-blue">{si + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-depro-dark truncate">{s.title || s.day}</p>
                  <p className="text-[10px] text-depro-gray">{s.day} · {s.duration} · {s.intensity}</p>
                </div>
                <button onClick={() => onDeleteSession(mc.id, s.id)} className="text-depro-gray hover:text-red-500 p-1 transition-colors">
                  <X size={12} />
                </button>
              </div>
            ))}
            <button onClick={() => setShowNewSession(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-depro-blue/30 text-xs font-bold text-depro-blue hover:bg-depro-blue-light/30 transition-colors">
              <Plus size={11} /> Añadir sesión
            </button>
          </div>
        )}
      </div>
      {showNewSession && (
        <SessionEditorModal
          onClose={() => setShowNewSession(false)}
          onCreate={(session) => { onAddSession(mc.id, session); setShowNewSession(false); }}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL
   ════════════════════════════════════════════════════════════ */
export default function AdminPlanificacionPage() {
  const [plans, setPlans] = useState(() => loadGlobalPlans());
  const [activeMcModal, setActiveMcModal] = useState(null); // ageBlock id
  const [syncing, setSyncing] = useState(false);

  // Cargar desde API al montar (cross-device)
  useEffect(() => {
    fetchGlobalPlansFromAPI().then((apiPlans) => {
      if (apiPlans && apiPlans.length > 0) {
        setPlans(apiPlans);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(apiPlans));
      }
    });
  }, []);

  const persist = (newPlans) => {
    setPlans(newPlans);
    saveGlobalPlans(newPlans);
  };

  const addMicrocycle = (mc) => persist([...plans, mc]);
  const deleteMicrocycle = (id) => persist(plans.filter((p) => p.id !== id));
  const addSession = (mcId, session) =>
    persist(plans.map((p) => p.id === mcId ? { ...p, sessions: [...(p.sessions || []), session] } : p));
  const deleteSession = (mcId, sessionId) =>
    persist(plans.map((p) => p.id === mcId ? { ...p, sessions: (p.sessions || []).filter((s) => s.id !== sessionId) } : p));

  const handleSyncNow = async () => {
    setSyncing(true);
    await saveGlobalPlans(plans);
    setSyncing(false);
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-depro-dark">Planificación global</h1>
          <p className="text-depro-gray text-sm mt-1">
            Crea los microciclos de cada bloque. Todos los equipos del mismo bloque los recibirán automáticamente.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 border border-green-200">
            <CheckCircle size={12} className="text-green-600" />
            <span className="text-xs font-bold text-green-700">Auto-asignación activa</span>
          </div>
          <button onClick={handleSyncNow} disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-depro-border text-xs font-bold text-depro-gray hover:text-depro-dark hover:border-depro-dark transition-colors disabled:opacity-50">
            <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Guardando…" : "Guardar en nube"}
          </button>
        </div>
      </div>

      {/* Leyenda de cómo funciona */}
      <div className="bg-depro-blue-light/40 border border-depro-blue/20 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-depro-blue/15 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Shield size={15} className="text-depro-blue" />
        </div>
        <div className="text-sm text-depro-dark/80">
          <span className="font-bold text-depro-dark">¿Cómo funciona? </span>
          Crea los microciclos en cada bloque de edad. Cuando un club tenga equipos
          con categorías <span className="font-bold">Sub-9 a Sub-12</span> (Bloque 1),{" "}
          <span className="font-bold">Sub-13 a Sub-15</span> (Bloque 2) o{" "}
          <span className="font-bold">Sub-16 / Juvenil</span> (Bloque 3),
          esos entrenadores verán automáticamente los planes del bloque correspondiente.
        </div>
      </div>

      {/* Grid de 3 bloques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {AGE_BLOCKS.map((bloque) => {
          const blockPlans = plans.filter((p) => p.ageBlock === bloque.id);

          return (
            <div key={bloque.id} className="rounded-2xl border flex flex-col overflow-hidden"
              style={{ borderColor: bloque.color + "30" }}>

              {/* Header del bloque */}
              <div className="px-5 py-4"
                style={{ background: `linear-gradient(135deg, ${bloque.color}12 0%, white 100%)` }}>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center border"
                    style={{ backgroundColor: bloque.color + "18", borderColor: bloque.color + "25" }}>
                    <Shield size={14} style={{ color: bloque.color }} />
                  </div>
                  <div>
                    <div className="font-black text-depro-dark text-sm">{bloque.id}</div>
                    <div className="text-[10px] font-bold" style={{ color: bloque.color }}>
                      {bloque.ages.join(" · ")}
                    </div>
                  </div>
                  <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: bloque.color + "15", color: bloque.color }}>
                    {blockPlans.length} mic.
                  </span>
                </div>
                <p className="text-[11px] text-depro-gray">{bloque.label.split(" · ")[1]}</p>
              </div>

              {/* Indicador de auto-asignación */}
              <div className="px-4 py-2 border-t border-b flex items-center gap-2"
                style={{ borderColor: bloque.color + "20", backgroundColor: bloque.color + "05" }}>
                <Users size={11} style={{ color: bloque.color }} />
                <span className="text-[10px] font-bold" style={{ color: bloque.color }}>
                  Todos los equipos {bloque.ages.join(", ")} → auto-asignado
                </span>
              </div>

              {/* Microciclos */}
              <div className="flex-1 p-3 space-y-2 bg-white min-h-[100px]">
                {blockPlans.length === 0 && (
                  <div className="py-8 text-center text-depro-gray">
                    <ClipboardList size={24} className="mx-auto mb-2 opacity-25" />
                    <p className="text-xs font-medium">Sin mesociclos</p>
                    <p className="text-[10px] opacity-60 mt-0.5">Añade el primero para este bloque</p>
                  </div>
                )}
                {blockPlans.map((mc) => (
                  <MicrocycleCard
                    key={mc.id}
                    mc={mc}
                    onAddSession={addSession}
                    onDeleteSession={deleteSession}
                    onDelete={deleteMicrocycle}
                  />
                ))}
              </div>

              {/* Botón añadir */}
              <div className="px-3 pb-3 bg-white">
                <button onClick={() => setActiveMcModal(bloque.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-dashed text-xs font-bold transition-all"
                  style={{ borderColor: bloque.color + "40", color: bloque.color }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = bloque.color + "10")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
                  <Plus size={13} /> Añadir microciclo
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal nuevo microciclo */}
      {activeMcModal && (
        <NewMicrocycleModal
          initialAgeBlock={activeMcModal}
          onClose={() => setActiveMcModal(null)}
          onCreate={(mc) => { addMicrocycle(mc); setActiveMcModal(null); }}
        />
      )}
    </div>
  );
}
