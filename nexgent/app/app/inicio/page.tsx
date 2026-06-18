/**
 * DEMO vs PRODUCCIÓN
 * ------------------
 * MAQUETA — datos seed. Producción: agregar datos GPS en vivo.
 */

"use client";

import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  DEMO_PLAYERS, WEEKLY_LOAD, riskColor, loadBandColor, DEMO_CLUB,
} from "@/lib/seed-data";
import { MessageSquare, Calendar, AlertTriangle } from "lucide-react";

export default function InicioPage() {
  const highRisk = DEMO_PLAYERS.filter((p) => p.injuryRisk === "alto").length;
  const teamRisk = highRisk >= 2 ? "alto" : highRisk === 1 ? "medio" : "bajo";

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-black">Buenos días, staff {DEMO_CLUB.shortName}</h1>
        <p className="text-slate-400 text-sm mt-1">Resumen del día · Semana 38</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-2">
            <AlertTriangle size={14} /> Riesgo de lesión
          </div>
          <p className="text-3xl font-black capitalize" style={{ color: riskColor(teamRisk as "bajo" | "medio" | "alto") }}>
            {teamRisk}
          </p>
          <p className="text-xs text-slate-500 mt-1">{highRisk} jugadores en alerta</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-2">
            <Calendar size={14} /> Próxima sesión
          </div>
          <p className="font-bold">Hoy 11:00</p>
          <p className="text-sm text-slate-400">Técnico-táctico · Intensidad media</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <p className="text-slate-400 text-xs font-bold uppercase mb-2">Próximo partido</p>
          <p className="font-bold">Sáb 21:00</p>
          <p className="text-sm text-slate-400">La Liga · Local</p>
        </div>
        <Link href="/app/chat" className="rounded-xl border border-blue-700/50 bg-blue-950/30 p-4 hover:border-blue-500 transition-colors">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase mb-2">
            <MessageSquare size={14} /> Chat staff
          </div>
          <p className="text-sm text-slate-300">3 mensajes nuevos en Cuerpo técnico</p>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5">
          <h2 className="font-bold mb-4">Carga semanal del equipo (AU)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={WEEKLY_LOAD}>
              <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155" }} />
              <Bar dataKey="load" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5">
          <h2 className="font-bold mb-4">Estado de la plantilla</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {DEMO_PLAYERS.map((p) => (
              <div key={p.id} className="flex flex-col items-center gap-1">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-xs font-black border-2"
                  style={{ borderColor: loadBandColor(p.loadBand), background: "#1e293b" }}
                >
                  {p.avatar}
                </div>
                <span className="text-[10px] text-slate-400 truncate w-full text-center">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-600 border border-slate-800 rounded-lg p-3">
        MAQUETA — datos de ejemplo. Producción: agregación GPS en tiempo real + predicción IA de riesgo.
      </p>
    </div>
  );
}
