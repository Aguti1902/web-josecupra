import { useMemo, useState } from "react";
import {
  Activity, Calendar, CheckCircle, ClipboardList, MessageSquare, Play, Plus,
  Save, Send, Sparkles, Trash2, TrendingUp, Upload, Users, X,
} from "lucide-react";
import { PALMEIRAS } from "../../../../lib/nexgentConfig";
import {
  CHAT_CHANNELS, DEMO_PLAYERS, EMPTY_DIAGRAM, EXEC_KPIS, GPS_DEMO_ROWS,
  MEDICAL_PLAYERS, MESO_PHASES, MICROCYCLE, PLAYER_TESTS, PRESET_PROMPTS,
  SEASON_BLOCKS, SEED_CHAT_MESSAGES, SEED_SCOUTING, SEED_SESSIONS, VIDEO_CLIPS,
  VIDEO_EVENTS, WEEKLY_LOAD, YOUTH_CATEGORIES, YOUTH_SQUAD, loadBandColor,
  mockAiSummary, mockClassifyLoad, riskColor,
} from "../../../../lib/nexgentSeedData";
import NexGentClubBanner from "../NexGentClubBanner";
import PitchDiagram from "./PitchDiagram";

const ACCENT = PALMEIRAS.accent;
const TYPE_COLORS = {
  recovery: "#94A3B8", strength: "#3B82F6", tactical: ACCENT, speed: "#F59E0B",
  activation: "#8B5CF6", match: "#EF4444", rest: "#E5E7EB",
};

function PageTitle({ children, sub }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-black text-depro-dark">{children}</h1>
      {sub && <p className="text-depro-gray text-sm mt-1">{sub}</p>}
    </div>
  );
}

function WeeklyLoadChart({ data, accent }) {
  const max = Math.max(...data.map((d) => d.load));
  return (
    <div className="flex items-end justify-between gap-2 h-44 pt-2">
      {data.map(({ day, load }) => (
        <div key={day} className="flex-1 flex flex-col items-center gap-2">
          <div className="w-full flex items-end justify-center" style={{ height: "140px" }}>
            <div className="w-full max-w-[36px] rounded-t-md" style={{ height: `${Math.max(8, (load / max) * 100)}%`, backgroundColor: accent }} />
          </div>
          <span className="text-xs font-bold text-depro-gray">{day}</span>
        </div>
      ))}
    </div>
  );
}

function ScoreBar({ label, value }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-depro-gray">{label}</span>
        <span className="font-bold">{value}/10</span>
      </div>
      <div className="h-2 bg-depro-gray-light rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value * 10}%`, backgroundColor: ACCENT }} />
      </div>
    </div>
  );
}

