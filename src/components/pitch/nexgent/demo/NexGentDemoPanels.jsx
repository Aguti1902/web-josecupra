import { useMemo, useState } from "react";
import {
  Activity, Calendar, CheckCircle, ClipboardList, FileText, MessageSquare, Play,
  Save, Search, Send, Sparkles, Target, Trash2, TrendingUp, Upload, Users,
} from "lucide-react";
import { LAKERS } from "../../../../lib/nexgentConfig";
import {
  CHAT_CHANNELS, DEMO_PLAYERS, EMPTY_DIAGRAM, GPS_DEMO_ROWS,
  KEY_MOMENTS, MEDICAL_RECORDS, MESO_PHASES, MICROCYCLE, PLANNING_OVERVIEW,
  PLAYER_TESTS, SCOUTING_PROFILES, SEASON_BLOCKS, SEASON_MATCHES, SEED_CHAT_MESSAGES,
  SEED_SESSIONS, TACTICAL_PRIORITIES, TRAINING_SESSIONS, VIDEO_CLIPS, WEEKLY_LOAD,
  WEEKLY_OBJECTIVES, YOUTH_CATEGORIES, YOUTH_SQUAD,
  generateDiagramFromPrompt, loadBandColor, mockAiSummary, mockClassifyLoad, riskColor,
} from "../../../../lib/nexgentSeedData";
import NexGentClubBanner from "../NexGentClubBanner";
import PitchDiagram from "./PitchDiagram";

const ACCENT = LAKERS.accent;
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
    <div className="w-full space-y-6">
      <NexGentClubBanner team={LAKERS.team} role="Entrenador" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Plantilla activa", value: String(DEMO_PLAYERS.length), sub: `jugadores · ${LAKERS.team}`, nav: "plantilla" },
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
    <div className="w-full space-y-6">
      <PageTitle sub={`${LAKERS.team} · ${DEMO_PLAYERS.length} jugadores`}>Plantilla</PageTitle>
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

function SeasonLoadChart({ data, accent }) {
  const maxLoad = Math.max(...data.map((d) => d.load));
  const maxIntensity = Math.max(...data.map((d) => d.intensity));
  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2 sm:gap-4 h-40">
        {data.map((b) => (
          <div key={b.month} className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <div className="w-full flex items-end justify-center gap-0.5" style={{ height: "120px" }}>
              <div className="w-[45%] rounded-t-sm opacity-90" style={{ height: `${(b.load / maxLoad) * 100}%`, backgroundColor: accent, minHeight: "8px" }} title={`Volumen ${b.load}%`} />
              <div className="w-[45%] rounded-t-sm opacity-70" style={{ height: `${(b.intensity / maxIntensity) * 100}%`, backgroundColor: "#F59E0B", minHeight: "8px" }} title={`Intensidad ${b.intensity}%`} />
            </div>
            <span className="text-[10px] font-bold text-depro-gray">{b.month}</span>
            <span className="text-[9px] text-depro-gray text-center leading-tight truncate w-full">{b.block}</span>
            <span className="text-[9px] text-depro-gray">{b.matches} PJ</span>
          </div>
        ))}
      </div>
      <div className="flex gap-4 text-xs text-depro-gray">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: accent }} /> Volumen</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-500" /> Intensidad</span>
      </div>
    </div>
  );
}

