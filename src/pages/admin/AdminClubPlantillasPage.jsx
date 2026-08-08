import { useMemo, useState } from "react";
import { Layers, Minus, Plus, RotateCcw } from "lucide-react";
import {
  CLUB_AUTO_PROTOCOL_TEMPLATES,
  PROTOCOL_DAY_META,
} from "../../lib/clubAuto/clubAutoTemplates";

const STORAGE_KEY = "depro_club_template_overrides";

const TEMPLATE_ORDER = ["campo_A", "campo_B", "campo_C", "gym_A", "gym_B", "gym_C"];

function readOverrides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeOverrides(value) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

function TemplateCard({ templateId, template, qtyBySlot, onChangeQty }) {
  const meta = PROTOCOL_DAY_META[template.protocolo] || {};
  const slots = template.slots || [];

  return (
    <div className="bg-white border border-depro-border rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-depro-border">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-depro-blue">
              {template.entorno === "gym" ? "Gym" : "Campo"} {template.protocolo}
            </p>
            <h3 className="font-bold text-depro-dark mt-0.5">{template.title}</h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-depro-blue/10 text-depro-blue">
              tipo · {template.entorno}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              nivel · {template.protocolo}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800">
              día · {meta.grupoMicrociclo || meta.label || "—"}
            </span>
          </div>
        </div>
        <p className="text-xs text-depro-gray mt-2">
          <strong>Formato:</strong> {template.format}
        </p>
        {meta.label && (
          <p className="text-xs text-depro-gray mt-1">
            <strong>Día microciclo:</strong> {meta.label} ({meta.intensidadDia})
          </p>
        )}
      </div>

      <div className="p-4 space-y-2">
        <p className="text-[11px] font-black uppercase tracking-wide text-depro-gray mb-1">
          6 slots · cantidad de ejercicios
        </p>
        {slots.map((slot) => {
          const qty = qtyBySlot[slot.slot] ?? 1;
          return (
            <div
              key={slot.slot}
              className="flex items-center justify-between gap-3 rounded-xl border border-depro-border px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-depro-dark truncate">{slot.label}</p>
                <p className="text-[11px] text-depro-gray font-mono">{slot.slot}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onChangeQty(templateId, slot.slot, -1)}
                  className="p-1.5 rounded-lg border border-depro-border text-depro-gray hover:border-depro-blue hover:text-depro-blue"
                  aria-label="Reducir"
                >
                  <Minus size={14} />
                </button>
                <span className="w-7 text-center text-sm font-bold text-depro-dark">{qty}</span>
                <button
                  type="button"
                  onClick={() => onChangeQty(templateId, slot.slot, 1)}
                  className="p-1.5 rounded-lg border border-depro-border text-depro-gray hover:border-depro-blue hover:text-depro-blue"
                  aria-label="Aumentar"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminClubPlantillasPage() {
  const [overrides, setOverrides] = useState(() => readOverrides());

  const templates = useMemo(
    () => TEMPLATE_ORDER.map((id) => ({ id, template: CLUB_AUTO_PROTOCOL_TEMPLATES[id] })).filter((t) => t.template),
    []
  );

  const changeQty = (templateId, slotKey, delta) => {
    setOverrides((prev) => {
      const next = { ...prev };
      const block = { ...(next[templateId] || {}) };
      const current = block[slotKey] ?? 1;
      block[slotKey] = Math.max(1, Math.min(6, current + delta));
      next[templateId] = block;
      writeOverrides(next);
      return next;
    });
  };

  const resetOverrides = () => {
    localStorage.removeItem(STORAGE_KEY);
    setOverrides({});
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-depro-dark flex items-center gap-2">
            <Layers size={22} className="text-depro-blue" />
            Plantillas club auto
          </h1>
          <p className="text-sm text-depro-gray mt-1">
            Protocolos Campo/Gym × A/B/C. Ajusta la cantidad de ejercicios por slot (guardado local).
          </p>
        </div>
        <button
          type="button"
          onClick={resetOverrides}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-depro-border text-xs font-semibold text-depro-dark hover:bg-depro-gray-light"
        >
          <RotateCcw size={14} />
          Restablecer cantidades
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {templates.map(({ id, template }) => (
          <TemplateCard
            key={id}
            templateId={id}
            template={template}
            qtyBySlot={overrides[id] || {}}
            onChangeQty={changeQty}
          />
        ))}
      </div>
    </div>
  );
}
