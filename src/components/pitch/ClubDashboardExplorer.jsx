import { useMemo, useState } from "react";
import {
  Activity, Calendar, ChevronRight, ClipboardList, Download,
  LayoutDashboard, Play, TrendingUp, Users, X, Zap,
} from "lucide-react";
import {
  SQUAD, SESSIONS, MESOCYCLE_CALENDAR, WEEK_LOADS, TASK_FRAMEWORKS, TASK_PARAMS,
  TEAMS, PLAYER_TESTS, CURRENT_WEEK, MONTH_NAMES, WEEKDAY_SHORT,
  buildMonthGrid, dateKey, filterSquad, getPlayerById, DEPRO_VIDEO_LOGO,
} from "./clubExplorerData";

const DEFAULT_CLUB = {
  name: "Fundació Cornellà",
  abbrev: "FC",
  logo: "/LOGO CLUBS/CORNELLA.jpeg",
  accent: "#0D8F4D",
  team: "Sub-15 A",
};

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { id: "microcycle", label: "Microcycle", icon: Calendar, path: "/dashboard/plan" },
  { id: "mesocycle", label: "Mesocycle", icon: ClipboardList, path: "/dashboard/mesocycle" },
  { id: "squad", label: "Squad", icon: Users, path: "/dashboard/squad" },
  { id: "tests", label: "Tests", icon: Activity, path: "/dashboard/team-tests" },
  { id: "loads", label: "Loads", icon: TrendingUp, path: "/dashboard/cargas" },
  { id: "tasks", label: "Task designer", icon: Zap, path: "/dashboard/plan/tasks" },
];

const MODULE_COPY = {
  dashboard: { title: "Club command center", desc: "Click cards to jump into sessions, squad or loads." },
  microcycle: { title: "Weekly session plan", desc: "Select a day — open exercises with drill previews and export PDF." },
  mesocycle: { title: "Periodization calendar", desc: "Click any training day to open that session in the microcycle." },
  squad: { title: "Full squad · 22 players", desc: "Filter by position or plan. Click a player for profile and cross-links." },
  tests: { title: "Physical testing suite", desc: "T1 → T2 → T3 evolution vs team average. Click any row for charts." },
  loads: { title: "Load monitoring", desc: "Click sessions to highlight weekly volume. Linked to microcycle days." },
  tasks: { title: "Task designer", desc: "Switch frameworks A/B/C/D — toggle tasks and edit parameters live." },
};

const TYPE_COLORS = { A: "#3B82F6", B: "#F59E0B", C: "#EF4444", M: "#6B7280" };

function ChartLines({ color, values, teamAvg }) {
  const w = 280;
  const h = 72;
  const pad = 8;
  const all = [...values, ...teamAvg];
  const min = Math.min(...all) - (Math.max(...all) - Math.min(...all)) * 0.2;
  const max = Math.max(...all) + (Math.max(...all) - Math.min(...all)) * 0.2;
  const toX = (i) => pad + (i / (values.length - 1)) * (w - pad * 2);
  const toY = (v) => h - pad - ((v - min) / (max - min)) * (h - pad * 2);
  const player = values.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  const avg = teamAvg.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-20">
      <polyline points={avg} fill="none" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="5 4" strokeLinecap="round" />
      <polyline points={player} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      {values.map((v, i) => (
        <circle key={i} cx={toX(i)} cy={toY(v)} r="4" fill={color} stroke="#fff" strokeWidth="1.5" />
      ))}
      {["T1", "T2", "T3"].map((l, i) => (
        <text key={l} x={toX(i)} y={h - 2} textAnchor="middle" fontSize="9" fill="#9CA3AF" fontWeight="bold">{l}</text>
      ))}
    </svg>
  );
}

function DeproVideoPlaceholder({ className = "", compact = false }) {
  return (
    <div className={`relative bg-white flex items-center justify-center overflow-hidden ${className}`}>
      <img
        src={DEPRO_VIDEO_LOGO}
        alt="DEPRO"
        className={`object-contain ${compact ? "h-8 w-auto opacity-90" : "h-12 md:h-16 w-auto opacity-90"}`}
      />
      <span className="absolute inset-0 flex items-center justify-center bg-black/5">
        <span className={`rounded-full bg-white/95 shadow-md flex items-center justify-center ${compact ? "w-8 h-8" : "w-12 h-12"}`}>
          <Play size={compact ? 14 : 22} className="text-gray-700 fill-gray-700 ml-0.5" />
        </span>
      </span>
    </div>
  );
}

