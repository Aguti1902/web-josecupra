import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Search, X, AlertCircle } from "lucide-react";
import {
  listAssignablePlayers,
  listAssignableClubTargets,
  assignPlanToPlayer,
  assignClubAutoPlan,
} from "../../lib/adminAssignPlan";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addWeeksISO(iso, weeks) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + weeks * 7);
  return d.toISOString().slice(0, 10);
}

/**
 * Modal reutilizable para asignar planes (jugador o club auto).
 * mode: "player" | "club"
 */
export default function AssignPlanModal({
  open,
  onClose,
  onAssigned,
  mode = "player",
  planPreview = null,
  profile = null,
  questionnaire = null,
  defaultCycles = 1,
}) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState("");
  const [cycles, setCycles] = useState(Math.min(6, Math.max(1, Number(defaultCycles) || 1)));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const targets = useMemo(() => {
    if (mode === "club") return listAssignableClubTargets();
    return listAssignablePlayers();
  }, [mode, open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return targets;
    return targets.filter((t) =>
      [t.name, t.email, t.id, t.kind].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [targets, query]);

  const selected = targets.find((t) => t.id === selectedId) || null;

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setSelectedId("");
    setStartDate(todayISO());
    setCycles(Math.min(6, Math.max(1, Number(defaultCycles) || 1)));
    setError(null);
    setSuccess(null);
    setLoading(false);
  }, [open, defaultCycles, mode]);

  useEffect(() => {
    if (!startDate) return;
    const n = Math.min(6, Math.max(1, Number(cycles) || 1));
    setEndDate(addWeeksISO(startDate, n * 4));
  }, [startDate, cycles]);

  if (!open) return null;

  const handleAssign = () => {
    setError(null);
    setSuccess(null);
    if (!selectedId) {
      setError("Selecciona un destino.");
      return;
    }
    setLoading(true);
    try {
      const n = Math.min(6, Math.max(1, Number(cycles) || 1));
      let payload;
      if (mode === "club") {
        if (!questionnaire) throw new Error("Cuestionario requerido para club auto");
        payload = assignClubAutoPlan({
          targetId: selected.id,
          kind: selected.kind,
          clubId: selected.clubId,
          teamId: selected.teamId,
          questionnaire,
          startDate,
          endDate,
          cycles: n,
        });
      } else {
        payload = assignPlanToPlayer({
          userId: selected.id,
          plan: planPreview || null,
          profile: profile || null,
          startDate,
          endDate,
          cycles: n,
        });
      }
      setSuccess(
        mode === "club"
          ? `Plan club auto asignado a ${selected.name} (${n} ciclo${n > 1 ? "s" : ""} · ${n * 4} semanas).`
          : `Plan asignado a ${selected.name} (${n} ciclo${n > 1 ? "s" : ""} · ${n * 4} semanas).`
      );
      onAssigned?.(payload);
    } catch (e) {
      setError(e?.message || "No se pudo asignar el plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-depro w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-depro-border">
          <div>
            <h2 className="font-bold text-depro-dark text-lg">Asignar plan</h2>
            <p className="text-xs text-depro-gray mt-0.5">
              {mode === "club" ? "Motor club automático → club / equipo / entrenador" : "Plan individual → jugador"}
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-depro-gray-light text-depro-gray">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-depro-dark mb-1">
              {mode === "club" ? "Destino" : "Jugador"}
            </label>
            <div className="relative mb-2">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-depro-gray" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre o email…"
                className="w-full border border-depro-border rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
              />
            </div>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full border border-depro-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30 bg-white"
            >
              <option value="">— Seleccionar —</option>
              {filtered.map((t) => (
                <option key={t.id} value={t.id}>
                  {mode === "club"
                    ? `${t.name}${t.kind ? ` (${t.kind})` : ""}${t.email ? ` · ${t.email}` : ""}`
                    : `${t.name}${t.email ? ` · ${t.email}` : ""}`}
                </option>
              ))}
            </select>
            {filtered.length === 0 && (
              <p className="text-xs text-amber-700 mt-1.5">No hay destinos que coincidan con la búsqueda.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-depro-dark mb-1">Fecha inicio</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-depro-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-depro-dark mb-1">Fecha fin</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-depro-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-depro-dark mb-1">
              Ciclos <span className="text-depro-gray font-normal">(1–6 · cada ciclo = 4 semanas)</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={6}
                value={cycles}
                onChange={(e) => setCycles(Math.min(6, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                className="w-24 border border-depro-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
              />
              <span className="text-xs text-depro-gray">
                = {Math.min(6, Math.max(1, Number(cycles) || 1)) * 4} semanas
              </span>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-900 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-900 flex items-start gap-2">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-depro-border flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-depro-border text-sm font-semibold text-depro-dark hover:bg-depro-gray-light"
          >
            Cerrar
          </button>
          <button
            type="button"
            disabled={loading || !!success}
            onClick={handleAssign}
            className="px-4 py-2.5 rounded-xl bg-depro-blue text-white text-sm font-bold hover:bg-depro-blue-dark disabled:opacity-50"
          >
            {loading ? "Asignando…" : "Asignar"}
          </button>
        </div>
      </div>
    </div>
  );
}
