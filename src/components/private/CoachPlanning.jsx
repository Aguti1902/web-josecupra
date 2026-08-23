import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Layers, Calendar, ChevronDown, ChevronUp, ArrowRight, Info, CheckCircle,
} from "lucide-react";
import { loadCoachLibrary, getCachedCoachLibrary } from "../../lib/coachLibraryStorage";
import { loadOrGenerateMesociclo, saveMesociclo } from "../../lib/coachSessionsStorage";
import { monthBounds, isoWeekStartsInMonth, startOfIsoWeek } from "../../lib/clubAuto/clubAutoCoachBridge";
import { formatWeekRangeLabel, formatDate } from "../../lib/periodization";
import MesocycleCalendar from "./MesocycleCalendar";

function lum(hex) {
  try {
    const h = (hex || "#000").replace("#", "");
    return (0.299 * parseInt(h.slice(0, 2), 16) + 0.587 * parseInt(h.slice(2, 4), 16) + 0.114 * parseInt(h.slice(4, 6), 16)) / 255;
  } catch { return 0; }
}
function safeAccent(hex) { return lum(hex) > 0.75 ? "#0A36F7" : (hex || "#0A36F7"); }
function contrastText(hex) { return lum(hex) > 0.55 ? "#111827" : "#ffffff"; }

function isoToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function CoachPlanning({ club, team }) {
  const accent = safeAccent(club?.primaryColor || "#0A36F7");
  const config = useMemo(() => club?.coachConfig || {}, [club?.coachConfig]);
  const clubId = club?.id;
  const teamId = team?.id;
  const bounds = useMemo(() => monthBounds(new Date()), []);
  const weekStarts = useMemo(() => isoWeekStartsInMonth(bounds.startDate), [bounds.startDate]);
  const currentWeekIdx = Math.max(0, weekStarts.indexOf(startOfIsoWeek(isoToday())));

  const [libraryReady, setLibraryReady] = useState(false);
  const [mesociclo, setMesociclo] = useState(null);
  const [openWeek, setOpenWeek] = useState(currentWeekIdx + 1);

  useEffect(() => { loadCoachLibrary().then(() => setLibraryReady(true)); }, []);

  useEffect(() => {
    if (!clubId || !teamId) return;
    const library = getCachedCoachLibrary();
    const m = loadOrGenerateMesociclo({
      clubId, teamId, config, startDate: bounds.startDate, endDate: bounds.endDate, library,
    });
    setMesociclo(m);
  }, [clubId, teamId, config, libraryReady, bounds.startDate, bounds.endDate]);

  function updateWeekMeta(weekNumber, patch) {
    if (!mesociclo) return;
    const weeks = mesociclo.weeks.map((w) => (w.weekNumber === weekNumber ? { ...w, ...patch } : w));
    const next = { ...mesociclo, weeks };
    setMesociclo(next);
    saveMesociclo({ clubId, teamId, data: next });
  }

  if (!clubId || !teamId) return null;

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 text-depro-gray text-xs font-bold uppercase tracking-wide mb-2">
          <Calendar size={14} className="text-depro-blue" />
          Plan mensual
        </div>
        <h2 className="text-xl font-black text-depro-dark">Mesociclo</h2>
        <p className="text-sm text-depro-gray">
          {formatDate(bounds.startDate)} → {formatDate(bounds.endDate)} · Calendario del mes con la sesión de cada día
        </p>
      </div>

      {!mesociclo ? null : (
        <>
          <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: `linear-gradient(135deg, ${accent} 0%, ${accent}CC 100%)` }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
              <Layers size={20} style={{ color: contrastText(accent) }} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide opacity-80" style={{ color: contrastText(accent) }}>Objetivo de fase</p>
              <h3 className="font-black" style={{ color: contrastText(accent) }}>{mesociclo.objetivoLabel}</h3>
              <p className="text-xs opacity-80 mt-0.5" style={{ color: contrastText(accent) }}>Mesociclo de {mesociclo.numWeeks} semanas</p>
            {currentWeekIdx >= 0 && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-green-50 border border-green-200 text-green-700">
                <CheckCircle size={10}/> Semana {currentWeekIdx + 1} en curso
              </div>
            )}
            </div>
          </div>

          {mesociclo.weeks?.length > 0 && mesociclo.startDate && (
            <MesocycleCalendar
              activePlan={{ startDate: mesociclo.startDate, endDate: mesociclo.endDate || bounds.endDate }}
              weeks={mesociclo.weeks}
              accent={accent}
            />
          )}

          <div className="space-y-3">
            {mesociclo.weeks.map((w) => {
              const isOpen = openWeek === w.weekNumber;
              return (
                <div key={w.weekNumber} className="bg-white border border-depro-border rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setOpenWeek(isOpen ? -1 : w.weekNumber)}
                    className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-depro-gray-light/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0" style={{ backgroundColor: accent + "15", color: accent }}>
                        S{w.weekNumber}
                      </div>
                      <div>
                        <div className="font-bold text-depro-dark text-sm">Semana {w.weekNumber}</div>
                        <div className="text-xs text-depro-gray">
                          {formatWeekRangeLabel(w.weekStart, 0)} · {(w.microciclo?.sessions || w.sessions || []).length} sesiones
                          {w.weekNumber === currentWeekIdx + 1 ? " · Semana en curso" : ""}
                        </div>
                      </div>
                    </div>
                    {isOpen ? <ChevronUp size={16} className="text-depro-gray" /> : <ChevronDown size={16} className="text-depro-gray" />}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 space-y-3 border-t border-depro-border">
                      <div className="grid sm:grid-cols-2 gap-2 pt-3">
                        {(w.microciclo?.sessions || w.sessions || []).map((s) => (
                          <Link
                            key={s.id}
                            to={`/dashboard/plan?week=${w.weekNumber - 1}&session=${encodeURIComponent(s.id)}`}
                            className="text-left text-xs font-bold px-3 py-2.5 rounded-xl border border-depro-border hover:border-depro-blue/40 transition-colors"
                            style={{ backgroundColor: accent + "08", color: accent }}
                          >
                            <span className="block text-depro-dark">{s.assignedDay || "Sesión"}</span>
                            <span className="font-semibold opacity-90">Protocolo {s.protocol} · {s.duracionEstimada || "75–90 min"}</span>
                          </Link>
                        ))}
                      </div>
                      <div>
                        <label className="text-xs font-bold text-depro-gray mb-1 block">Nota de esta semana (editable)</label>
                        <textarea
                          key={`week_${w.weekNumber}_notes`}
                          defaultValue={w.notas || ""}
                          onBlur={(e) => updateWeekMeta(w.weekNumber, { notas: e.target.value })}
                          placeholder="Ej. semana de carga alta, coincide con torneo…"
                          rows={2}
                          className="w-full text-sm border border-depro-border rounded-xl px-3 py-2 outline-none focus:border-depro-blue resize-none"
                        />
                      </div>
                      <Link
                        to="/dashboard/plan"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold"
                        style={{ color: accent }}
                      >
                        Abrir microciclo / sesiones <ArrowRight size={13} />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-start gap-2 text-xs text-depro-gray bg-depro-gray-light/40 rounded-xl p-3">
            <Info size={13} className="flex-shrink-0 mt-0.5" />
            La estructura de bloques y protocolos la define el motor DEPRO según tu configuración. Puedes editar notas y objetivos, y sustituir ejercicios concretos desde el módulo de Sesiones.
          </div>
        </>
      )}
    </div>
  );
}
