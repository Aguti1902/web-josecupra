import { useState, useEffect } from "react";
import {
  Zap, Users, ChevronLeft, ChevronRight, Info,
  TrendingUp, Minus, User, Moon, BatteryLow, Smile,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useActiveTeam } from "../../context/ViewContext";
import FeatureGate from "../../components/private/FeatureGate";
import { saveClubDetail, loadClubDetail } from "../../lib/adminStorage";
import { supabase } from "../../lib/supabase";

/* ── Helpers ──────────────────────────────────────────────── */
function getAgeBlock(category) {
  if (!category) return null;
  if (["Sub-13","Sub-14","Sub-15"].includes(category)) return "Bloque 2";
  if (["Sub-16","Juvenil"].includes(category)) return "Bloque 3";
  return null;
}

function calcLoad(volumen, rpe, especificidad) {
  const v = parseFloat(volumen) || 0;
  const r = parseFloat(rpe) || 0;
  const e = parseFloat(especificidad) || 0;
  return v * r * e;
}

/** sRPE clásico (Foster): minutos × RPE — referencia para clasificar la sesión */
function calcSrpe(volumen, rpe) {
  return (parseFloat(volumen) || 0) * (parseFloat(rpe) || 0);
}

/**
 * Semáforo por sesión — basado en sRPE (min × RPE), estándar en fútbol.
 * La carga mostrada sigue siendo Volumen × RPE × Especificidad.
 */
function sessionTrafficLight(volumen, rpe) {
  const srpe = calcSrpe(volumen, rpe);
  if (!srpe) return { color: "#9CA3AF", label: "—", bg: "#F3F4F6" };
  if (srpe < 250) return { color: "#22C55E", label: "Baja",    bg: "#F0FDF4" };
  if (srpe < 450) return { color: "#F59E0B", label: "Media",   bg: "#FFFBEB" };
  if (srpe < 650) return { color: "#EF4444", label: "Alta",    bg: "#FEF2F2" };
  return              { color: "#7C3AED", label: "Muy alta", bg: "#F5F3FF" };
}

/** Semáforo semanal — carga acumulada DEPRO escalada por días de entreno del equipo */
function weeklyTrafficLight(total, trainingDaysCount = 3) {
  if (!total) return { color: "#9CA3AF", label: "Sin datos", bg: "#F3F4F6" };
  const n = Math.max(trainingDaysCount || 3, 2);
  const low  = n * 550;
  const med  = n * 1050;
  const high = n * 1700;
  if (total < low)  return { color: "#22C55E", label: "Carga semanal baja",    bg: "#F0FDF4" };
  if (total < med)  return { color: "#F59E0B", label: "Carga semanal media",   bg: "#FFFBEB" };
  if (total < high) return { color: "#EF4444", label: "Carga semanal alta",    bg: "#FEF2F2" };
  return              { color: "#7C3AED", label: "Carga semanal muy alta", bg: "#F5F3FF" };
}

function getVisibleSessions(trainingDaysCount) {
  return SESSIONS.filter((s) => s.key !== "d" || trainingDaysCount >= 4);
}

function getWeekSessionKeys(trainingDaysCount) {
  const keys = ["partido", "a", "b", "c"];
  if (trainingDaysCount >= 4) keys.push("d");
  return keys;
}

const STORAGE_KEY = (clubId, teamId) => `depro_cargas_${clubId}_${teamId}`;

const SESSIONS = [
  { key: "partido", label: "Partido",          isPartido: true },
  { key: "a",       label: "Entreno A · Extensivo",  isPartido: false },
  { key: "b",       label: "Entreno B · Intensivo",  isPartido: false },
  { key: "c",       label: "Entreno C · Reactivo",   isPartido: false },
  { key: "d",       label: "Entreno D · Complementaria", isPartido: false },
];

function getMonthWeeks(year, month) {
  const weeks = [];
  const lastDay = new Date(year, month + 1, 0);
  let current = new Date(year, month, 1);
  current.setDate(current.getDate() - ((current.getDay() + 6) % 7));
  while (current <= lastDay) {
    weeks.push({ start: new Date(current), end: new Date(new Date(current).setDate(current.getDate() + 6)) });
    current.setDate(current.getDate() + 7);
  }
  return weeks;
}

