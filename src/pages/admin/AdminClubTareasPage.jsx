import { useMemo, useState } from "react";
import { Plus, Save, Layers, ExternalLink } from "lucide-react";
import { CLUB_MAIN_TASKS } from "../../data/clubAutoCatalog";

const STORAGE_KEY = "depro_club_task_overrides";
const CUSTOM_KEY = "depro_club_custom_tasks";

const NIVELES = ["A", "B", "C"];
const GRUPOS = [
  { id: "regenerativo", label: "Grupo 1 · regenerativo / baja carga", folder: "grupo_1_regenerativo" },
  { id: "carga_alta", label: "Grupo 2 · carga alta", folder: "grupo_2_carga_alta" },
  { id: "prepartido", label: "Grupo 3 · prepartido / velocidad corta", folder: "grupo_3_prepartido" },
];

const TIPOS_TAREA = [
  "Rondo", "Posesión", "Finalización", "Oleadas", "Partido", "Circuito",
  "Velocidad de reacción", "Transiciones",
];
const TIPOS_SESION = ["extensiva", "intensiva", "reactiva"];
const BLOQUES_EDAD = ["1", "2", "3"];

const emptyDraft = () => ({
  nombre: "",
  nivel: "B",
  grupo_microciclo: "regenerativo",
  tipo_tarea: "Posesión",
  tipo_sesion: "extensiva",
  bloques_edad: ["1", "2", "3"],
  video: "",
  descripcion: "",
});

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function TaskRow({ item, override, onExplanationChange, onMetaChange, systemOnly }) {
  const descripcion = override?.descripcion ?? item.descripcion ?? "";
  const tipoTarea = override?.tipo_tarea ?? item.tipo_tarea ?? "—";
  const tipoSesion = override?.tipo_sesion ?? item.tipo_sesion ?? "—";
  const bloques = override?.bloques_edad ?? item.bloques_edad ?? [];
  const video = override?.video ?? item.video ?? item.videoUrl ?? "";

  return (
    <div className="rounded-xl border border-depro-border p-3 space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-depro-dark">{item.nombre}</p>
          <p className="text-[11px] text-depro-gray mt-0.5">{item.carpeta}</p>
        </div>
        <div className="flex flex-wrap gap-1">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-depro-gray-light border border-depro-border">nivel · {item.nivel}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-depro-gray-light border border-depro-border">{item.grupo_microciclo}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-depro-blue/10 text-depro-blue border border-depro-blue/20">{tipoTarea}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">{tipoSesion}</span>
          {bloques.map((b) => (
            <span key={b} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-800 border border-green-200">Bloque {b}</span>
          ))}
          {systemOnly && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">solo explicación editable</span>
          )}
        </div>
      </div>
      <label className="block text-[10px] text-depro-gray">
        Explicación de la tarea
        <textarea
          rows={2}
          value={descripcion}
          onChange={(e) => onExplanationChange(item.id, e.target.value)}
          className="mt-0.5 w-full border border-depro-border rounded-lg px-2 py-1.5 text-xs resize-none"
        />
      </label>
      {!systemOnly && onMetaChange && (
        <div className="grid sm:grid-cols-2 gap-2">
          <label className="block text-[10px] text-depro-gray">
            Vídeo YouTube
            <div className="flex gap-1 mt-0.5">
              <input
                type="url"
                value={video}
                onChange={(e) => onMetaChange(item.id, { video: e.target.value })}
                className="flex-1 border border-depro-border rounded-lg px-2 py-1.5 text-xs"
              />
              {video && (
                <a href={video} target="_blank" rel="noreferrer" className="p-1.5 border border-depro-border rounded-lg text-depro-blue">
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </label>
        </div>
      )}
      {systemOnly && video && (
        <a href={video} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-depro-blue font-semibold">
          <ExternalLink size={11} /> Ver vídeo
        </a>
      )}
    </div>
  );
}

export default function AdminClubTareasPage({ embedded = false } = {}) {
  const [overrides, setOverrides] = useState(() => readJson(STORAGE_KEY, {}));
  const [custom, setCustom] = useState(() => readJson(CUSTOM_KEY, []));
  const [saved, setSaved] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [filterBloque, setFilterBloque] = useState("");
  const [filterSesion, setFilterSesion] = useState("");
  const [filterTipo, setFilterTipo] = useState("");

  const systemCount = CLUB_MAIN_TASKS.length;
  const totalCount = systemCount + custom.length;

  const byFolder = useMemo(() => {
    const map = {};
    for (const nivel of NIVELES) {
      for (const g of GRUPOS) {
        const key = `${nivel}/${g.id}`;
        map[key] = CLUB_MAIN_TASKS.filter((t) => t.nivel === nivel && t.grupo_microciclo === g.id);
      }
    }
    return map;
  }, []);

  const filteredCustom = useMemo(() => {
    return custom.filter((t) => {
      if (filterBloque && !(t.bloques_edad || []).map(String).includes(filterBloque)) return false;
      if (filterSesion && t.tipo_sesion !== filterSesion) return false;
      if (filterTipo && t.tipo_tarea !== filterTipo) return false;
      return true;
    });
  }, [custom, filterBloque, filterSesion, filterTipo]);

  const persistOverrides = (next) => {
    setOverrides(next);
    writeJson(STORAGE_KEY, next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const changeExplanation = (id, descripcion) => {
    persistOverrides({
      ...overrides,
      [id]: { ...(overrides[id] || {}), descripcion },
    });
  };

  const changeMeta = (id, patch) => {
    const nextCustom = custom.map((t) => (t.id === id ? { ...t, ...patch } : t));
    setCustom(nextCustom);
    writeJson(CUSTOM_KEY, nextCustom);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const toggleBloqueDraft = (b) => {
    setDraft((d) => {
      const has = d.bloques_edad.includes(b);
      const next = has ? d.bloques_edad.filter((x) => x !== b) : [...d.bloques_edad, b];
      return { ...d, bloques_edad: next.length ? next : [b] };
    });
  };

  const handleAddCustom = () => {
    if (!draft.nombre.trim()) return;
    if (!draft.bloques_edad.length) return;
    const id = `custom_task_${Date.now()}`;
    const item = {
      id,
      carpeta: `/calentamiento_con_balon/${draft.nivel}/grupo_${draft.grupo_microciclo === "regenerativo" ? "1_regenerativo" : draft.grupo_microciclo === "carga_alta" ? "2_carga_alta" : "3_prepartido"}`,
      nombre: draft.nombre.trim(),
      nivel: draft.nivel,
      grupo_microciclo: draft.grupo_microciclo,
      tipo_tarea: draft.tipo_tarea,
      tipo_sesion: draft.tipo_sesion,
      bloques_edad: draft.bloques_edad,
      video: draft.video || "",
      videoUrl: draft.video || "",
      intensidad: draft.grupo_microciclo === "carga_alta" ? "alta" : draft.grupo_microciclo === "prepartido" ? "media" : "baja",
      gimnasio: false,
      descripcion: draft.descripcion || "",
      custom: true,
      adaptaciones: {
        jugadores: "Ajustar formato según número de jugadores.",
        espacio: "Ajustar espacio según día del microciclo.",
      },
    };
    const next = [item, ...custom];
    setCustom(next);
    writeJson(CUSTOM_KEY, next);
    setDraft(emptyDraft());
    setAdding(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="space-y-6">
      {!embedded && (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-depro-dark flex items-center gap-2">
              <Layers size={22} className="text-depro-blue" />
              Calentamiento con balón
            </h1>
            <p className="text-sm text-depro-gray mt-1">
              Antes «Tareas». Sin límite de cantidad. Campos: tipo de tarea, tipo de sesión, bloque de edad, explicación y vídeo.
              La IA filtra: bloque → tipo de sesión → selección.
            </p>
          </div>
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl">
              <Save size={13} /> Guardado
            </span>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-depro-border bg-white p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="text-sm text-depro-dark">
          <strong>{totalCount}</strong> tareas
          <span className="text-depro-gray ml-2">· catálogo abierto</span>
        </div>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-depro-blue text-white text-sm font-bold"
        >
          <Plus size={14} /> Añadir tarea
        </button>
      </div>

      {/* Filtros IA (preview admin) */}
      <div className="rounded-2xl border border-depro-border bg-depro-gray-light/40 p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wide text-depro-gray">Filtros de selección IA (preview)</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <label className="text-[10px] text-depro-gray">
            1. Bloque de edad
            <select
              className="mt-0.5 w-full border border-depro-border rounded-lg px-3 py-2 text-sm bg-white"
              value={filterBloque}
              onChange={(e) => setFilterBloque(e.target.value)}
            >
              <option value="">Todos</option>
              {BLOQUES_EDAD.map((b) => <option key={b} value={b}>Bloque {b}</option>)}
            </select>
          </label>
          <label className="text-[10px] text-depro-gray">
            2. Tipo de sesión
            <select
              className="mt-0.5 w-full border border-depro-border rounded-lg px-3 py-2 text-sm bg-white"
              value={filterSesion}
              onChange={(e) => setFilterSesion(e.target.value)}
            >
              <option value="">Todas</option>
              {TIPOS_SESION.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="text-[10px] text-depro-gray">
            3. Tipo de tarea
            <select
              className="mt-0.5 w-full border border-depro-border rounded-lg px-3 py-2 text-sm bg-white"
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
            >
              <option value="">Todos</option>
              {TIPOS_TAREA.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
        </div>
        <p className="text-[11px] text-depro-gray">
          Mostrando {filteredCustom.length} tareas añadidas tras filtros.
          El motor aplica el mismo orden al generar la sesión.
        </p>
      </div>

      {adding && (
        <div className="rounded-2xl border border-depro-blue/30 bg-depro-blue-light p-4 space-y-3">
          <h3 className="font-bold text-depro-dark text-sm">Nueva tarea</h3>
          <input
            className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm"
            placeholder="Nombre de la tarea"
            value={draft.nombre}
            onChange={(e) => setDraft((d) => ({ ...d, nombre: e.target.value }))}
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="text-[10px] text-depro-gray">
              Tipo de tarea
              <select
                className="mt-0.5 w-full border border-depro-border rounded-lg px-3 py-2 text-sm bg-white"
                value={draft.tipo_tarea}
                onChange={(e) => setDraft((d) => ({ ...d, tipo_tarea: e.target.value }))}
              >
                {TIPOS_TAREA.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label className="text-[10px] text-depro-gray">
              Tipo de sesión
              <select
                className="mt-0.5 w-full border border-depro-border rounded-lg px-3 py-2 text-sm bg-white"
                value={draft.tipo_sesion}
                onChange={(e) => setDraft((d) => ({ ...d, tipo_sesion: e.target.value }))}
              >
                {TIPOS_SESION.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="text-[10px] text-depro-gray">
              Nivel
              <select
                className="mt-0.5 w-full border border-depro-border rounded-lg px-3 py-2 text-sm bg-white"
                value={draft.nivel}
                onChange={(e) => setDraft((d) => ({ ...d, nivel: e.target.value }))}
              >
                {NIVELES.map((n) => <option key={n} value={n}>Nivel {n}</option>)}
              </select>
            </label>
            <label className="text-[10px] text-depro-gray">
              Grupo microciclo
              <select
                className="mt-0.5 w-full border border-depro-border rounded-lg px-3 py-2 text-sm bg-white"
                value={draft.grupo_microciclo}
                onChange={(e) => setDraft((d) => ({ ...d, grupo_microciclo: e.target.value }))}
              >
                {GRUPOS.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
              </select>
            </label>
          </div>
          <div>
            <p className="text-[10px] text-depro-gray mb-1">Bloque de edad (multiselección)</p>
            <div className="flex flex-wrap gap-2">
              {BLOQUES_EDAD.map((b) => {
                const on = draft.bloques_edad.includes(b);
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => toggleBloqueDraft(b)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                      on ? "bg-depro-blue text-white border-depro-blue" : "bg-white border-depro-border text-depro-dark"
                    }`}
                  >
                    Bloque {b}
                  </button>
                );
              })}
            </div>
          </div>
          <textarea
            rows={2}
            className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm resize-none"
            placeholder="Explicación de la tarea"
            value={draft.descripcion}
            onChange={(e) => setDraft((d) => ({ ...d, descripcion: e.target.value }))}
          />
          <input
            type="url"
            className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm"
            placeholder="Vídeo de YouTube"
            value={draft.video}
            onChange={(e) => setDraft((d) => ({ ...d, video: e.target.value }))}
          />
          <div className="flex gap-2">
            <button type="button" onClick={handleAddCustom} className="px-4 py-2 rounded-xl bg-depro-blue text-white text-sm font-bold">Guardar</button>
            <button type="button" onClick={() => setAdding(false)} className="px-4 py-2 rounded-xl border border-depro-border text-sm">Cancelar</button>
          </div>
        </div>
      )}

      {NIVELES.map((nivel) => (
        <section key={nivel} className="space-y-4">
          <h2 className="font-bold text-depro-dark text-lg">Nivel {nivel}</h2>
          {GRUPOS.map((g) => {
            const items = byFolder[`${nivel}/${g.id}`] || [];
            return (
              <div key={g.id} className="space-y-2">
                <h3 className="text-sm font-bold text-depro-blue">
                  {g.label}
                  <span className="text-depro-gray font-normal ml-2 text-xs">
                    /calentamiento_con_balon/{nivel}/{g.folder} · {items.length}
                  </span>
                </h3>
                <div className="space-y-2">
                  {items.map((item) => (
                    <TaskRow
                      key={item.id}
                      item={item}
                      override={overrides[item.id]}
                      onExplanationChange={changeExplanation}
                      systemOnly
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      ))}

      {filteredCustom.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-bold text-depro-dark">Tareas añadidas</h2>
          {filteredCustom.map((item) => (
            <TaskRow
              key={item.id}
              item={item}
              override={overrides[item.id]}
              onExplanationChange={changeExplanation}
              onMetaChange={changeMeta}
            />
          ))}
        </section>
      )}
    </div>
  );
}