export function InicioPanel({ onNavigate }) {
  const highRisk = DEMO_PLAYERS.filter((p) => p.injuryRisk === "alto").length;
  const teamRisk = highRisk >= 2 ? "alto" : highRisk === 1 ? "medio" : "bajo";
  const testPct = Math.round((DEMO_PLAYERS.filter((p) => p.loadBand === "optima").length / DEMO_PLAYERS.length) * 100);
  const quickLinks = [
    { id: "planificacion", icon: Calendar, label: "Microciclo", sub: "Semana 24 · Mesociclo 3" },
    { id: "sesiones", icon: ClipboardList, label: "Sesiones", sub: "3 tareas en banco" },
    { id: "carga", icon: TrendingUp, label: "Cargas GPS", sub: "Import Catapult listo" },
    { id: "chat", icon: MessageSquare, label: "Chat staff", sub: "3 mensajes nuevos" },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <NexGentClubBanner team={PALMEIRAS.team} role="Entrenador" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Plantilla activa", value: String(DEMO_PLAYERS.length), sub: `jugadores · ${PALMEIRAS.team}`, nav: "plantilla" },
          { icon: Calendar, label: "Próxima sesión", value: "Hoy 09:30", sub: "Técnico-táctico · Intensidad media", nav: "sesiones" },
          { icon: CheckCircle, label: "Tests completados", value: `${testPct}%`, sub: "Evaluación T3 · Semana 24", color: ACCENT, nav: "plantilla" },
          { icon: Activity, label: "Riesgo lesión", value: teamRisk, sub: `${highRisk} jugadores en alerta`, color: riskColor(teamRisk), nav: "medico" },
        ].map(({ icon: Icon, label, value, sub, color, nav }) => (
          <button
            key={label}
            type="button"
            onClick={() => nav && onNavigate?.(nav)}
            className="bg-white rounded-xl border border-depro-border p-4 shadow-sm text-left hover:border-green-600/40 transition-colors"
          >
            <div className="flex items-center gap-2 text-depro-gray text-xs font-bold uppercase mb-2">
              <Icon size={14} /> {label}
            </div>
            <p className="text-3xl font-black capitalize text-depro-dark" style={color ? { color } : undefined}>{value}</p>
            <p className="text-xs text-depro-gray mt-1">{sub}</p>
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {quickLinks.map(({ id, icon: Icon, label, sub }) => (
          <button key={id} type="button" onClick={() => onNavigate?.(id)} className="bg-white rounded-xl border border-depro-border p-4 text-left hover:shadow-sm hover:border-green-600/30 transition-all">
            <Icon size={18} className="text-depro-blue mb-2" />
            <p className="font-bold text-sm text-depro-dark">{label}</p>
            <p className="text-xs text-depro-gray mt-0.5">{sub}</p>
          </button>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-depro-border p-5 shadow-sm">
          <h2 className="font-bold text-depro-dark mb-4">Carga semanal del equipo (AU)</h2>
          <WeeklyLoadChart data={WEEKLY_LOAD} accent={ACCENT} />
        </div>
        <div className="bg-white rounded-xl border border-depro-border p-5 shadow-sm">
          <h2 className="font-bold text-depro-dark mb-4">Estado de la plantilla</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {DEMO_PLAYERS.map((p) => (
              <button key={p.id} type="button" onClick={() => onNavigate?.("plantilla")} className="flex flex-col items-center gap-1 hover:opacity-80">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-xs font-black border-2 bg-white" style={{ borderColor: loadBandColor(p.loadBand) }}>
                  {p.avatar}
                </div>
                <span className="text-[10px] text-depro-gray truncate w-full text-center">{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PlantillaPanel() {
  const [selected, setSelected] = useState(DEMO_PLAYERS[8]);
  const tests = PLAYER_TESTS[selected?.id];

  return (
    <div className="max-w-6xl space-y-6">
      <PageTitle sub={`${PALMEIRAS.team} · ${DEMO_PLAYERS.length} jugadores`}>Plantilla</PageTitle>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-depro-border bg-white overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-depro-gray-light text-depro-gray text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Jugador</th>
                <th className="px-4 py-3 text-left">Pos</th>
                <th className="px-4 py-3 text-right">Min</th>
                <th className="px-4 py-3 text-right">G/A</th>
                <th className="px-4 py-3 text-left">Carga</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_PLAYERS.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className={`border-t border-depro-border cursor-pointer hover:bg-green-50/50 ${selected?.id === p.id ? "bg-green-50" : ""}`}
                >
                  <td className="px-4 py-3 font-bold text-depro-gray">{p.num}</td>
                  <td className="px-4 py-3 font-bold">{p.name}</td>
                  <td className="px-4 py-3 text-depro-gray">{p.position}</td>
                  <td className="px-4 py-3 text-right">{p.minutes}</td>
                  <td className="px-4 py-3 text-right">{p.goals}/{p.assists}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full capitalize" style={{ background: `${loadBandColor(p.loadBand)}22`, color: loadBandColor(p.loadBand) }}>
                      {p.loadBand}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {selected && (
          <div className="rounded-xl border border-depro-border bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-sm font-black border-2" style={{ borderColor: loadBandColor(selected.loadBand) }}>
                {selected.avatar}
              </div>
              <div>
                <h2 className="text-xl font-black">{selected.name}</h2>
                <p className="text-sm text-depro-gray">#{selected.num} · {selected.position} · {selected.age} años</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-depro-gray-light p-3"><div className="text-xs text-depro-gray">Minutos</div><div className="font-black">{selected.minutes}</div></div>
              <div className="rounded-lg bg-depro-gray-light p-3"><div className="text-xs text-depro-gray">Sprint max</div><div className="font-black">{selected.sprint ? `${selected.sprint} km/h` : "—"}</div></div>
              <div className="rounded-lg bg-depro-gray-light p-3"><div className="text-xs text-depro-gray">Goles</div><div className="font-black">{selected.goals}</div></div>
              <div className="rounded-lg bg-depro-gray-light p-3"><div className="text-xs text-depro-gray">Asistencias</div><div className="font-black">{selected.assists}</div></div>
            </div>
            {tests && (
              <div>
                <h3 className="font-bold text-sm mb-2">Tests físicos T3</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-depro-gray">Resistencia</span><span className="font-bold">{tests.endurance}</span></div>
                  <div className="flex justify-between"><span className="text-depro-gray">Sprint 30m</span><span className="font-bold">{tests.sprint}s</span></div>
                  <div className="flex justify-between"><span className="text-depro-gray">Agilidad</span><span className="font-bold">{tests.agility}s</span></div>
                  <div className="text-xs font-bold text-green-600 mt-2">{tests.rating}</div>
                </div>
              </div>
            )}
            <div className="text-xs">
              Riesgo lesión: <span className="font-bold capitalize" style={{ color: riskColor(selected.injuryRisk) }}>{selected.injuryRisk}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function PlanificacionPanel() {
  return (
    <div className="max-w-5xl space-y-6">
      <PageTitle sub="Temporada 2026 · Paulistão Sub-20">Planificación</PageTitle>
      <div>
        <h2 className="font-bold text-sm text-depro-gray uppercase mb-3">Temporada · Mesociclos</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {MESO_PHASES.map((phase) => (
            <div key={phase.name} className={`rounded-xl border p-4 ${phase.active ? "border-green-600 bg-green-50" : "border-depro-border bg-white"}`}>
              <p className="font-black text-depro-dark">{phase.name}</p>
              <p className="text-xs text-depro-gray mt-1">Semanas {phase.weeks}</p>
              <p className="text-xs mt-2 leading-relaxed">{phase.focus}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-depro-border bg-white p-5 shadow-sm">
        <h2 className="font-bold mb-1">Carga de temporada</h2>
        <p className="text-xs text-depro-gray mb-4">Volumen relativo por mes (%)</p>
        <div className="flex items-end gap-3 h-32">
          {SEASON_BLOCKS.map((b) => (
            <div key={b.month} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-md" style={{ height: `${b.load}%`, backgroundColor: ACCENT, maxHeight: "100px" }} />
              <span className="text-[10px] font-bold text-depro-gray">{b.month}</span>
              <span className="text-[9px] text-depro-gray text-center leading-tight">{b.block}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-depro-border bg-white p-5 shadow-sm">
        <h2 className="font-bold mb-4">Microciclo · Semana 24</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {MICROCYCLE.map((d) => (
            <div
              key={d.day}
              className={`rounded-lg border p-3 text-center ${d.type === "rest" ? "opacity-60 bg-depro-gray-light" : "bg-white"}`}
              style={{ borderColor: d.type === "match" ? "#EF4444" : TYPE_COLORS[d.type] ?? "#E5E7EB" }}
            >
              <p className="text-xs font-bold text-depro-gray">{d.day}</p>
              <p className="text-[11px] font-semibold mt-2 leading-tight">{d.label}</p>
              {d.rpe > 0 && <p className="text-[10px] text-depro-gray mt-1">RPE {d.rpe} · {d.duration}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SesionesPanel() {
  const [prompt, setPrompt] = useState("");
  const [diagram, setDiagram] = useState(EMPTY_DIAGRAM);
  const [bank, setBank] = useState(SEED_SESSIONS);
  const [title, setTitle] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("A");
  const [generating, setGenerating] = useState(false);

  const generate = () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setTimeout(() => {
      const key = Object.keys(PRESET_PROMPTS).find((k) => prompt.toLowerCase().includes(k.split(" ")[0]));
      setDiagram(key ? { ...PRESET_PROMPTS[key] } : SEED_SESSIONS[0].diagram);
      setGenerating(false);
    }, 800);
  };

  const saveSession = () => {
    const session = {
      id: crypto.randomUUID(),
      title: title || prompt.slice(0, 40) || "Sesión sin título",
      description: prompt,
      diagram,
    };
    setBank([session, ...bank]);
    setTitle("");
  };

  return (
    <div className="max-w-5xl space-y-6">
      <PageTitle sub="Describe el ejercicio o dibújalo en el campo">Sesiones y tareas</PageTitle>
      <div className="rounded-xl border border-depro-border bg-white p-4 space-y-3 shadow-sm">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder='Ej: "posesión 3 contra 3 en espacio reducido, máximo dos toques"'
          rows={2}
          className="w-full border border-depro-border rounded-lg px-4 py-3 text-sm outline-none focus:border-green-600 resize-none"
        />
        <button type="button" onClick={generate} disabled={generating} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-bold text-sm disabled:opacity-50" style={{ backgroundColor: ACCENT }}>
          <Sparkles size={16} /> {generating ? "Generando diagrama…" : "Generar con IA"}
        </button>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Diagrama táctico</h2>
            <div className="flex gap-2">
              <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)} className="bg-depro-gray-light border border-depro-border rounded px-2 py-1 text-xs">
                <option value="A">Equipo A</option>
                <option value="B">Equipo B</option>
              </select>
              <button type="button" onClick={() => setDiagram(EMPTY_DIAGRAM)} className="p-2 rounded-lg bg-depro-gray-light text-depro-gray hover:text-red-500">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <PitchDiagram
            diagram={diagram}
            interactive
            selectedTeam={selectedTeam}
            onAddPlayer={(team, x, y) => setDiagram((d) => ({ ...d, players: [...d.players, { team, x, y }] }))}
          />
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-depro-gray font-bold uppercase">Guardar en banco</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nombre de la tarea" className="w-full mt-1 border border-depro-border rounded-lg px-3 py-2 text-sm" />
            <button type="button" onClick={saveSession} className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-white text-sm font-bold" style={{ backgroundColor: ACCENT }}>
              <Save size={16} /> Guardar sesión
            </button>
          </div>
          <div>
            <h3 className="font-bold text-sm mb-2">Banco de sesiones</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {bank.map((s) => (
                <button key={s.id} type="button" onClick={() => { setDiagram(s.diagram); setPrompt(s.description); }} className="w-full text-left rounded-lg border border-depro-border bg-white p-3 hover:border-green-600/40">
                  <p className="font-semibold text-sm">{s.title}</p>
                  <p className="text-xs text-depro-gray mt-1 line-clamp-2">{s.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CargaPanel() {
  const [loaded, setLoaded] = useState(false);
  const [classified, setClassified] = useState([]);

  const loadDemo = () => {
    setLoaded(true);
    setClassified(GPS_DEMO_ROWS.map((r) => ({ ...r, explanation: mockClassifyLoad(r) })));
  };

  return (
    <div className="max-w-4xl space-y-6">
      <PageTitle sub="Import GPS Catapult, STATSports, Polar, WIMU…">Control de carga</PageTitle>
      <button type="button" onClick={loadDemo} className="flex flex-col items-center justify-center border-2 border-dashed border-depro-border rounded-xl p-10 w-full hover:border-green-600/50 transition-colors bg-white">
        <Upload className="text-depro-gray mb-3" size={32} />
        <span className="font-bold">Cargar datos GPS de ejemplo</span>
        <span className="text-xs text-depro-gray mt-1">Simula import Catapult · Semana 24</span>
      </button>
      {loaded && (
        <div className="space-y-3">
          <h2 className="font-bold">Clasificación IA · {classified.length} jugadores</h2>
          {classified.map((p) => (
            <div key={p.name} className="rounded-xl border border-depro-border bg-white p-4 flex flex-wrap gap-4 items-start shadow-sm">
              <div>
                <p className="font-bold">{p.name}</p>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full capitalize mt-1 inline-block" style={{ background: `${loadBandColor(p.band)}22`, color: loadBandColor(p.band) }}>{p.band}</span>
                <p className="text-[10px] text-depro-gray mt-2">{p.distance}m · HSR {p.hsr}m · {p.sprints} sprints</p>
              </div>
              <p className="text-sm text-depro-gray flex-1 min-w-[200px]">{p.explanation}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ChatPanel() {
  const [channel, setChannel] = useState("tecnico");
  const [messages, setMessages] = useState(SEED_CHAT_MESSAGES);
  const [input, setInput] = useState("");
  const [summary, setSummary] = useState("");
  const [author, setAuthor] = useState("Staff Demo");
  const filtered = useMemo(() => messages.filter((m) => m.channel_id === channel), [messages, channel]);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: crypto.randomUUID(), channel_id: channel, author, role: "Staff", content: input.trim(), created_at: new Date().toISOString() }]);
    setInput("");
  };

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle>Chat del staff</PageTitle>
        <div className="flex gap-2 items-center">
          <input value={author} onChange={(e) => setAuthor(e.target.value)} className="bg-depro-gray-light border border-depro-border rounded-lg px-3 py-1.5 text-sm w-32" placeholder="Tu nombre" />
          <button type="button" onClick={() => setSummary(mockAiSummary(filtered))} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-sm font-bold">
            <Sparkles size={16} /> Resumen IA
          </button>
        </div>
      </div>
      {summary && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-bold text-xs uppercase mb-1">Resumen IA</p>
          {summary}
        </div>
      )}
      <div className="flex gap-2 flex-wrap">
        {CHAT_CHANNELS.map((c) => (
          <button key={c.id} type="button" onClick={() => setChannel(c.id)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${channel === c.id ? "text-white" : "bg-depro-gray-light text-depro-gray"}`} style={channel === c.id ? { backgroundColor: ACCENT } : undefined}>
            {c.name}
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-depro-border bg-white flex flex-col h-[420px] shadow-sm">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.map((m) => (
            <div key={m.id} className="rounded-lg bg-depro-gray-light px-4 py-3">
              <div className="flex justify-between text-xs text-depro-gray mb-1">
                <span className="font-bold text-depro-dark">{m.author}</span>
                <span>{new Date(m.created_at).toLocaleString("es-ES", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <p className="text-sm">{m.content}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-depro-border p-3 flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Escribe un mensaje..." className="flex-1 border border-depro-border rounded-lg px-4 py-2 text-sm outline-none" />
          <button type="button" onClick={sendMessage} className="px-4 py-2 rounded-lg text-white" style={{ backgroundColor: ACCENT }}><Send size={18} /></button>
        </div>
      </div>
    </div>
  );
}

export function VideoPanel() {
  const [activeClip, setActiveClip] = useState(VIDEO_CLIPS[0]);
  return (
    <div className="max-w-4xl space-y-6">
      <PageTitle sub="Análisis de partido y entrenamiento">Rendimiento y vídeo</PageTitle>
      <div className="relative rounded-xl overflow-hidden border border-depro-border bg-slate-900 aspect-video flex items-center justify-center">
        <div className="relative z-10 text-center text-white">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3"><Play size={28} className="ml-1" /></div>
          <p className="text-sm font-bold">{activeClip.title}</p>
          <p className="text-xs text-white/60 mt-1">Duración {activeClip.duration} · Demo simulada</p>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {VIDEO_CLIPS.map((c) => (
          <button key={c.id} type="button" onClick={() => setActiveClip(c)} className={`px-3 py-2 rounded-lg text-sm font-medium border ${activeClip.id === c.id ? "border-green-600 bg-green-50" : "border-depro-border bg-white"}`}>
            {c.title}
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-depro-border bg-white divide-y divide-depro-border shadow-sm">
        <div className="px-4 py-3 font-bold text-sm text-depro-gray uppercase">Eventos detectados (IA simulada)</div>
        {VIDEO_EVENTS.map((ev) => (
          <div key={ev.time} className="px-4 py-3 flex items-center gap-4">
            <span className="font-mono text-sm w-14" style={{ color: ACCENT }}>{ev.time}</span>
            <span className={`text-sm flex-1 ${ev.type === "positive" ? "text-green-600" : "text-red-500"}`}>{ev.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ScoutingPanel() {
  const [reports, setReports] = useState(SEED_SCOUTING);
  const [selected, setSelected] = useState(SEED_SCOUTING[0]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ player_name: "", physical: 5, technical: 5, tactical: 5, attitudinal: 5, notes: "" });

  const save = () => {
    if (!form.player_name.trim()) return;
    const report = { id: crypto.randomUUID(), ...form, created_at: new Date().toISOString() };
    setReports([report, ...reports]);
    setSelected(report);
    setForm({ player_name: "", physical: 5, technical: 5, tactical: 5, attitudinal: 5, notes: "" });
    setShowForm(false);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex justify-between items-center">
        <PageTitle>Scouting</PageTitle>
        <button type="button" onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-bold" style={{ backgroundColor: ACCENT }}>
          <Plus size={16} /> Nuevo informe
        </button>
      </div>
      {showForm && (
        <div className="rounded-xl border border-depro-border bg-white p-5 space-y-4 shadow-sm">
          <div className="flex justify-between"><h2 className="font-bold">Nuevo informe</h2><button type="button" onClick={() => setShowForm(false)}><X size={18} /></button></div>
          <input value={form.player_name} onChange={(e) => setForm({ ...form, player_name: e.target.value })} placeholder="Nombre del jugador" className="w-full border border-depro-border rounded-lg px-4 py-2" />
          {[["physical", "Físico"], ["technical", "Técnico"], ["tactical", "Táctico"], ["attitudinal", "Actitudinal"]].map(([k, label]) => (
            <div key={k}>
              <label className="text-xs text-depro-gray">{label}</label>
              <input type="range" min={1} max={10} value={form[k]} onChange={(e) => setForm({ ...form, [k]: Number(e.target.value) })} className="w-full accent-green-700" />
            </div>
          ))}
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notas..." rows={3} className="w-full border border-depro-border rounded-lg px-4 py-2 text-sm" />
          <button type="button" onClick={save} className="px-5 py-2 rounded-lg text-white font-bold text-sm" style={{ backgroundColor: ACCENT }}>Guardar informe</button>
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          {reports.map((r) => (
            <button key={r.id} type="button" onClick={() => setSelected(r)} className={`w-full text-left rounded-xl border p-4 ${selected?.id === r.id ? "border-green-600 bg-green-50" : "border-depro-border bg-white"}`}>
              <p className="font-bold">{r.player_name}</p>
              <p className="text-xs text-depro-gray mt-1">F{r.physical} T{r.technical} Ta{r.tactical} A{r.attitudinal}</p>
            </button>
          ))}
        </div>
        {selected && (
          <div className="rounded-xl border border-depro-border bg-white p-5 space-y-4 shadow-sm">
            <h2 className="text-xl font-black">{selected.player_name}</h2>
            <ScoreBar label="Físico" value={selected.physical} />
            <ScoreBar label="Técnico" value={selected.technical} />
            <ScoreBar label="Táctico" value={selected.tactical} />
            <ScoreBar label="Actitudinal" value={selected.attitudinal} />
            <p className="text-sm text-depro-gray leading-relaxed">{selected.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function MedicoPanel() {
  const focus = MEDICAL_PLAYERS[0];
  const PHASES = ["Fase 1", "Fase 2", "Fase 3", "Alta"];
  return (
    <div className="max-w-4xl space-y-6">
      <PageTitle sub="Historial clínico y readaptación">Médico</PageTitle>
      <div className="rounded-xl border border-depro-border bg-white overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-depro-gray-light text-depro-gray text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Jugador</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Lesión</th>
              <th className="px-4 py-3 text-left">Fase</th>
            </tr>
          </thead>
          <tbody>
            {MEDICAL_PLAYERS.map((p) => (
              <tr key={p.name} className="border-t border-depro-border">
                <td className="px-4 py-3 font-bold">{p.name}</td>
                <td className="px-4 py-3 text-depro-gray">{p.status}</td>
                <td className="px-4 py-3 text-depro-gray">{p.injury}</td>
                <td className="px-4 py-3">{PHASES[p.phase - 1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="font-bold">Readaptación · {focus.name}</h2>
        <p className="text-sm text-depro-gray mt-1">{focus.injury}</p>
        <div className="flex gap-2 mt-4 mb-2">
          {PHASES.map((ph, i) => (
            <div key={ph} className={`flex-1 text-center text-xs py-2 rounded-lg font-bold ${i + 1 <= focus.phase ? "bg-amber-500 text-white" : "bg-white text-depro-gray border border-depro-border"}`}>{ph}</div>
          ))}
        </div>
        <div className="h-3 bg-white rounded-full overflow-hidden border border-amber-200">
          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${focus.progress}%` }} />
        </div>
        <p className="text-xs text-depro-gray mt-2">{focus.progress}% completado</p>
      </div>
    </div>
  );
}

export function CanteraPanel() {
  const [cat, setCat] = useState("sub17");
  return (
    <div className="max-w-4xl space-y-6">
      <PageTitle sub="Categorías inferiores · registro manual">Cantera</PageTitle>
      <div className="flex gap-2 flex-wrap">
        {YOUTH_CATEGORIES.map((c) => (
          <button key={c.id} type="button" onClick={() => setCat(c.id)} className={`px-4 py-2 rounded-lg text-sm font-bold border ${cat === c.id ? "text-white border-green-700" : "bg-white border-depro-border text-depro-gray"}`} style={cat === c.id ? { backgroundColor: ACCENT } : undefined}>
            {c.name}
          </button>
        ))}
      </div>
      {YOUTH_CATEGORIES.filter((c) => c.id === cat).map((c) => (
        <div key={c.id} className="rounded-xl border border-depro-border bg-white p-5 shadow-sm">
          <div className="flex flex-wrap justify-between gap-2 mb-4">
            <div><h2 className="font-black text-lg">{c.name}</h2><p className="text-sm text-depro-gray">{c.players} jugadores · {c.coach}</p></div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">{c.nextMatch}</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(cat === "sub20" ? DEMO_PLAYERS.slice(0, 6) : YOUTH_SQUAD).map((p) => (
              <div key={p.name} className="rounded-lg border border-depro-border p-3">
                <p className="font-bold">{p.name}</p>
                <p className="text-sm text-depro-gray">{p.position}{p.age ? ` · ${p.age} años` : ""}</p>
                {"load" in p && (
                  <div className="mt-2 flex gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-depro-gray-light">Carga: {p.load}</span>
                    <span className="px-2 py-0.5 rounded" style={{ color: riskColor(p.risk) }}>Riesgo: {p.risk}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function DireccionPanel() {
  return (
    <div className="max-w-4xl space-y-6">
      <PageTitle sub="KPIs y resumen ejecutivo">Dirección deportiva</PageTitle>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {EXEC_KPIS.map((k) => (
          <div key={k.label} className="rounded-xl border border-depro-border bg-white p-5 shadow-sm">
            <p className="text-3xl font-black" style={{ color: ACCENT }}>{k.value}</p>
            <p className="text-sm text-depro-gray mt-2">{k.label}</p>
            <p className="text-xs text-green-600 font-bold mt-1">{k.trend} vs mes anterior</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-depro-border bg-white p-5 shadow-sm">
        <h2 className="font-bold mb-3">Resumen ejecutivo</h2>
        <p className="text-sm text-depro-dark leading-relaxed">
          La plantilla Sub-20 mantiene adherencia del 94% al microciclo. Dos jugadores en protocolo de readaptación (Luis Felipe, Kevin).
          Scouting activo con 4 informes nuevos este mes. Estêvão lidera métricas ofensivas con 12 goles. La integración GPS clasifica carga en tiempo real — estimación de 18 días de baja evitados en el trimestre.
        </p>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Goles temporada", value: "34", sub: "Estêvão 12 · Luighi 9" },
          { label: "Media asistencia entreno", value: "96%", sub: "Sub-20" },
          { label: "Partidos restantes", value: "8", sub: "Paulistão + Copa SP" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-depro-border bg-white p-4 shadow-sm">
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-sm font-bold mt-1">{s.label}</p>
            <p className="text-xs text-depro-gray">{s.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export const DEMO_PANELS = {
  inicio: InicioPanel,
  plantilla: PlantillaPanel,
  chat: ChatPanel,
  planificacion: PlanificacionPanel,
  sesiones: SesionesPanel,
  carga: CargaPanel,
  video: VideoPanel,
  scouting: ScoutingPanel,
  medico: MedicoPanel,
  cantera: CanteraPanel,
  direccion: DireccionPanel,
};