function ObjectiveStatus({ status }) {
  const styles = {
    on_track: { bg: "bg-green-50 text-green-700 border-green-200", label: "En objetivo" },
    attention: { bg: "bg-amber-50 text-amber-700 border-amber-200", label: "Atención" },
    risk: { bg: "bg-red-50 text-red-700 border-red-200", label: "Riesgo" },
  };
  const s = styles[status] ?? styles.on_track;
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.bg}`}>{s.label}</span>;
}

export function PlanificacionPanel() {
  const ov = PLANNING_OVERVIEW;
  const activePhase = MESO_PHASES.find((p) => p.active) ?? MESO_PHASES[2];
  const [selectedDay, setSelectedDay] = useState(MICROCYCLE.find((d) => d.type === "tactical") ?? MICROCYCLE[2]);
  const weekProgress = Math.round((ov.currentWeek / ov.totalWeeks) * 100);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageTitle sub={`${ov.competition} · Semana ${ov.currentWeek} de ${ov.totalWeeks}`}>Planificación</PageTitle>
        <div className="flex items-center gap-2 text-sm">
          <span className="px-3 py-1.5 rounded-lg bg-green-50 text-green-800 border border-green-200 font-bold">{activePhase.name}</span>
          <span className="text-depro-gray">Actualizado 19 Jun 2026</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {[
          { label: "Semana actual", value: `${ov.currentWeek}/${ov.totalWeeks}`, sub: `${weekProgress}% temporada` },
          { label: "Balance", value: `${ov.wins}V ${ov.draws}E ${ov.losses}D`, sub: `${ov.matchesPlayed} partidos` },
          { label: "RPE medio", value: ov.avgRpe, sub: "Últimas 4 semanas" },
          { label: "Adherencia plan", value: `${ov.adherence}%`, sub: "Asistencia + cumplimiento" },
          { label: "Carga semanal", value: `${(ov.avgWeeklyLoad / 1000).toFixed(1)}k AU`, sub: "PlayerLoad Catapult" },
          { label: "Lesionados", value: ov.injured, sub: "En protocolo activo" },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-depro-border bg-white p-4 shadow-sm">
            <p className="text-xl font-black" style={{ color: ACCENT }}>{k.value}</p>
            <p className="text-xs font-bold mt-1">{k.label}</p>
            <p className="text-[10px] text-depro-gray">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-depro-border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className="font-bold">Línea temporal · Temporada {ov.season}</h2>
          <span className="text-xs text-depro-gray">Semana {ov.currentWeek} · {activePhase.focus}</span>
        </div>
        <div className="relative h-3 bg-depro-gray-light rounded-full overflow-hidden mb-2">
          <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${weekProgress}%`, backgroundColor: ACCENT }} />
          {MESO_PHASES.map((ph) => {
            const left = ((ph.weekStart - 1) / ov.totalWeeks) * 100;
            const width = ((ph.weekEnd - ph.weekStart + 1) / ov.totalWeeks) * 100;
            return (
              <div
                key={ph.name}
                className={`absolute top-0 h-full border-r border-white/30 ${ph.active ? "opacity-100" : "opacity-40"}`}
                style={{ left: `${left}%`, width: `${width}%`, backgroundColor: ph.active ? `${ACCENT}44` : "transparent" }}
                title={ph.name}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-depro-gray font-bold">
          <span>S1</span>
          <span>S8</span>
          <span>S16</span>
          <span className="text-green-700">← S{ov.currentWeek}</span>
          <span>S{ov.totalWeeks}</span>
        </div>
      </div>

      <div className="grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div>
            <h2 className="font-bold text-sm text-depro-gray uppercase mb-3">Mesociclos · Macrociclo {ov.season}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {MESO_PHASES.map((phase) => (
                <div key={phase.name} className={`rounded-xl border p-4 transition-shadow ${phase.active ? "border-green-600 bg-green-50 shadow-sm ring-1 ring-green-600/20" : "border-depro-border bg-white"}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-black text-depro-dark">{phase.name}</p>
                      <p className="text-xs text-depro-gray">Semanas {phase.weeks}</p>
                    </div>
                    {phase.active && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-600 text-white">Activo</span>}
                  </div>
                  <p className="text-xs leading-relaxed text-depro-dark mb-3">{phase.focus}</p>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { label: "Volumen", val: `${phase.volume}%` },
                      { label: "Intensidad", val: `${phase.intensity}%` },
                      { label: "Sesiones", val: phase.sessions },
                    ].map(({ label, val }) => (
                      <div key={label} className="rounded-lg bg-white/80 border border-depro-border/50 p-2 text-center">
                        <p className="text-[10px] text-depro-gray">{label}</p>
                        <p className="text-sm font-black">{val}</p>
                      </div>
                    ))}
                  </div>
                  <ul className="space-y-1">
                    {phase.objectives.map((obj) => (
                      <li key={obj} className="text-[11px] text-depro-gray flex items-start gap-1.5">
                        <CheckCircle size={12} className="text-green-600 flex-shrink-0 mt-0.5" /> {obj}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-depro-border bg-white p-5 shadow-sm">
            <h2 className="font-bold mb-1">Carga de temporada</h2>
            <p className="text-xs text-depro-gray mb-4">Volumen e intensidad relativos por mes · partidos jugados (PJ)</p>
            <SeasonLoadChart data={SEASON_BLOCKS} accent={ACCENT} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border-2 border-green-600 bg-green-50 p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase text-green-800 mb-1">Próximo partido</p>
            <p className="text-xl font-black">{ov.nextMatch.opponent}</p>
            <p className="text-sm text-depro-gray mt-1">{ov.nextMatch.date}</p>
            <p className="text-xs text-depro-gray">{ov.nextMatch.venue} · {ov.nextMatch.round}</p>
          </div>
          <div className="rounded-xl border border-depro-border bg-white p-4 shadow-sm">
            <h2 className="font-bold text-sm mb-3 flex items-center gap-2"><Calendar size={16} /> Calendario</h2>
            <div className="space-y-2">
              {SEASON_MATCHES.map((m) => (
                <div key={m.id} className={`flex items-center gap-3 rounded-lg p-3 border ${m.highlight ? "border-green-600 bg-green-50" : "border-depro-border"}`}>
                  <div className="text-center w-12 flex-shrink-0">
                    <p className="text-[10px] text-depro-gray">{m.date.split(" ")[0]}</p>
                    <p className="text-xs font-bold">{m.date.split(" ")[1] ?? ""}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{m.opponent}</p>
                    <p className="text-[10px] text-depro-gray">{m.round} · {m.venue}</p>
                  </div>
                  {m.played ? (
                    <span className="text-xs font-bold text-green-700">{m.result}</span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-depro-gray-light text-depro-gray">Próximo</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-depro-border bg-white p-4 shadow-sm">
            <h2 className="font-bold text-sm mb-3 flex items-center gap-2"><Target size={16} /> Prioridades tácticas</h2>
            <div className="space-y-3">
              {TACTICAL_PRIORITIES.map((p) => (
                <div key={p.title}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold">{p.title}</span>
                    <span className="text-depro-gray">{p.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-depro-gray-light rounded-full overflow-hidden mb-1">
                    <div className="h-full rounded-full" style={{ width: `${p.progress}%`, backgroundColor: ACCENT }} />
                  </div>
                  <p className="text-[10px] text-depro-gray">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-depro-border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-bold">Microciclo · Semana {ov.currentWeek}</h2>
          <span className="text-xs text-depro-gray">Carga proyectada: {(MICROCYCLE.reduce((s, d) => s + d.load, 0) / 1000).toFixed(1)}k AU</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
          {MICROCYCLE.map((d) => {
            const selected = selectedDay?.id === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedDay(d)}
                className={`rounded-xl border p-3 text-left transition-all ${selected ? "ring-2 ring-green-600 border-green-600 bg-green-50" : d.type === "rest" ? "opacity-60 bg-depro-gray-light border-depro-border" : "bg-white border-depro-border hover:border-green-600/40"}`}
                style={{ borderTopWidth: "3px", borderTopColor: TYPE_COLORS[d.type] ?? "#E5E7EB" }}
              >
                <p className="text-xs font-bold text-depro-gray">{d.day}</p>
                <p className="text-[10px] text-depro-gray">{d.date}</p>
                <p className="text-[11px] font-semibold mt-2 leading-tight line-clamp-2">{d.label}</p>
                {d.sessionType !== "—" && (
                  <span className="inline-block mt-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-depro-gray-light">Sesión {d.sessionType}</span>
                )}
                {d.rpe > 0 && <p className="text-[10px] text-depro-gray mt-1">RPE {d.rpe} · {(d.load / 1000).toFixed(1)}k AU</p>}
              </button>
            );
          })}
        </div>

        {selectedDay && (
          <div className="grid lg:grid-cols-3 gap-6 pt-4 border-t border-depro-border">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h3 className="font-bold text-lg">{selectedDay.label}</h3>
                <p className="text-sm text-depro-gray">{selectedDay.day} {selectedDay.date} · {selectedDay.duration} · {selectedDay.players} jugadores convocados</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-depro-gray mb-2">Objetivos</p>
                <ul className="space-y-1">
                  {selectedDay.objectives.map((o) => (
                    <li key={o} className="text-sm flex items-center gap-2"><CheckCircle size={14} className="text-green-600" /> {o}</li>
                  ))}
                </ul>
              </div>
              {selectedDay.blocks.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase text-depro-gray mb-2">Bloques</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDay.blocks.map((b, i) => (
                      <span key={b} className="text-xs px-3 py-1.5 rounded-lg border border-depro-border bg-depro-gray-light/50">
                        <span className="text-depro-gray mr-1">{i + 1}.</span>{b}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-sm text-depro-gray italic border-l-2 border-amber-400 pl-3">{selectedDay.notes}</p>
            </div>
            <div className="space-y-3">
              <div className="rounded-lg border border-depro-border p-4 bg-depro-gray-light/30">
                <p className="text-[10px] uppercase font-bold text-depro-gray">Carga del día</p>
                <p className="text-2xl font-black mt-1" style={{ color: ACCENT }}>{selectedDay.load.toLocaleString()} AU</p>
                <div className="mt-3 h-2 bg-white rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, (selectedDay.load / 7200) * 100)}%`, backgroundColor: TYPE_COLORS[selectedDay.type] ?? ACCENT }} />
                </div>
                <p className="text-[10px] text-depro-gray mt-2">Referencia partido: 7.200 AU</p>
              </div>
              <div className="rounded-lg border border-depro-border p-4">
                <p className="text-[10px] uppercase font-bold text-depro-gray mb-2">Objetivos semanales</p>
                <div className="space-y-2">
                  {WEEKLY_OBJECTIVES.map((o) => (
                    <div key={o.area} className="text-xs">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-bold">{o.area}</span>
                        <ObjectiveStatus status={o.status} />
                      </div>
                      <p className="text-depro-gray">{o.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function SesionesPanel() {
  const [tab, setTab] = useState("sesiones");
  const [selectedSession, setSelectedSession] = useState(TRAINING_SESSIONS[0]);
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
      setDiagram(generateDiagramFromPrompt(prompt));
      setGenerating(false);
    }, 900);
  };

  const saveTask = () => {
    const task = {
      id: crypto.randomUUID(),
      title: title || prompt.slice(0, 40) || "Tarea sin título",
      description: prompt,
      diagram,
    };
    setBank([task, ...bank]);
    setTitle("");
  };

  return (
    <div className="w-full space-y-6">
      <PageTitle sub="Planificación de entrenamientos y diseño de tareas con IA">Sesiones y tareas</PageTitle>
      <div className="flex gap-2 border-b border-depro-border pb-1">
        {[
          { id: "sesiones", label: "Sesiones de entrenamiento" },
          { id: "tareas", label: "Diseñador de tareas (IA)" },
        ].map(({ id, label }) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={`px-4 py-2 text-sm font-bold border-b-2 -mb-[5px] transition-colors ${tab === id ? "border-green-700 text-green-800" : "border-transparent text-depro-gray hover:text-depro-dark"}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "sesiones" && (
        <div className="grid xl:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h2 className="font-bold text-sm text-depro-gray uppercase">Semana 24</h2>
            {TRAINING_SESSIONS.map((s) => (
              <button key={s.id} type="button" onClick={() => setSelectedSession(s)} className={`w-full text-left rounded-xl border p-4 transition-colors ${selectedSession?.id === s.id ? "border-green-600 bg-green-50" : "border-depro-border bg-white hover:border-green-600/30"}`}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: s.type === "A" ? "#3B82F6" : s.type === "B" ? "#F59E0B" : "#EF4444" }}>Sesión {s.type}</span>
                  <span className="text-[10px] text-depro-gray">{s.duration} · RPE {s.rpe}</span>
                </div>
                <p className="font-bold text-sm">{s.title}</p>
                <p className="text-xs text-depro-gray mt-1">{s.day}</p>
              </button>
            ))}
          </div>
          {selectedSession && (
            <div className="xl:col-span-2 space-y-4">
              <div className="rounded-xl border border-depro-border bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-xl font-black">{selectedSession.title}</h2>
                    <p className="text-sm text-depro-gray mt-1">{selectedSession.day} · {selectedSession.duration} · RPE {selectedSession.rpe}</p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">{selectedSession.tasks.length} bloques</span>
                </div>
                <p className="text-sm text-depro-dark mb-4">{selectedSession.focus}</p>
                <div className="space-y-3">
                  {selectedSession.tasks.map((t, i) => (
                    <div key={i} className="flex gap-4 rounded-lg border border-depro-border p-4 bg-depro-gray-light/30">
                      <div className="w-24 flex-shrink-0">
                        <span className="text-[10px] font-bold uppercase text-depro-gray">{t.block}</span>
                        <p className="text-xs font-bold text-green-700 mt-1">{t.duration}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm">{t.name}</p>
                        <p className="text-xs text-depro-gray mt-1">{t.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "tareas" && (
        <>
          <div className="rounded-xl border border-depro-border bg-white p-4 space-y-3 shadow-sm">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='Ej: "posesión 3 contra 3 en cuadrado 20x20, máximo dos toques" · "rondo 4v2" · "pressing 8v8 en zona reducida"'
              rows={2}
              className="w-full border border-depro-border rounded-lg px-4 py-3 text-sm outline-none focus:border-green-600 resize-none"
            />
            <div className="flex flex-wrap gap-2">
              {["rondo 4v2", "posesión 3 contra 3", "pressing 8v8", "cuadrado 20x20"].map((ex) => (
                <button key={ex} type="button" onClick={() => setPrompt(ex)} className="text-xs px-3 py-1.5 rounded-full border border-depro-border bg-depro-gray-light hover:border-green-600/40">{ex}</button>
              ))}
            </div>
            <button type="button" onClick={generate} disabled={generating || !prompt.trim()} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-bold text-sm disabled:opacity-50" style={{ backgroundColor: ACCENT }}>
              <Sparkles size={16} /> {generating ? "Generando diagrama…" : "Generar con IA"}
            </button>
          </div>
          <div className="grid xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold">Diagrama táctico</h2>
                <div className="flex gap-2">
                  <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)} className="bg-depro-gray-light border border-depro-border rounded px-2 py-1 text-xs">
                    <option value="A">Equipo A</option>
                    <option value="B">Equipo B</option>
                  </select>
                  <button type="button" onClick={() => setDiagram(EMPTY_DIAGRAM)} className="p-2 rounded-lg bg-depro-gray-light text-depro-gray hover:text-red-500"><Trash2 size={16} /></button>
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
                <label className="text-xs text-depro-gray font-bold uppercase">Guardar tarea en banco</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nombre de la tarea" className="w-full mt-1 border border-depro-border rounded-lg px-3 py-2 text-sm" />
                <button type="button" onClick={saveTask} className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-white text-sm font-bold" style={{ backgroundColor: ACCENT }}>
                  <Save size={16} /> Guardar tarea
                </button>
              </div>
              <div>
                <h3 className="font-bold text-sm mb-2">Banco de tareas</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {bank.map((s) => (
                    <button key={s.id} type="button" onClick={() => { setDiagram({ ...s.diagram, workZone: s.diagram.workZone }); setPrompt(s.description); }} className="w-full text-left rounded-lg border border-depro-border bg-white p-3 hover:border-green-600/40">
                      <p className="font-semibold text-sm">{s.title}</p>
                      <p className="text-xs text-depro-gray mt-1 line-clamp-2">{s.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function CargaPanel() {
  const [classified] = useState(() => GPS_DEMO_ROWS.map((r) => ({ ...r, explanation: mockClassifyLoad(r) })));
  const teamLoad = WEEKLY_LOAD.reduce((s, d) => s + d.load, 0);
  const avgLoad = Math.round(teamLoad / GPS_DEMO_ROWS.length);

  return (
    <div className="w-full space-y-6">
      <PageTitle sub="Import GPS Catapult, STATSports, Polar, WIMU… · Semana 24">Control de carga</PageTitle>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Carga media equipo", value: `${avgLoad} AU`, sub: "Catapult PlayerLoad" },
          { label: "Jugadores monitorizados", value: GPS_DEMO_ROWS.length, sub: "Sesión J24 vs Corinthians" },
          { label: "En zona óptima", value: GPS_DEMO_ROWS.filter((r) => r.band === "optima").length, sub: "Sin ajuste planificado" },
          { label: "Alerta / riesgo", value: GPS_DEMO_ROWS.filter((r) => r.band === "riesgo").length, sub: "Protocolo descarga" },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-depro-border bg-white p-4 shadow-sm">
            <p className="text-2xl font-black" style={{ color: ACCENT }}>{k.value}</p>
            <p className="text-sm font-bold mt-1">{k.label}</p>
            <p className="text-xs text-depro-gray">{k.sub}</p>
          </div>
        ))}
      </div>
      <div className="grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-xl border border-depro-border bg-white p-5 shadow-sm">
          <h2 className="font-bold mb-4">Carga semanal · microciclo</h2>
          <WeeklyLoadChart data={WEEKLY_LOAD} accent={ACCENT} />
        </div>
        <div className="rounded-xl border border-depro-border bg-white p-5 shadow-sm">
          <h2 className="font-bold mb-3">Importación GPS</h2>
          <p className="text-sm text-depro-gray mb-4">Datos de ejemplo Catapult · sesión entrenamiento J24</p>
          <button type="button" className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-depro-border rounded-lg py-4 hover:border-green-600/50 transition-colors text-sm font-bold">
            <Upload size={18} /> Reimportar CSV demo
          </button>
          <p className="text-[10px] text-depro-gray mt-3">Compatible: Catapult, STATSports, Polar Pro, WIMU</p>
        </div>
      </div>
      <div className="rounded-xl border border-depro-border bg-white overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-depro-border flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold">Clasificación IA · {classified.length} jugadores</h2>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">Actualizado hoy 09:42</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-depro-gray-light text-depro-gray text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Jugador</th>
                <th className="px-4 py-3 text-left">Distancia</th>
                <th className="px-4 py-3 text-left">HSR</th>
                <th className="px-4 py-3 text-left">Sprints</th>
                <th className="px-4 py-3 text-left">PlayerLoad</th>
                <th className="px-4 py-3 text-left">Banda</th>
                <th className="px-4 py-3 text-left">Recomendación IA</th>
              </tr>
            </thead>
            <tbody>
              {classified.map((p) => (
                <tr key={p.name} className="border-t border-depro-border hover:bg-depro-gray-light/40">
                  <td className="px-4 py-3 font-bold">{p.name}</td>
                  <td className="px-4 py-3">{p.distance.toLocaleString()} m</td>
                  <td className="px-4 py-3">{p.hsr.toLocaleString()} m</td>
                  <td className="px-4 py-3">{p.sprints}</td>
                  <td className="px-4 py-3 font-bold">{p.load.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full capitalize" style={{ background: `${loadBandColor(p.band)}22`, color: loadBandColor(p.band) }}>{p.band}</span>
                  </td>
                  <td className="px-4 py-3 text-depro-gray text-xs max-w-xs">{p.explanation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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
    <div className="w-full space-y-4">
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
  const [search, setSearch] = useState("");
  const [highlight, setHighlight] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return KEY_MOMENTS;
    return KEY_MOMENTS.filter((m) =>
      m.label.toLowerCase().includes(q) || m.tags.some((t) => t.includes(q)) || m.time.includes(q)
    );
  }, [search]);

  return (
    <div className="w-full space-y-6">
      <PageTitle sub="Análisis de partido y entrenamiento">Rendimiento y vídeo</PageTitle>
      <div className="grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <div className="relative rounded-xl overflow-hidden border border-depro-border bg-slate-900 aspect-video flex items-center justify-center">
            <div className="relative z-10 text-center text-white">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3"><Play size={28} className="ml-1" /></div>
              <p className="text-sm font-bold">{activeClip.title}</p>
              <p className="text-xs text-white/60 mt-1">
                {highlight ? `Saltando a ${highlight.time} · ${highlight.label}` : `Duración ${activeClip.duration} · Demo simulada`}
              </p>
            </div>
            {highlight && (
              <div className="absolute bottom-3 left-3 right-3 h-1 bg-white/20 rounded-full">
                <div className="h-full bg-green-400 rounded-full w-2/3" />
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {VIDEO_CLIPS.map((c) => (
              <button key={c.id} type="button" onClick={() => { setActiveClip(c); setHighlight(null); }} className={`px-3 py-2 rounded-lg text-sm font-medium border ${activeClip.id === c.id ? "border-green-600 bg-green-50" : "border-depro-border bg-white"}`}>
                {c.title}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-depro-border bg-white p-4 shadow-sm space-y-3">
          <h2 className="font-bold text-sm flex items-center gap-2"><Search size={16} /> Buscar momentos clave</h2>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Ej: "pressing", "estêvão", "transición", "12:34"'
            className="w-full border border-depro-border rounded-lg px-3 py-2 text-sm outline-none focus:border-green-600"
          />
          <div className="flex flex-wrap gap-1.5">
            {["pressing", "transición", "estêvão", "gol", "error"].map((tag) => (
              <button key={tag} type="button" onClick={() => setSearch(tag)} className="text-[10px] px-2 py-1 rounded-full border border-depro-border bg-depro-gray-light hover:border-green-600/40">{tag}</button>
            ))}
          </div>
          <p className="text-xs text-depro-gray">{filtered.length} momento{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}</p>
          <div className="max-h-64 overflow-y-auto divide-y divide-depro-border border border-depro-border rounded-lg">
            {filtered.map((m) => (
              <button key={m.id} type="button" onClick={() => setHighlight(m)} className={`w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-depro-gray-light/50 ${highlight?.id === m.id ? "bg-green-50" : ""}`}>
                <span className="font-mono text-xs w-12 flex-shrink-0" style={{ color: ACCENT }}>{m.time}</span>
                <span className={`text-xs flex-1 ${m.type === "positive" ? "text-green-600" : "text-red-500"}`}>{m.label}</span>
              </button>
            ))}
            {filtered.length === 0 && <p className="px-3 py-4 text-sm text-depro-gray text-center">Sin resultados para &quot;{search}&quot;</p>}
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-depro-border bg-white divide-y divide-depro-border shadow-sm">
        <div className="px-4 py-3 font-bold text-sm text-depro-gray uppercase">Eventos detectados (IA simulada)</div>
        {KEY_MOMENTS.slice(0, 6).map((ev) => (
          <div key={ev.id} className="px-4 py-3 flex items-center gap-4">
            <span className="font-mono text-sm w-14" style={{ color: ACCENT }}>{ev.time}</span>
            <span className={`text-sm flex-1 ${ev.type === "positive" ? "text-green-600" : "text-red-500"}`}>{ev.label}</span>
            <div className="flex gap-1">{ev.tags.slice(0, 3).map((t) => <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-depro-gray-light text-depro-gray">{t}</span>)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ImagingPlaceholder({ type, label, finding }) {
  const styles = {
    RX: "from-slate-800 via-slate-600 to-slate-900",
    RM: "from-indigo-950 via-purple-900 to-slate-900",
    ECO: "from-teal-900 via-emerald-800 to-slate-900",
  };
  return (
    <div className="rounded-lg border border-depro-border overflow-hidden bg-white">
      <div className={`aspect-[4/3] bg-gradient-to-br ${styles[type] ?? styles.RX} relative flex items-center justify-center`}>
        <div className="absolute inset-4 border border-white/20 rounded opacity-60" />
        <div className="absolute inset-8 border border-white/10 rounded opacity-40" />
        <span className="text-white/80 text-xs font-bold uppercase tracking-wider z-10">{type === "RM" ? "Resonancia" : type === "ECO" ? "Ecografía" : "Radiografía"}</span>
      </div>
      <div className="p-3">
        <p className="text-xs font-bold">{label}</p>
        <p className="text-[10px] text-depro-gray mt-1">{finding}</p>
      </div>
    </div>
  );
}

export function ScoutingPanel() {
  const [profiles] = useState(SCOUTING_PROFILES);
  const [selected, setSelected] = useState(SCOUTING_PROFILES[0]);
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter((p) =>
      p.player_name.toLowerCase().includes(q) || p.club.toLowerCase().includes(q) || p.position.toLowerCase().includes(q) || p.league.toLowerCase().includes(q)
    );
  }, [profiles, filter]);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <PageTitle sub={`${profiles.length} perfiles · seguimiento activo`}>Scouting</PageTitle>
        <div className="flex items-center gap-2 bg-white border border-depro-border rounded-lg px-3 py-2">
          <Search size={16} className="text-depro-gray" />
          <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Buscar jugador, club, posición…" className="text-sm outline-none w-48 sm:w-64" />
        </div>
      </div>
      <div className="grid xl:grid-cols-3 gap-6">
        <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
          {filtered.map((p) => (
            <button key={p.id} type="button" onClick={() => setSelected(p)} className={`w-full text-left rounded-xl border p-4 transition-colors ${selected?.id === p.id ? "border-green-600 bg-green-50" : "border-depro-border bg-white hover:border-green-600/30"}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold">{p.player_name}</p>
                  <p className="text-xs text-depro-gray">{p.position} · {p.age} años · {p.nationality}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-depro-gray-light text-depro-gray whitespace-nowrap">{p.status}</span>
              </div>
              <p className="text-xs text-depro-gray mt-2">{p.club}</p>
              <p className="text-xs font-bold mt-1" style={{ color: ACCENT }}>{p.marketValue}</p>
            </button>
          ))}
        </div>
        {selected && (
          <div className="xl:col-span-2 space-y-4">
            <div className="rounded-xl border border-depro-border bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-black">{selected.player_name}</h2>
                  <p className="text-sm text-depro-gray mt-1">{selected.position} · {selected.age} años · {selected.nationality} · {selected.foot}</p>
                </div>
                <span className="text-sm font-black px-4 py-2 rounded-lg bg-green-50 text-green-800 border border-green-200">{selected.marketValue}</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                {[
                  { label: "Club", value: selected.club },
                  { label: "Liga", value: selected.league },
                  { label: "Contrato", value: selected.contract },
                  { label: "Altura", value: selected.height },
                  { label: "Scout", value: selected.scout },
                  { label: "Observado", value: selected.scoutedAt },
                  { label: "Estado", value: selected.status },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg bg-depro-gray-light/50 p-3">
                    <p className="text-[10px] uppercase font-bold text-depro-gray">{label}</p>
                    <p className="text-sm font-bold mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <ScoreBar label="Físico" value={selected.physical} />
                <ScoreBar label="Técnico" value={selected.technical} />
                <ScoreBar label="Táctico" value={selected.tactical} />
                <ScoreBar label="Actitudinal" value={selected.attitudinal} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold uppercase text-depro-gray mb-2">Fortalezas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.strengths.map((s) => <span key={s} className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">{s}</span>)}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-depro-gray mb-2">Debilidades</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.weaknesses.map((w) => <span key={w} className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">{w}</span>)}
                  </div>
                </div>
              </div>
              <p className="text-sm text-depro-dark leading-relaxed mt-4 border-t border-depro-border pt-4">{selected.notes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function MedicoPanel() {
  const [selected, setSelected] = useState(MEDICAL_RECORDS[0]);
  const PHASES = ["Fase 1", "Fase 2", "Fase 3", "Alta"];

  return (
    <div className="w-full space-y-6">
      <PageTitle sub="Historial clínico y readaptación">Médico</PageTitle>
      <div className="rounded-xl border border-depro-border bg-white overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-depro-gray-light text-depro-gray text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Jugador</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Lesión</th>
              <th className="px-4 py-3 text-left">Médico</th>
              <th className="px-4 py-3 text-left">Fase</th>
              <th className="px-4 py-3 text-left">Progreso</th>
            </tr>
          </thead>
          <tbody>
            {MEDICAL_RECORDS.map((p) => (
              <tr key={p.id} onClick={() => setSelected(p)} className={`border-t border-depro-border cursor-pointer hover:bg-depro-gray-light/40 ${selected.id === p.id ? "bg-green-50" : ""}`}>
                <td className="px-4 py-3 font-bold">{p.name}</td>
                <td className="px-4 py-3 text-depro-gray">{p.status}</td>
                <td className="px-4 py-3 text-depro-gray">{p.injury}</td>
                <td className="px-4 py-3 text-depro-gray text-xs">{p.doctor}</td>
                <td className="px-4 py-3">{PHASES[p.phase - 1] ?? "Alta"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-depro-gray-light rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${p.progress}%`, backgroundColor: p.progress === 100 ? "#22C55E" : "#F59E0B" }} />
                    </div>
                    <span className="text-xs text-depro-gray">{p.progress}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="font-bold text-lg">Readaptación · {selected.name}</h2>
                <p className="text-sm text-depro-gray mt-1">{selected.injury}</p>
                <p className="text-xs text-depro-gray mt-1">Inicio: {selected.date} · {selected.doctor}</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-white border border-amber-200 text-amber-800">{selected.restrictions}</span>
            </div>
            {selected.phase < 4 && (
              <>
                <div className="flex gap-2 mb-2">
                  {PHASES.map((ph, i) => (
                    <div key={ph} className={`flex-1 text-center text-xs py-2 rounded-lg font-bold ${i + 1 <= selected.phase ? "bg-amber-500 text-white" : "bg-white text-depro-gray border border-depro-border"}`}>{ph}</div>
                  ))}
                </div>
                <div className="h-3 bg-white rounded-full overflow-hidden border border-amber-200">
                  <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${selected.progress}%` }} />
                </div>
                <p className="text-xs text-depro-gray mt-2">{selected.progress}% completado</p>
              </>
            )}
          </div>

          <div className="rounded-xl border border-depro-border bg-white p-5 shadow-sm">
            <h2 className="font-bold mb-4 flex items-center gap-2"><FileText size={16} /> Historial clínico</h2>
            <div className="space-y-0 relative pl-4 border-l-2 border-depro-border ml-2">
              {selected.history.map((h, i) => (
                <div key={i} className="relative pb-4 pl-4">
                  <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white ${h.type === "incident" ? "bg-red-500" : h.type === "imaging" ? "bg-indigo-500" : h.type === "milestone" ? "bg-green-500" : "bg-amber-500"}`} />
                  <p className="text-[10px] text-depro-gray font-bold">{h.date}</p>
                  <p className="text-sm">{h.event}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-depro-border bg-white p-5 shadow-sm">
            <h2 className="font-bold mb-4">Imagenología</h2>
            {selected.imaging.length > 0 ? (
              <div className="space-y-3">
                {selected.imaging.map((img, i) => (
                  <ImagingPlaceholder key={i} type={img.type} label={`${img.label} · ${img.date}`} finding={img.finding} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-depro-gray">Sin estudios recientes. Último control preventivo OK.</p>
            )}
          </div>
          <div className="rounded-xl border border-depro-border bg-white p-5 shadow-sm">
            <h2 className="font-bold mb-3 text-sm">Restricciones activas</h2>
            <p className="text-sm text-depro-dark">{selected.restrictions}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CanteraPanel() {
  const [cat, setCat] = useState("sub17");
  return (
    <div className="w-full space-y-6">
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
};
