/**
 * DEMO vs PRODUCCIÓN
 * ------------------
 * DEMO: render SVG desde JSON de IA o dibujo manual.
 * PRODUCCIÓN: export PNG/PDF, biblioteca compartida entre clubes, versionado.
 */

"use client";

import { SessionDiagram } from "@/lib/seed-data";

const FIELD_W = 400;
const FIELD_H = 260;
const MARGIN = 20;

interface PitchDiagramProps {
  diagram: SessionDiagram;
  interactive?: boolean;
  onAddPlayer?: (team: string, x: number, y: number) => void;
  selectedTeam?: string;
}

function toSvgX(x: number, spaceW: number) {
  return MARGIN + (x / spaceW) * (FIELD_W - MARGIN * 2);
}

function toSvgY(y: number, spaceH: number) {
  return MARGIN + (y / spaceH) * (FIELD_H - MARGIN * 2);
}

export default function PitchDiagram({
  diagram,
  interactive = false,
  onAddPlayer,
  selectedTeam = "A",
}: PitchDiagramProps) {
  const { space, players, arrows } = diagram;

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
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
    >
      {/* Campo */}
      <rect x={MARGIN} y={MARGIN} width={FIELD_W - MARGIN * 2} height={FIELD_H - MARGIN * 2} fill="#15803d" stroke="#fff" strokeWidth="1.5" opacity="0.95" />
      <line x1={FIELD_W / 2} y1={MARGIN} x2={FIELD_W / 2} y2={FIELD_H - MARGIN} stroke="#fff" strokeWidth="1" opacity="0.6" />
      <circle cx={FIELD_W / 2} cy={FIELD_H / 2} r="28" fill="none" stroke="#fff" strokeWidth="1" opacity="0.6" />

      {/* Zona de trabajo (campo completo en demo) */}
      <rect
        x={MARGIN}
        y={MARGIN}
        width={FIELD_W - MARGIN * 2}
        height={FIELD_H - MARGIN * 2}
        fill="none"
        stroke="#FEBE10"
        strokeWidth="1.5"
        strokeDasharray="6 4"
        opacity="0.35"
      />

      {/* Flechas */}
      {arrows.map((a, i) => {
        const x1 = toSvgX(a.from.x, space.width);
        const y1 = toSvgY(a.from.y, space.height);
        const x2 = toSvgX(a.to.x, space.width);
        const y2 = toSvgY(a.to.y, space.height);
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth="2" markerEnd="url(#arrowhead)" />
          </g>
        );
      })}

      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#fff" />
        </marker>
      </defs>

      {/* Jugadores */}
      {players.map((p, i) => (
        <g key={i}>
          <circle
            cx={toSvgX(p.x, space.width)}
            cy={toSvgY(p.y, space.height)}
            r="10"
            fill={p.team === "A" ? "#00529F" : "#FEBE10"}
            stroke="#fff"
            strokeWidth="2"
          />
          <text
            x={toSvgX(p.x, space.width)}
            y={toSvgY(p.y, space.height) + 4}
            textAnchor="middle"
            fontSize="9"
            fontWeight="bold"
            fill="#fff"
          >
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

export const EMPTY_DIAGRAM: SessionDiagram = {
  space: { width: 30, height: 20 },
  players: [],
  arrows: [],
};
