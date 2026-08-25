import { useMemo, useState } from "react";
import { Save, Minus, Plus, Layers, ChevronDown, ChevronUp } from "lucide-react";
import { getAllTemplates, updateTemplateBlockSlots, updateTemplateBlockVolume, PLAYER_TEMPLATES, countBlockSlots, isV2Template } from "../../lib/planTemplates";
import { SESSION_INTENSITY } from "../../lib/planLoadRules";

const INTENSITY_COLOR = {
  alta: "bg-red-50 text-red-700 border-red-200",
  media: "bg-amber-50 text-amber-800 border-amber-200",
  baja: "bg-green-50 text-green-700 border-green-200",
};

function formatSlot(s) {
  if (!s || typeof s !== "object") return "?";
  const parts = [];
  if (s.rol) parts.push(`rol=${s.rol}`);
  if (s.objetivo) parts.push(`obj=${Array.isArray(s.objetivo) ? s.objetivo.join("|") : s.objetivo}`);
  if (s.segmento) parts.push(`seg=${s.segmento}`);
  if (s.patron) parts.push(`pat=${Array.isArray(s.patron) ? s.patron.join("|") : s.patron}`);
  if (s.patronOr) parts.push(`patOr=${[].concat(s.patronOr).join("|")}`);
  if (s.grupo_muscular) parts.push(`mus=${[].concat(s.grupo_muscular).join("|")}`);
  if (s.pool || s.poolPattern || s.poolFamily) {
    parts.push(s.pool || s.poolPattern || s.poolFamily);
  }
  if (s.qty > 1) parts.push(`×${s.qty}`);
  return parts.join(" · ") || s.description || "?";
}

function slotSummary(block) {
  if (Array.isArray(block.slots) && typeof block.slots[0] === "object") {
    return block.slots.map(formatSlot).join("  |  ");
  }
  if (Array.isArray(block.slots)) {
    return block.slots
      .map((s) => `${s.pool || s.poolPattern || s.poolFamily || "?"}${s.qty > 1 ? `×${s.qty}` : ""}`)
      .join(" · ");
  }
  return (block.tags || []).slice(0, 3).join(", ");
}

const CANONICAL_IDS = new Set([
  "Fuerza Inferior", "Fuerza Superior", "Fuerza Full",
  "Velocidad", "Hipertrofia Full", "Hipertrofia Pierna", "Hipertrofia Torso",
  "Prevención", "Movilidad",
  "Resistencia aeróbica", "Resistencia umbral", "Resistencia anaeróbica",
  "Sesión mínima", "Pliometría", "Isométricos",
]);

function firstVolume(block) {
  const slots = Array.isArray(block?.slots) ? block.slots : [];
  const vol = slots.find((s) => s?.volume)?.volume || {};
  return {
    sets: vol.sets != null ? String(vol.sets) : "",
    reps: vol.reps != null ? String(vol.reps) : "",
    rest: vol.rest != null ? String(vol.rest) : "",
  };
}

