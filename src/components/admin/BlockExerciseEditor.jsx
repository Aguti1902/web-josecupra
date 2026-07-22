import { Plus, Trash2, PlayCircle, Info } from "lucide-react";
import { emptyExercise, emptySubSession, normalizeBlock } from "../../lib/sessionBlocks";
import {
  emptyGuideItem, getDefaultGuideItems, resolveBlockGuideItems,
} from "../../lib/blockGuideItems";
import { getYouTubeId, youtubeThumbUrl } from "../../lib/youtube";

const SESSION_BLOCK_CONFIG = {
  calentamiento:  { label: "Calentamiento",    color: "#F59E0B" },
  principal:      { label: "Bloque principal", color: "#3B82F6" },
};

export default function BlockExerciseEditor({ blockType, block, onUpdate, sessionFramework = "A" }) {
  const normalized = normalizeBlock({ ...block, type: blockType });
  const subSessions = normalized.subSessions || [emptySubSession("Parte 1")];
  const cfg = SESSION_BLOCK_CONFIG[blockType] || { color: "#3B82F6" };
  const guideItems = resolveBlockGuideItems(block, blockType, sessionFramework);

  const syncSubSessions = (next) => {
    const exercises = next.flatMap((ss) => ss.exercises || []);
    onUpdate({ type: blockType, subSessions: next, exercises, guideItems: block.guideItems ?? guideItems });
  };

  const setGuideItems = (next) => onUpdate({ guideItems: next });

  const updateGuideItem = (gi, field, val) => {
    const next = guideItems.map((item, i) => (i === gi ? { ...item, [field]: val } : item));
    setGuideItems(next);
  };

  const addGuideItem = () => setGuideItems([...guideItems, emptyGuideItem()]);

  const removeGuideItem = (gi) => {
    if (guideItems.length <= 1) return;
    setGuideItems(guideItems.filter((_, i) => i !== gi));
  };

  const resetGuideItems = () => setGuideItems(getDefaultGuideItems(blockType, sessionFramework));

  const updateSub = (si, changes) =>
    syncSubSessions(subSessions.map((ss, i) => (i === si ? { ...ss, ...changes } : ss)));

  const addSub = () =>
    syncSubSessions([...subSessions, emptySubSession(`Parte ${subSessions.length + 1}`)]);

  const removeSub = (si) => {
    if (subSessions.length <= 1) return;
    syncSubSessions(subSessions.filter((_, i) => i !== si));
  };

  const addEx = (si) => {
    const next = subSessions.map((ss, i) =>
      i === si ? { ...ss, exercises: [...(ss.exercises || []), emptyExercise()] } : ss
    );
    syncSubSessions(next);
  };

  const removeEx = (si, ei) => {
    const next = subSessions.map((ss, i) =>
      i === si ? { ...ss, exercises: (ss.exercises || []).filter((_, j) => j !== ei) } : ss
    );
    syncSubSessions(next);
  };

  const updateEx = (si, ei, field, val) => {
    const next = subSessions.map((ss, i) =>
      i === si
        ? { ...ss, exercises: (ss.exercises || []).map((ex, j) => (j === ei ? { ...ex, [field]: val } : ex)) }
        : ss
    );
    syncSubSessions(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label className="text-xs font-bold text-depro-gray uppercase tracking-wide w-20 flex-shrink-0">Duración</label>
        <input className="border border-depro-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-depro-blue/30 w-28"
          placeholder="10 min" value={block.duration || ""}
          onChange={(e) => onUpdate({ duration: e.target.value })} />
      </div>

      {blockType === "calentamiento" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-2.5 text-xs text-amber-900">
          <strong className="font-bold">Vídeo YouTube:</strong> ponlo en cada ejercicio de las sub-sesiones (abajo), igual que en Principal. Así se ve en la sesión del club.
        </div>
      )}

      <div className="rounded-xl border border-depro-border p-3 space-y-2 bg-depro-gray-light/30">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Info size={12} className="text-depro-blue" />
            <span className="text-xs font-bold text-depro-dark">Panel informativo (vista entrenador)</span>
          </div>
          <button type="button" onClick={resetGuideItems}
            className="text-[10px] font-bold text-depro-gray hover:text-depro-blue transition-colors">
            Restaurar
          </button>
        </div>
        <p className="text-[10px] text-depro-gray leading-tight">
          Textos de la columna derecha en calentamiento/principal. El entrenador los verá tal cual los escribas aquí.
        </p>
        {guideItems.map((item, gi) => (
          <div key={item.id || gi} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-start">
            <input className="border border-depro-border rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
              placeholder="Etiqueta" value={item.label || ""}
              onChange={(e) => updateGuideItem(gi, "label", e.target.value)} />
            <input className="border border-depro-border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
              placeholder="Descripción" value={item.text || ""}
              onChange={(e) => updateGuideItem(gi, "text", e.target.value)} />
            <button type="button" onClick={() => removeGuideItem(gi)} className="text-depro-gray hover:text-red-500 p-1 mt-0.5">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        <button type="button" onClick={addGuideItem}
          className="flex items-center gap-1 text-xs font-bold text-depro-blue hover:underline">
          <Plus size={11} /> Añadir punto
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-depro-gray uppercase tracking-wide">
          Sub-sesiones · {subSessions.length}
        </span>
        <button type="button" onClick={addSub}
          className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border transition-colors"
          style={{ color: cfg.color, borderColor: cfg.color + "40" }}>
          <Plus size={11} /> Añadir sub-sesión
        </button>
      </div>

      {subSessions.map((sub, si) => (
        <div key={sub.id || si} className="border border-depro-border rounded-xl p-3 space-y-3 bg-depro-gray-light/20">
          <div className="flex items-center gap-2">
            <input
              className="flex-1 border border-depro-border rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
              value={sub.title || ""}
              placeholder={`Parte ${si + 1}`}
              onChange={(e) => updateSub(si, { title: e.target.value })}
            />
            {subSessions.length > 1 && (
              <button type="button" onClick={() => removeSub(si)} className="text-depro-gray hover:text-red-500 p-1">
                <Trash2 size={14} />
              </button>
            )}
            <button type="button" onClick={() => addEx(si)}
              className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg border"
              style={{ color: cfg.color, borderColor: cfg.color + "40" }}>
              <Plus size={11} /> Ejercicio
            </button>
          </div>

          {(sub.exercises || []).length === 0 && (
            <p className="text-xs text-depro-gray italic text-center py-3">Sin ejercicios en esta sub-sesión</p>
          )}

          {(sub.exercises || []).map((ex, ei) => {
            const ytId = getYouTubeId(ex.videoUrl);
            return (
              <div key={ex.id || `${si}-${ei}`} className="border border-depro-border rounded-xl overflow-hidden bg-white">
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-black flex-shrink-0"
                      style={{ backgroundColor: cfg.color + "18", color: cfg.color }}>{ei + 1}</div>
                    <input className="flex-1 border border-depro-border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                      placeholder="Nombre del ejercicio" value={ex.name || ""}
                      onChange={(e) => updateEx(si, ei, "name", e.target.value)} />
                    <button type="button" onClick={() => removeEx(si, ei)} className="text-depro-gray hover:text-red-500 p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { field: "sets", placeholder: "Series", label: "Series" },
                      { field: "reps", placeholder: "10-12", label: "Reps/T." },
                      { field: "rest", placeholder: "60s", label: "Descanso" },
                      { field: "duration", placeholder: "40\"", label: "Duración" },
                    ].map(({ field, placeholder, label }) => (
                      <div key={field}>
                        <div className="text-[9px] font-bold text-depro-gray uppercase tracking-wide mb-0.5">{label}</div>
                        <input className="w-full border border-depro-border rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                          placeholder={placeholder} value={ex[field] || ""}
                          onChange={(e) => updateEx(si, ei, field, e.target.value)} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="px-3 pb-3 flex items-center gap-2 border-t border-depro-border/50 pt-2">
                  <PlayCircle size={13} className={ytId ? "text-red-500" : "text-depro-gray"} />
                  <input className="flex-1 border border-depro-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                    placeholder="URL YouTube (opcional)" value={ex.videoUrl || ""}
                    onChange={(e) => updateEx(si, ei, "videoUrl", e.target.value)} />
                  {ytId && (
                    <img src={youtubeThumbUrl(ytId, "default")} alt="" className="w-14 h-10 rounded-lg object-cover border border-depro-border flex-shrink-0" />
                  )}
                </div>
                <div className="px-3 pb-3 space-y-2 border-t border-depro-border/50 pt-2">
                  <input className="w-full border border-depro-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                    placeholder="Descripción breve (opcional)" value={ex.description || ""}
                    onChange={(e) => updateEx(si, ei, "description", e.target.value)} />
                  <textarea rows={2} className="w-full border border-depro-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-depro-blue/30 resize-none"
                    placeholder="Consejos técnicos: una línea por consejo" value={ex.tips || ""}
                    onChange={(e) => updateEx(si, ei, "tips", e.target.value)} />
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
