import { Check, Sparkles, TrendingUp, Users, Activity, Calendar, BarChart3 } from "lucide-react";

/** Dashboard principal — hero mockup */
export function DashboardMockup() {
  const bars = [45, 72, 58, 88, 65, 92, 70, 85];
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="absolute -inset-6 bg-depro-blue/8 rounded-[2.5rem] blur-3xl" aria-hidden="true" />
      <div className="relative bg-white rounded-2xl border border-depro-border shadow-2xl overflow-hidden depro-float">
        <div className="flex items-center gap-2 px-4 py-3 bg-depro-gray-light border-b border-depro-border">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <span className="text-[10px] font-mono text-depro-gray ml-2">app.depro.es/dashboard</span>
        </div>
        <div className="flex">
          <div className="w-14 bg-depro-dark py-4 flex flex-col items-center gap-3 shrink-0">
            {[LayoutIcon, Calendar, Users, Activity].map((Icon, i) => (
              <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center ${i === 0 ? "bg-depro-blue" : "bg-white/10"}`}>
                <Icon size={14} className="text-white" />
              </div>
            ))}
          </div>
          <div className="flex-1 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-depro-gray font-bold uppercase">Microciclo · Sem 12</p>
                <p className="text-sm font-black text-depro-dark">Cadete A · Pretemporada</p>
              </div>
              <span className="flex items-center gap-1 text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 depro-pulse-dot" /> IA activa
              </span>
            </div>
            <div className="flex items-end gap-1 h-16">
              {bars.map((h, i) => (
                <div key={i} className="flex-1 bg-depro-blue-light rounded-t overflow-hidden flex items-end">
                  <div className="w-full bg-gradient-to-t from-depro-blue to-depro-blue-dark rounded-t depro-grow-bar" style={{ "--bar-h": `${h}%`, animationDelay: `${i * 0.08}s` }} />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Jugadores", val: "22", icon: Users },
                { label: "Carga media", val: "6.8", icon: TrendingUp },
                { label: "Sesiones", val: "3/3", icon: Calendar },
              ].map(({ label, val, icon: Icon }) => (
                <div key={label} className="bg-depro-gray-light rounded-lg p-2">
                  <Icon size={10} className="text-depro-blue mb-0.5" />
                  <p className="text-xs font-black text-depro-dark">{val}</p>
                  <p className="text-[8px] text-depro-gray">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LayoutIcon({ size, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1" fill="currentColor" />
      <rect x="14" y="3" width="7" height="4" rx="1" fill="currentColor" opacity="0.6" />
      <rect x="14" y="10" width="7" height="11" rx="1" fill="currentColor" opacity="0.4" />
      <rect x="3" y="13" width="7" height="8" rx="1" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

/** Mockup sesiones / microciclo */
export function SessionsMockup() {
  const sessions = [
    { day: "L", label: "Activación", load: "Baja", done: true },
    { day: "X", label: "Fuerza-Vel.", load: "Alta", done: true },
    { day: "V", label: "Descarga", load: "Media", done: false },
  ];
  return (
    <div className="bg-white rounded-2xl border border-depro-border shadow-xl p-5 w-full max-w-sm">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={14} className="text-depro-blue" />
        <span className="text-xs font-bold text-depro-dark">Sesiones generadas · IA</span>
      </div>
      <div className="space-y-2">
        {sessions.map((s, i) => (
          <div key={s.day} className="flex items-center gap-3 p-3 rounded-xl border border-depro-border depro-fade-in" style={{ animationDelay: `${i * 0.2}s` }}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${s.done ? "bg-depro-blue text-white" : "bg-depro-gray-light text-depro-gray"}`}>{s.day}</div>
            <div className="flex-1">
              <p className="text-xs font-bold text-depro-dark">{s.label}</p>
              <p className="text-[10px] text-depro-gray">Carga {s.load}</p>
            </div>
            {s.done && <Check size={14} className="text-green-500" />}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Mockup control de cargas + wellness */
export function LoadMockup() {
  const players = [
    { name: "García", rpe: 7, sleep: 8, fatigue: 3 },
    { name: "López", rpe: 9, sleep: 6, fatigue: 7 },
    { name: "Ruiz", rpe: 5, sleep: 9, fatigue: 2 },
  ];
  return (
    <div className="bg-white rounded-2xl border border-depro-border shadow-xl overflow-hidden w-full max-w-md">
      <div className="px-4 py-3 bg-depro-blue text-white flex items-center justify-between">
        <span className="text-xs font-bold">Control de carga · Sub-14</span>
        <Activity size={14} />
      </div>
      <table className="w-full text-[10px]">
        <thead className="bg-depro-gray-light">
          <tr>
            <th className="text-left px-3 py-2 font-bold text-depro-gray">Jugador</th>
            <th className="px-2 py-2 font-bold text-depro-gray">RPE</th>
            <th className="px-2 py-2 font-bold text-depro-gray">Sueño</th>
            <th className="px-2 py-2 font-bold text-depro-gray">Fatiga</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p) => (
            <tr key={p.name} className="border-t border-depro-border">
              <td className="px-3 py-2 font-semibold text-depro-dark">{p.name}</td>
              <td className="px-2 py-2 text-center"><span className={`px-1.5 py-0.5 rounded font-bold ${p.rpe >= 8 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>{p.rpe}</span></td>
              <td className="px-2 py-2 text-center text-depro-gray">{p.sleep}h</td>
              <td className="px-2 py-2 text-center text-depro-gray">{p.fatigue}/10</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-100 text-[9px] text-yellow-700 font-medium">
        ⚠ Alerta: 1 jugador en zona de sobrecarga
      </div>
    </div>
  );
}

/** Mockup tests físicos */
export function TestsMockup() {
  const tests = [
    { name: "Sprint 30m", val: "4.12s", trend: "+3%", good: true },
    { name: "Salto CMJ", val: "38.2 cm", trend: "+5%", good: true },
    { name: "Agilidad 5-10-5", val: "4.82 s", trend: "-2%", good: false },
  ];
  return (
    <div className="bg-white rounded-2xl border border-depro-border shadow-xl p-5 w-full max-w-sm">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={14} className="text-depro-blue" />
        <span className="text-xs font-bold text-depro-dark">Tests físicos · T2</span>
      </div>
      {tests.map((t) => (
        <div key={t.name} className="flex items-center justify-between py-2.5 border-b border-depro-border last:border-0">
          <div>
            <p className="text-xs font-bold text-depro-dark">{t.name}</p>
            <p className="text-sm font-black text-depro-blue">{t.val}</p>
          </div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${t.good ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>{t.trend}</span>
        </div>
      ))}
    </div>
  );
}

/** Mockup plan jugador individual */
export function PlayerPlanMockup() {
  return (
    <div className="bg-white rounded-2xl border border-depro-border shadow-xl p-5 w-full max-w-sm depro-float">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-depro-blue flex items-center justify-center text-white font-black text-sm">CM</div>
        <div>
          <p className="text-xs font-bold text-depro-dark">Carlos · Centrocampista</p>
          <p className="text-[10px] text-depro-gray">Plan Pro · Semana 8</p>
        </div>
      </div>
      <div className="space-y-2">
        {["Fuerza lower body", "Velocidad + agilidad", "Recuperación activa"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className="w-full h-2 bg-depro-gray-light rounded-full overflow-hidden">
              <div className="h-full bg-depro-blue rounded-full depro-fill-bar" style={{ animationDelay: `${i * 0.5}s` }} />
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-depro-gray mt-3">Adaptado por IA según feedback y tests</p>
    </div>
  );
}

/** Mockup club multi-equipo */
export function ClubOverviewMockup() {
  const teams = [
    { name: "Alevín A", cat: "Sub-12", players: 18, load: "OK" },
    { name: "Cadete A", cat: "Sub-14", players: 22, load: "⚠" },
    { name: "Juvenil", cat: "Sub-16", players: 20, load: "OK" },
  ];
  return (
    <div className="bg-white rounded-2xl border border-depro-border shadow-xl overflow-hidden w-full max-w-md">
      <div className="px-4 py-3 border-b border-depro-border flex items-center justify-between">
        <span className="text-xs font-bold text-depro-dark">CD Demo Fútbol · Vista club</span>
        <span className="text-[9px] bg-depro-blue/10 text-depro-blue px-2 py-0.5 rounded-full font-bold">3 equipos</span>
      </div>
      {teams.map((t) => (
        <div key={t.name} className="flex items-center justify-between px-4 py-3 border-b border-depro-border last:border-0 hover:bg-depro-gray-light/50">
          <div>
            <p className="text-xs font-bold text-depro-dark">{t.name}</p>
            <p className="text-[10px] text-depro-gray">{t.cat} · {t.players} jugadores</p>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.load === "OK" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-700"}`}>{t.load}</span>
        </div>
      ))}
    </div>
  );
}
