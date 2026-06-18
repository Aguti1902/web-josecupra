/** MAQUETA — cantera sin GPS */

"use client";

import { YOUTH_SQUAD, riskColor } from "@/lib/seed-data";

export default function CanteraPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-black">Cantera · Juvenil A</h1>
      <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-slate-800 text-amber-400 border border-amber-700/50">
        Entrada manual — sin GPS
      </span>

      <div className="grid sm:grid-cols-3 gap-4">
        {YOUTH_SQUAD.map((p) => (
          <div key={p.name} className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
            <p className="font-bold">{p.name}</p>
            <p className="text-sm text-slate-400">{p.position}</p>
            <div className="mt-3 flex gap-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-slate-700">Carga: {p.load}</span>
              <span className="px-2 py-0.5 rounded" style={{ color: riskColor(p.risk as "bajo" | "medio" | "alto") }}>
                Riesgo: {p.risk}
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-600 border border-slate-800 rounded-lg p-3">
        MAQUETA — registro manual para categorías inferiores sin hardware GPS.
      </p>
    </div>
  );
}
