import React, { useState, useEffect } from "react";
import {
  ClipboardList, Plus, X, Save, Shield, CheckCircle, Users,
  Flame, Dumbbell, Target, Wind, BarChart2, ChevronDown, ChevronUp,
  Trash2, Calendar, PlayCircle, Edit3, Copy, RefreshCw,
} from "lucide-react";
import {
  emptyExercise, emptySubSession, normalizeBlock, defaultBlocks,
  flattenBlocksToExercises, BLOCK_LABELS,
} from "../../lib/sessionBlocks";
import BlockExerciseEditor from "../../components/admin/BlockExerciseEditor";
import { getMesocicloWeeks, getSessionType } from "../../lib/periodization";
import {
  FRAMEWORKS, FRAMEWORK_LABELS, FRAMEWORK_COLORS,
  groupSessionsByFramework, ensureWeekSchedule, suggestTemplateKey,
  prepareSessionPayload, normalizeMesocycle, formatWeekCombination,
} from "../../lib/mesocycleTemplates";

/* ── Constantes globales ─────────────────────────────────── */
const AGE_BLOCKS = [
  { id: "Bloque 1", label: "Bloque 1 · Fútbol Base",      ages: ["Sub-9","Sub-10","Sub-11","Sub-12"], color: "#3B82F6" },
  { id: "Bloque 2", label: "Bloque 2 · Fútbol Formativo", ages: ["Sub-13","Sub-14","Sub-15"],          color: "#8B5CF6" },
  { id: "Bloque 3", label: "Bloque 3 · Fútbol Juvenil",   ages: ["Sub-16","Juvenil"],                  color: "#EF4444" },
];

const INTENSITIES   = ["Baja","Media","Media-alta","Alta","Máxima","Complementaria-D"];
const SESSION_DAYS  = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

const SESSION_BLOCK_CONFIG = {
  calentamiento:  { label: "Calentamiento",    color: "#F59E0B", hasVideo: true },
  principal:      { label: "Bloque principal", color: "#3B82F6", hasVideo: false },
  complementario: { label: "Complementario",   color: "#8B5CF6", hasVideo: false },
  vuelta_calma:   { label: "Vuelta a la calma", color: "#10B981", hasVideo: true },
};

const SESSION_TYPE_OPTIONS = [
  { value: "Baja",             label: "A · Extensiva",       color: "#3B82F6" },
  { value: "Media",            label: "A · Extensiva",       color: "#3B82F6" },
  { value: "Media-alta",       label: "B · Intensiva",       color: "#F59E0B" },
  { value: "Alta",             label: "B · Intensiva",       color: "#F59E0B" },
  { value: "Máxima",           label: "C · Reactiva",        color: "#EF4444" },
  { value: "Complementaria-D", label: "D · Complementaria",  color: "#10B981" },
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
    const res = await fetch("/api/admin-clubs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        club: { id: GLOBAL_CLUB_ID, name: "Global Plans" },
        detail: { plans },
      }),
    });
    if (!res.ok) console.warn("[DEPRO] saveGlobalPlans API error", await res.text());
  } catch (e) { console.warn("[DEPRO] saveGlobalPlans fetch error", e); }
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

