/** Gráficas SVG ligeras para Wellness y Mis cargas. */

function finitePoints(series) {
  return (series || [])
    .map((p, i) => ({ ...p, i, v: Number(p.value) }))
    .filter((p) => Number.isFinite(p.v));
}

export function LineChart({ series = [], color = "#7C3AED", height = 160, fill = true, unit = "", formatTick = null }) {
  const w = 320;
  const h = height;
  const pad = { l: 28, r: 8, t: 12, b: 28 };
  const pts = finitePoints(series);
  if (!series.length) {
    return <div className="h-40 flex items-center justify-center text-xs text-depro-gray">Sin datos aún</div>;
  }
  const vals = pts.map((p) => p.v);
  const min = vals.length ? Math.min(...vals) : 0;
  const max = vals.length ? Math.max(...vals) : 1;
  const span = max - min || Math.max(max * 0.08, 1);
  const yMin = min - span * 0.15;
  const yMax = max + span * 0.15;
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const xOf = (i) => pad.l + (series.length <= 1 ? innerW / 2 : (i / (series.length - 1)) * innerW);
  const yOf = (v) => pad.t + innerH - ((v - yMin) / (yMax - yMin)) * innerH;
  const plotted = pts.map((p) => ({ ...p, x: xOf(p.i), y: yOf(p.v) }));
  const d = plotted.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const area = plotted.length
    ? `${d} L ${plotted[plotted.length - 1].x.toFixed(1)} ${(pad.t + innerH).toFixed(1)} L ${plotted[0].x.toFixed(1)} ${(pad.t + innerH).toFixed(1)} Z`
    : "";
  const yTicks = [yMax, (yMin + yMax) / 2, yMin];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img">
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={pad.l} x2={w - pad.r} y1={yOf(t)} y2={yOf(t)} stroke="#EEF2FF" strokeWidth="1" />
          <text x={pad.l - 4} y={yOf(t) + 3} textAnchor="end" fontSize="8" fill="#9CA3AF">
            {formatTick ? formatTick(t) : `${Math.round(t * 10) / 10}${unit}`}
          </text>
        </g>
      ))}
      {fill && area && <path d={area} fill={color} opacity="0.12" />}
      {d && <path d={d} fill="none" stroke={color} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />}
      {plotted.map((p) => (
        <circle key={p.i} cx={p.x} cy={p.y} r="3.2" fill="#fff" stroke={color} strokeWidth="2" />
      ))}
      {series.map((p, i) => (
        <text key={p.label || i} x={xOf(i)} y={h - 8} textAnchor="middle" fontSize="8" fill="#9CA3AF">
          {p.label}
        </text>
      ))}
    </svg>
  );
}

export function DualLineChart({
  a = [],
  b = [],
  colorA = "#7C3AED",
  colorB = "#2563EB",
  labelA = "",
  labelB = "",
  height = 180,
}) {
  const series = a.map((p, i) => ({ ...p, a: p.value, b: b[i]?.value }));
  return (
    <div>
      <LineChart series={a.map((p) => ({ ...p, value: p.value }))} color={colorA} height={height} />
      <div className="flex items-center justify-center gap-4 -mt-1 pb-1">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-depro-gray">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colorA }} /> {labelA}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-depro-gray">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colorB }} /> {labelB}
        </span>
      </div>
      {/* overlay B */}
      <div className="-mt-[180px] pointer-events-none">
        <LineChart series={b} color={colorB} height={height} fill={false} />
      </div>
    </div>
  );
}

