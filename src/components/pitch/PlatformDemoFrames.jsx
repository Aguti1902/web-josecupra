import { useState, useEffect } from "react";
import {
  Activity, Calendar, ChevronRight, Download, Filter,
  TrendingUp, Users, Zap,
} from "lucide-react";

/** Browser chrome wrapper — looks like a product screenshot */
function BrowserFrame({ title, children, accent = "#0A36F7" }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-xl shadow-gray-200/60 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
        </div>
        <div className="flex-1 mx-2">
          <div className="bg-white border border-gray-200 rounded-md px-3 py-1 text-[10px] text-gray-400 font-mono truncate text-center">
            app.depro.club · {title}
          </div>
        </div>
        <div className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-black text-white" style={{ backgroundColor: accent }}>
          RF
        </div>
      </div>
      <div className="p-4 md:p-5 bg-[#FAFBFC] min-h-[280px]">{children}</div>
    </div>
  );
}

function SidebarMini({ active, accent }) {
  const items = [
    { id: "dash", label: "Dashboard", icon: Zap },
    { id: "plan", label: "Microcycle", icon: Calendar },
    { id: "squad", label: "Squad", icon: Users },
    { id: "tests", label: "Tests", icon: Activity },
    { id: "loads", label: "Loads", icon: TrendingUp },
  ];
  return (
    <div className="w-28 flex-shrink-0 border-r border-gray-200 pr-3 space-y-0.5">
      <div className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Riverside FC</div>
      {items.map((it) => {
        const Icon = it.icon;
        const on = active === it.id;
        return (
          <div
            key={it.id}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[9px] font-semibold transition-all duration-300 ${
              on ? "text-white shadow-sm" : "text-gray-500"
            }`}
            style={on ? { backgroundColor: accent } : {}}
          >
            <Icon size={11} /> {it.label}
          </div>
        );
      })}
    </div>
  );
}

function DemoDashboard({ accent, step }) {
  return (
    <BrowserFrame title="dashboard" accent={accent}>
      <div className="flex gap-3">
        <SidebarMini active="dash" accent={accent} />
        <div className="flex-1 space-y-3">
          <div className="rounded-lg p-3 text-white" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}dd)` }}>
            <div className="text-[10px] opacity-80 font-bold uppercase">Riverside FC Academy</div>
            <div className="text-sm font-black">U15 Elite · Week 12</div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { l: "Players", v: step >= 1 ? "22" : "—" },
              { l: "Sessions", v: step >= 1 ? "3" : "—" },
              { l: "Tests done", v: step >= 2 ? "88%" : "—" },
            ].map((s) => (
              <div key={s.l} className="bg-white rounded-lg border border-gray-100 p-2 text-center">
                <div className="text-lg font-black text-gray-900 stat-number">{s.v}</div>
                <div className="text-[8px] text-gray-400 font-bold uppercase">{s.l}</div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg border border-gray-100 p-2.5">
            <div className="text-[9px] font-bold text-gray-400 uppercase mb-1">Next session</div>
            <div className={`text-xs font-bold text-gray-800 transition-opacity duration-500 ${step >= 2 ? "opacity-100" : "opacity-40"}`}>
              Wed · Session B · Intensive · 75 min
            </div>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

function DemoMicrocycle({ accent, step }) {
  const blocks = ["Warm-up", "Main block", "Task designer"];
  return (
    <BrowserFrame title="microcycle / week-12" accent={accent}>
      <div className="flex gap-3">
        <SidebarMini active="plan" accent={accent} />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-black text-gray-900">Session B · Intensive</div>
            <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Type B</span>
          </div>
          {blocks.map((b, i) => (
            <div
              key={b}
              className={`bg-white rounded-lg border p-2.5 transition-all duration-500 ${
                step > i ? "border-blue-200 shadow-sm" : "border-gray-100 opacity-50"
              }`}
            >
              <div className="text-[9px] font-bold text-gray-400 uppercase">{b}</div>
              <div className="text-[10px] text-gray-700 mt-0.5">
                {i === 0 && "Rondo 4v2 · 12 min · Video included"}
                {i === 1 && "Possession 8v8 · Press trigger · 25 min"}
                {i === 2 && "3 tasks selected · A/B/C framework"}
              </div>
              {step > i + 1 && i === 2 && (
                <div className="mt-2 flex items-center gap-1 text-[9px] font-bold text-blue-600 animate-pulse">
                  <Download size={10} /> Export club PDF
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </BrowserFrame>
  );
}

function DemoSquad({ accent, step }) {
  const players = [
    { n: "J. Morrison", pos: "CM", t: "Premium" },
    { n: "E. Brooks", pos: "CB", t: "Basic" },
    { n: "L. Chen", pos: "RW", t: "Premium" },
  ];
  return (
    <BrowserFrame title="squad / u15-elite" accent={accent}>
      <div className="flex gap-3">
        <SidebarMini active="squad" accent={accent} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Filter size={10} className="text-gray-400" />
            {["All", "Midfield", "With tests"].map((f, i) => (
              <span
                key={f}
                className={`text-[8px] font-bold px-2 py-0.5 rounded-full border transition-all duration-300 ${
                  step >= i ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-400"
                }`}
              >
                {f}
              </span>
            ))}
          </div>
          <div className="space-y-1">
            {players.map((p, i) => (
              <div
                key={p.n}
                className={`flex items-center justify-between bg-white rounded-lg border px-2.5 py-2 transition-all duration-500 ${
                  step > i ? "border-gray-200" : "border-transparent opacity-30"
                }`}
              >
                <div>
                  <div className="text-[10px] font-bold text-gray-900">{p.n}</div>
                  <div className="text-[8px] text-gray-400">{p.pos}</div>
                </div>
                <span className="text-[8px] font-bold text-blue-600">{p.t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

function DemoTests({ accent, step }) {
  const cols = ["T1", "T2", "T3"];
  const row = { name: "J. Morrison", vals: ["500", "520", step >= 2 ? "545" : "—"], colors: ["#22C55E", "#22C55E", "#22C55E"] };
  return (
    <BrowserFrame title="team-tests" accent={accent}>
      <div className="flex gap-3">
        <SidebarMini active="tests" accent={accent} />
        <div className="flex-1">
          <div className="text-[9px] text-gray-500 mb-2">Rated vs <strong>team average</strong> · auto</div>
          <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-4 gap-px bg-gray-100 text-[8px] font-bold text-gray-400 uppercase">
              <div className="bg-gray-50 p-1.5">Player</div>
              {cols.map((c) => <div key={c} className="bg-gray-50 p-1.5 text-center">{c}</div>)}
            </div>
            <div className="grid grid-cols-4 gap-px bg-gray-100">
              <div className="bg-white p-1.5 text-[9px] font-bold text-gray-800">{row.name}</div>
              {row.vals.map((v, i) => (
                <div key={i} className="bg-white p-1.5 text-center">
                  <span
                    className={`inline-block text-[9px] font-black px-1.5 py-0.5 rounded transition-all duration-700 ${
                      step > i ? "scale-100 opacity-100" : "scale-75 opacity-0"
                    }`}
                    style={{ backgroundColor: row.colors[i] + "20", color: row.colors[i] }}
                  >
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {step >= 3 && (
            <div className="mt-2 text-[9px] font-bold text-green-600 flex items-center gap-1">
              <ChevronRight size={10} /> Excellent · +9% vs team avg (Endurance T3)
            </div>
          )}
        </div>
      </div>
    </BrowserFrame>
  );
}

function DemoLoads({ accent, step }) {
  const sessions = [
    { l: "Match", v: step >= 1 ? 720 : "—", c: "#EF4444" },
    { l: "A", v: step >= 1 ? 405 : "—", c: "#22C55E" },
    { l: "B", v: step >= 2 ? 890 : "—", c: "#F59E0B" },
    { l: "C", v: step >= 2 ? 650 : "—", c: "#F59E0B" },
  ];
  return (
    <BrowserFrame title="loads / week-12" accent={accent}>
      <div className="flex gap-3">
        <SidebarMini active="loads" accent={accent} />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-gray-500 uppercase">Weekly load</span>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full transition-all duration-500 ${
              step >= 3 ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-400"
            }`}>
              {step >= 3 ? "Medium · 2,665" : "Calculating…"}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {sessions.map((s) => (
              <div key={s.l} className="bg-white rounded-lg border border-gray-100 p-2 text-center">
                <div className="text-[8px] text-gray-400 font-bold">{s.l}</div>
                <div className="text-sm font-black stat-number" style={{ color: s.c }}>{s.v}</div>
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-1000 ease-out"
              style={{ width: step >= 3 ? "68%" : `${step * 20}%` }}
            />
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

const DEMOS = [
  { id: "dashboard", label: "Club dashboard", Component: DemoDashboard },
  { id: "microcycle", label: "Session planning", Component: DemoMicrocycle },
  { id: "squad", label: "Squad registry", Component: DemoSquad },
  { id: "tests", label: "Physical tests", Component: DemoTests },
  { id: "loads", label: "Load monitoring", Component: DemoLoads },
];

export function PlatformDemoCarousel({ accent = "#0A36F7" }) {
  const [demoIdx, setDemoIdx] = useState(0);
  const [step, setStep] = useState(0);

  const demo = DEMOS[demoIdx];
  const DemoComponent = demo.Component;

  useEffect(() => {
    const tick = setInterval(() => setStep((s) => (s >= 4 ? 0 : s + 1)), 900);
    return () => clearInterval(tick);
  }, [demoIdx]);

  useEffect(() => {
    const rotate = setInterval(() => {
      setDemoIdx((i) => (i + 1) % DEMOS.length);
      setStep(0);
    }, 5500);
    return () => clearInterval(rotate);
  }, []);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {DEMOS.map((d, i) => (
          <button
            key={d.id}
            type="button"
            onClick={() => { setDemoIdx(i); setStep(0); }}
            className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
              i === demoIdx
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>
      <div className="relative">
        <DemoComponent accent={accent} step={step} />
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${step >= i ? "w-4 bg-blue-600" : "w-1 bg-gray-300"}`}
            />
          ))}
        </div>
      </div>
      <p className="text-center text-xs text-gray-400 mt-6">Live product simulation · auto-plays like a demo GIF</p>
    </div>
  );
}

export function PlatformScreenshotGrid() {
  const shots = [
    { title: "Branded club sidebar", desc: "Logo, colors & team switcher on every screen.", img: "/foto2.jpg", tag: "White-label" },
    { title: "Periodized calendar", desc: "Mesocycles aligned to your training days.", img: "/foto3.jpg", tag: "Planning" },
    { title: "Match-day integration", desc: "Sessions A/B/C/D + match load in one week.", img: "/foto4.jpg", tag: "Loads" },
    { title: "Performance culture", desc: "Data-driven culture parents & sponsors see.", img: "/foto1.jpg", tag: "Results" },
  ];
  return (
    <div className="grid sm:grid-cols-2 gap-5">
      {shots.map((s) => (
        <div key={s.title} className="group rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="relative h-44 overflow-hidden">
            <img src={s.img} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-white/95 text-gray-800 px-2 py-1 rounded-md shadow-sm">
              {s.tag}
            </span>
          </div>
          <div className="p-4">
            <h4 className="font-bold text-gray-900 text-sm">{s.title}</h4>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{s.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
