import { useEffect, useMemo, useState } from "react";
import { Plus, Save, Layers, ExternalLink, Trash2, Folder } from "lucide-react";
import {
  CLUB_TASK_FOLDERS,
  folderById,
  loadCustomTasks,
  saveCustomTasks,
  hydrateCustomTasks,
} from "../../data/clubAutoCatalog";

const TIPOS_SESION = ["extensiva", "intensiva", "reactiva"];

function emptyDraft(folderId) {
  const folder = folderById(folderId);
  return {
    nombre: "",
    video: "",
    descripcion: "",
    tipos_sesion: folder ? [...folder.tipos_sesion] : ["extensiva"],
  };
}

function SessionPills({ value, onToggle }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {TIPOS_SESION.map((s) => {
        const on = (value || []).includes(s);
        return (
          <button
            key={s}
            type="button"
            onClick={() => onToggle(s)}
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              on ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-white text-depro-gray border-depro-border"
            }`}
          >
            {s}
          </button>
        );
      })}
    </div>
  );
}

export default function AdminClubTareasPage({ embedded = false } = {}) {
  const [custom, setCustom] = useState(() => loadCustomTasks());
  const [saved, setSaved] = useState(false);
  const [openFolder, setOpenFolder] = useState(CLUB_TASK_FOLDERS[0]?.id || "rondo");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(() => emptyDraft(CLUB_TASK_FOLDERS[0]?.id));

  useEffect(() => {
    hydrateCustomTasks().then((list) => {
      if (Array.isArray(list) && list.length) setCustom(list);
    }).catch(() => {});
  }, []);

  const persist = (next) => {
    saveCustomTasks(next);
    setCustom(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const byFolder = useMemo(() => {
    const map = Object.fromEntries(CLUB_TASK_FOLDERS.map((f) => [f.id, []]));
    for (const t of custom) {
      const id = t.folderId || "rondo";
      if (!map[id]) map[id] = [];
      map[id].push(t);
    }
    return map;
  }, [custom]);

  const folder = folderById(openFolder);

  const toggleDraftSesion = (s) => {
    setDraft((d) => {
      const has = d.tipos_sesion.includes(s);
      const next = has ? d.tipos_sesion.filter((x) => x !== s) : [...d.tipos_sesion, s];
      return { ...d, tipos_sesion: next.length ? next : [s] };
    });
  };

  const handleAdd = () => {
    if (!draft.nombre.trim() || !folder) return;
    const item = {
      id: `custom_task_${Date.now()}`,
      folderId: folder.id,
      tipo_tarea: folder.label,
      carpeta: folder.carpeta,
      nombre: draft.nombre.trim(),
      tipos_sesion: draft.tipos_sesion.length ? draft.tipos_sesion : [...folder.tipos_sesion],
      tipo_sesion: (draft.tipos_sesion[0] || folder.tipos_sesion[0]),
      video: draft.video || "",
      videoUrl: draft.video || "",
      descripcion: draft.descripcion || "",
      custom: true,
      bloques_edad: ["1", "2", "3"],
    };
    persist([item, ...custom]);
    setDraft(emptyDraft(folder.id));
    setAdding(false);
  };

  const changeMeta = (id, patch) => {
    persist(custom.map((t) => (t.id === id ? { ...t, ...patch, videoUrl: patch.video ?? t.videoUrl } : t)));
  };

  const toggleTaskSesion = (id, s) => {
    const item = custom.find((t) => t.id === id);
    if (!item) return;
    const cur = item.tipos_sesion || [item.tipo_sesion].filter(Boolean);
    const has = cur.includes(s);
    const next = has ? cur.filter((x) => x !== s) : [...cur, s];
    changeMeta(id, { tipos_sesion: next.length ? next : [s], tipo_sesion: (next[0] || s) });
  };

  const removeTask = (id) => persist(custom.filter((t) => t.id !== id));

  const selectFolder = (id) => {
    setOpenFolder(id);
    setDraft(emptyDraft(id));
    setAdding(false);
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
              Carpetas vacías. Tú subes las tareas. Las etiquetas de sesión vienen de cada carpeta y se pueden ajustar.
            </p>
          </div>
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl">
              <Save size={13} /> Guardado
            </span>
          )}
        </div>
      )}
      {embedded && saved && (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl">
          <Save size={13} /> Guardado
        </span>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {CLUB_TASK_FOLDERS.map((f) => {
          const count = (byFolder[f.id] || []).length;
          const active = openFolder === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => selectFolder(f.id)}
              className={`text-left rounded-xl border p-3 transition-colors ${
                active ? "border-depro-blue bg-depro-blue-light/40" : "border-depro-border bg-white hover:border-depro-blue/40"
              }`}
            >
              <p className="text-sm font-bold text-depro-dark flex items-center gap-1.5">
                <Folder size={14} /> {f.label}
              </p>
              <p className="text-[11px] text-depro-gray mt-1">{f.nota}</p>
              <p className="text-[10px] font-bold text-depro-blue mt-1.5">
                {count} tarea{count === 1 ? "" : "s"} · {f.tipos_sesion.join(" · ")}
              </p>
            </button>
          );
        })}
      </div>

      {folder && (
        <section className="rounded-2xl border border-depro-border bg-white p-4 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-bold text-depro-dark">{folder.label}</h2>
              <p className="text-xs text-depro-gray mt-0.5">{folder.nota}</p>
              <p className="text-[11px] text-depro-gray mt-1 font-mono">{folder.carpeta}</p>
            </div>
            <button
              type="button"
              onClick={() => { setAdding((v) => !v); setDraft(emptyDraft(folder.id)); }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-depro-blue text-white text-sm font-bold"
            >
              <Plus size={14} /> Añadir tarea
            </button>
          </div>

          {adding && (
            <div className="rounded-xl border border-depro-blue/30 bg-depro-blue-light p-4 space-y-3">
              <input
                className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm bg-white"
                placeholder="Nombre de la tarea"
                value={draft.nombre}
                onChange={(e) => setDraft((d) => ({ ...d, nombre: e.target.value }))}
              />
              <div>
                <p className="text-[10px] text-depro-gray mb-1">Tipos de sesión (por defecto los de la carpeta)</p>
                <SessionPills value={draft.tipos_sesion} onToggle={toggleDraftSesion} />
              </div>
              <textarea
                rows={2}
                className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm resize-none bg-white"
                placeholder="Explicación (opcional)"
                value={draft.descripcion}
                onChange={(e) => setDraft((d) => ({ ...d, descripcion: e.target.value }))}
              />
              <input
                type="url"
                className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm bg-white"
                placeholder="Vídeo de YouTube"
                value={draft.video}
                onChange={(e) => setDraft((d) => ({ ...d, video: e.target.value }))}
              />
              <div className="flex gap-2">
                <button type="button" onClick={handleAdd} className="px-4 py-2 rounded-xl bg-depro-blue text-white text-sm font-bold">Guardar</button>
                <button type="button" onClick={() => setAdding(false)} className="px-4 py-2 rounded-xl border border-depro-border text-sm bg-white">Cancelar</button>
              </div>
            </div>
          )}

          {(byFolder[folder.id] || []).length === 0 && !adding && (
            <p className="text-sm text-depro-gray italic text-center py-6 border border-dashed border-depro-border rounded-xl">
              Carpeta vacía. Añade las tareas tú.
            </p>
          )}

          <div className="space-y-2">
            {(byFolder[folder.id] || []).map((item) => (
              <div key={item.id} className="rounded-xl border border-depro-border p-3 space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <input
                    className="flex-1 min-w-[10rem] text-sm font-semibold text-depro-dark border border-transparent hover:border-depro-border rounded-lg px-2 py-1"
                    value={item.nombre}
                    onChange={(e) => changeMeta(item.id, { nombre: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => removeTask(item.id)}
                    className="p-1.5 rounded-lg border border-depro-border text-depro-gray hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <SessionPills
                  value={item.tipos_sesion || [item.tipo_sesion].filter(Boolean)}
                  onToggle={(s) => toggleTaskSesion(item.id, s)}
                />
                <textarea
                  rows={2}
                  value={item.descripcion || ""}
                  onChange={(e) => changeMeta(item.id, { descripcion: e.target.value })}
                  className="w-full border border-depro-border rounded-lg px-2 py-1.5 text-xs resize-none"
                  placeholder="Explicación"
                />
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={item.video || item.videoUrl || ""}
                    onChange={(e) => changeMeta(item.id, { video: e.target.value })}
                    className="flex-1 border border-depro-border rounded-lg px-2 py-1.5 text-xs"
                    placeholder="YouTube"
                  />
                  {(item.video || item.videoUrl) && (
                    <a href={item.video || item.videoUrl} target="_blank" rel="noreferrer" className="p-1.5 border border-depro-border rounded-lg text-depro-blue">
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