export function BodyChart({ weight = [], waist = [], height = 180 }) {
  const w = 320;
  const h = height;
  const pad = { l: 28, r: 28, t: 12, b: 28 };
  const n = Math.max(weight.length, waist.length);
  if (!n) return <div className="h-40 flex items-center justify-center text-xs text-depro-gray">Sin datos aún</div>;
  const wVals = weight.map((p) => Number(p.value)).filter(Number.isFinite);
  const aVals = waist.map((p) => Number(p.value)).filter(Number.isFinite);
  const scale = (vals, v) => {
    if (!vals.length || v == null || !Number.isFinite(Number(v))) return null;
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const span = max - min || Math.max(max * 0.08, 1);
    const yMin = min - span * 0.15;
    const yMax = max + span * 0.15;
    const innerH = h - pad.t - pad.b;
    return pad.t + innerH - ((Number(v) - yMin) / (yMax - yMin)) * innerH;
  };
  const innerW = w - pad.l - pad.r;
  const xOf = (i) => pad.l + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const pathOf = (arr, vals) => {
    const pts = arr.map((p, i) => {
      const y = scale(vals, p.value);
      return y == null ? null : ` ${i === 0 || !arr.slice(0, i).some((q) => Number.isFinite(Number(q.value))) ? "M" : "L"} ${xOf(i).toFixed(1)} ${y.toFixed(1)}`;
    }).filter(Boolean);
    return pts.join("");
  };
  const lastW = wVals[wVals.length - 1];
  const lastA = aVals[aVals.length - 1];

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img">
        <path d={pathOf(weight, wVals)} fill="none" stroke="#7C3AED" strokeWidth="2.4" />
        <path d={pathOf(waist, aVals)} fill="none" stroke="#2563EB" strokeWidth="2.4" />
        {weight.map((p, i) => {
          const y = scale(wVals, p.value);
          return y == null ? null : <circle key={`w${i}`} cx={xOf(i)} cy={y} r="3.2" fill="#fff" stroke="#7C3AED" strokeWidth="2" />;
        })}
        {waist.map((p, i) => {
          const y = scale(aVals, p.value);
          return y == null ? null : <circle key={`a${i}`} cx={xOf(i)} cy={y} r="3.2" fill="#fff" stroke="#2563EB" strokeWidth="2" />;
        })}
        {Array.from({ length: n }).map((_, i) => (
          <text key={i} x={xOf(i)} y={h - 8} textAnchor="middle" fontSize="8" fill="#9CA3AF">
            {(weight[i] || waist[i])?.label}
          </text>
        ))}
        {lastW != null && (
          <text x={w - 4} y={scale(wVals, lastW) || 12} textAnchor="end" fontSize="8" fill="#7C3AED">{lastW}</text>
        )}
        {lastA != null && (
          <text x={w - 4} y={(scale(aVals, lastA) || 24) + 10} textAnchor="end" fontSize="8" fill="#2563EB">{lastA}</text>
        )}
      </svg>
      <div className="flex items-center justify-center gap-4 pb-1">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-depro-gray">
          <span className="w-2 h-2 rounded-full bg-violet-600" /> Peso (kg)
        </span>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-depro-gray">
          <span className="w-2 h-2 rounded-full bg-blue-600" /> Cintura (cm)
        </span>
      </div>
    </div>
  );
}