/* ── Modal editor de sesión ──────────────────────────────── */
function SessionEditorModal({ onClose, onCreate, initialData = null, onUpdate = null, existingSessions = [], defaultFramework = null }) {
  const isEditing = !!initialData;
  const [tab, setTab] = useState("resumen");
  const [form, setForm] = useState(() => {
    if (initialData) {
      return {
        title: initialData.title || "",
        duration: initialData.duration || "75 min",
        intensity: initialData.intensity || "Media",
        templateKey: initialData.templateKey || "",
        objective: initialData.objective || "",
        space: initialData.space || "",
        blocks: initialData.blocks?.length
          ? initialData.blocks.map((b) => normalizeBlock(b))
          : defaultBlocks(),
        exercises: initialData.exercises || [],
      };
    }
    const fw = defaultFramework || "A";
    const defaultIntensity = fw === "A" ? "Media" : fw === "B" ? "Media-alta" : fw === "C" ? "Máxima" : "Complementaria-D";
    return {
      title: "",
      duration: "75 min",
      intensity: defaultIntensity,
      templateKey: suggestTemplateKey(existingSessions, fw),
      objective: "",
      space: "",
      blocks: defaultBlocks(),
      exercises: [],
    };
  });

  const getBlock = (type) => normalizeBlock(form.blocks.find((b) => b.type === type) || { type, exercises: [] });
  const updateBlock = (type, changes) =>
    setForm((f) => ({
      ...f,
      blocks: f.blocks.map((b) => (b.type === type ? normalizeBlock({ ...b, ...changes, type }) : b)),
    }));

  const sessionTypeMeta = SESSION_TYPE_OPTIONS.find((o) => o.value === form.intensity) || SESSION_TYPE_OPTIONS[1];

  const TABS = [
    { id:"resumen",        label:"Resumen",          icon: BarChart2 },
    { id:"calentamiento",  label:"Calentamiento",    icon: Flame },
    { id:"principal",      label:"Principal",        icon: Dumbbell },
    { id:"complementario", label:"Complementario",   icon: Target },
    { id:"vuelta_calma",   label:"Vuelta a la calma", icon: Wind },
  ];

  const handleSave = () => {
    if (!form.title.trim()) return;
    const blocks = form.blocks.map((b) => normalizeBlock(b));
    const allExercises = flattenBlocksToExercises(blocks);
    const payload = prepareSessionPayload({ ...form, blocks, exercises: allExercises }, existingSessions);
    if (isEditing && onUpdate) {
      onUpdate({ ...initialData, ...payload });
    } else {
      onCreate({ ...payload, id: `s${Date.now()}` });
    }
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
              <div className="font-black text-depro-dark leading-none">{form.title || (isEditing ? "Editar sesión" : "Nueva sesión")}</div>
              <div className="text-[10px] text-depro-gray mt-0.5">
                <span className="font-bold" style={{ color: sessionTypeMeta.color }}>{sessionTypeMeta.label}</span>
                {form.templateKey && (
                  <span className="ml-2 font-black" style={{ color: sessionTypeMeta.color }}>{form.templateKey}</span>
                )}
                <span className="ml-2 opacity-60">{isEditing ? "· Plantilla del marco" : "· El día se asigna en el mesociclo"}</span>
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
                  <div className="text-xs font-semibold mt-1" style={{ color: sessionTypeMeta.color }}>
                    {sessionTypeMeta.label}{form.templateKey ? ` · ${form.templateKey}` : ""}
                  </div>
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
                    value={form.intensity}
                    onChange={(e) => {
                      const intensity = e.target.value;
                      const fw = getSessionType(intensity);
                      setForm((f) => ({
                        ...f,
                        intensity,
                        templateKey: isEditing && f.templateKey
                          ? f.templateKey
                          : suggestTemplateKey(existingSessions, fw),
                      }));
                    }}>
                    {INTENSITIES.map((i) => {
                      const opt = SESSION_TYPE_OPTIONS.find((o) => o.value === i);
                      return <option key={i} value={i}>{opt ? opt.label : i}</option>;
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-depro-gray uppercase tracking-wide mb-1.5">Plantilla</label>
                  <input className="w-full border border-depro-border rounded-xl px-3 py-2.5 text-sm font-black focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                    placeholder="A1" value={form.templateKey}
                    onChange={(e) => setForm((f) => ({ ...f, templateKey: e.target.value.toUpperCase() }))} />
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
                <BlockExerciseEditor
                  key={blockType}
                  blockType={blockType}
                  block={block}
                  onUpdate={(changes) => updateBlock(blockType, changes)}
                />
              </div>
            );
          })}

        </div>

        <div className="flex gap-3 px-5 py-4 border-t border-depro-border flex-shrink-0 bg-white">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-depro-border text-depro-gray font-medium text-sm hover:border-depro-dark transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={!form.title.trim()}
            className="flex-1 py-2.5 rounded-xl bg-depro-blue text-white font-bold text-sm hover:bg-depro-blue-dark transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
            <Save size={14} /> {isEditing ? "Guardar cambios" : "Guardar sesión"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Modal nuevo microciclo ──────────────────────────────── */
function NewMicrocycleModal({ onClose, onCreate, onUpdate = null, initialAgeBlock = "", initialData = null }) {
  const isEditing = !!initialData;
  const [form, setForm] = useState(() => initialData ? {
    label: initialData.label || "",
    ageBlock: initialData.ageBlock || initialAgeBlock,
    startDate: initialData.startDate || "",
    endDate: initialData.endDate || "",
    status: initialData.status || "borrador",
  } : {
    label: "", ageBlock: initialAgeBlock,
    startDate: "", endDate: "",
    status: "borrador",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-depro w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-depro-border">
          <h2 className="font-bold text-depro-dark text-lg">{isEditing ? "Editar mesociclo" : "Nuevo mesociclo"}</h2>
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
              if (isEditing && onUpdate) {
                onUpdate({ ...initialData, ...form });
              } else {
                onCreate({ ...form, id: `mc${Date.now()}`, sessions: [] });
              }
              onClose();
            }}
            disabled={!form.label || !form.ageBlock || !form.startDate || !form.endDate}
            className="flex-1 py-2.5 rounded-xl bg-depro-blue text-white font-semibold text-sm hover:bg-depro-blue-dark transition-colors disabled:opacity-40"
          >
            {isEditing ? "Guardar cambios" : "Crear mesociclo"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Combinación semanal A1/B1/C1 ─────────────────────────── */
function WeekScheduleEditor({ mc, onUpdateSchedule }) {
  const numWeeks = getMesocicloWeeks(mc.startDate, mc.endDate) || 1;
  const groups = groupSessionsByFramework(mc.sessions);
  const schedule = ensureWeekSchedule(mc, numWeeks);

  const updateCell = (weekIdx, fw, sessionId) => {
    const next = schedule.map((row, i) =>
      i === weekIdx ? { ...row, week: i + 1, [fw]: sessionId || null } : row
    );
    onUpdateSchedule(next);
  };

  if (!mc.startDate || !mc.endDate) {
    return (
      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
        Define fechas de inicio y fin del mesociclo para configurar la combinación semanal.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-depro-border overflow-hidden">
      <div className="px-3 py-2 bg-depro-gray-light/40 border-b border-depro-border">
        <p className="text-xs font-bold text-depro-dark">Combinación por semana</p>
        <p className="text-[10px] text-depro-gray mt-0.5">
          Elige qué plantilla (A1, A2, B1…) usa cada marco en cada semana del mesociclo.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-white border-b border-depro-border">
              <th className="text-left px-3 py-2 font-bold text-depro-gray">Semana</th>
              {FRAMEWORKS.map((fw) => (
                <th key={fw} className="px-2 py-2 font-bold text-center" style={{ color: FRAMEWORK_COLORS[fw] }}>
                  {fw} · {FRAMEWORK_LABELS[fw]}
                </th>
              ))}
              <th className="px-3 py-2 font-bold text-depro-gray text-left">Combinación</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((row, wi) => (
              <tr key={wi} className="border-b border-depro-border/60 hover:bg-depro-gray-light/20">
                <td className="px-3 py-2 font-black text-depro-dark whitespace-nowrap">{wi + 1}</td>
                {FRAMEWORKS.map((fw) => (
                  <td key={fw} className="px-2 py-2">
                    <select
                      className="w-full min-w-[88px] border border-depro-border rounded-lg px-2 py-1.5 text-xs bg-white"
                      value={row[fw] || ""}
                      onChange={(e) => updateCell(wi, fw, e.target.value || null)}
                    >
                      <option value="">—</option>
                      {(groups[fw] || []).map((t) => (
                        <option key={t.id} value={t.id}>{t.templateKey} · {t.title || "Sin título"}</option>
                      ))}
                    </select>
                  </td>
                ))}
                <td className="px-3 py-2 font-bold text-depro-blue whitespace-nowrap">
                  {formatWeekCombination(row, mc.sessions) || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Card de microciclo ──────────────────────────────────── */
function MicrocycleCard({ mc, onAddSession, onDeleteSession, onDelete, onUpdateMc, onUpdateSession, onUpdateSchedule }) {
  const [expanded, setExpanded] = useState(false);
  const [showNewSession, setShowNewSession] = useState(false);
  const [newSessionFramework, setNewSessionFramework] = useState("A");
  const [editingSession, setEditingSession] = useState(null);
  const [showEditMc, setShowEditMc] = useState(false);
  const [frameworkTab, setFrameworkTab] = useState("A");

  const grouped = groupSessionsByFramework(mc.sessions);

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
            <button onClick={() => setShowEditMc(true)} className="text-depro-gray hover:text-depro-blue p-1.5 rounded-lg hover:bg-depro-blue-light/30 transition-colors" title="Editar mesociclo">
              <Edit3 size={14} />
            </button>
            <button onClick={() => onDelete(mc.id)} className="text-depro-gray hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Eliminar mesociclo">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Sesiones */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-depro-border space-y-4">
            <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-depro-blue-light/30 border border-depro-blue/15">
              <Calendar size={11} className="text-depro-blue mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-depro-blue font-medium leading-tight">
                <strong>A, B, C son marcos condicionales.</strong> Crea varias plantillas por marco (A1, A2, B1…) y combínalas por semana abajo.
              </p>
            </div>

            {/* Plantillas por marco */}
            <div>
              <div className="flex gap-1 mb-2 overflow-x-auto">
                {FRAMEWORKS.map((fw) => (
                  <button key={fw} type="button" onClick={() => setFrameworkTab(fw)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      frameworkTab === fw ? "text-white border-transparent" : "bg-white text-depro-gray border-depro-border"
                    }`}
                    style={frameworkTab === fw ? { backgroundColor: FRAMEWORK_COLORS[fw] } : {}}>
                    {fw} · {FRAMEWORK_LABELS[fw]} ({grouped[fw]?.length || 0})
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                {(grouped[frameworkTab] || []).length === 0 && (
                  <p className="text-xs text-depro-gray italic px-1">Sin plantillas {frameworkTab} — añade la primera</p>
                )}
                {(grouped[frameworkTab] || []).map((s) => (
                  <div key={s.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-depro-gray-light/50 border border-depro-border">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-black text-xs"
                      style={{ backgroundColor: FRAMEWORK_COLORS[frameworkTab] + "18", color: FRAMEWORK_COLORS[frameworkTab] }}>
                      {s.templateKey}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-depro-dark truncate">{s.title || "Sin título"}</p>
                      <p className="text-[10px] text-depro-gray">{s.duration} · {s.intensity}</p>
                    </div>
                    <button onClick={() => setEditingSession(s)} className="text-depro-gray hover:text-depro-blue p-1 rounded transition-colors" title="Editar">
                      <Edit3 size={12} />
                    </button>
                    <button onClick={() => onDeleteSession(mc.id, s.id)} className="text-depro-gray hover:text-red-500 p-1 transition-colors" title="Eliminar">
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => { setNewSessionFramework(frameworkTab); setShowNewSession(true); }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed text-xs font-bold transition-colors"
                  style={{ borderColor: FRAMEWORK_COLORS[frameworkTab] + "50", color: FRAMEWORK_COLORS[frameworkTab] }}>
                  <Plus size={11} /> Añadir plantilla {frameworkTab}
                </button>
              </div>
            </div>

            {/* Combinación semanal */}
            <WeekScheduleEditor mc={mc} onUpdateSchedule={(weekSchedule) => onUpdateSchedule(mc.id, weekSchedule)} />
          </div>
        )}
      </div>
      {showNewSession && (
        <SessionEditorModal
          onClose={() => setShowNewSession(false)}
          existingSessions={mc.sessions || []}
          defaultFramework={newSessionFramework}
          onCreate={(session) => { onAddSession(mc.id, session); setShowNewSession(false); }}
        />
      )}
      {editingSession && (
        <SessionEditorModal
          initialData={editingSession}
          existingSessions={(mc.sessions || []).filter((s) => s.id !== editingSession.id)}
          onClose={() => setEditingSession(null)}
          onCreate={() => {}}
          onUpdate={(updated) => { onUpdateSession(mc.id, updated); setEditingSession(null); }}
        />
      )}
      {showEditMc && (
        <NewMicrocycleModal
          initialData={mc}
          onClose={() => setShowEditMc(false)}
          onCreate={() => {}}
          onUpdate={(updated) => { onUpdateMc(updated); setShowEditMc(false); }}
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
  const [activeMcModal, setActiveMcModal] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // Cargar desde API al montar (cross-device) — Supabase es fuente de verdad
  useEffect(() => {
    async function loadFromCloud() {
      try {
        const r = await fetch("/api/admin-clubs");
        if (!r.ok) return;
        const data = await r.json();
        const clubs = data.clubs || [];

        // Plans globales
        const globalEntry = clubs.find((c) => c.id === GLOBAL_CLUB_ID);
        if (globalEntry?.plans && globalEntry.plans.length > 0) {
          setPlans(globalEntry.plans);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(globalEntry.plans));
        }
      } catch (e) { console.warn("[DEPRO] loadFromCloud error", e); }
    }
    loadFromCloud();
  }, []);

  const persist = (newPlans) => {
    setPlans(newPlans);
    saveGlobalPlans(newPlans);
  };

  const addMicrocycle = (mc) => persist([...plans, normalizeMesocycle({ ...mc, sessions: mc.sessions || [] })]);
  const deleteMicrocycle = (id) => persist(plans.filter((p) => p.id !== id));
  const updateMicrocycle = (updated) => persist(plans.map((p) => p.id === updated.id ? normalizeMesocycle({ ...p, ...updated }) : p));
  const addSession = (mcId, session) =>
    persist(plans.map((p) => {
      if (p.id !== mcId) return p;
      const prepared = prepareSessionPayload(session, p.sessions || []);
      return normalizeMesocycle({ ...p, sessions: [...(p.sessions || []), prepared] });
    }));
  const deleteSession = (mcId, sessionId) =>
    persist(plans.map((p) => {
      if (p.id !== mcId) return p;
      const sessions = (p.sessions || []).filter((s) => s.id !== sessionId);
      const weekSchedule = (p.weekSchedule || []).map((row) => {
        const next = { ...row };
        for (const fw of FRAMEWORKS) {
          if (next[fw] === sessionId) next[fw] = null;
        }
        return next;
      });
      return normalizeMesocycle({ ...p, sessions, weekSchedule });
    }));
  const updateSession = (mcId, updated) =>
    persist(plans.map((p) => {
      if (p.id !== mcId) return p;
      const sessions = (p.sessions || []).map((s) =>
        s.id === updated.id ? prepareSessionPayload(updated, (p.sessions || []).filter((x) => x.id !== updated.id)) : s
      );
      return normalizeMesocycle({ ...p, sessions });
    }));
  const updateWeekSchedule = (mcId, weekSchedule) =>
    persist(plans.map((p) => p.id === mcId ? normalizeMesocycle({ ...p, weekSchedule }) : p));

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
                    onUpdateMc={updateMicrocycle}
                    onUpdateSession={updateSession}
                    onUpdateSchedule={updateWeekSchedule}
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
                  <Plus size={13} /> Añadir mesociclo
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
