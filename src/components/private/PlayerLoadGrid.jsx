import { Download, Filter } from "lucide-react";
import { downloadLoadGridCsv } from "../../lib/loadGrid";

function toneClass(tone) {
  if (tone === "positive") return "bg-emerald-50 text-emerald-800";
  if (tone === "negative") return "bg-red-50 text-red-800";
  return "bg-depro-gray-light text-depro-dark";
}

function MiniBars({ title, items, valueKey = "value", labelKey = "label", unit = "" }) {
  const data = (items || []).filter((d) => d[valueKey] != null);
  const max = Math.max(...data.map((d) => Math.abs(Number(d[valueKey]) || 0)), 1);
  return (
    <div className="bg-white border border-depro-border rounded-2xl p-4 h-full">
      <h3 className="text-sm font-black text-depro-dark mb-3">{title}</h3>
      {!data.length ? (
        <p className="text-xs text-depro-gray">Sin datos todavía. Registra en la rutina.</p>
      ) : (
        <div className="flex items-end gap-2 h-32">
          {data.map((item, i) => {
            const val = Number(item[valueKey]) || 0;
            const pct = Math.max(8, Math.round((Math.abs(val) / max) * 100));
            const positive = val >= 0;
            return (
              <div key={`${item[labelKey]}-${i}`} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                <span className="text-[10px] font-bold text-depro-dark truncate w-full text-center">
                  {val}{unit}
                </span>
                <div
                  className="w-full rounded-t-lg"
                  style={{
                    height: `${pct}%`,
                    backgroundColor: positive ? "#16A34A" : "#DC2626",
                    minHeight: "8px",
                  }}
                />
                <span className="text-[9px] text-depro-gray truncate w-full text-center">{item[labelKey]}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LineChart({ title, series }) {
  const width = 320;
  const height = 120;
  const lines = (series || []).slice(0, 5).map((s, idx) => {
    const pts = (s.points || []).filter((p) => p.value != null);
    if (pts.length < 1) return null;
    const max = Math.max(...pts.map((p) => Number(p.value) || 0), 1);
    const min = Math.min(...pts.map((p) => Number(p.value) || 0), 0);
    const span = Math.max(max - min, 1);
    const coords = pts.map((p, i) => {
      const x = 16 + (i / Math.max(pts.length - 1, 1)) * (width - 32);
      const y = height - 16 - ((Number(p.value) - min) / span) * (height - 32);
      return `${x},${y}`;
    });
    const colors = ["#0A36F7", "#16A34A", "#F59E0B", "#EC4899", "#06B6D4"];
    return (
      <polyline
        key={s.name || idx}
        fill="none"
        stroke={colors[idx % colors.length]}
        strokeWidth="2.5"
        points={coords.join(" ")}
      />
    );
  }).filter(Boolean);

  return (
    <div className="bg-white border border-depro-border rounded-2xl p-4 h-full">
      <h3 className="text-sm font-black text-depro-dark mb-2">{title}</h3>
      {!lines.length ? (
        <p className="text-xs text-depro-gray">Registra al menos dos semanas para ver la evolución.</p>
      ) : (
        <>
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28">
            {lines}
          </svg>
          <div className="flex flex-wrap gap-2 mt-1">
            {(series || []).slice(0, 5).map((s, i) => (
              <span key={s.name} className="text-[10px] text-depro-gray truncate max-w-[8rem]">
                <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: ["#0A36F7", "#16A34A", "#F59E0B", "#EC4899", "#06B6D4"][i] }} />
                {s.name}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FuerzaCell({ cell }) {
  if (!cell) return <span className="text-depro-gray">—</span>;
  return (
    <div className={`rounded-lg px-2 py-1.5 text-[11px] ${toneClass(cell.tone)}`}>
      {(cell.series || []).map((s, i) => (
        <div key={i} className="tabular-nums font-semibold">
          {s.weight || "–"} kg × {s.reps || "–"}
        </div>
      ))}
    </div>
  );
}

function ResistenciaCell({ cell }) {
  if (!cell) return <span className="text-depro-gray">—</span>;
  return (
    <div className={`rounded-lg px-2 py-1.5 text-[11px] ${toneClass(cell.tone)}`}>
      <div>FC {cell.heartRate ?? "–"}</div>
      <div>RPE {cell.rpe ?? "–"}</div>
      <div>{cell.distance != null ? `${cell.distance} m` : "–"}</div>
    </div>
  );
}

function VelocidadCell({ cell }) {
  if (!cell) return <span className="text-depro-gray">—</span>;
  return (
    <div className={`rounded-lg px-2 py-1.5 text-[11px] ${toneClass(cell.tone)}`}>
      <div>{cell.time || "–"}</div>
      <div>FC {cell.heartRate ?? "–"}</div>
      <div>RPE {cell.rpe ?? "–"}</div>
    </div>
  );
}

export default function PlayerLoadGrid({ grid, domain, weekFilter, onWeekFilter, playerFilter, onPlayerFilter, players = [] }) {
  const Cell = domain === "fuerza" ? FuerzaCell : domain === "resistencia" ? ResistenciaCell : VelocidadCell;

  return (
    <div className="grid xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.9fr)] gap-4">
      <div className="bg-white border border-depro-border rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-depro-border flex flex-wrap items-center gap-2 justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-depro-gray">
            <Filter size={13} />
            <select
              className="admin-input text-xs py-1.5"
              value={weekFilter}
              onChange={(e) => onWeekFilter(e.target.value)}
            >
              <option value="all">Semanas 1–4</option>
              <option value="1">S1</option>
              <option value="2">S2</option>
              <option value="3">S3</option>
              <option value="4">S4</option>
            </select>
            {players.length > 0 && (
              <select
                className="admin-input text-xs py-1.5"
                value={playerFilter || "all"}
                onChange={(e) => onPlayerFilter?.(e.target.value)}
              >
                <option value="all">Todos los jugadores</option>
                {players.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            )}
          </div>
          <button
            type="button"
            onClick={() => downloadLoadGridCsv(grid, domain)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-depro-border text-xs font-bold text-depro-dark hover:border-depro-blue hover:text-depro-blue"
          >
            <Download size={13} /> Exportar Excel
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-depro-gray-light">
              <tr>
                <th className="text-left px-3 py-2 text-[11px] font-bold uppercase text-depro-gray">Ejercicio</th>
                {["S1", "S2", "S3", "S4"].map((label, i) => (
                  (weekFilter === "all" || Number(weekFilter) === i + 1) && (
                    <th key={label} className="text-left px-3 py-2 text-[11px] font-bold uppercase text-depro-gray">{label}</th>
                  )
                ))}
                {domain === "fuerza" && (
                  <>
                    <th className="text-left px-3 py-2 text-[11px] font-bold uppercase text-depro-gray">Máx</th>
                    <th className="text-left px-3 py-2 text-[11px] font-bold uppercase text-depro-gray">Media</th>
                  </>
                )}
                <th className="text-left px-3 py-2 text-[11px] font-bold uppercase text-depro-gray">% S1</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-depro-border">
              {(grid.rows || []).length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-sm text-depro-gray">
                    Aún no hay registros de este tipo. Guárdalos en la sesión de la rutina.
                  </td>
                </tr>
              ) : grid.rows.map((row) => (
                <tr key={row.key}>
                  <td className="px-3 py-2 font-bold text-depro-dark">{row.name}</td>
                  {[1, 2, 3, 4].map((w) => (
                    (weekFilter === "all" || Number(weekFilter) === w) && (
                      <td key={w} className="px-3 py-2 align-top">
                        <Cell cell={row.cells[w]} />
                      </td>
                    )
                  ))}
                  {domain === "fuerza" && (
                    <>
                      <td className="px-3 py-2 tabular-nums font-black">{row.maxWeight ?? "—"}</td>
                      <td className="px-3 py-2 tabular-nums">{row.meanWeight != null ? row.meanWeight.toFixed(1) : "—"}</td>
                    </>
                  )}
                  <td className="px-3 py-2">
                    {row.pctFromS1 == null ? "—" : (
                      <span className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-black ${toneClass(row.tone)}`}>
                        {row.pctFromS1 > 0 ? "+" : ""}{row.pctFromS1}%
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {domain === "fuerza" && (grid.sessionTotals || []).length > 0 && (
          <div className="px-4 py-3 border-t border-depro-border text-xs text-depro-gray">
            Peso total por sesión (volumen kg×reps):{" "}
            {grid.sessionTotals.map((s) => (
              <span key={s.sessionId} className="inline-block mr-3 font-semibold text-depro-dark">
                S{s.week} {s.title}: {Math.round(s.volume)}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-4">
        <LineChart title="Evolución por ejercicio" series={grid.charts?.exerciseEvolution} />
        <MiniBars
          title="Mejora vs semana 1 (%)"
          items={(grid.charts?.improvement || []).map((r) => ({ label: r.name, value: r.pct }))}
          unit="%"
        />
        {domain === "fuerza" && (
          <MiniBars title="Peso total por sesión" items={grid.charts?.sessionVolume} />
        )}
      </div>
    </div>
  );
}
