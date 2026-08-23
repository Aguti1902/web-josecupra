import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search, Save, X, Plus, Edit3, Trash2, CheckCircle2, AlertCircle,
  Dumbbell, RefreshCw, ChevronDown, ChevronUp, Info,
} from "lucide-react";
import {
  loadCoachLibrary, upsertExercise, deleteExercise, approveExercise,
} from "../../lib/coachLibraryStorage";
import { BLOQUES, BLOQUE_LABELS, PROTOCOLOS, MATERIALES, CATEGORY_PROTOCOLS } from "../../data/coachExerciseLibrary";

const CATEGORIAS = Object.keys(CATEGORY_PROTOCOLS);
const COMPLEJIDADES = ["baja", "media", "alta"];

function genId() {
  return `coach_ex_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function emptyForm() {
  return {
    nombre: "", categoria: CATEGORIAS[0], subcategoria: "", objetivo: "", descripcion: "",
    bloquesPermitidos: [...BLOQUES], protocolosPermitidos: CATEGORY_PROTOCOLS[CATEGORIAS[0]] || [...PROTOCOLOS],
    material: ["sin_material"], duracion: 6, complejidad: "media",
    etiquetas: "", gruposMusculares: "", video: "", gif: "", notas: "",
    espacioNecesario: "reducido", numeroJugadores: "individual", tiempoRecomendado: "",
    estado: "aprobado",
  };
}

function toFormFields(ex) {
  return {
    ...emptyForm(),
    ...ex,
    etiquetas: (ex.etiquetas || []).join(", "),
    gruposMusculares: (ex.gruposMusculares || []).join(", "),
  };
}

function fromFormFields(form, existingId) {
  return {
    ...form,
    id: existingId || genId(),
    duracion: parseInt(form.duracion, 10) || 6,
    etiquetas: form.etiquetas.split(",").map((s) => s.trim()).filter(Boolean),
    gruposMusculares: form.gruposMusculares.split(",").map((s) => s.trim()).filter(Boolean),
  };
}

function toggleInArray(arr, value) {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

/* ── Modal de edición / creación ─────────────────────────────── */
function ExerciseFormModal({ exercise, onSave, onClose }) {
  const [form, setForm] = useState(() => toFormFields(exercise || emptyForm()));
  const isNew = !exercise;

  function set(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  function handleSubmit() {
    if (!form.nombre.trim()) return;
    onSave(fromFormFields(form, exercise?.id));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-depro-border flex-shrink-0">
          <h3 className="font-black text-depro-dark">{isNew ? "Nuevo ejercicio" : "Editar ejercicio"}</h3>
          <button onClick={onClose} className="text-depro-gray hover:text-depro-dark p-1 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-depro-gray uppercase tracking-wide mb-1 block">Nombre</label>
              <input className="w-full border border-depro-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-depro-blue/30"
                value={form.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Ej. Skipping bajo con vallas" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-depro-gray uppercase tracking-wide mb-1 block">Categoría</label>
              <select className="w-full border border-depro-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-depro-blue/30"
                value={form.categoria}
                onChange={(e) => set("categoria", e.target.value)}>
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-depro-gray uppercase tracking-wide mb-1 block">Descripción</label>
            <textarea rows={2} className="w-full border border-depro-border rounded-xl px-3 py-2 text-sm resize-none outline-none focus:ring-2 focus:ring-depro-blue/30"
              value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)} placeholder="Ejecución del ejercicio…" />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold text-depro-gray uppercase tracking-wide mb-1 block">Duración (min)</label>
              <input type="number" min="1" className="w-full border border-depro-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-depro-blue/30"
                value={form.duracion} onChange={(e) => set("duracion", e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-depro-gray uppercase tracking-wide mb-1 block">Complejidad</label>
              <select className="w-full border border-depro-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-depro-blue/30"
                value={form.complejidad} onChange={(e) => set("complejidad", e.target.value)}>
                {COMPLEJIDADES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-depro-gray uppercase tracking-wide mb-1 block">Estado</label>
              <select className="w-full border border-depro-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-depro-blue/30"
                value={form.estado} onChange={(e) => set("estado", e.target.value)}>
                <option value="aprobado">Aprobado</option>
                <option value="pendiente_aprobacion">Pendiente de aprobación</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-depro-gray uppercase tracking-wide mb-1.5 block">Bloques permitidos</label>
            <div className="flex gap-2">
              {BLOQUES.map((b) => (
                <button key={b} type="button" onClick={() => set("bloquesPermitidos", toggleInArray(form.bloquesPermitidos, b))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${form.bloquesPermitidos.includes(b) ? "bg-depro-blue text-white border-depro-blue" : "border-depro-border text-depro-gray"}`}>
                  {BLOQUE_LABELS[b] || b}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-depro-gray uppercase tracking-wide mb-1.5 block">Protocolos permitidos</label>
            <div className="flex gap-2">
              {PROTOCOLOS.map((p) => (
                <button key={p} type="button" onClick={() => set("protocolosPermitidos", toggleInArray(form.protocolosPermitidos, p))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${form.protocolosPermitidos.includes(p) ? "bg-depro-blue text-white border-depro-blue" : "border-depro-border text-depro-gray"}`}>
                  Protocolo {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-depro-gray uppercase tracking-wide mb-1.5 block">Material necesario</label>
            <div className="flex flex-wrap gap-2">
              {MATERIALES.map((m) => (
                <button key={m} type="button" onClick={() => set("material", toggleInArray(form.material, m))}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${form.material.includes(m) ? "bg-depro-blue text-white border-depro-blue" : "border-depro-border text-depro-gray"}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-depro-gray uppercase tracking-wide mb-1 block">Etiquetas (separadas por coma)</label>
              <input className="w-full border border-depro-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-depro-blue/30"
                value={form.etiquetas} onChange={(e) => set("etiquetas", e.target.value)} placeholder="velocidad, tren_inferior" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-depro-gray uppercase tracking-wide mb-1 block">Grupos musculares</label>
              <input className="w-full border border-depro-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-depro-blue/30"
                value={form.gruposMusculares} onChange={(e) => set("gruposMusculares", e.target.value)} placeholder="cuádriceps, glúteo" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-depro-gray uppercase tracking-wide mb-1 block">URL vídeo (opcional)</label>
              <input className="w-full border border-depro-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-depro-blue/30"
                value={form.video} onChange={(e) => set("video", e.target.value)} placeholder="https://…" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-depro-gray uppercase tracking-wide mb-1 block">URL gif (opcional)</label>
              <input className="w-full border border-depro-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-depro-blue/30"
                value={form.gif} onChange={(e) => set("gif", e.target.value)} placeholder="https://…" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-depro-gray uppercase tracking-wide mb-1 block">Notas / tips</label>
            <textarea rows={2} className="w-full border border-depro-border rounded-xl px-3 py-2 text-sm resize-none outline-none focus:ring-2 focus:ring-depro-blue/30"
              value={form.notas} onChange={(e) => set("notas", e.target.value)} />
          </div>
        </div>

        <div className="flex gap-3 px-5 py-4 border-t border-depro-border flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-depro-border text-depro-gray font-medium text-sm hover:border-depro-dark transition-colors">
            Cancelar
          </button>
          <button onClick={handleSubmit}
            className="flex-1 py-2.5 rounded-xl bg-depro-blue text-white font-bold text-sm hover:bg-depro-blue-dark transition-colors flex items-center justify-center gap-2">
            <Save size={14} /> Guardar ejercicio
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Página principal ─────────────────────────────────────────── */
export default function AdminCoachLibraryPage({ embedded = false }) {
  const [searchParams] = useSearchParams();
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(() => searchParams.get("q") || "");
  const [filterCategoria, setFilterCategoria] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [collapsed, setCollapsed] = useState({});
  const [editing, setEditing] = useState(null); // exercise | "new" | null
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCoachLibrary().then((lib) => { setLibrary(lib); setLoading(false); });
  }, []);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearch(q);
  }, [searchParams]);

  const pending = useMemo(() => library.filter((e) => e.estado === "pendiente_aprobacion"), [library]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return library.filter((e) => {
      if (q && !e.nombre.toLowerCase().includes(q)) return false;
      if (filterCategoria && e.categoria !== filterCategoria) return false;
      if (filterEstado && e.estado !== filterEstado) return false;
      return true;
    });
  }, [library, search, filterCategoria, filterEstado]);

  const grouped = useMemo(() => {
    const map = {};
    CATEGORIAS.forEach((c) => { map[c] = []; });
    filtered.forEach((e) => {
      if (!map[e.categoria]) map[e.categoria] = [];
      map[e.categoria].push(e);
    });
    return map;
  }, [filtered]);

  async function handleSave(exercise) {
    setSaving(true);
    const next = await upsertExercise(exercise);
    setLibrary(next);
    setSaving(false);
    setEditing(null);
  }

  async function handleDelete(id) {
    if (!window.confirm("¿Eliminar este ejercicio de la biblioteca?")) return;
    const next = await deleteExercise(id);
    setLibrary(next);
  }

  async function handleApprove(id) {
    const next = await approveExercise(id);
    setLibrary(next);
  }

  const toggleCollapsed = (key) => setCollapsed((c) => ({ ...c, [key]: !c[key] }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-depro-gray text-sm gap-2">
        <RefreshCw size={16} className="animate-spin" /> Cargando biblioteca…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!embedded && (
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-depro-dark flex items-center gap-2">
            <Dumbbell size={22} className="text-depro-blue" /> Biblioteca DEPRO Coach
          </h1>
          <p className="text-sm text-depro-gray mt-0.5">{library.length} ejercicios · usada por el motor de reglas de entrenadores individuales</p>
        </div>
        <button
          onClick={() => setEditing("new")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-depro-blue text-white font-bold text-sm hover:bg-depro-blue-dark transition-colors flex-shrink-0"
        >
          <Plus size={15} /> Nuevo ejercicio
        </button>
      </div>
      )}

      {embedded && (
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <p className="text-sm text-depro-gray">{library.length} ejercicios · motor DEPRO Coach</p>
          <button
            onClick={() => setEditing("new")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-depro-blue text-white font-bold text-sm hover:bg-depro-blue-dark"
          >
            <Plus size={14} /> Nuevo ejercicio
          </button>
        </div>
      )}

      <div className="flex items-start gap-3 bg-depro-blue-light/30 border border-depro-blue/20 rounded-2xl px-4 py-3">
        <Info size={16} className="text-depro-blue flex-shrink-0 mt-0.5" />
        <p className="text-xs text-depro-dark/70">
          Solo los ejercicios en estado <strong>Aprobado</strong> entran al motor automático de sesiones/microciclos.
          Los ejercicios propios creados por entrenadores en Modo Personalizado aparecen aquí como <strong>Pendiente de aprobación</strong>.
        </p>
      </div>

      {pending.length > 0 && (
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 bg-amber-50 border-b border-amber-200 flex items-center gap-2">
            <AlertCircle size={15} className="text-amber-600" />
            <span className="font-bold text-amber-800 text-sm">{pending.length} ejercicio{pending.length > 1 ? "s" : ""} pendiente{pending.length > 1 ? "s" : ""} de aprobación</span>
          </div>
          <div className="divide-y divide-depro-border/30">
            {pending.map((ex) => (
              <div key={ex.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50/70">
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-depro-dark text-sm">{ex.nombre}</span>
                  <span className="text-xs text-depro-gray ml-2">{ex.categoria}</span>
                </div>
                <button onClick={() => handleApprove(ex.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 flex-shrink-0">
                  <CheckCircle2 size={12} /> Aprobar
                </button>
                <button onClick={() => setEditing(ex)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-depro-gray-light text-depro-gray border border-depro-border hover:text-depro-dark flex-shrink-0">
                  <Edit3 size={11} /> Editar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-depro-gray" />
          <input
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-depro-border bg-white text-sm outline-none focus:ring-2 focus:ring-depro-blue/30"
            placeholder="Buscar ejercicio…" value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select value={filterCategoria} onChange={(e) => setFilterCategoria(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-depro-border bg-white text-sm outline-none focus:ring-2 focus:ring-depro-blue/30 text-depro-dark">
          <option value="">Todas las categorías</option>
          {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-depro-border bg-white text-sm outline-none focus:ring-2 focus:ring-depro-blue/30 text-depro-dark">
          <option value="">Todos los estados</option>
          <option value="aprobado">Aprobado</option>
          <option value="pendiente_aprobacion">Pendiente</option>
        </select>
      </div>

      <div className="space-y-4">
        {CATEGORIAS.map((categoria) => {
          const exercises = grouped[categoria] || [];
          if (exercises.length === 0) return null;
          const isCollapsed = collapsed[categoria];
          return (
            <div key={categoria} className="bg-white rounded-2xl border border-depro-border shadow-sm overflow-hidden">
              <button onClick={() => toggleCollapsed(categoria)} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors text-left">
                <div className="flex-1 min-w-0">
                  <div className="font-black text-depro-dark">{categoria}</div>
                  <div className="text-xs text-depro-gray">{exercises.length} ejercicios · protocolo(s) {(CATEGORY_PROTOCOLS[categoria] || []).join(", ")}</div>
                </div>
                {isCollapsed ? <ChevronDown size={16} className="text-depro-gray flex-shrink-0" /> : <ChevronUp size={16} className="text-depro-gray flex-shrink-0" />}
              </button>
              {!isCollapsed && (
                <div className="border-t border-depro-border/50 divide-y divide-depro-border/30">
                  {exercises.map((ex) => (
                    <div key={ex.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50/70 transition-colors group">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ex.estado === "aprobado" ? "bg-green-400" : "bg-amber-400"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-depro-dark text-sm truncate">{ex.nombre}</span>
                          {(ex.bloquesPermitidos || []).map((b) => (
                            <span key={b} className="text-[10px] px-2 py-0.5 rounded-full bg-depro-blue/10 text-depro-blue font-medium">{BLOQUE_LABELS[b] || b}</span>
                          ))}
                        </div>
                        <div className="text-[11px] text-depro-gray mt-0.5">
                          {(ex.protocolosPermitidos || []).map((p) => `Protocolo ${p}`).join(" · ")} · {ex.complejidad}
                        </div>
                      </div>
                      <button onClick={() => setEditing(ex)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-depro-gray-light text-depro-gray border border-depro-border hover:text-depro-dark hover:border-depro-blue transition-all flex-shrink-0 opacity-0 group-hover:opacity-100">
                        <Edit3 size={11} /> Editar
                      </button>
                      <button onClick={() => handleDelete(ex.id)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-red-50 text-depro-red border border-red-200 hover:bg-red-100 transition-all flex-shrink-0 opacity-0 group-hover:opacity-100">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editing && (
        <ExerciseFormModal
          exercise={editing === "new" ? null : editing}
          onSave={handleSave}
          onClose={() => !saving && setEditing(null)}
        />
      )}
    </div>
  );
}
