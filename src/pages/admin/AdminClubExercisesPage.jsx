import { useMemo, useState } from "react";
import { Dumbbell, Search, X, ChevronDown, ChevronUp, Info } from "lucide-react";
import {
  getClubExerciseCatalog,
  clubSlotLabel,
  SLOT_RULES,
  protocolsUsingClubSlot,
  AGE_BLOCK_LABELS,
} from "../../lib/clubAuto/clubExerciseCatalog";

export default function AdminClubExercisesPage({ standalone = false }) {
  const [search, setSearch] = useState("");
  const [slotFilter, setSlotFilter] = useState("");
  const [collapsed, setCollapsed] = useState({});

  const catalog = useMemo(() => getClubExerciseCatalog(), []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return catalog.filter((ex) => {
      if (slotFilter && !ex.clubTags?.club_slot?.includes(slotFilter)) return false;
      if (q && !String(ex.nombre || "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [catalog, search, slotFilter]);

  const grouped = useMemo(() => {
    const map = {};
    SLOT_RULES.forEach((r) => { map[r.slot] = []; });
    const untagged = [];
    for (const ex of filtered) {
      if (!ex.clubSlots.length) {
        untagged.push(ex);
        continue;
      }
      const slots = slotFilter
        ? ex.clubSlots.filter((s) => s.id === slotFilter)
        : ex.clubSlots;
      for (const s of slots) {
        if (!map[s.id]) map[s.id] = [];
        map[s.id].push(ex);
      }
    }
    return { map, untagged };
  }, [filtered, slotFilter]);

  const tagged = catalog.filter((ex) => ex.clubSlots.length).length;
  const toggleCollapsed = (key) => setCollapsed((c) => ({ ...c, [key]: !c[key] }));

  return (
    <div className="space-y-4">
      {!standalone && (
        <div>
          <h2 className="font-bold text-depro-dark flex items-center gap-2">
            <Dumbbell size={18} className="text-depro-blue" />
            Catálogo de ejercicios (clubs)
          </h2>
          <p className="text-sm text-depro-gray mt-1">
            Mismos ejercicios que las planificaciones individuales, etiquetados por slot de plantilla
            para que el motor automático sepa dónde colocarlos.
            {` ${tagged} de ${catalog.length} con al menos una etiqueta.`}
          </p>
        </div>
      )}

      {standalone && (
        <p className="text-sm text-depro-gray">
          {tagged} de {catalog.length} ejercicios con etiqueta de plantilla.
          Niveles de edad: {Object.values(AGE_BLOCK_LABELS).join(" · ")}.
        </p>
      )}

      <div className="flex items-start gap-3 bg-depro-blue-light/30 border border-depro-blue/20 rounded-2xl px-4 py-3">
        <Info size={16} className="text-depro-blue flex-shrink-0 mt-0.5" />
        <p className="text-xs text-depro-dark/70">
          Cada grupo es un <strong>slot de plantilla</strong> (no «Bloque 1/2/3»).
          Las etiquetas Campo/Gym A·B·C indican en qué protocolo automático entra el ejercicio:
          A regenerativo, B carga/fuerza, C prepartido. Los niveles de edad son{" "}
          <strong>A · 9–12 años</strong>, <strong>B · 12–15 años</strong> y <strong>C · 16+ años</strong>.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-depro-gray" />
          <input
            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-depro-border text-sm"
            placeholder="Buscar ejercicio…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-depro-gray">
              <X size={13} />
            </button>
          )}
        </div>
        <select
          value={slotFilter}
          onChange={(e) => setSlotFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-depro-border text-sm bg-white"
        >
          <option value="">Todos los slots de plantilla</option>
          {SLOT_RULES.map((r) => (
            <option key={r.slot} value={r.slot}>{r.label}</option>
          ))}
        </select>
      </div>

      <p className="text-xs text-depro-gray">{filtered.length} ejercicios</p>

      <div className="space-y-3">
        {SLOT_RULES.map((rule) => {
          const exercises = grouped.map[rule.slot] || [];
          if (!exercises.length) return null;
          const usedIn = protocolsUsingClubSlot(rule.slot);
          const isCollapsed = collapsed[rule.slot];
          return (
            <div key={rule.slot} className="bg-white rounded-2xl border border-depro-border overflow-hidden">
              <button
                type="button"
                onClick={() => toggleCollapsed(rule.slot)}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-black text-depro-dark">{rule.label}</p>
                  <p className="text-[11px] text-depro-gray mt-0.5">
                    {exercises.length} ejercicios
                    {usedIn.length ? ` · plantillas: ${usedIn.map((p) => p.short).join(", ")}` : ""}
                  </p>
                  {usedIn.length > 0 && (
                    <p className="text-[11px] text-depro-gray/80 mt-0.5 truncate">
                      {usedIn.map((p) => p.title).join(" · ")}
                    </p>
                  )}
                </div>
                {isCollapsed ? <ChevronDown size={16} className="text-depro-gray shrink-0" /> : <ChevronUp size={16} className="text-depro-gray shrink-0" />}
              </button>
              {!isCollapsed && (
                <div className="border-t border-depro-border/50 divide-y divide-depro-border/30">
                  {exercises.map((ex) => (
                    <div key={`${rule.slot}-${ex.id}`} className="px-4 py-3">
                      <p className="text-sm font-semibold text-depro-dark">{ex.nombre}</p>
                      <p className="text-[11px] text-depro-gray mt-0.5">
                        {ex.carpeta} · {(ex.etiquetas?.material || []).join(", ") || "sin material"}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {ex.clubSlots.map((s) => (
                          <span
                            key={s.id}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              s.id === rule.slot
                                ? "bg-depro-blue/10 text-depro-blue border-depro-blue/20"
                                : "bg-slate-50 text-slate-600 border-slate-200"
                            }`}
                          >
                            {s.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {!slotFilter && grouped.untagged.length > 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-depro-border overflow-hidden">
            <div className="px-4 py-3">
              <p className="font-bold text-depro-dark">Sin slot de plantilla</p>
              <p className="text-[11px] text-depro-gray">{grouped.untagged.length} ejercicios aún no etiquetados para el motor club</p>
            </div>
            <div className="border-t border-depro-border/50 divide-y divide-depro-border/30 max-h-64 overflow-y-auto">
              {grouped.untagged.map((ex) => (
                <div key={ex.id} className="px-4 py-2.5">
                  <p className="text-sm text-depro-dark">{ex.nombre}</p>
                  <p className="text-[11px] text-depro-gray">{ex.carpeta}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { clubSlotLabel };
