/** Mini escenas animadas solo al hover (estilo GIF interactivo) */

function CoachEngineScene() {
  const bars = [55, 78, 62, 90, 70];
  return (
    <div className="ai-card-hover-scene rounded-xl bg-[#0a0e17]/90 border border-white/10 p-3 h-28 overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-bold text-white/50 uppercase">Microciclo · S3</span>
        <span className="text-[8px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-full">A/B/C</span>
      </div>
      <div className="flex items-end gap-1 h-14">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 rounded-t bg-white/5 flex items-end h-full overflow-hidden">
            <div
              className="w-full rounded-t bg-gradient-to-t from-holded-blue to-blue-400 ai-hover-bar"
              style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function PlayerPlanScene() {
  return (
    <div className="ai-card-hover-scene rounded-xl bg-[#0a0e17]/90 border border-white/10 p-3 h-28 overflow-hidden relative">
      <div className="flex gap-2 mb-2">
        {["Del", "MC", "Ext"].map((pos, i) => (
          <span
            key={pos}
            className={`text-[8px] font-bold px-2 py-0.5 rounded-full ai-hover-pill ${i === 1 ? "bg-holded-blue/30 text-blue-200" : "bg-white/5 text-white/40"}`}
            style={{ animationDelay: `${i * 0.2}s` }}
          >
            {pos}
          </span>
        ))}
      </div>
      <div className="space-y-1.5">
        {[85, 60, 72].map((w, i) => (
          <div key={i} className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-holded-blue ai-hover-fill"
              style={{ width: `${w}%`, animationDelay: `${i * 0.15}s` }}
            />
          </div>
        ))}
      </div>
      <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center ai-hover-pulse">
        <span className="text-[8px] font-black text-emerald-300">✓</span>
      </div>
    </div>
  );
}

function LoadClassifierScene() {
  const bars = [35, 55, 72, 48, 88, 62, 75];
  return (
    <div className="ai-card-hover-scene rounded-xl bg-[#0a0e17]/90 border border-white/10 p-3 h-28 overflow-hidden">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] font-bold text-white/50">RPE · Wellness</span>
        <span className="text-lg font-black text-holded-green ai-hover-counter">6.8</span>
      </div>
      <div className="flex items-end gap-0.5 h-12 mt-1">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm bg-gradient-to-t from-holded-green to-emerald-400 ai-hover-bar"
            style={{ height: `${h * 0.45}%`, animationDelay: `${i * 0.08}s` }}
          />
        ))}
      </div>
      <div className="mt-1.5 flex gap-1">
        <span className="text-[7px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded ai-hover-alert">Alerta</span>
        <span className="text-[7px] font-bold text-white/30 px-1.5 py-0.5">3 jugadores</span>
      </div>
    </div>
  );
}

function PeriodizationScene() {
  const weeks = ["S1", "S2", "S3", "S4", "S5"];
  return (
    <div className="ai-card-hover-scene rounded-xl bg-[#0a0e17]/90 border border-white/10 p-3 h-28 overflow-hidden">
      <p className="text-[9px] font-bold text-white/50 mb-2 uppercase">Mesociclo · Pretemporada</p>
      <div className="flex gap-1.5 items-end h-14">
        {weeks.map((w, i) => (
          <div key={w} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full rounded-md ai-hover-week ${i <= 2 ? "bg-holded-blue" : "bg-white/10"}`}
              style={{ height: `${40 + i * 12}%`, animationDelay: `${i * 0.12}s` }}
            />
            <span className="text-[7px] font-bold text-white/40">{w}</span>
          </div>
        ))}
      </div>
      <div className="h-1 rounded-full bg-white/5 mt-2 overflow-hidden">
        <div className="h-full w-3/5 bg-gradient-to-r from-holded-blue to-emerald-400 rounded-full ai-hover-progress" />
      </div>
    </div>
  );
}

export const AI_ENGINE_SCENES = {
  coach: CoachEngineScene,
  player: PlayerPlanScene,
  load: LoadClassifierScene,
  period: PeriodizationScene,
};