function isoWeekKey(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const year = d.getUTCFullYear();
  const week = Math.ceil(((d - new Date(Date.UTC(year, 0, 1))) / 86400000 + 1) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
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

/* ── Semáforo badge ─────────────────────────────────────────── */
function LoadBadge({ load, volumen, rpe }) {
  const tl = sessionTrafficLight(volumen, rpe);
  if (!load) return <span className="text-depro-gray/40">—</span>;
  return (
    <span className="font-black text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: tl.bg, color: tl.color }}>
      {Math.round(load)} · {tl.label}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────
   VISTA EQUIPO — campos globales para una sesión
   ──────────────────────────────────────────────────────────── */
function TeamSessionEditor({ session, entry, onChange, readOnly }) {
  const load = calcLoad(entry.volumen, entry.rpe, entry.especificidad);
  return (
    <div className="space-y-4">
      {session.isPartido && (
        <div>
          <label className="block text-xs font-bold text-depro-gray uppercase tracking-wide mb-1">Rival</label>
          <input
            className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
            placeholder="Ej. FC Barcelona B"
            value={entry.rival || ""}
            onChange={(e) => onChange({ ...entry, rival: e.target.value })}
            disabled={readOnly}
          />
        </div>
      )}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-[10px] font-bold text-depro-gray uppercase tracking-wide mb-1 block">
            <Tooltip text="Duración total de la sesión o partido en minutos.">Volumen (min)</Tooltip>
          </label>
          <input type="number" min="0" max="180"
            className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
            placeholder="90" value={entry.volumen || ""}
            onChange={(e) => onChange({ ...entry, volumen: e.target.value })}
            disabled={readOnly}
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-depro-gray uppercase tracking-wide mb-1 block">
            <Tooltip text="Percepción subjetiva del esfuerzo del equipo (1=muy fácil, 10=máximo).">RPE (1–10)</Tooltip>
          </label>
          <input type="number" min="1" max="10"
            className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
            placeholder="7" value={entry.rpe || ""}
            onChange={(e) => onChange({ ...entry, rpe: e.target.value })}
            disabled={readOnly}
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-depro-gray uppercase tracking-wide mb-1 block">
            <Tooltip text="Cuánto se parece al partido real (1=poco específico, 5=muy).">Espec. (1–5)</Tooltip>
          </label>
          <input type="number" min="1" max="5"
            className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
            placeholder="3" value={entry.especificidad || ""}
            onChange={(e) => onChange({ ...entry, especificidad: e.target.value })}
            disabled={readOnly}
          />
        </div>
      </div>
      {load > 0 && (
        <div className="flex items-center justify-end">
          <LoadBadge load={load} volumen={entry.volumen} rpe={entry.rpe} />
        </div>
      )}

      <WellnessEditor wellness={entry.wellness} onChange={(w) => onChange({ ...entry, wellness: w })} readOnly={readOnly} />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   WELLNESS — sueño, fatiga, estado de ánimo (equipo)
   ──────────────────────────────────────────────────────────── */
function WellnessEditor({ wellness, onChange, readOnly }) {
  const w = wellness || {};
  const fields = [
    { key: "sueno",  label: "Sueño",  icon: Moon,      tip: "Calidad de sueño percibida por el equipo (1=muy mala, 5=excelente)." },
    { key: "fatiga", label: "Fatiga", icon: BatteryLow, tip: "Nivel de fatiga percibida (1=sin fatiga, 5=muy fatigado)." },
    { key: "animo",  label: "Ánimo",  icon: Smile,     tip: "Estado de ánimo general del equipo (1=bajo, 5=muy positivo)." },
  ];
  return (
    <div className="pt-3 border-t border-depro-border/50">
      <p className="text-[10px] font-bold text-depro-gray uppercase tracking-wide mb-2">Wellness</p>
      <div className="grid grid-cols-3 gap-3">
        {fields.map(({ key, label, icon: FieldIcon, tip }) => (
          <div key={key}>
            <label className="text-[10px] font-bold text-depro-gray uppercase tracking-wide mb-1 flex items-center gap-1">
              <FieldIcon size={11} />
              <Tooltip text={tip}>{label} (1–5)</Tooltip>
            </label>
            <input type="number" min="1" max="5"
              className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
              placeholder="—" value={w[key] || ""}
              onChange={(e) => onChange({ ...w, [key]: e.target.value })}
              disabled={readOnly}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   VISTA JUGADORES — tabla individual
   ──────────────────────────────────────────────────────────── */
function PlayersSessionEditor({ session, entry, players, onChange, readOnly }) {
  const playerData  = entry.players || [];
  const especComun  = entry.especificidad || "";

  function updatePlayer(id, field, value) {
    const existing = playerData.find((p) => p.id === id) || { id };
    const updated  = playerData.filter((p) => p.id !== id).concat({ ...existing, [field]: value });
    onChange({ ...entry, players: updated });
  }

  function getPlayer(id) {
    return playerData.find((p) => p.id === id) || {};
  }

  return (
    <div className="space-y-4">
      {/* Rival si es partido */}
      {session.isPartido && (
        <div>
          <label className="block text-xs font-bold text-depro-gray uppercase tracking-wide mb-1">Rival</label>
          <input
            className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
            placeholder="Ej. FC Barcelona B"
            value={entry.rival || ""}
            onChange={(e) => onChange({ ...entry, rival: e.target.value })}
            disabled={readOnly}
          />
        </div>
      )}

      {/* Especificidad común */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-bold text-depro-gray uppercase tracking-wide whitespace-nowrap">
          <Tooltip text="Especificidad común para todos los jugadores en esta sesión (1–5).">Especificidad común (1–5)</Tooltip>
        </label>
        <input type="number" min="1" max="5"
          className="w-20 border border-depro-border rounded-lg px-3 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
          placeholder="3" value={especComun}
          onChange={(e) => onChange({ ...entry, especificidad: e.target.value })}
          disabled={readOnly}
        />
      </div>

      {/* Tabla jugadores */}
      {players.length === 0 ? (
        <div className="text-center py-8 text-sm text-depro-gray border-2 border-dashed border-depro-border rounded-xl">
          No hay jugadores en la plantilla todavía.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-depro-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-depro-gray-light/40 border-b border-depro-border">
                <th className="text-left px-4 py-2.5 text-xs font-bold text-depro-gray uppercase tracking-wide">Jugador</th>
                <th className="px-3 py-2.5 text-xs font-bold text-depro-gray uppercase tracking-wide text-center">
                  <Tooltip text="Minutos jugados o de entrenamiento.">Minutos</Tooltip>
                </th>
                <th className="px-3 py-2.5 text-xs font-bold text-depro-gray uppercase tracking-wide text-center">
                  <Tooltip text="Percepción subjetiva del esfuerzo individual (1–10).">RPE</Tooltip>
                </th>
                <th className="px-3 py-2.5 text-xs font-bold text-depro-gray uppercase tracking-wide text-center">Carga</th>
                <th className="px-3 py-2.5 text-xs font-bold text-depro-gray uppercase tracking-wide text-center">Nivel</th>
                <th className="px-3 py-2.5 text-xs font-bold text-depro-gray uppercase tracking-wide text-center">
                  <Tooltip text="Calidad de sueño percibida (1–5).">Sueño</Tooltip>
                </th>
                <th className="px-3 py-2.5 text-xs font-bold text-depro-gray uppercase tracking-wide text-center">
                  <Tooltip text="Nivel de fatiga percibida (1–5).">Fatiga</Tooltip>
                </th>
                <th className="px-3 py-2.5 text-xs font-bold text-depro-gray uppercase tracking-wide text-center">
                  <Tooltip text="Estado de ánimo general (1–5).">Ánimo</Tooltip>
                </th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => {
                const pd   = getPlayer(player.id);
                const load = calcLoad(pd.minutos, pd.rpe, especComun || 3);
                const tl   = sessionTrafficLight(pd.minutos, pd.rpe);
                return (
                  <tr key={player.id} className="border-b border-depro-border/50 hover:bg-depro-gray-light/20 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-depro-gray-light flex items-center justify-center flex-shrink-0">
                          <User size={12} className="text-depro-gray" />
                        </div>
                        <span className="font-medium text-depro-dark truncate max-w-[120px]">{player.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" min="0" max="120"
                        className="w-16 border border-depro-border rounded-lg px-2 py-1 text-xs text-center mx-auto block focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                        placeholder="90" value={pd.minutos || ""}
                        onChange={(e) => updatePlayer(player.id, "minutos", e.target.value)}
                        disabled={readOnly}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" min="1" max="10"
                        className="w-14 border border-depro-border rounded-lg px-2 py-1 text-xs text-center mx-auto block focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                        placeholder="7" value={pd.rpe || ""}
                        onChange={(e) => updatePlayer(player.id, "rpe", e.target.value)}
                        disabled={readOnly}
                      />
                    </td>
                    <td className="px-3 py-2.5 text-center text-xs font-black text-depro-dark">
                      {load > 0 ? Math.round(load) : <span className="text-depro-gray/40">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {load > 0 ? (
                        <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: tl.color }} title={tl.label} />
                      ) : <span className="w-3 h-3 rounded-full inline-block bg-depro-gray/20" />}
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" min="1" max="5"
                        className="w-12 border border-depro-border rounded-lg px-2 py-1 text-xs text-center mx-auto block focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                        placeholder="—" value={pd.sueno || ""}
                        onChange={(e) => updatePlayer(player.id, "sueno", e.target.value)}
                        disabled={readOnly}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" min="1" max="5"
                        className="w-12 border border-depro-border rounded-lg px-2 py-1 text-xs text-center mx-auto block focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                        placeholder="—" value={pd.fatiga || ""}
                        onChange={(e) => updatePlayer(player.id, "fatiga", e.target.value)}
                        disabled={readOnly}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" min="1" max="5"
                        className="w-12 border border-depro-border rounded-lg px-2 py-1 text-xs text-center mx-auto block focus:outline-none focus:ring-2 focus:ring-depro-blue/30"
                        placeholder="—" value={pd.animo || ""}
                        onChange={(e) => updatePlayer(player.id, "animo", e.target.value)}
                        disabled={readOnly}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Totales */}
            {players.some((p) => { const pd = getPlayer(p.id); return pd.minutos || pd.rpe; }) && (
              <tfoot>
                <tr className="bg-depro-gray-light/40 border-t-2 border-depro-border">
                  <td className="px-4 py-2 text-xs font-bold text-depro-gray uppercase">Promedio equipo</td>
                  <td className="px-3 py-2 text-center text-xs font-black text-depro-dark">
                    {(() => {
                      const vals = players.map((p) => parseFloat(getPlayer(p.id).minutos) || 0).filter(Boolean);
                      return vals.length ? Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) : "—";
                    })()}
                  </td>
                  <td className="px-3 py-2 text-center text-xs font-black text-depro-dark">
                    {(() => {
                      const vals = players.map((p) => parseFloat(getPlayer(p.id).rpe) || 0).filter(Boolean);
                      return vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : "—";
                    })()}
                  </td>
                  <td className="px-3 py-2 text-center text-xs font-black text-depro-dark">
                    {(() => {
                      const loads = players.map((p) => { const pd = getPlayer(p.id); return calcLoad(pd.minutos, pd.rpe, especComun || 3); }).filter(Boolean);
                      return loads.length ? Math.round(loads.reduce((a,b)=>a+b,0)/loads.length) : "—";
                    })()}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {(() => {
                      const withData = players.filter((p) => {
                        const pd = getPlayer(p.id);
                        return calcSrpe(pd.minutos, pd.rpe) > 0;
                      });
                      if (!withData.length) return null;
                      const avgMin = withData.reduce((s, p) => s + (parseFloat(getPlayer(p.id).minutos) || 0), 0) / withData.length;
                      const avgRpe = withData.reduce((s, p) => s + (parseFloat(getPlayer(p.id).rpe) || 0), 0) / withData.length;
                      const tl = sessionTrafficLight(avgMin, avgRpe);
                      return <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: tl.color }} title={tl.label} />;
                    })()}
                  </td>
                  <td colSpan={3} className="px-3 py-2 text-center text-xs font-black text-depro-dark">
                    {(() => {
                      const avg = (field) => {
                        const vals = players.map((p) => parseFloat(getPlayer(p.id)[field]) || 0).filter(Boolean);
                        return vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : "—";
                      };
                      return `${avg("sueno")} · ${avg("fatiga")} · ${avg("animo")}`;
                    })()}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
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

  const ageBlock  = getAgeBlock(team?.category);
  const isReadOnly = user?.team_role === "coordinador";

  const storageKey = STORAGE_KEY(club?.id || "x", team?.id || "y");
  const trainingDaysCount = team?.trainingDays?.length || 3;
  const visibleSessions = getVisibleSessions(trainingDaysCount);
  const weekSessionKeys = getWeekSessionKeys(trainingDaysCount);

  // ── Selector principal ───────────────────────────────────
  const [scope, setScope]         = useState("equipo"); // "equipo" | "jugadores"
  const [activeSession, setActiveSession] = useState("partido");

  const resolvedSession = visibleSessions.some((s) => s.key === activeSession)
    ? activeSession
    : visibleSessions.find((s) => !s.isPartido)?.key || "a";

  // ── Datos ────────────────────────────────────────────────
  const [allData, setAllData] = useState(() => {
    try {
      const local = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (local) return local;
      if (club?.id && team?.id) {
        const detail = loadClubDetail(club.id);
        return detail?.teamCargas?.[team.id] || {};
      }
      return {};
    } catch { return {}; }
  });

  // Semana activa
  const [weekOffset, setWeekOffset] = useState(0);
  const today = new Date();
  const activeWeekStart = new Date(today);
  activeWeekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7) + weekOffset * 7);
  const activeWeekKey = isoWeekKey(activeWeekStart);

  const currentWeekData = allData[activeWeekKey] || { partido: {}, a: {}, b: {}, c: {}, d: {} };

  // ── Jugadores de la plantilla ────────────────────────────
  const [players, setPlayers] = useState([]);
  useEffect(() => {
    if (!club?.id || !team?.id) return;
    // Jugadores manuales
    try {
      const raw = localStorage.getItem(`depro_squad_${club.id}_${team.id}`);
      const manual = JSON.parse(raw || "[]");
      setPlayers(manual);
    } catch { setPlayers([]); }
    // Jugadores registrados via Supabase
    supabase.from("player_team_links").select("player_id, name").eq("team_id", team.id)
      .then(({ data }) => {
        if (data?.length) {
          setPlayers((prev) => {
            const ids = new Set(prev.map((p) => p.id));
            const extra = data.filter((d) => !ids.has(d.player_id)).map((d) => ({ id: d.player_id, name: d.name || "Jugador" }));
            return [...prev, ...extra];
          });
        }
      }).catch(() => {});
  }, [club?.id, team?.id]);

  // ── Vista mensual ────────────────────────────────────────
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear,  setViewYear]  = useState(new Date().getFullYear());

  // Solo accesible para Bloques 2 y 3
  if (!ageBlock) {
    return (
      <div className="dash-page text-center">
        <div className="w-16 h-16 rounded-2xl bg-depro-gray-light flex items-center justify-center mx-auto mb-4">
          <Zap size={28} className="text-depro-gray opacity-40" />
        </div>
        <h2 className="text-xl font-black text-depro-dark mb-2">Módulo de Cargas no disponible</h2>
        <p className="text-depro-gray text-sm">Este módulo está disponible únicamente para equipos de <strong>Fútbol 11</strong> (Bloques 2 y 3: Sub-13 a Juvenil).</p>
      </div>
    );
  }

  function updateWeekData(newData) {
    const updated = { ...allData, [activeWeekKey]: newData };
    setAllData(updated);
    try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch {}
    if (club?.id && team?.id) {
      const detail = loadClubDetail(club.id) || {};
      saveClubDetail(club.id, {
        ...detail,
        teamCargas: { ...(detail.teamCargas || {}), [team.id]: updated },
      });
    }
  }

  function updateSession(key, entry) {
    updateWeekData({ ...currentWeekData, [key]: entry });
  }

  // ── Carga total semanal ──────────────────────────────────
  const weekLoad = weekSessionKeys.reduce((sum, key) => {
    const e = currentWeekData[key] || {};
    return sum + calcLoad(e.volumen, e.rpe, e.especificidad);
  }, 0);
  const weekLoadTL = weeklyTrafficLight(weekLoad, trainingDaysCount);

  const monthWeeks = getMonthWeeks(viewYear, viewMonth);
  const monthNames = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

  function weekLabel(offset) {
    const d = new Date(today);
    d.setDate(today.getDate() - ((today.getDay()+6)%7) + offset*7);
    return d.toLocaleDateString("es-ES", { day:"numeric", month:"short" });
  }

  const activeSessionDef = visibleSessions.find((s) => s.key === resolvedSession) || visibleSessions[0];

  return (
    <FeatureGate user={user} feature="cargas">
    <div className="dash-page">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-depro-gray mb-1">
          <Zap size={13} style={{ color: accent }} /> Cargas del equipo · {ageBlock}
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-depro-dark">Cargas del equipo</h1>
        <p className="text-depro-gray text-sm mt-0.5">{team?.name} · Fórmula: Volumen × RPE × Especificidad</p>
      </div>

      {/* ═══════════════════════════════════════════════
          1. SELECTOR ÁMBITO — lo primero de todo
          ═══════════════════════════════════════════════ */}
      <div className="bg-white border border-depro-border rounded-2xl p-5 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Equipo / Jugadores */}
          <div className="flex-1">
            <p className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-2">Ámbito</p>
            <div className="flex gap-2">
              <button
                onClick={() => setScope("equipo")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                  scope === "equipo"
                    ? "bg-depro-dark text-white border-depro-dark shadow-sm"
                    : "bg-white text-depro-gray border-depro-border hover:border-depro-dark/40"
                }`}
              >
                <TrendingUp size={14} /> Equipo
              </button>
              <button
                onClick={() => setScope("jugadores")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                  scope === "jugadores"
                    ? "bg-depro-blue text-white border-depro-blue shadow-sm"
                    : "bg-white text-depro-gray border-depro-border hover:border-depro-blue/40"
                }`}
              >
                <Users size={14} /> Jugador por jugador
              </button>
            </div>
          </div>

          {/* Selector de sesión */}
          <div className="flex-1">
            <p className="text-xs font-bold text-depro-gray uppercase tracking-wide mb-2">Sesión</p>
            <div className="flex flex-wrap gap-2">
              {visibleSessions.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setActiveSession(s.key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                    activeSession === s.key
                      ? "text-white border-transparent shadow-sm"
                      : "bg-white text-depro-gray border-depro-border hover:border-depro-dark/30"
                  }`}
                  style={activeSession === s.key ? { backgroundColor: accent } : {}}
                >
                  {s.isPartido ? "⚽ Partido" : s.label.split(" · ")[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Descripción del modo activo */}
        <div className="mt-3 pt-3 border-t border-depro-border/50 flex items-center gap-2">
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
            scope === "equipo" ? "bg-depro-dark/10 text-depro-dark" : "bg-depro-blue/10 text-depro-blue"
          }`}>
            {scope === "equipo" ? "Métricas globales del equipo" : `${players.length} jugadores · métricas individuales`}
          </span>
          <span className="text-xs text-depro-gray">·</span>
          <span className="text-xs text-depro-gray font-medium">{activeSessionDef.label}</span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          2. SEMANA ACTIVA + EDITOR
          ═══════════════════════════════════════════════ */}
      <div className="bg-white border border-depro-border rounded-2xl overflow-hidden mb-5">
        {/* Nav semana */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-depro-border bg-depro-gray-light/20">
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
          <div className="px-5 py-2.5 border-b border-depro-border flex items-center gap-3 bg-depro-gray-light/10">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: weekLoadTL.color }} />
            <span className="text-sm font-bold text-depro-dark">{weekLoadTL.label}</span>
            <span className="text-xs text-depro-gray ml-auto">Total semana: <strong>{Math.round(weekLoad)}</strong></span>
          </div>
        )}

        {/* Editor de la sesión activa */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-black text-depro-dark">{activeSessionDef.label}</span>
            {scope === "jugadores" && (
              <span className="text-xs text-depro-gray bg-depro-gray-light px-2 py-0.5 rounded-full">{players.length} jugadores</span>
            )}
          </div>

          {scope === "equipo" ? (
            <TeamSessionEditor
              session={activeSessionDef}
              entry={currentWeekData[resolvedSession] || {}}
              onChange={(e) => updateSession(resolvedSession, e)}
              readOnly={isReadOnly}
            />
          ) : (
            <PlayersSessionEditor
              session={activeSessionDef}
              entry={currentWeekData[resolvedSession] || {}}
              players={players}
              onChange={(e) => updateSession(resolvedSession, e)}
              readOnly={isReadOnly}
            />
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          3. VISTA MENSUAL
          ═══════════════════════════════════════════════ */}
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
              <tr className="border-b border-depro-border bg-depro-gray-light/20">
                <th className="text-left px-4 py-2.5 font-bold text-depro-gray uppercase tracking-wide">Semana</th>
                <th className="px-3 py-2.5 font-bold text-depro-gray uppercase tracking-wide text-center">Partido</th>
                <th className="px-3 py-2.5 font-bold text-depro-gray uppercase tracking-wide text-center">A</th>
                <th className="px-3 py-2.5 font-bold text-depro-gray uppercase tracking-wide text-center">B</th>
                <th className="px-3 py-2.5 font-bold text-depro-gray uppercase tracking-wide text-center">C</th>
                {trainingDaysCount >= 4 && (
                  <th className="px-3 py-2.5 font-bold text-depro-gray uppercase tracking-wide text-center">D</th>
                )}
                <th className="px-3 py-2.5 font-bold text-depro-gray uppercase tracking-wide text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              {monthWeeks.map((week, wi) => {
                const key = isoWeekKey(week.start);
                const wd  = allData[key] || {};
                const sessions = weekSessionKeys.reduce((acc, k) => {
                  acc[k] = wd[k] || {};
                  return acc;
                }, {});
                const total = Object.values(sessions).reduce((s, e) => s + calcLoad(e.volumen, e.rpe, e.especificidad), 0);
                const tl  = weeklyTrafficLight(total, trainingDaysCount);
                const fmt = (s,e) => `${s.getDate()}/${s.getMonth()+1} – ${e.getDate()}/${e.getMonth()+1}`;
                return (
                  <tr key={wi} className="border-b border-depro-border/50 hover:bg-depro-gray-light/20 transition-colors">
                    <td className="px-4 py-3 text-depro-gray font-medium">{fmt(week.start, week.end)}</td>
                    {weekSessionKeys.map((k) => {
                      const e = sessions[k];
                      const l = calcLoad(e.volumen, e.rpe, e.especificidad);
                      const t = sessionTrafficLight(e.volumen, e.rpe);
                      return (
                        <td key={k} className="px-3 py-3 text-center">
                          {l > 0 ? (
                            <span className="inline-flex flex-col items-center gap-0.5">
                              {k === "partido" && e.rival && <span className="text-[9px] text-depro-gray">vs {e.rival}</span>}
                              <span className="font-black" style={{ color: t.color }}>{Math.round(l)}</span>
                            </span>
                          ) : <Minus size={12} className="mx-auto text-depro-gray/30" />}
                        </td>
                      );
                    })}
                    <td className="px-3 py-3 text-center">
                      {total > 0
                        ? <span className="font-black text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: tl.bg, color: tl.color }}>{Math.round(total)}</span>
                        : <Minus size={12} className="mx-auto text-depro-gray/30" />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </FeatureGate>
  );
}
