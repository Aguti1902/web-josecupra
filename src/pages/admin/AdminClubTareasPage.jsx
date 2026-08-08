import { useMemo, useState } from "react";
import { Plus, Save, Layers } from "lucide-react";
import { CLUB_MAIN_TASKS } from "../../data/clubAutoCatalog";

const STORAGE_KEY = "depro_club_task_overrides";
const CUSTOM_KEY = "depro_club_custom_tasks";
const TARGET = 45;

const NIVELES = ["A", "B", "C"];
const GRUPOS = [
  { id: "regenerativo", label: "Grupo 1 · regenerativo / baja carga", folder: "grupo_1_regenerativo" },
  { id: "carga_alta", label: "Grupo 2 · carga alta", folder: "grupo_2_carga_alta" },
  { id: "prepartido", label: "Grupo 3 · prepartido / velocidad corta", folder: "grupo_3_prepartido" },
];

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

function TaskRow({ item, override, onExplanationChange, systemOnly }) {
  const descripcion = override?.descripcion ?? item.descripcion ?? "";
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
    </div>
  );
}

export default function AdminClubTareasPage() {
  const [overrides, setOverrides] = useState(() => readJson(STORAGE_KEY, {}));
  const [custom, setCustom] = useState(() => readJson(CUSTOM_KEY, []));
  const [saved, setSaved] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({
    nombre: "",
    nivel: "B",
    grupo_microciclo: "regenerativo",
    descripcion: "",
  });

  const systemCount = CLUB_MAIN_TASKS.length;
  const totalCount = systemCount + custom.length;
  const missing = Math.max(0, TARGET - totalCount);

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

  const handleAddCustom = () => {
    if (!draft.nombre.trim()) return;
    const id = `custom_task_${Date.now()}`;
    const item = {
      id,
      carpeta: `/tareas/${draft.nivel}/grupo_${draft.grupo_microciclo === "regenerativo" ? "1_regenerativo" : draft.grupo_microciclo === "carga_alta" ? "2_carga_alta" : "3_prepartido"}`,
      nombre: draft.nombre.trim(),
      nivel: draft.nivel,
      grupo_microciclo: draft.grupo_microciclo,
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
    setDraft({ nombre: "", nivel: "B", grupo_microciclo: "regenerativo", descripcion: "" });
    setAdding(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-depro-dark flex items-center gap-2">
            <Layers size={22} className="text-depro-blue" />
            Tareas club auto
          </h1>
          <p className="text-sm text-depro-gray mt-1">
            Estructura 3×3×5 = 45 tareas base. En tareas del sistema solo puedes editar la explicación.
          </p>
        </div>
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl">
            <Save size={13} /> Guardado
          </span>
        )}
      </div>

      <div className="rounded-2xl border border-depro-border bg-white p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="text-sm text-depro-dark">
          <strong>{totalCount}</strong> / {TARGET} tareas
          {missing > 0 ? (
            <span className="text-amber-700 ml-2">· Faltan {missing} para el total inicial de 45</span>
          ) : (
            <span className="text-green-700 ml-2">· Total inicial completo</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-depro-blue text-white text-sm font-bold"
        >
          <Plus size={14} /> Añadir tarea
        </button>
      </div>

      {adding && (
        <div className="rounded-2xl border border-depro-blue/30 bg-depro-blue-light p-4 space-y-3">
          <h3 className="font-bold text-depro-dark text-sm">Nueva tarea (extra)</h3>
          <input
            className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm"
            placeholder="Nombre de la tarea"
            value={draft.nombre}
            onChange={(e) => setDraft((d) => ({ ...d, nombre: e.target.value }))}
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <select
              className="border border-depro-border rounded-lg px-3 py-2 text-sm bg-white"
              value={draft.nivel}
              onChange={(e) => setDraft((d) => ({ ...d, nivel: e.target.value }))}
            >
              {NIVELES.map((n) => <option key={n} value={n}>Nivel {n}</option>)}
            </select>
            <select
              className="border border-depro-border rounded-lg px-3 py-2 text-sm bg-white"
              value={draft.grupo_microciclo}
              onChange={(e) => setDraft((d) => ({ ...d, grupo_microciclo: e.target.value }))}
            >
              {GRUPOS.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
            </select>
          </div>
          <textarea
            rows={2}
            className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm resize-none"
            placeholder="Explicación"
            value={draft.descripcion}
            onChange={(e) => setDraft((d) => ({ ...d, descripcion: e.target.value }))}
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
                    /tareas/{nivel}/{g.folder} · {items.length}/5
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

      {custom.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-bold text-depro-dark">Tareas añadidas</h2>
          {custom.map((item) => (
            <TaskRow
              key={item.id}
              item={item}
              override={overrides[item.id]}
              onExplanationChange={changeExplanation}
            />
          ))}
        </section>
      )}
    </div>
  );
}
