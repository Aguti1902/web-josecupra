import { useState } from "react";
import { Save, Minus, Plus, Layers, ChevronDown, ChevronUp } from "lucide-react";
import { getAllTemplates, updateTemplateBlockSlots, PLAYER_TEMPLATES } from "../../lib/planTemplates";
import { SESSION_INTENSITY } from "../../lib/planLoadRules";

const INTENSITY_COLOR = {
  alta: "bg-red-50 text-red-700 border-red-200",
  media: "bg-amber-50 text-amber-800 border-amber-200",
  baja: "bg-green-50 text-green-700 border-green-200",
};

function TemplateCard({ template, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [localSlots, setLocalSlots] = useState(() =>
    template.blocks.map((b) => b.slots)
  );
  const [saved, setSaved] = useState(false);
  const intensityKey = (SESSION_INTENSITY[template.id] || "media").toLowerCase();

  const changeSlot = (idx, delta) => {
    setLocalSlots((prev) => {
      const next = [...prev];
      next[idx] = Math.max(1, Math.min(8, (next[idx] || 1) + delta));
      return next;
    });
    setSaved(false);
  };

  const handleSave = () => {
    localSlots.forEach((slots, i) => updateTemplateBlockSlots(template.id, i, slots));
    onUpdate();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white border border-depro-border rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-depro-gray-light/40 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-depro-blue/10 flex items-center justify-center">
            <Layers size={18} className="text-depro-blue" />
          </div>
          <div>
            <h3 className="font-bold text-depro-dark">{template.id}</h3>
            <p className="text-xs text-depro-gray">{template.duration} · {template.blocks.length} bloques</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg border ${INTENSITY_COLOR[intensityKey]}`}>
            {intensityKey}
          </span>
          {open ? <ChevronUp size={18} className="text-depro-gray" /> : <ChevronDown size={18} className="text-depro-gray" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-depro-border p-5 space-y-3">
          {template.blocks.map((block, i) => (
            <div key={block.label} className="flex items-center justify-between gap-4 py-2 border-b border-depro-border/50 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-depro-dark">{block.label}</p>
                <p className="text-xs text-depro-gray">{block.duration} · {block.tags.slice(0, 3).join(", ")}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button type="button" onClick={() => changeSlot(i, -1)} className="w-8 h-8 rounded-lg border border-depro-border flex items-center justify-center hover:bg-depro-gray-light">
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center font-bold text-depro-dark">{localSlots[i]}</span>
                <button type="button" onClick={() => changeSlot(i, 1)} className="w-8 h-8 rounded-lg border border-depro-border flex items-center justify-center hover:bg-depro-gray-light">
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={handleSave}
            className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-depro-blue text-white text-sm font-semibold hover:bg-depro-blue-dark transition-colors"
          >
            <Save size={15} />
            {saved ? "Guardado" : "Guardar cambios"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState(getAllTemplates);
  const refresh = () => setTemplates(getAllTemplates());

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-depro-dark">Plantillas de sesión</h1>
        <p className="text-depro-gray text-sm mt-0.5">
          Estructuras base del motor de planes (PDF §2.1). Puedes modificar la cantidad de ejercicios por bloque sin alterar la estructura general.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-900">
        <strong>{Object.keys(PLAYER_TEMPLATES).length} plantillas</strong> — Fuerza A/B, Velocidad, Hipertrofia (5 variantes), Resistencia (3 tipos), Prevención, Movilidad y Sesión mínima.
      </div>

      <div className="grid gap-4">
        {templates.map((t) => (
          <TemplateCard key={t.id} template={t} onUpdate={refresh} />
        ))}
      </div>
    </div>
  );
}