function ExerciseThumb({ exercise, onClick, selected }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-xl border overflow-hidden transition-all hover:shadow-md ${
        selected ? "border-2 ring-2 ring-offset-1" : "border-gray-200 bg-white hover:border-gray-300"
      }`}
      style={selected ? { borderColor: "#0D8F4D", ringColor: "#0D8F4D22" } : {}}
    >
      <div className="flex gap-3 p-3">
        <div className="relative w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-gray-100">
          {exercise.hasVideo ? (
            <DeproVideoPlaceholder className="w-full h-full" compact />
          ) : (
            <span className="flex items-center justify-center h-full text-[10px] text-gray-400 font-bold bg-gray-50">MATCH</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm text-gray-900 truncate">{exercise.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{exercise.duration} · {exercise.sets} × {exercise.reps}</p>
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{exercise.desc}</p>
        </div>
      </div>
    </button>
  );
}

function ExercisePreviewModal({ exercise, onClose }) {
  if (!exercise) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="font-black text-gray-900">{exercise.name}</p>
            <p className="text-xs text-gray-500">{exercise.desc}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={20} />
          </button>
        </div>
        {exercise.hasVideo ? (
          <DeproVideoPlaceholder className="aspect-video w-full border-b border-gray-100" />
        ) : (
          <div className="aspect-video w-full bg-gray-50 flex items-center justify-center border-b border-gray-100">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Match day</p>
          </div>
        )}
        <div className="px-5 py-4 grid grid-cols-3 gap-3 text-center text-sm border-t border-gray-100">
          <div><p className="text-xs text-gray-400">Duration</p><p className="font-bold">{exercise.duration}</p></div>
          <div><p className="text-xs text-gray-400">Sets</p><p className="font-bold">{exercise.sets}</p></div>
          <div><p className="text-xs text-gray-400">Reps</p><p className="font-bold">{exercise.reps}</p></div>
        </div>
        {exercise.hasVideo && (
          <p className="px-5 pb-4 text-[11px] text-center text-gray-400">
            Drill video preview — available in the full club platform
          </p>
        )}
      </div>
    </div>
  );
}

function PanelDashboard({ club, actions }) {
  const next = SESSIONS["wed-b"];
  return (
    <div className="space-y-5">
      <div className="rounded-2xl p-6 text-white" style={{ background: `linear-gradient(135deg, ${club.accent}, ${club.accent}cc)` }}>
        <p className="text-xs font-bold uppercase opacity-80 mb-1">{club.name}</p>
        <h3 className="text-2xl font-black">{club.team} · Week {CURRENT_WEEK}</h3>
        <p className="text-sm opacity-90 mt-1">Mesocycle 2 · Block B · Mon / Wed / Fri + Match</p>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { l: "Players", v: "22", sub: "Full roster active", onClick: () => actions.go("squad") },
          { l: "Sessions this week", v: "4", sub: "A · B · C + Match", onClick: () => actions.go("microcycle") },
          { l: "Tests completed", v: "82%", sub: "4 pending T1", onClick: () => actions.go("tests") },
        ].map((s) => (
          <button
            key={s.l}
            type="button"
            onClick={s.onClick}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm text-left hover:border-gray-300 hover:shadow-md transition-all"
          >
            <div className="text-3xl font-black text-gray-900">{s.v}</div>
            <div className="text-sm font-bold text-gray-800 mt-1">{s.l}</div>
            <p className="text-xs text-gray-500 mt-1">{s.sub}</p>
          </button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => actions.openSession("wed-b")}
          className="rounded-xl border-2 border-gray-200 bg-white p-5 text-left hover:shadow-md transition-all"
          style={{ borderColor: club.accent + "44" }}
        >
          <p className="text-xs font-bold text-gray-400 uppercase mb-3">Next session · click to open</p>
          <p className="font-black text-gray-900">{next.day} · {next.title}</p>
          <p className="text-sm text-gray-500 mt-1">{next.duration} min · RPE {next.rpe} · {next.objective}</p>
        </button>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-bold text-gray-400 uppercase mb-3">Teams overview</p>
          <div className="space-y-2">
            {TEAMS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => t.id === "u15" && actions.go("squad")}
                className="w-full flex items-center justify-between text-sm hover:bg-gray-50 rounded-lg px-2 py-1.5 -mx-2"
              >
                <span className="font-semibold text-gray-700">{t.name}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: club.accent + "18", color: club.accent }}>
                  {t.players} players
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => actions.go("loads")}
        className="w-full rounded-xl border border-gray-200 bg-white p-4 flex items-center justify-between hover:bg-gray-50"
      >
        <div className="text-left">
          <p className="text-xs font-bold text-gray-400 uppercase">Weekly load</p>
          <p className="font-black text-amber-600">2,665 AU · Medium</p>
        </div>
        <ChevronRight size={18} className="text-gray-300" />
      </button>
    </div>
  );
}

function PanelMicrocycle({ club, state, actions }) {
  const session = SESSIONS[state.selectedSessionId] || SESSIONS["wed-b"];
  const weekDays = ["mon-a", "wed-b", "fri-c", "sat-match"];
  const [previewEx, setPreviewEx] = useState(null);
  const [pdfExported, setPdfExported] = useState(false);

  const handleExport = () => {
    setPdfExported(true);
    setTimeout(() => setPdfExported(false), 2500);
  };

  return (
    <div className="space-y-4">
      {previewEx && <ExercisePreviewModal exercise={previewEx} onClose={() => setPreviewEx(null)} />}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-black text-gray-900">Microcycle · Week {CURRENT_WEEK}</h3>
        <button
          type="button"
          onClick={handleExport}
          className="flex items-center gap-2 text-xs font-bold text-white px-4 py-2 rounded-lg transition-opacity"
          style={{ backgroundColor: pdfExported ? "#22C55E" : club.accent }}
        >
          <Download size={14} /> {pdfExported ? "PDF ready ✓" : "Export session PDF"}
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {weekDays.map((sid) => {
          const s = SESSIONS[sid];
          const on = state.selectedSessionId === sid;
          return (
            <button
              key={sid}
              type="button"
              onClick={() => actions.selectSession(sid)}
              className={`rounded-xl border p-4 text-left transition-all ${on ? "shadow-md ring-2 ring-offset-1" : "border-gray-200 bg-white hover:border-gray-300"}`}
              style={on ? { borderColor: s.color, ringColor: s.color + "33" } : {}}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-gray-900 text-sm">{s.day}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: TYPE_COLORS[s.type] || s.color }}>
                  {s.type}
                </span>
              </div>
              <p className="font-semibold text-xs" style={{ color: club.accent }}>{s.framework}</p>
              <p className="text-[11px] text-gray-500 mt-1">{s.duration} min · RPE {s.rpe}</p>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100" style={{ backgroundColor: session.color + "12" }}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-xs font-bold uppercase" style={{ color: session.color }}>{session.date}</p>
              <h4 className="text-lg font-black text-gray-900">{session.title}</h4>
              <p className="text-sm text-gray-500 mt-1">{session.objective}</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-black text-gray-900">{session.duration} min</p>
              <p className="text-xs text-gray-500">RPE {session.rpe} · {session.load} AU</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-6">
          {session.blocks.map((block) => (
            <div key={block.id}>
              <p className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: session.color }} />
                {block.label}
              </p>
              <div className="space-y-2">
                {block.exercises.map((ex) => (
                  <ExerciseThumb
                    key={ex.id}
                    exercise={ex}
                    selected={state.selectedExerciseId === ex.id}
                    onClick={() => {
                      actions.selectExercise(ex.id);
                      setPreviewEx(ex);
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PanelMesocycle({ club, state, actions }) {
  const year = 2026;
  const month = 5;
  const rows = useMemo(() => buildMonthGrid(year, month), []);
  const selectedKey = state.selectedCalendarDate;
  const selectedEntry = selectedKey ? MESOCYCLE_CALENDAR[selectedKey] : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-gray-900">Mesocycle 2 · {MONTH_NAMES[month]} {year}</h3>
          <p className="text-xs text-gray-500 mt-1">Click a coloured day to open session · grey = rest / travel</p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-full text-white" style={{ backgroundColor: club.accent }}>
          Week {CURRENT_WEEK} active
        </span>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
          {WEEKDAY_SHORT.map((d) => (
            <div key={d} className="py-2 text-center text-[10px] font-bold text-gray-400 uppercase">{d}</div>
          ))}
        </div>
        {rows.map((row, ri) => (
          <div key={ri} className="grid grid-cols-7 border-b border-gray-50 last:border-0">
            {row.map((day, di) => {
              if (!day) return <div key={di} className="min-h-[72px] bg-gray-50/50" />;
              const key = dateKey(year, month, day);
              const entry = MESOCYCLE_CALENDAR[key];
              const session = entry ? SESSIONS[entry.sessionId] : null;
              const isToday = key === "2026-06-18";
              const isSelected = selectedKey === key;

              return (
                <button
                  key={di}
                  type="button"
                  onClick={() => entry && actions.openCalendarDay(key, entry.sessionId)}
                  disabled={!entry}
                  className={`min-h-[72px] p-1.5 text-left border-r border-gray-50 last:border-r-0 transition-all ${
                    entry ? "hover:bg-gray-50 cursor-pointer" : "cursor-default"
                  } ${isSelected ? "ring-2 ring-inset" : ""}`}
                  style={isSelected ? { ringColor: club.accent } : {}}
                >
                  <span className={`text-xs font-bold ${isToday ? "text-white w-6 h-6 rounded-full inline-flex items-center justify-center" : "text-gray-700"}`}
                    style={isToday ? { backgroundColor: club.accent } : {}}
                  >
                    {day}
                  </span>
                  {session && (
                    <div className="mt-1">
                      <span
                        className="block text-[9px] font-bold px-1 py-0.5 rounded text-white truncate"
                        style={{ backgroundColor: session.color }}
                      >
                        {session.type} · {entry.variant}
                      </span>
                      <span className="text-[8px] text-gray-400 block mt-0.5">W{entry.week}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {selectedEntry && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Selected day</p>
            <p className="font-black text-gray-900">{selectedKey} · {SESSIONS[selectedEntry.sessionId]?.title}</p>
          </div>
          <button
            type="button"
            onClick={() => actions.openSession(selectedEntry.sessionId)}
            className="text-xs font-bold text-white px-4 py-2 rounded-lg"
            style={{ backgroundColor: club.accent }}
          >
            Open in microcycle →
          </button>
        </div>
      )}

      <div className="grid sm:grid-cols-4 gap-2">
        {[
          { t: "A", c: "#3B82F6", l: "Extensive" },
          { t: "B", c: "#F59E0B", l: "Intensive" },
          { t: "C", c: "#EF4444", l: "Reactive" },
          { t: "M", c: "#6B7280", l: "Match" },
        ].map((x) => (
          <div key={x.t} className="rounded-lg border border-gray-100 p-3 text-center">
            <span className="text-xs font-bold px-2 py-0.5 rounded text-white" style={{ backgroundColor: x.c }}>{x.t}</span>
            <p className="text-[10px] text-gray-500 mt-1">{x.l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const SQUAD_FILTERS = [
  { id: "all", label: "All (22)" },
  { id: "premium", label: "Premium" },
  { id: "pending", label: "Tests pending" },
  { id: "gk", label: "GK" },
  { id: "def", label: "Defence" },
  { id: "mid", label: "Midfield" },
  { id: "fwd", label: "Forwards" },
];

function PanelSquad({ club, state, actions }) {
  const players = filterSquad(state.squadFilter);
  const selected = getPlayerById(state.selectedPlayerId);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {SQUAD_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => actions.setSquadFilter(f.id)}
            className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
              state.squadFilter === f.id ? "text-white border-transparent" : "text-gray-500 border-gray-200 hover:border-gray-300"
            }`}
            style={state.squadFilter === f.id ? { backgroundColor: club.accent } : {}}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        <div className={`lg:col-span-3 rounded-xl border border-gray-200 overflow-hidden max-h-[420px] overflow-y-auto ${selected ? "" : "lg:col-span-5"}`}>
          {players.map((p) => {
            const on = state.selectedPlayerId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => actions.selectPlayer(p.id)}
                className={`w-full flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0 text-left transition-colors ${
                  on ? "bg-green-50" : "bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-black text-gray-600">{p.num}</span>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.pos} · {p.age} yrs · {p.foot} foot</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold hidden sm:inline" style={{ color: club.accent }}>{p.plan}</span>
                  <span className={`font-bold px-2 py-0.5 rounded ${p.tests === "done" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                    {p.tests === "done" ? "Tests ✓" : "Pending"}
                  </span>
                  <span className={`font-bold px-2 py-0.5 rounded hidden md:inline ${
                    p.load === "High" || p.load === "Peak" ? "bg-red-50 text-red-600" : p.load === "Low" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-600"
                  }`}>
                    {p.load}
                  </span>
                  <ChevronRight size={14} className="text-gray-300" />
                </div>
              </button>
            );
          })}
        </div>

        {selected && (
          <div className="lg:col-span-2 rounded-xl border-2 bg-white p-5 space-y-4" style={{ borderColor: club.accent + "44" }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Player card</p>
                <h4 className="text-xl font-black text-gray-900">#{selected.num} {selected.name}</h4>
                <p className="text-sm text-gray-500">{selected.pos} · {selected.plan} plan</p>
              </div>
              <button type="button" onClick={() => actions.selectPlayer(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                ["Age", selected.age],
                ["Foot", selected.foot],
                ["Load", selected.load],
                ["Tests", selected.tests === "done" ? "Complete" : "Pending"],
              ].map(([l, v]) => (
                <div key={l} className="rounded-lg bg-gray-50 px-3 py-2">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{l}</p>
                  <p className="font-bold text-gray-800">{v}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => actions.goToPlayerTests(selected.id)}
                className="w-full text-xs font-bold text-white py-2.5 rounded-lg"
                style={{ backgroundColor: club.accent }}
              >
                View physical tests →
              </button>
              <button
                type="button"
                onClick={() => actions.go("microcycle")}
                className="w-full text-xs font-bold py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Weekly plan for squad
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PanelTests({ club, state, actions }) {
  const pid = state.selectedPlayerId || "p08";
  const player = getPlayerById(pid) || SQUAD[7];
  const tests = PLAYER_TESTS[pid] || PLAYER_TESTS.p08;

  const rows = SQUAD.filter((p) => p.tests === "done").slice(0, 8);

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Rated vs <strong>team average</strong> · click row to switch player</p>
      <div className="rounded-xl border border-gray-200 overflow-hidden max-h-48 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-50">
            <tr className="text-xs font-bold text-gray-400 uppercase">
              <th className="px-4 py-2 text-left">Player</th>
              <th className="px-4 py-2">T1</th>
              <th className="px-4 py-2">T2</th>
              <th className="px-4 py-2">T3</th>
              <th className="px-4 py-2">Rating</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const t = PLAYER_TESTS[p.id]?.endurance || { t1: 480 + p.num * 2, t2: 495 + p.num, t3: 510 + p.num, rating: "Good", pct: "+3%" };
              const on = p.id === player.id;
              return (
                <tr
                  key={p.id}
                  onClick={() => actions.selectPlayer(p.id)}
                  className={`border-t border-gray-100 cursor-pointer ${on ? "bg-green-50" : "hover:bg-gray-50"}`}
                >
                  <td className="px-4 py-2.5 font-bold">{p.name}</td>
                  {[t.t1, t.t2, t.t3].map((v, i) => (
                    <td key={i} className="px-4 py-2.5 text-center">
                      <span className="font-black text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs">{v}</span>
                    </td>
                  ))}
                  <td className="px-4 py-2.5 text-center text-xs font-bold text-green-600">{t.rating} {t.pct}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs font-bold text-gray-400 uppercase">Charts · {player.name}</p>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 p-4 bg-white">
          <p className="text-xs font-bold text-gray-400 uppercase mb-2">Endurance (m)</p>
          <ChartLines color={club.accent} values={[tests.endurance.t1, tests.endurance.t2, tests.endurance.t3]} teamAvg={[498, 510, 518]} />
        </div>
        <div className="rounded-xl border border-gray-200 p-4 bg-white">
          <p className="text-xs font-bold text-gray-400 uppercase mb-2">Sprint (s)</p>
          <ChartLines color="#3B82F6" values={[tests.sprint.t1, tests.sprint.t2, tests.sprint.t3]} teamAvg={[2.95, 2.88, 2.82]} />
        </div>
        <div className="rounded-xl border border-gray-200 p-4 bg-white">
          <p className="text-xs font-bold text-gray-400 uppercase mb-2">Agility (s)</p>
          <ChartLines color="#F59E0B" values={[tests.agility.t1, tests.agility.t2, tests.agility.t3]} teamAvg={[4.4, 4.3, 4.2]} />
        </div>
        <div className="rounded-xl border border-gray-200 p-4 bg-white">
          <p className="text-xs font-bold text-gray-400 uppercase mb-2">Vertical jump (cm)</p>
          <ChartLines color="#EF4444" values={[tests.jump.t1, tests.jump.t2, tests.jump.t3]} teamAvg={[36, 37, 38]} />
        </div>
      </div>
    </div>
  );
}

function PanelLoads({ club, state, actions }) {
  const sessions = Object.entries(WEEK_LOADS);
  const total = sessions.reduce((s, [, v]) => s + v.au, 0);
  const highlighted = state.selectedSessionId;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-gray-900">Weekly load · sRPE</h3>
        <span className="text-sm font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-700">Medium · {total.toLocaleString()} AU</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {sessions.map(([sid, s]) => {
          const on = highlighted === sid;
          return (
            <button
              key={sid}
              type="button"
              onClick={() => actions.openSession(sid)}
              className={`rounded-xl border p-4 text-center transition-all ${on ? "shadow-md ring-2" : "border-gray-200 bg-white hover:border-gray-300"}`}
              style={on ? { borderColor: s.color, ringColor: s.color + "33" } : {}}
            >
              <p className="text-xs font-bold text-gray-400">{s.label}</p>
              <p className="text-2xl font-black mt-1" style={{ color: s.color }}>{s.au}</p>
              <p className="text-[10px] text-gray-400 mt-1">Click → session</p>
            </button>
          );
        })}
      </div>
      <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
        {sessions.map(([sid, s]) => (
          <button
            key={sid}
            type="button"
            onClick={() => actions.openSession(sid)}
            className="h-full transition-opacity hover:opacity-80"
            style={{ width: `${(s.au / total) * 100}%`, backgroundColor: s.color }}
            title={`${s.label}: ${s.au} AU`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500">Volume × RPE × specificity — click any bar or card to open that session.</p>
    </div>
  );
}

function PanelTasks({ club, state, actions }) {
  const fw = TASK_FRAMEWORKS.find((f) => f.fw === state.taskFramework) || TASK_FRAMEWORKS[1];
  const params = TASK_PARAMS[state.taskFramework];
  const selectedTasks = state.selectedTasks;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {TASK_FRAMEWORKS.map((f) => (
          <button
            key={f.fw}
            type="button"
            onClick={() => actions.setTaskFramework(f.fw)}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-opacity ${state.taskFramework === f.fw ? "ring-2 ring-offset-2 ring-gray-400" : "opacity-70 hover:opacity-100"}`}
            style={{ backgroundColor: f.color }}
          >
            {f.fw} · {f.label}
          </button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 p-4 bg-white">
          <p className="text-xs font-bold text-gray-400 uppercase mb-3">Task types · click to toggle</p>
          {fw.tasks.map((t) => {
            const on = selectedTasks.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => actions.toggleTask(t)}
                className="w-full flex items-center gap-2 text-sm font-semibold py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-lg px-1"
              >
                <span
                  className={`w-5 h-5 rounded flex items-center justify-center text-[10px] text-white ${on ? "" : "bg-gray-200"}`}
                  style={on ? { backgroundColor: fw.color } : {}}
                >
                  {on ? "✓" : ""}
                </span>
                {t}
              </button>
            );
          })}
        </div>
        <div className="rounded-xl border border-gray-200 p-4 bg-white">
          <p className="text-xs font-bold text-gray-400 uppercase mb-3">Parameters · Session {fw.label}</p>
          {Object.entries(params).map(([l, v]) => (
            <div key={l} className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0">
              <span className="text-gray-500 capitalize">{l}</span>
              <span className="font-bold text-gray-800">{v}</span>
            </div>
          ))}
          <button
            type="button"
            onClick={() => actions.openSession(state.taskFramework === "A" ? "mon-a" : state.taskFramework === "B" ? "wed-b" : state.taskFramework === "C" ? "fri-c" : "mon-a")}
            className="mt-4 w-full text-xs font-bold text-white py-2.5 rounded-lg"
            style={{ backgroundColor: club.accent }}
          >
            Open matching session in microcycle →
          </button>
        </div>
      </div>
    </div>
  );
}

const PANELS = {
  dashboard: PanelDashboard,
  microcycle: PanelMicrocycle,
  mesocycle: PanelMesocycle,
  squad: PanelSquad,
  tests: PanelTests,
  loads: PanelLoads,
  tasks: PanelTasks,
};

export function ClubDashboardExplorer({ club = DEFAULT_CLUB }) {
  const [active, setActive] = useState("dashboard");
  const [selectedSessionId, setSelectedSessionId] = useState("wed-b");
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState(null);
  const [squadFilter, setSquadFilter] = useState("all");
  const [taskFramework, setTaskFramework] = useState("B");
  const [selectedTasks, setSelectedTasks] = useState(["Pressing trap", "4v4 transitions", "Finishing after press"]);

  const actions = {
    go: (module) => setActive(module),
    openSession: (sessionId) => {
      setSelectedSessionId(sessionId);
      setActive("microcycle");
    },
    selectSession: (sessionId) => setSelectedSessionId(sessionId),
    selectPlayer: (id) => setSelectedPlayerId(id),
    selectExercise: (id) => setSelectedExerciseId(id),
    setSquadFilter: (f) => setSquadFilter(f),
    openCalendarDay: (date, sessionId) => {
      setSelectedCalendarDate(date);
      setSelectedSessionId(sessionId);
    },
    goToPlayerTests: (id) => {
      setSelectedPlayerId(id);
      setActive("tests");
    },
    setTaskFramework: (fw) => {
      setTaskFramework(fw);
      const framework = TASK_FRAMEWORKS.find((f) => f.fw === fw);
      if (framework) setSelectedTasks([...framework.tasks]);
    },
    toggleTask: (task) => {
      setSelectedTasks((prev) =>
        prev.includes(task) ? prev.filter((t) => t !== task) : [...prev, task]
      );
    },
  };

  const state = {
    selectedSessionId,
    selectedPlayerId,
    selectedCalendarDate,
    selectedExerciseId,
    squadFilter,
    taskFramework,
    selectedTasks,
  };

  const activeNav = NAV.find((n) => n.id === active);
  const copy = MODULE_COPY[active];
  const Panel = PANELS[active];

  return (
    <div className="rounded-2xl border-2 border-gray-200 bg-white shadow-2xl shadow-gray-200/50 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-400/90" />
          <span className="w-3 h-3 rounded-full bg-amber-400/90" />
          <span className="w-3 h-3 rounded-full bg-green-400/90" />
        </div>
        <div className="flex-1 max-w-md mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-1.5 text-xs text-gray-400 font-mono text-center truncate">
            app.depro.club · {activeNav?.path || "/dashboard"}
          </div>
        </div>
        <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-200 bg-white flex-shrink-0">
          <img src={club.logo} alt="" className="w-full h-full object-contain p-0.5" />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[560px] lg:min-h-[720px]">
        <aside className="lg:w-56 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white p-4">
          <div className="flex items-center gap-3 mb-6 px-1">
            <img src={club.logo} alt={club.name} className="w-10 h-10 rounded-xl object-contain border border-gray-200 p-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-black text-gray-900 truncate">{club.name}</p>
              <p className="text-[10px] text-gray-400 font-semibold truncate">{club.team}</p>
            </div>
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-2">Navigation</p>
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {NAV.map((item) => {
              const Icon = item.icon;
              const on = active === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActive(item.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                    on ? "shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                  }`}
                  style={on ? { backgroundColor: club.accent, color: "#fff" } : {}}
                >
                  <Icon size={18} />
                  {item.label}
                  {on && <ChevronRight size={14} className="ml-auto hidden lg:block opacity-80" />}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 bg-[#FAFBFC]">
          <div className="px-5 md:px-8 py-5 border-b border-gray-100 bg-white">
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: club.accent }}>Interactive preview · click everything</p>
            <h3 className="text-xl md:text-2xl font-black text-gray-900">{copy.title}</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-2xl">{copy.desc}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-5 md:p-8">
            <Panel club={club} state={state} actions={actions} />
          </div>
        </main>
      </div>

      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 text-center text-xs text-gray-400">
        22 players · calendar mesocycle · drill previews · cross-module navigation
      </div>
    </div>
  );
}
