/** MAQUETA — planificación con datos seed */

"use client";

import { MESO_PHASES, MICROCYCLE } from "@/lib/seed-data";

export default function PlanificacionPage() {
  const activePhase = 2;

  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="text-2xl font-black">Planificación</h1>

      <div className="flex gap-2 flex-wrap">
        {MESO_PHASES.map((phase, i) => (
          <div
            key={phase}
            className={`px-4 py-2 rounded-lg text-sm font-bold ${i === activePhase ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"}`}
          >
            {phase}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-5">
        <h2 className="font-bold mb-4">Microciclo · Semana 38</h2>
        <div className="grid grid-cols-7 gap-2">
          {MICROCYCLE.map((d) => (
            <div
              key={d.day}
              className={`rounded-lg border p-3 text-center ${
                d.type === "match" ? "border-amber-500/50 bg-amber-950/30" :
                d.type === "rest" ? "border-slate-700 bg-slate-900/50 opacity-60" :
                "border-slate-600 bg-slate-800/50"
              }`}
            >
              <p className="text-xs font-bold text-slate-400">{d.day}</p>
              <p className="text-[11px] font-semibold mt-2 leading-tight">{d.label}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-600 border border-slate-800 rounded-lg p-3">
        MAQUETA — mesociclo y microciclo con datos fijos. Producción: editor colaborativo + sync calendario competición.
      </p>
    </div>
  );
}
