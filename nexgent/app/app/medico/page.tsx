/** MAQUETA — estado clínico plantilla */

"use client";

import { MEDICAL_PLAYERS } from "@/lib/seed-data";

const PHASES = ["Fase 1", "Fase 2", "Fase 3", "Alta"];

export default function MedicoPage() {
  const focus = MEDICAL_PLAYERS[0];

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-black">Médico</h1>

      <div className="rounded-xl border border-depro-border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-depro-gray-light text-depro-gray text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Jugador</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Fase</th>
            </tr>
          </thead>
          <tbody>
            {MEDICAL_PLAYERS.map((p) => (
              <tr key={p.name} className="border-t border-depro-border">
                <td className="px-4 py-3 font-bold">{p.name}</td>
                <td className="px-4 py-3 text-depro-gray">{p.status}</td>
                <td className="px-4 py-3">{PHASES[p.phase - 1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-amber-700/40 bg-amber-950/20 p-5">
        <h2 className="font-bold">Readaptación · {focus.name}</h2>
        <div className="flex gap-2 mt-4 mb-2">
          {PHASES.map((ph, i) => (
            <div key={ph} className={`flex-1 text-center text-xs py-2 rounded-lg font-bold ${i + 1 <= focus.phase ? "bg-amber-500 text-slate-900" : "bg-depro-gray-light text-depro-gray"}`}>
              {ph}
            </div>
          ))}
        </div>
        <div className="h-3 bg-depro-gray-light rounded-full overflow-hidden">
          <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${focus.progress}%` }} />
        </div>
        <p className="text-xs text-depro-gray mt-2">{focus.progress}% completado</p>
      </div>

      <p className="text-xs text-depro-gray border border-depro-border rounded-lg p-3">MAQUETA — datos clínicos de ejemplo.</p>
    </div>
  );
}
