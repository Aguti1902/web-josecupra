import { useState } from "react";
import {
  Activity, Calendar, ChevronRight, ClipboardList, Download,
  LayoutDashboard, TrendingUp, Users, Zap,
} from "lucide-react";

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
  dashboard: {
    title: "Club command center",
    desc: "Directors and coaches see team status, next sessions and test completion in one branded home screen.",
  },
  microcycle: {
    title: "Weekly session plan",
    desc: "Open any training day — warm-up, main block and tasks are already configured for your category.",
  },
  mesocycle: {
    title: "Periodization map",
    desc: "Mesocycles and microcycles aligned to your competition calendar. Every session type mapped across the block.",
  },
  squad: {
    title: "Squad intelligence",
    desc: "Filter roster by position, plan type and test status. Drill into any player card.",
  },
  tests: {
    title: "Physical testing suite",
    desc: "T1 → T2 → T3 evolution rated automatically vs team average — not generic benchmarks.",
  },
  loads: {
    title: "Load monitoring",
    desc: "Volume × RPE × specificity with weekly traffic lights. Match + training in one calendar.",
  },
  tasks: {
    title: "Task designer",
    desc: "Build conditional tasks per framework A/B/C/D. Parameters and cues sync to PDFs.",
  },
};

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

function PanelDashboard({ club }) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl p-6 text-white" style={{ background: `linear-gradient(135deg, ${club.accent}, ${club.accent}cc)` }}>
        <p className="text-xs font-bold uppercase opacity-80 mb-1">{club.name}</p>
        <h3 className="text-2xl font-black">{club.team} · Week 12</h3>
        <p className="text-sm opacity-90 mt-1">Mesocycle 2 · Block B · Mon / Wed / Fri</p>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { l: "Players", v: "22", sub: "Full roster active" },
          { l: "Sessions this week", v: "3", sub: "A · B · C configured" },
          { l: "Tests completed", v: "88%", sub: "T1 baseline done" },
        ].map((s) => (
          <div key={s.l} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="text-3xl font-black text-gray-900">{s.v}</div>
            <div className="text-sm font-bold text-gray-800 mt-1">{s.l}</div>
            <p className="text-xs text-gray-500 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-bold text-gray-400 uppercase mb-3">Next session</p>
          <p className="font-black text-gray-900">Wednesday · Session B · Intensive</p>
          <p className="text-sm text-gray-500 mt-1">75 min · Pressing triggers · RPE target 7</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-bold text-gray-400 uppercase mb-3">Teams overview</p>
          <div className="space-y-2">
            {["Sub-13 A", "Sub-15 A", "Juvenil A"].map((t) => (
              <div key={t} className="flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-700">{t}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: club.accent + "18", color: club.accent }}>Active</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PanelMicrocycle({ club }) {
  const days = [
    { day: "Monday", session: "A · Extensive", type: "A", note: "Technical possession · 45 min" },
    { day: "Wednesday", session: "B · Intensive", type: "B", note: "Pressing triggers · 75 min" },
    { day: "Friday", session: "C · Reactive", type: "C", note: "Transitions 4v4 · 60 min" },
    { day: "Saturday", session: "Match", type: "M", note: "League fixture · load tracked" },
  ];
  const typeColor = { A: "#3B82F6", B: "#F59E0B", C: "#EF4444", M: "#6B7280" };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-black text-gray-900">Microcycle · Week 12</h3>
        <button type="button" className="flex items-center gap-2 text-xs font-bold text-white px-4 py-2 rounded-lg" style={{ backgroundColor: club.accent }}>
          <Download size={14} /> Export session PDF
        </button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {days.map((d) => (
          <div key={d.day} className="rounded-xl border border-gray-200 bg-white p-4 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-gray-900">{d.day}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: typeColor[d.type] }}>{d.type}</span>
            </div>
            <p className="font-semibold text-sm" style={{ color: club.accent }}>{d.session}</p>
            <p className="text-xs text-gray-500 mt-1">{d.note}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Session B · blocks</p>
        {["Warm-up: Rondo 4v2 · 12 min", "Main: Possession 8v8 · 25 min", "Tasks: 3 selected · A/B/C framework"].map((b) => (
          <div key={b} className="text-sm text-gray-700 py-2 border-b border-gray-200 last:border-0">{b}</div>
        ))}
      </div>
    </div>
  );
}

function PanelMesocycle({ club }) {
  const weeks = [
    { w: "W1", a: "A1", b: "B1", c: "C1", load: "Low" },
    { w: "W2", a: "A2", b: "B2", c: "C2", load: "Medium" },
    { w: "W3", a: "A3", b: "B3", c: "D1", load: "High" },
    { w: "W4", a: "Match", b: "A4", c: "—", load: "Peak" },
  ];
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-black text-gray-900">Mesocycle 2 · Competitive block</h3>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-bold text-gray-400 uppercase">
              <th className="px-4 py-3">Week</th>
              <th className="px-4 py-3">Mon</th>
              <th className="px-4 py-3">Wed</th>
              <th className="px-4 py-3">Fri</th>
              <th className="px-4 py-3">Load</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((row) => (
              <tr key={row.w} className="border-t border-gray-100">
                <td className="px-4 py-3 font-black text-gray-900">{row.w}</td>
                <td className="px-4 py-3 font-semibold" style={{ color: club.accent }}>{row.a}</td>
                <td className="px-4 py-3 font-semibold" style={{ color: club.accent }}>{row.b}</td>
                <td className="px-4 py-3 font-semibold text-gray-600">{row.c}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">{row.load}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500">Every variant (A1, B2, C3…) is pre-configured by DEPRO each month — coaches only open and run.</p>
    </div>
  );
}

function PanelSquad({ club }) {
  const players = [
    { n: "Pol García", pos: "CM", plan: "Premium", tests: "Done" },
    { n: "Marc Vidal", pos: "CB", plan: "Basic", tests: "Done" },
    { n: "Alex Ruiz", pos: "RW", plan: "Premium", tests: "Pending" },
    { n: "Sergi Costa", pos: "GK", plan: "Basic", tests: "Done" },
  ];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {["All", "Midfield", "With tests", "Premium plan"].map((f, i) => (
          <span key={f} className={`text-xs font-bold px-3 py-1.5 rounded-full border ${i === 0 ? "text-white border-transparent" : "text-gray-500 border-gray-200"}`} style={i === 0 ? { backgroundColor: club.accent } : {}}>{f}</span>
        ))}
      </div>
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        {players.map((p) => (
          <div key={p.n} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0 bg-white hover:bg-gray-50">
            <div>
              <p className="font-bold text-gray-900 text-sm">{p.n}</p>
              <p className="text-xs text-gray-400">{p.pos}</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="font-semibold" style={{ color: club.accent }}>{p.plan}</span>
              <span className={`font-bold px-2 py-0.5 rounded ${p.tests === "Done" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{p.tests}</span>
              <ChevronRight size={14} className="text-gray-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PanelTests({ club }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Rated vs <strong>team average</strong> · automatic</p>
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs font-bold text-gray-400 uppercase">
              <th className="px-4 py-2 text-left">Player</th>
              <th className="px-4 py-2">T1</th>
              <th className="px-4 py-2">T2</th>
              <th className="px-4 py-2">T3</th>
              <th className="px-4 py-2">Rating</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-gray-100">
              <td className="px-4 py-3 font-bold">Pol García</td>
              {["500", "520", "545"].map((v) => (
                <td key={v} className="px-4 py-3 text-center"><span className="font-black text-green-600 bg-green-50 px-2 py-0.5 rounded">{v}</span></td>
              ))}
              <td className="px-4 py-3 text-center text-xs font-bold text-green-600">Excellent +9%</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 p-4 bg-white">
          <p className="text-xs font-bold text-gray-400 uppercase mb-2">Endurance · Pol García</p>
          <ChartLines color={club.accent} values={[500, 520, 545]} teamAvg={[498, 510, 518]} />
        </div>
        <div className="rounded-xl border border-gray-200 p-4 bg-white">
          <p className="text-xs font-bold text-gray-400 uppercase mb-2">Sprint · Pol García</p>
          <ChartLines color="#3B82F6" values={[2.92, 2.84, 2.78]} teamAvg={[2.95, 2.88, 2.82]} />
        </div>
      </div>
    </div>
  );
}

function PanelLoads({ club }) {
  const sessions = [
    { l: "Match", v: 720, c: "#EF4444" },
    { l: "A", v: 405, c: "#22C55E" },
    { l: "B", v: 890, c: "#F59E0B" },
    { l: "C", v: 650, c: "#F59E0B" },
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-gray-900">Weekly load · sRPE</h3>
        <span className="text-sm font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-700">Medium · 2,665 AU</span>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {sessions.map((s) => (
          <div key={s.l} className="rounded-xl border border-gray-200 bg-white p-4 text-center">
            <p className="text-xs font-bold text-gray-400">{s.l}</p>
            <p className="text-2xl font-black mt-1" style={{ color: s.c }}>{s.v}</p>
          </div>
        ))}
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full w-[68%] rounded-full bg-amber-400" />
      </div>
      <p className="text-xs text-gray-500">Volume × RPE × specificity — traffic light updates when load exceeds team range.</p>
    </div>
  );
}

function PanelTasks({ club }) {
  const frameworks = [
    { fw: "A", label: "Extensive", color: "#3B82F6" },
    { fw: "B", label: "Intensive", color: "#F59E0B" },
    { fw: "C", label: "Reactive", color: "#EF4444" },
    { fw: "D", label: "Complementary", color: "#10B981" },
  ];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {frameworks.map((f) => (
          <span key={f.fw} className="text-xs font-bold px-3 py-1.5 rounded-lg text-white" style={{ backgroundColor: f.color }}>{f.fw} · {f.label}</span>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 p-4 bg-white">
          <p className="text-xs font-bold text-gray-400 uppercase mb-3">Task types · multiselect</p>
          {["Positional rondo", "4v4 transitions", "Finishing"].map((t) => (
            <div key={t} className="flex items-center gap-2 text-sm font-semibold py-2 border-b border-gray-50 last:border-0">
              <span className="w-4 h-4 rounded bg-blue-600 text-white text-[10px] flex items-center justify-center">✓</span>
              {t}
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-gray-200 p-4 bg-white">
          <p className="text-xs font-bold text-gray-400 uppercase mb-3">Parameters · Session Reactive</p>
          {[
            { l: "Space", v: "30 × 20 m" },
            { l: "Players", v: "8v8 + 2 neutrals" },
            { l: "Duration", v: "12 min × 3 sets" },
          ].map((p) => (
            <div key={p.l} className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0">
              <span className="text-gray-500">{p.l}</span>
              <span className="font-bold text-gray-800">{p.v}</span>
            </div>
          ))}
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

export function ClubDashboardExplorer({
  club = DEFAULT_CLUB,
}) {
  const [active, setActive] = useState("dashboard");
  const activeNav = NAV.find((n) => n.id === active);
  const copy = MODULE_COPY[active];
  const Panel = PANELS[active];

  return (
    <div className="rounded-2xl border-2 border-gray-200 bg-white shadow-2xl shadow-gray-200/50 overflow-hidden">
      {/* Browser chrome */}
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

      <div className="flex flex-col lg:flex-row min-h-[520px] lg:min-h-[640px]">
        {/* Sidebar */}
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

        {/* Main */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#FAFBFC]">
          <div className="px-5 md:px-8 py-5 border-b border-gray-100 bg-white">
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: club.accent }}>Interactive preview</p>
            <h3 className="text-xl md:text-2xl font-black text-gray-900">{copy.title}</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-2xl">{copy.desc}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-5 md:p-8">
            <Panel club={club} />
          </div>
        </main>
      </div>

      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 text-center text-xs text-gray-400">
        Click any module in the sidebar — full club dashboard simulation
      </div>
    </div>
  );
}
