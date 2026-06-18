/** MAQUETA — KPIs dirección deportiva */

"use client";

import { EXEC_KPIS } from "@/lib/seed-data";

export default function DireccionPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-black">Dirección deportiva</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {EXEC_KPIS.map((k) => (
          <div key={k.label} className="rounded-xl border border-depro-border bg-white shadow-sm p-5">
            <p className="text-3xl font-black text-amber-400 stat-number">{k.value}</p>
            <p className="text-sm text-depro-gray mt-2">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-depro-border bg-white p-5">
        <h2 className="font-bold mb-3">Resumen ejecutivo</h2>
        <p className="text-sm text-depro-dark leading-relaxed">
          La plantilla mantiene adherencia del 94% al microciclo. Dos jugadores en protocolo de readaptación.
          Scouting activo con 4 informes nuevos este mes. La integración GPS permite clasificar carga en tiempo
          real — estimación de 18 días de baja evitados en el trimestre por gestión proactiva.
        </p>
      </div>

      <p className="text-xs text-depro-gray border border-depro-border rounded-lg p-3">MAQUETA — KPIs y resumen con datos de ejemplo.</p>
    </div>
  );
}
