import { useState, useEffect } from "react";
import {
  Zap, Users, ChevronLeft, ChevronRight, Info,
  TrendingUp, AlertCircle, CheckCircle, Minus,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useActiveTeam } from "../../context/ViewContext";

/* ── Helpers ──────────────────────────────────────────────── */
function getAgeBlock(category) {
  if (!category) return null;
  if (["Sub-13","Sub-14","Sub-15"].includes(category)) return "Bloque 2";
  if (["Sub-16","Juvenil"].includes(category)) return "Bloque 3";
  return null; // Bloque 1 → no accede
}

function calcLoad(volumen, rpe, especificidad) {
  const v = parseFloat(volumen) || 0;
  const r = parseFloat(rpe) || 0;
  const e = parseFloat(especificidad) || 0;
  return v * r * e;
}

function trafficLight(load) {
  if (!load) return { color: "#9CA3AF", label: "—", bg: "#F3F4F6" };
  if (load < 200) return { color: "#22C55E", label: "Baja",    bg: "#F0FDF4" };
  if (load < 400) return { color: "#F59E0B", label: "Media",   bg: "#FFFBEB" };
  if (load < 700) return { color: "#EF4444", label: "Alta",    bg: "#FEF2F2" };
  return              { color: "#7C3AED", label: "Muy alta", bg: "#F5F3FF" };
}

function weeklyLoadLabel(total) {
  if (!total) return "Sin datos";
  if (total < 600)  return "Carga semanal baja";
  if (total < 1200) return "Carga semanal media";
  if (total < 2000) return "Carga semanal alta";
  return "Carga semanal muy alta";
}

const STORAGE_KEY = (clubId, teamId) => `depro_cargas_${clubId}_${teamId}`;
const SESSION_LABELS = ["Partido", "Entreno A", "Entreno B", "Entreno C"];

function getMonthWeeks(year, month) {
  const weeks = [];
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  let current = new Date(firstDay);
  // Move to Monday of the first week
  current.setDate(current.getDate() - ((current.getDay() + 6) % 7));
  while (current <= lastDay) {
    const weekStart = new Date(current);
    const weekEnd   = new Date(current); weekEnd.setDate(weekEnd.getDate() + 6);
    weeks.push({ start: new Date(weekStart), end: new Date(weekEnd) });
    current.setDate(current.getDate() + 7);
  }
  return weeks;
}

function isoWeekKey(date) {
  // YYYY-WW
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const year = d.getUTCFullYear();
  const week = Math.ceil(((d - new Date(Date.UTC(year,0,1))) / 86400000 + 1) / 7);
  return `${year}-W${String(week).padStart(2,"0")}`;
}

/* ── Tooltip ──────────────────────────────────────────────── */
function Tooltip({ text, children }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex items-center gap-1" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <Info size={11} className="text-depro-gray cursor-help" />
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 w-48 bg-depro-dark text-white text-[10px] rounded-lg px-3 py-2 shadow-lg leading-relaxed whitespace-normal">
          {text}
        </span>
      )}
    </span>
  );
}