export function RecoverChart({ fatigue = [], sleep = [], pain = [], height = 180 }) {
  const series = [
    { data: fatigue, color: "#F59E0B", label: "Fatiga" },
    { data: sleep, color: "#22C55E", label: "Sueño" },
    { data: pain, color: "#A78BFA", label: "Dolor muscular" },
  ];
  const w = 320;
  const h = height;
  const pad = { l: 22, r: 8, t: 12, b: 28 };
  const n = Math.max(fatigue.length, sleep.length, pain.length, 1);
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const xOf = (i) => pad.l + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const yOf = (v) => pad.t + innerH - ((Number(v) - 1) / 4) * innerH;
  const pathOf = (arr) => arr
    .map((p, i) => {
      if (!Number.isFinite(Number(p.value))) return null;
      const cmd = arr.slice(0, i).some((q) => Number.isFinite(Number(q.value))) ? "L" : "M";
      return `${cmd} ${xOf(i).toFixed(1)} ${yOf(p.value).toFixed(1)}`;
    })
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img">
        {[1, 2, 3, 4, 5].map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={w - pad.r} y1={yOf(t)} y2={yOf(t)} stroke="#F3F4F6" strokeWidth="1" />
            <text x={pad.l - 4} y={yOf(t) + 3} textAnchor="end" fontSize="8" fill="#9CA3AF">{t}</text>
          </g>
        ))}
        {series.map((s) => (
          <g key={s.label}>
            <path d={pathOf(s.data)} fill="none" stroke={s.color} strokeWidth="2.4" />
            {s.data.map((p, i) => Number.isFinite(Number(p.value)) ? (
              <circle key={i} cx={xOf(i)} cy={yOf(p.value)} r="3.2" fill="#fff" stroke={s.color} strokeWidth="2" />
            ) : null)}
          </g>
        ))}
        {Array.from({ length: n }).map((_, i) => (
          <text key={i} x={xOf(i)} y={h - 8} textAnchor="middle" fontSize="8" fill="#9CA3AF">
            {(fatigue[i] || sleep[i] || pain[i])?.label}
          </text>
        ))}
      </svg>
      <div className="flex items-center justify-center gap-3 pb-1 flex-wrap">
        {series.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-depro-gray">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} /> {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function BarChart({ series = [], color = "#FB2C39", height = 160, formatValue = null }) {
  const w = 320;
  const h = height;
  const pad = { l: 28, r: 8, t: 16, b: 28 };
  const vals = series.map((p) => Number(p.value) || 0);
  const max = Math.max(...vals, 1);
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const gap = 10;
  const barW = series.length ? (innerW - gap * (series.length - 1)) / series.length : innerW;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img">
      {series.map((p, i) => {
        const v = Number(p.value) || 0;
        const bh = (v / max) * innerH;
        const x = pad.l + i * (barW + gap);
        const y = pad.t + innerH - bh;
        return (
          <g key={p.label || i}>
            <rect x={x} y={y} width={barW} height={bh} rx="6" fill={color} opacity={i === series.length - 1 ? 1 : 0.75} />
            <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize="8" fontWeight="700" fill="#111827">
              {v ? (formatValue ? formatValue(v) : Math.round(v).toLocaleString("es-ES")) : ""}
            </text>
            <text x={x + barW / 2} y={h - 8} textAnchor="middle" fontSize="8" fill="#9CA3AF">{p.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function DonutChart({ slices = [], totalLabel = "", totalValue = "" }) {
  const size = 160;
  const r = 52;
  const cx = 80;
  const cy = 80;
  const sum = slices.reduce((a, s) => a + (s.value || 0), 0) || 1;
  let acc = 0;
  const colors = { fuerza: "#FB2C39", resistencia: "#F9A8A8", velocidad: "#FECACA", otros: "#FEE2E2" };

  const arc = (start, frac) => {
    const a0 = start * Math.PI * 2 - Math.PI / 2;
    const a1 = (start + frac) * Math.PI * 2 - Math.PI / 2;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const large = frac > 0.5 ? 1 : 0;
    return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
  };

  return (
    <div className="flex items-center gap-4">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-36 h-36 shrink-0" role="img">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#FEE2E2" strokeWidth="18" />
        {slices.filter((s) => s.value > 0).map((s) => {
          const frac = s.value / sum;
          const d = arc(acc, frac);
          acc += frac;
          return (
            <path key={s.key} d={d} fill="none" stroke={colors[s.key] || "#FB2C39"} strokeWidth="18" strokeLinecap="butt" />
          );
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="14" fontWeight="800" fill="#111827">{totalValue}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="8" fill="#9CA3AF">{totalLabel}</text>
      </svg>
      <ul className="space-y-1.5 text-xs">
        {slices.map((s) => (
          <li key={s.key} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[s.key] || "#FB2C39" }} />
            <span className="text-depro-dark font-medium">{s.label}</span>
            <span className="ml-auto tabular-nums text-depro-gray">{s.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
