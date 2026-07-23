import { TrendingUp, Dumbbell, Activity } from "lucide-react";

function MiniBarChart({ title, icon: Icon, color, data, unit = "", valueKey = "value", labelKey = "label" }) {
  if (!data?.length) {
    return (
      <div className="bg-white border border-depro-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon size={14} style={{ color }} />
          <h3 className="text-sm font-bold text-depro-dark">{title}</h3>
        </div>
        <p className="text-xs text-depro-gray">Sin datos todavía. Registra pesos en tus ejercicios.</p>
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d[valueKey] || 0), 1);

  return (
    <div className="bg-white border border-depro-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={14} style={{ color }} />
        <h3 className="text-sm font-bold text-depro-dark">{title}</h3>
      </div>
      <div className="flex items-end gap-2 h-28">
        {data.map((item) => {
          const pct = Math.max(8, Math.round(((item[valueKey] || 0) / max) * 100));
          return (
            <div key={item[labelKey] || item.week || item.name} className="flex-1 flex flex-col items-center gap-1 min-w-0">
              <span className="text-[10px] font-bold text-depro-dark truncate w-full text-center">
                {item[valueKey]}{unit}
              </span>
              <div className="w-full rounded-t-lg transition-all" style={{ height: `${pct}%`, backgroundColor: color, minHeight: "8px" }} />
              <span className="text-[9px] text-depro-gray truncate w-full text-center">{item[labelKey]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function RankingCharts({ weightWeeks, topExercises, friendsProfiles = [], accent = "#0A36F7" }) {
  const friendWeightData = friendsProfiles
    .filter((p) => p.stats?.maxWeight)
    .slice(0, 6)
    .map((p) => ({
      label: (p.name || "?").split(" ")[0],
      value: p.stats.maxWeight,
    }));

  const exerciseData = topExercises.map((ex) => ({
    label: ex.name.length > 12 ? `${ex.name.slice(0, 10)}…` : ex.name,
    value: ex.max,
  }));

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <MiniBarChart
        title="Evolución de peso máximo (kg)"
        icon={TrendingUp}
        color={accent}
        data={weightWeeks}
        unit=" kg"
        valueKey="maxWeight"
        labelKey="label"
      />
      <MiniBarChart
        title="Tus mejores marcas por ejercicio"
        icon={Dumbbell}
        color="#3BC21D"
        data={exerciseData}
        unit=" kg"
        valueKey="value"
        labelKey="label"
      />
      {friendsProfiles.length > 0 && (
        <div className="md:col-span-2">
          <MiniBarChart
            title="Comparativa de peso máximo con amigos"
            icon={Activity}
            color="#8B5CF6"
            data={friendWeightData}
            unit=" kg"
            valueKey="value"
            labelKey="label"
          />
        </div>
      )}
    </div>
  );
}