/* ── Entrada de una sesión de la semana ───────────────────── */
function SessionRow({ label, entry, isPartido, onChange, readOnly }) {
  const load = calcLoad(entry.volumen, entry.rpe, entry.especificidad);
  const tl   = trafficLight(load);
  return (
    <div className="bg-white border border-depro-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-depro-dark">{label}</span>
        {load > 0 && (
          <span className="text-xs font-black px-2.5 py-1 rounded-full" style={{ backgroundColor: tl.bg, color: tl.color }}>
            {Math.round(load)} · {tl.label}
          </span>
        )}
      </div>

      {isPartido && (
        <input
          className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
          placeholder="Rival (ej. FC Barcelona B)"
          value={entry.rival || ""}
          onChange={(e) => onChange({ ...entry, rival: e.target.value })}
          disabled={readOnly}
        />
      )}

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-[10px] font-bold text-depro-gray uppercase tracking-wide mb-1 block">
            <Tooltip text="Duración total de la sesión o partido en minutos.">Volumen (min)</Tooltip>
          </label>
          <input type="number" min="0" max="180"
            className="w-full border border-depro-border rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
            placeholder="90" value={entry.volumen || ""}
            onChange={(e) => onChange({ ...entry, volumen: e.target.value })}
            disabled={readOnly}
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-depro-gray uppercase tracking-wide mb-1 block">
            <Tooltip text="Percepción subjetiva del esfuerzo del equipo (1=muy fácil, 10=máximo esfuerzo).">RPE (1–10)</Tooltip>
          </label>
          <input type="number" min="1" max="10"
            className="w-full border border-depro-border rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
            placeholder="7" value={entry.rpe || ""}
            onChange={(e) => onChange({ ...entry, rpe: e.target.value })}
            disabled={readOnly}
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-depro-gray uppercase tracking-wide mb-1 block">
            <Tooltip text="Cuánto se parece el contenido al partido real (1=poco específico, 5=muy específico).">Espec. (1–5)</Tooltip>
          </label>
          <input type="number" min="1" max="5"
            className="w-full border border-depro-border rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
            placeholder="3" value={entry.especificidad || ""}
            onChange={(e) => onChange({ ...entry, especificidad: e.target.value })}
            disabled={readOnly}
          />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL
   ════════════════════════════════════════════════════════════ */
export default function CargasPage() {
  const { user } = useAuth();
  const activeTeam = useActiveTeam();
  const team  = activeTeam;
  const club  = user?.club;
  const accent = club?.primaryColor || "#0A36F7";

  const ageBlock = getAgeBlock(team?.category);
  const isReadOnly = user?.team_role === "coordinador";

  // Solo accesible para Bloques 2 y 3
  if (!ageBlock) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 rounded-2xl bg-depro-gray-light flex items-center justify-center mx-auto mb-4">
          <Zap size={28} className="text-depro-gray opacity-40" />
        </div>
        <h2 className="text-xl font-black text-depro-dark mb-2">Módulo de Cargas no disponible</h2>
        <p className="text-depro-gray text-sm">Este módulo está disponible únicamente para equipos de <strong>Fútbol 11</strong> (Bloques 2 y 3: Sub-13 a Juvenil).</p>
      </div>
    );
  }

  const storageKey = STORAGE_KEY(club?.id || "x", team?.id || "y");

  // Estado principal: { [weekKey]: { partido, a, b, c, players: [] } }
  const [allData, setAllData] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "{}"); }
    catch { return {}; }
  });

  // Semana activa (offset desde la semana actual)
  const [weekOffset, setWeekOffset] = useState(0);
  const today = new Date();
  const activeWeekStart = new Date(today);
  activeWeekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7) + weekOffset * 7);
  const activeWeekKey = isoWeekKey(activeWeekStart);

  const currentWeekData = allData[activeWeekKey] || { partido: {}, a: {}, b: {}, c: {} };

  function updateWeekData(newData) {
    const updated = { ...allData, [activeWeekKey]: newData };
    setAllData(updated);
    try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch {}
  }

  function updateSession(key, entry) {
    updateWeekData({ ...currentWeekData, [key]: entry });
  }

  // Cálculo de carga total de la semana
  const weekLoad = ["partido","a","b","c"].reduce((sum, key) => {
    const e = currentWeekData[key] || {};
    return sum + calcLoad(e.volumen, e.rpe, e.especificidad);
  }, 0);
  const weekLoadTL = trafficLight(weekLoad);

  // Vista mensual
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear,  setViewYear]  = useState(new Date().getFullYear());
  const monthWeeks = getMonthWeeks(viewYear, viewMonth);
  const monthNames = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

  function weekDataFor(weekStart) {
    const key = isoWeekKey(weekStart);
    return allData[key] || {};
  }

  const weekLabel = (offset) => {
    const d = new Date(today);
    d.setDate(today.getDate() - ((today.getDay()+6)%7) + offset*7);
    return d.toLocaleDateString("es-ES", { day:"numeric", month:"short" });
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-depro-gray mb-1">
          <Zap size={13} style={{ color: accent }} /> Cargas del equipo · {ageBlock}
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-depro-dark">Cargas del equipo</h1>
        <p className="text-depro-gray text-sm mt-0.5">{team?.name} · Fórmula: Volumen × RPE × Especificidad</p>
      </div>

      {/* Semana activa */}
      <div className="bg-white border border-depro-border rounded-2xl overflow-hidden mb-6">
        {/* Nav semana */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-depro-border bg-depro-gray-light/30">
          <button onClick={() => setWeekOffset(w => w - 1)} className="p-1.5 rounded-lg hover:bg-depro-gray-light transition-colors text-depro-gray hover:text-depro-dark">
            <ChevronLeft size={16} />
          </button>
          <div className="text-center">
            <div className="text-sm font-black text-depro-dark">
              {weekOffset === 0 ? "Semana actual" : weekOffset < 0 ? `Hace ${Math.abs(weekOffset)} semana${Math.abs(weekOffset)>1?"s":""}` : `En ${weekOffset} semana${weekOffset>1?"s":""}`}
            </div>
            <div className="text-xs text-depro-gray">{weekLabel(weekOffset)} → {weekLabel(weekOffset + 1)}</div>
          </div>
          <button onClick={() => setWeekOffset(w => w + 1)} className="p-1.5 rounded-lg hover:bg-depro-gray-light transition-colors text-depro-gray hover:text-depro-dark">
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Resumen carga semanal */}
        {weekLoad > 0 && (
          <div className="px-5 py-3 border-b border-depro-border flex items-center gap-3">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: weekLoadTL.color }} />
            <span className="text-sm font-bold text-depro-dark">{weeklyLoadLabel(weekLoad)}</span>
            <span className="text-xs text-depro-gray ml-auto">Carga total: <strong>{Math.round(weekLoad)}</strong></span>
          </div>
        )}

        {/* Sesiones */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <SessionRow
            label="Partido"
            entry={currentWeekData.partido || {}}
            isPartido
            onChange={(e) => updateSession("partido", e)}
            readOnly={isReadOnly}
          />
          <SessionRow
            label="Entreno A · Extensivo"
            entry={currentWeekData.a || {}}
            isPartido={false}
            onChange={(e) => updateSession("a", e)}
            readOnly={isReadOnly}
          />
          <SessionRow
            label="Entreno B · Intensivo"
            entry={currentWeekData.b || {}}
            isPartido={false}
            onChange={(e) => updateSession("b", e)}
            readOnly={isReadOnly}
          />
          <SessionRow
            label="Entreno C · Reactivo"
            entry={currentWeekData.c || {}}
            isPartido={false}
            onChange={(e) => updateSession("c", e)}
            readOnly={isReadOnly}
          />
        </div>
      </div>

      {/* Vista mensual */}
      <div className="bg-white border border-depro-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-depro-border">
          <button onClick={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y=>y-1); } else setViewMonth(m=>m-1); }} className="p-1.5 rounded-lg hover:bg-depro-gray-light transition-colors text-depro-gray hover:text-depro-dark">
            <ChevronLeft size={16} />
          </button>
          <span className="font-black text-depro-dark">{monthNames[viewMonth]} {viewYear}</span>
          <button onClick={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y=>y+1); } else setViewMonth(m=>m+1); }} className="p-1.5 rounded-lg hover:bg-depro-gray-light transition-colors text-depro-gray hover:text-depro-dark">
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-depro-border bg-depro-gray-light/30">
                <th className="text-left px-4 py-2.5 font-bold text-depro-gray uppercase tracking-wide">Semana</th>
                <th className="px-3 py-2.5 font-bold text-depro-gray uppercase tracking-wide text-center">Partido</th>
                <th className="px-3 py-2.5 font-bold text-depro-gray uppercase tracking-wide text-center">A</th>
                <th className="px-3 py-2.5 font-bold text-depro-gray uppercase tracking-wide text-center">B</th>
                <th className="px-3 py-2.5 font-bold text-depro-gray uppercase tracking-wide text-center">C</th>
                <th className="px-3 py-2.5 font-bold text-depro-gray uppercase tracking-wide text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              {monthWeeks.map((week, wi) => {
                const wd = weekDataFor(week.start);
                const sessions = { partido: wd.partido||{}, a: wd.a||{}, b: wd.b||{}, c: wd.c||{} };
                const total = Object.values(sessions).reduce((s,e) => s + calcLoad(e.volumen,e.rpe,e.especificidad), 0);
                const tl = trafficLight(total);
                const formatRange = (s,e) => `${s.getDate()}/${s.getMonth()+1} – ${e.getDate()}/${e.getMonth()+1}`;
                return (
                  <tr key={wi} className="border-b border-depro-border/50 hover:bg-depro-gray-light/20 transition-colors">
                    <td className="px-4 py-3 text-depro-gray font-medium">{formatRange(week.start, week.end)}</td>
                    {["partido","a","b","c"].map(key => {
                      const e = sessions[key];
                      const l = calcLoad(e.volumen, e.rpe, e.especificidad);
                      const t = trafficLight(l);
                      return (
                        <td key={key} className="px-3 py-3 text-center">
                          {l > 0 ? (
                            <span className="inline-flex flex-col items-center gap-0.5">
                              {key === "partido" && e.rival && <span className="text-[9px] text-depro-gray font-medium">vs {e.rival}</span>}
                              <span className="font-black" style={{ color: t.color }}>{Math.round(l)}</span>
                            </span>
                          ) : <Minus size={12} className="mx-auto text-depro-gray/30" />}
                        </td>
                      );
                    })}
                    <td className="px-3 py-3 text-center">
                      {total > 0 ? (
                        <span className="font-black text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: tl.bg, color: tl.color }}>
                          {Math.round(total)}
                        </span>
                      ) : <Minus size={12} className="mx-auto text-depro-gray/30" />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
