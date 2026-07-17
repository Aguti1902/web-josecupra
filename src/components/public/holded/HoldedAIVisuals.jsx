/** Mini escenas animadas al hover — variantes claro y oscuro */

const sceneShell = (light) =>
  light
    ? "rounded-xl bg-gray-50 border border-gray-200 p-3 h-28 overflow-hidden"
    : "rounded-xl bg-[#0a0e17]/90 border border-white/10 p-3 h-28 overflow-hidden";

function CoachEngineScene({ light = false }) {
  const bars = [55, 78, 62, 90, 70];
  return (
    <div className={sceneShell(light)}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[9px] font-bold uppercase ${light ? "text-gray-400" : "text-white/50"}`}>Microciclo · S3</span>
        <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">A/B/C</span>
      </div>
      <div className="flex items-end gap-1 h-14">
        {bars.map((h, i) => (
          <div key={i} className={`flex-1 rounded-t flex items-end h-full overflow-hidden ${light ? "bg-blue-50" : "bg-white/5"}`}>
            <div className="w-full rounded-t bg-gradient-to-t from-holded-blue to-blue-400 ai-hover-bar" style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PlayerPlanScene({ light = false }) {
  return (
    <div className={`${sceneShell(light)} relative`}>
      <div className="flex gap-2 mb-2">
        {["Del", "MC", "Ext"].map((pos, i) => (
          <span
            key={pos}
            className={`text-[8px] font-bold px-2 py-0.5 rounded-full ai-hover-pill ${
              i === 1
                ? light ? "bg-blue-100 text-holded-blue" : "bg-holded-blue/30 text-blue-200"
                : light ? "bg-gray-100 text-gray-400" : "bg-white/5 text-white/40"
            }`}
            style={{ animationDelay: `${i * 0.2}s` }}
          >
            {pos}
          </span>
        ))}
      </div>
      <div className="space-y-1.5">
        {[85, 60, 72].map((w, i) => (
          <div key={i} className={`h-2 rounded-full overflow-hidden ${light ? "bg-gray-200" : "bg-white/5"}`}>
            <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-holded-blue ai-hover-fill" style={{ width: `${w}%`, animationDelay: `${i * 0.15}s` }} />
          </div>
        ))}
      </div>
      <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full flex items-center justify-center ai-hover-pulse ${light ? "bg-emerald-50 border border-emerald-200" : "bg-emerald-500/20 border border-emerald-400/40"}`}>
        <span className={`text-[8px] font-black ${light ? "text-emerald-600" : "text-emerald-300"}`}>✓</span>
      </div>
    </div>
  );
}

function LoadClassifierScene({ light = false }) {
  const bars = [35, 55, 72, 48, 88, 62, 75];
  return (
    <div className={sceneShell(light)}>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-[9px] font-bold ${light ? "text-gray-400" : "text-white/50"}`}>RPE · Wellness</span>
        <span className="text-lg font-black text-holded-green ai-hover-counter">6.8</span>
      </div>
      <div className="flex items-end gap-0.5 h-12 mt-1">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-holded-green to-emerald-400 ai-hover-bar" style={{ height: `${h * 0.45}%`, animationDelay: `${i * 0.08}s` }} />
        ))}
      </div>
      <div className="mt-1.5 flex gap-1">
        <span className="text-[7px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded ai-hover-alert">Alerta</span>
        <span className={`text-[7px] font-bold px-1.5 py-0.5 ${light ? "text-gray-400" : "text-white/30"}`}>3 jugadores</span>
      </div>
    </div>
  );
}

function PeriodizationScene({ light = false }) {
  const weeks = ["S1", "S2", "S3", "S4", "S5"];
  return (
    <div className={sceneShell(light)}>
      <p className={`text-[9px] font-bold mb-2 uppercase ${light ? "text-gray-400" : "text-white/50"}`}>Mesociclo · Pretemporada</p>
      <div className="flex gap-1.5 items-end h-14">
        {weeks.map((w, i) => (
          <div key={w} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full rounded-md ai-hover-week ${i <= 2 ? "bg-holded-blue" : light ? "bg-gray-200" : "bg-white/10"}`}
              style={{ height: `${40 + i * 12}%`, animationDelay: `${i * 0.12}s` }}
            />
            <span className={`text-[7px] font-bold ${light ? "text-gray-400" : "text-white/40"}`}>{w}</span>
          </div>
        ))}
      </div>
      <div className={`h-1 rounded-full mt-2 overflow-hidden ${light ? "bg-gray-200" : "bg-white/5"}`}>
        <div className="h-full w-3/5 bg-gradient-to-r from-holded-blue to-emerald-400 rounded-full ai-hover-progress" />
      </div>
    </div>
  );
}