function TemplateCard({ template, onUpdate }) {
  const v2 = isV2Template(template);
  const [open, setOpen] = useState(false);
  const [localSlots, setLocalSlots] = useState(() =>
    template.blocks.map((b) => (v2 ? countBlockSlots(b) : b.slots))
  );
  const [localVolume, setLocalVolume] = useState(() => template.blocks.map(firstVolume));
  const [saved, setSaved] = useState(false);
  const intensityKey = (
    SESSION_INTENSITY[template.id] || template.intensityLevel || template.intensity || "media"
  ).toLowerCase();

  const changeSlot = (idx, delta) => {
    setLocalSlots((prev) => {
      const next = [...prev];
      next[idx] = Math.max(1, Math.min(12, (next[idx] || 1) + delta));
      return next;
    });
    setSaved(false);
  };

  const changeVolume = (idx, field, value) => {
    setLocalVolume((prev) => {
      const next = [...prev];
      next[idx] = { ...(next[idx] || { sets: "", reps: "", rest: "" }), [field]: value };
      return next;
    });
    setSaved(false);
  };

  const handleSave = () => {
    localSlots.forEach((slots, i) => updateTemplateBlockSlots(template.id, i, slots));
    if (v2) {
      localVolume.forEach((vol, i) => updateTemplateBlockVolume(template.id, i, vol));
    }
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
            <h3 className="font-bold text-depro-dark">{template.title || template.id}</h3>
            <p className="text-xs text-depro-gray">
              {template.templateCode ? `${template.templateCode} · ` : ""}
              {template.duration} · {template.blocks.length} bloques
              {template.objective ? ` · ${template.objective}` : ""}
              {v2 ? " · slots multi-eje" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg border ${INTENSITY_COLOR[intensityKey] || INTENSITY_COLOR.media}`}>
            {intensityKey}
          </span>
          {open ? <ChevronUp size={18} className="text-depro-gray" /> : <ChevronDown size={18} className="text-depro-gray" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-depro-border p-5 space-y-3">
          {template.variants && (
            <div className="rounded-xl bg-depro-gray-light/60 px-3 py-2 text-xs text-depro-gray">
              <strong className="text-depro-dark">Variantes resistencia:</strong>{" "}
              {Object.entries(template.variants).map(([k, v]) => `${k} (${v.label})`).join(" · ")}
            </div>
          )}
          {template.blocks.map((block, i) => (
            <div key={`${block.label}-${i}`} className="flex items-start justify-between gap-4 py-2 border-b border-depro-border/50 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-depro-dark">{block.label}</p>
                <p className="text-xs text-depro-gray whitespace-normal break-words">
                  {block.duration} · {slotSummary(block)}
                </p>
                {v2 && (
                  <div className="grid grid-cols-3 gap-2 mt-2 max-w-md">
                    <label className="text-[10px] font-bold text-depro-gray uppercase tracking-wide">
                      Series
                      <input
                        className="mt-0.5 w-full border border-depro-border rounded-lg px-2 py-1.5 text-xs text-depro-dark font-semibold"
                        placeholder="3"
                        value={localVolume[i]?.sets || ""}
                        onChange={(e) => changeVolume(i, "sets", e.target.value)}
                      />
                    </label>
                    <label className="text-[10px] font-bold text-depro-gray uppercase tracking-wide">
                      Reps / rango
                      <input
                        className="mt-0.5 w-full border border-depro-border rounded-lg px-2 py-1.5 text-xs text-depro-dark font-semibold"
                        placeholder="4-6"
                        value={localVolume[i]?.reps || ""}
                        onChange={(e) => changeVolume(i, "reps", e.target.value)}
                      />
                    </label>
                    <label className="text-[10px] font-bold text-depro-gray uppercase tracking-wide">
                      Descanso
                      <input
                        className="mt-0.5 w-full border border-depro-border rounded-lg px-2 py-1.5 text-xs text-depro-dark font-semibold"
                        placeholder="3 min"
                        value={localVolume[i]?.rest || ""}
                        onChange={(e) => changeVolume(i, "rest", e.target.value)}
                      />
                    </label>
                  </div>
                )}
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
          <p className="text-xs text-depro-gray text-center pt-1">
            Ajusta el nº de ejercicios, series, repeticiones (p. ej. 4-6) y descansos (p. ej. 3 min). Vacío = según nivel del jugador.
          </p>
        </div>
      )}
    </div>
  );
}

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState(getAllTemplates);
  const refresh = () => setTemplates(getAllTemplates());

  const { canonical, aliases } = useMemo(() => {
    const can = [];
    const als = [];
    for (const t of templates) {
      if (CANONICAL_IDS.has(t.id)) can.push(t);
      else als.push(t);
    }
    return { canonical: can, aliases: als };
  }, [templates]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-depro-dark">Plantillas de sesión</h1>
        <p className="text-depro-gray text-sm mt-0.5">
          Plantillas F_* con slots etiquetados (rol · segmento · patrón · grupo muscular). El motor las rellena con filtrado AND.
        </p>
      </div>

      <div className="bg-depro-blue/5 border border-depro-blue/20 rounded-xl px-4 py-3 text-sm text-depro-dark">
        <strong>{canonical.length} plantillas canónicas</strong>
        {" — "}
        Fuerza Inferior/Superior/Full · Velocidad · Hipertrofia Full/Pierna/Torso · Prevención · Movilidad · Resistencia (aeróbica/umbral/anaeróbica con 3 variantes).
        {aliases.length > 0 && (
          <span className="text-depro-gray"> · {aliases.length} aliases legacy (Fuerza A/B, Push/Pull…)</span>
        )}
      </div>

      <div className="grid gap-4">
        {canonical.map((t) => (
          <TemplateCard key={t.id} template={t} onUpdate={refresh} />
        ))}
      </div>

      {aliases.length > 0 && (
        <details className="rounded-2xl border border-depro-border bg-white p-4">
          <summary className="cursor-pointer font-bold text-depro-dark text-sm">
            Aliases legacy ({aliases.length}) — compatibilidad con nombres antiguos
          </summary>
          <div className="grid gap-4 mt-4">
            {aliases.map((t) => (
              <TemplateCard key={t.id} template={t} onUpdate={refresh} />
            ))}
          </div>
        </details>
      )}

      <p className="text-xs text-depro-gray">
        Total en PLAYER_TEMPLATES: {Object.keys(PLAYER_TEMPLATES).length}
      </p>
    </div>
  );
}
