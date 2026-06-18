const FIELD_W = 400;
const FIELD_H = 260;
const MARGIN = 20;

function toSvgX(x, spaceW) {
  return MARGIN + (x / spaceW) * (FIELD_W - MARGIN * 2);
}

function toSvgY(y, spaceH) {
  return MARGIN + (y / spaceH) * (FIELD_H - MARGIN * 2);
}

export default function PitchDiagram({
  diagram,
  interactive = false,
  onAddPlayer,
  selectedTeam = "A",
}) {
  const { space, players, arrows } = diagram;

  const handleClick = (e) => {
    if (!interactive || !onAddPlayer) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * FIELD_W;
    const svgY = ((e.clientY - rect.top) / rect.height) * FIELD_H;
    const x = ((svgX - MARGIN) / (FIELD_W - MARGIN * 2)) * space.width;
    const y = ((svgY - MARGIN) / (FIELD_H - MARGIN * 2)) * space.height;
    if (x >= 0 && x <= space.width && y >= 0 && y <= space.height) {
      onAddPlayer(selectedTeam, Math.round(x * 10) / 10, Math.round(y * 10) / 10);
    }
  };

  return (
    <svg
      viewBox={`0 0 ${FIELD_W} ${FIELD_H}`}
      className={`w-full rounded-xl border border-emerald-800/30 bg-emerald-700/90 ${interactive ? "cursor-crosshair" : ""}`}
      onClick={handleClick}
      role="img"
      aria-label="Diagrama táctico"
    >
      <rect x={MARGIN} y={MARGIN} width={FIELD_W - MARGIN * 2} height={FIELD_H - MARGIN * 2} fill="#15803d" stroke="#fff" strokeWidth="1.5" opacity="0.95" />
      <line x1={FIELD_W / 2} y1={MARGIN} x2={FIELD_W / 2} y2={FIELD_H - MARGIN} stroke="#fff" strokeWidth="1" opacity="0.6" />
      <circle cx={FIELD_W / 2} cy={FIELD_H / 2} r="28" fill="none" stroke="#fff" strokeWidth="1" opacity="0.6" />
      {arrows.map((a, i) => (
        <line
          key={i}
          x1={toSvgX(a.from.x, space.width)}
          y1={toSvgY(a.from.y, space.height)}
          x2={toSvgX(a.to.x, space.width)}
          y2={toSvgY(a.to.y, space.height)}
          stroke="#fff"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
        />
      ))}
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#fff" />
        </marker>
      </defs>
      {players.map((p, i) => (
        <g key={i}>
          <circle
            cx={toSvgX(p.x, space.width)}
            cy={toSvgY(p.y, space.height)}
            r="10"
            fill={p.team === "A" ? "#00529F" : "#FDBE10"}
            stroke="#fff"
            strokeWidth="2"
          />
          <text x={toSvgX(p.x, space.width)} y={toSvgY(p.y, space.height) + 4} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fff">
            {p.team}
          </text>
        </g>
      ))}
      <text x={FIELD_W - 60} y={FIELD_H - 8} fontSize="10" fill="#fff" opacity="0.7">
        {space.width}×{space.height}m
      </text>
    </svg>
  );
}