/** Escenas extra para secciones blancas */
export function SetupScene({ light = true }) {
  return (
    <div className={sceneShell(light)}>
      <p className={`text-[9px] font-bold mb-2 uppercase ${light ? "text-gray-400" : "text-white/50"}`}>Configura tu equipo</p>
      <div className="grid grid-cols-3 gap-1.5">
        {["Categoría", "Material", "Plantilla"].map((l, i) => (
          <div key={l} className={`rounded-lg p-1.5 text-center ai-hover-pill ${light ? "bg-white border border-gray-100" : "bg-white/5"}`} style={{ animationDelay: `${i * 0.15}s` }}>
            <div className={`w-5 h-5 rounded-md mx-auto mb-0.5 ai-hover-week ${i < 2 ? "bg-holded-blue/80" : "bg-gray-200"}`} style={{ height: 12 }} />
            <span className={`text-[7px] font-bold ${light ? "text-gray-500" : "text-white/40"}`}>{l}</span>
          </div>
        ))}
      </div>
      <div className={`mt-2 h-1.5 rounded-full overflow-hidden ${light ? "bg-gray-200" : "bg-white/5"}`}>
        <div className="h-full bg-holded-blue rounded-full ai-hover-progress" style={{ width: "66%" }} />
      </div>
    </div>
  );
}

