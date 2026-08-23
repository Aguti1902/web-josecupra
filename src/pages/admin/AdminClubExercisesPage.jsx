import { useMemo, useState } from "react";
import { Dumbbell, Search, X } from "lucide-react";
import { getClubExerciseCatalog, clubSlotLabel, SLOT_RULES } from "../../lib/clubAuto/clubExerciseCatalog";

export default function AdminClubExercisesPage() {
  const [search, setSearch] = useState("");
  const [slotFilter, setSlotFilter] = useState("");

  const catalog = useMemo(() => getClubExerciseCatalog(), []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return catalog.filter((ex) => {
      if (slotFilter && !ex.clubTags?.club_slot?.includes(slotFilter)) return false;
      if (q && !String(ex.nombre || "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [catalog, search, slotFilter]);

  const tagged = catalog.filter((ex) => ex.clubSlots.length).length;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-bold text-depro-dark flex items-center gap-2">
          <Dumbbell size={18} className="text-depro-blue" />
          Ejercicios (versión club)
        </h2>
        <p className="text-sm text-depro-gray mt-1">
          Mismos ejercicios que las planificaciones individuales, con etiquetas de plantilla club
          (movilidad de cadera, tobillo/bisagra, activación glúteo, etc.).
          {` ${tagged} de ${catalog.length} con al menos una etiqueta de slot.`}
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

      <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
        {filtered.map((ex) => (
          <div key={ex.id} className="rounded-xl border border-depro-border p-3">
            <p className="text-sm font-semibold text-depro-dark">{ex.nombre}</p>
            <p className="text-[11px] text-depro-gray mt-0.5">
              {ex.carpeta} · {(ex.etiquetas?.material || []).join(", ") || "sin material"}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {ex.clubSlots.length ? ex.clubSlots.map((s) => (
                <span key={s.id} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-depro-blue/10 text-depro-blue border border-depro-blue/20">
                  {s.label}
                </span>
              )) : (
                <span className="text-[10px] text-depro-gray">Sin slot de plantilla</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { clubSlotLabel };