export function GenerateScene({ light = true }) {
  const rows = ["Sesión A", "Sesión B", "Sesión C"];
  return (
    <div className={sceneShell(light)}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[9px] font-bold uppercase ${light ? "text-gray-400" : "text-white/50"}`}>Generando microciclo</span>
        <SparklesDot />
      </div>
      <div className="space-y-1">
        {rows.map((r, i) => (
          <div key={r} className={`flex items-center gap-2 rounded-lg px-2 py-1 ai-hover-fill ${light ? "bg-white border border-gray-100" : "bg-white/5"}`} style={{ animationDelay: `${i * 0.12}s` }}>
            <div className={`w-3 h-3 rounded ai-hover-pulse ${i < 2 ? "bg-holded-green" : "bg-gray-200"}`} />
            <span className={`text-[8px] font-semibold flex-1 ${light ? "text-gray-700" : "text-white/70"}`}>{r}</span>
            <span className={`text-[7px] tabular-nums ${light ? "text-gray-400" : "text-white/30"}`}>{45 + i * 8} min</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TrainScene({ light = true }) {
  const bars = [50, 70, 85, 65, 90];
  return (
    <div className={sceneShell(light)}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[9px] font-bold uppercase ${light ? "text-gray-400" : "text-white/50"}`}>Sesión en campo</span>
        <span className="text-[8px] font-bold text-holded-green">Live</span>
      </div>
      <div className="flex items-end gap-1 h-12">
        {bars.map((h, i) => (
          <div key={i} className={`flex-1 rounded-t ai-hover-bar bg-gradient-to-t from-holded-green to-emerald-400`} style={{ height: `${h * 0.5}%`, animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
      <div className="flex justify-between mt-2 text-[7px] font-bold">
        <span className="text-holded-green">Adherencia 85%</span>
        <span className={light ? "text-gray-400" : "text-white/30"}>22 jugadores</span>
      </div>
    </div>
  );
}

export function RoleCoachScene({ light = true }) {
  return (
    <div className={sceneShell(light)}>
      <p className={`text-[9px] font-bold mb-2 ${light ? "text-gray-400" : "text-white/50"}`}>DEPRO Coach</p>
      <div className="flex items-end gap-1 h-14 mb-1">
        {[40, 65, 55, 80, 72].map((h, i) => (
          <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-holded-blue to-blue-300 ai-hover-bar" style={{ height: `${h}%`, animationDelay: `${i * 0.11}s` }} />
        ))}
      </div>
      <p className={`text-[8px] font-semibold ${light ? "text-gray-500" : "text-white/40"}`}>Microciclo semanal listo</p>
    </div>
  );
}

export function RoleClubScene({ light = true }) {
  const teams = ["A", "B", "C", "D"];
  return (
    <div className={sceneShell(light)}>
      <p className={`text-[9px] font-bold mb-2 ${light ? "text-gray-400" : "text-white/50"}`}>DEPRO Club · 4 equipos</p>
      <div className="grid grid-cols-4 gap-1.5">
        {teams.map((t, i) => (
          <div key={t} className={`aspect-square rounded-lg flex items-center justify-center font-black text-xs ai-hover-week ${i < 3 ? "bg-holded-blue text-white" : light ? "bg-gray-100 text-gray-400" : "bg-white/10 text-white/40"}`} style={{ animationDelay: `${i * 0.14}s` }}>
            {t}
          </div>
        ))}
      </div>
      <div className={`mt-2 h-1 rounded-full overflow-hidden ${light ? "bg-gray-200" : "bg-white/5"}`}>
        <div className="h-full bg-holded-blue rounded-full ai-hover-progress" />
      </div>
    </div>
  );
}

export function RolePlayerScene({ light = true }) {
  return (
    <div className={sceneShell(light)}>
      <p className={`text-[9px] font-bold mb-2 ${light ? "text-gray-400" : "text-white/50"}`}>Plan del jugador</p>
      <div className="space-y-1.5">
        {["Calentamiento", "Fuerza", "Core"].map((t, i) => (
          <div key={t} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded flex items-center justify-center ai-hover-pulse ${i < 2 ? "bg-holded-green text-white text-[7px]" : light ? "bg-gray-200" : "bg-white/10"}`}>✓</div>
            <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${light ? "bg-gray-200" : "bg-white/5"}`}>
              <div className="h-full bg-gradient-to-r from-violet-500 to-holded-blue rounded-full ai-hover-fill" style={{ width: `${70 + i * 10}%`, animationDelay: `${i * 0.1}s` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function VideoPreviewScene({ light = true }) {
  return (
    <div className={`${light ? "rounded-2xl bg-gray-50 border border-gray-200" : "rounded-2xl bg-[#0a0e17]/90 border border-white/10"} p-4 h-full min-h-[200px] overflow-hidden group`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          <span className="w-2 h-2 rounded-full bg-green-400" />
        </div>
        <span className={`text-[9px] font-mono flex-1 text-center ${light ? "text-gray-400" : "text-white/40"}`}>app.depro.es/dashboard</span>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {["Plan", "Carga", "Tests"].map((l, i) => (
          <div key={l} className={`rounded-lg p-2 text-center ${light ? "bg-white border border-gray-100" : "bg-white/5"}`}>
            <div className="flex items-end justify-center gap-0.5 h-8 mb-1">
              {[40, 65, 50].map((h, j) => (
                <div key={j} className="w-1.5 rounded-t bg-holded-blue ai-hover-bar" style={{ height: `${h * (0.4 + i * 0.1)}%`, animationDelay: `${(i + j) * 0.08}s` }} />
              ))}
            </div>
            <span className={`text-[8px] font-bold ${light ? "text-gray-500" : "text-white/50"}`}>{l}</span>
          </div>
        ))}
      </div>
      <div className={`h-2 rounded-full overflow-hidden ${light ? "bg-gray-200" : "bg-white/5"}`}>
        <div className="h-full bg-gradient-to-r from-holded-blue via-indigo-500 to-emerald-400 rounded-full ai-hover-progress" />
      </div>
      <p className={`text-[9px] text-center mt-2 ${light ? "text-gray-400" : "text-white/30"}`}>Pasa el ratón para ver el flujo</p>
    </div>
  );
}

function SparklesDot() {
  return <span className="w-1.5 h-1.5 rounded-full bg-holded-blue depro-pulse-dot" />;
}

export const AI_ENGINE_SCENES = {
  coach: CoachEngineScene,
  player: PlayerPlanScene,
  load: LoadClassifierScene,
  period: PeriodizationScene,
};

export function AIEngineScene({ id, light = false }) {
  const Scene = AI_ENGINE_SCENES[id];
  return Scene ? <Scene light={light} /> : null;
}
