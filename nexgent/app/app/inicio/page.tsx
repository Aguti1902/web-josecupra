"use client";

import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  DEMO_PLAYERS, WEEKLY_LOAD, riskColor, loadBandColor,
} from "@/lib/seed-data";
import { MessageSquare, Calendar, Activity, ClipboardList, Users, TrendingUp, CheckCircle } from "lucide-react";
import ClubBanner from "@/components/dashboard/ClubBanner";
import { PALMEIRAS } from "@/lib/club-config";

export default function InicioPage() {
  const highRisk = DEMO_PLAYERS.filter((p) => p.injuryRisk === "alto").length;
  const teamRisk = highRisk >= 2 ? "alto" : highRisk === 1 ? "medio" : "bajo";
  const completedTests = DEMO_PLAYERS.filter((p) => p.loadBand === "optima").length;
  const testPct = Math.round((completedTests / DEMO_PLAYERS.length) * 100);

  return (
    <div className="space-y-6 max-w-6xl">
      <ClubBanner team={PALMEIRAS.team} role="Entrenador" />

      {/* Stats row — estilo DEPRO coach dashboard */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-depro-border p-4 shadow-sm">
          <div className="flex items-center gap-2 text-depro-gray text-xs font-bold uppercase mb-2">
            <Users size={14} /> Plantilla activa
          </div>
          <p className="text-3xl font-black text-depro-dark">{DEMO_PLAYERS.length}</p>
          <p className="text-xs text-depro-gray mt-1">jugadores · {PALMEIRAS.team}</p>
        </div>
        <div className="bg-white rounded-xl border border-depro-border p-4 shadow-sm">
          <div className="flex items-center gap-2 text-depro-gray text-xs font-bold uppercase mb-2">
            <Calendar size={14} /> Próxima sesión
          </div>
          <p className="font-bold text-depro-dark">Hoy 09:30</p>
          <p className="text-sm text-depro-gray">Técnico-táctico · Intensidad media</p>
        </div>
        <div className="bg-white rounded-xl border border-depro-border p-4 shadow-sm">
          <div className="flex items-center gap-2 text-depro-gray text-xs font-bold uppercase mb-2">
            <CheckCircle size={14} style={{ color: PALMEIRAS.accent }} /> Tests completados
          </div>
          <p className="text-3xl font-black" style={{ color: PALMEIRAS.accent }}>{testPct}%</p>
          <p className="text-xs text-depro-gray mt-1">Evaluación T3 · Semana 24</p>
        </div>
        <div className="bg-white rounded-xl border border-depro-border p-4 shadow-sm">
          <div className="flex items-center gap-2 text-depro-gray text-xs font-bold uppercase mb-2">
            <Activity size={14} /> Riesgo lesión
          </div>
          <p className="text-3xl font-black capitalize" style={{ color: riskColor(teamRisk as "bajo" | "medio" | "alto") }}>
            {teamRisk}
          </p>
          <p className="text-xs text-depro-gray mt-1">{highRisk} jugadores en alerta</p>
        </div>
      </div>

      {/* Quick links — DEPRO style */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { href: "/app/planificacion", icon: Calendar, label: "Microciclo", sub: "Semana 24 · Mesociclo 3" },
          { href: "/app/sesiones", icon: ClipboardList, label: "Sesiones", sub: "2 sesiones planificadas" },
          { href: "/app/carga", icon: TrendingUp, label: "Cargas GPS", sub: "Import Catapult listo" },
          { href: "/app/chat", icon: MessageSquare, label: "Chat staff", sub: "3 mensajes nuevos" },
        ].map(({ href, icon: Icon, label, sub }) => (
          <Link key={href} href={href} className="bg-white rounded-xl border border-depro-border p-4 hover:border-depro-blue hover:shadow-sm transition-all group">
            <Icon size={18} className="text-depro-blue mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-sm text-depro-dark">{label}</p>
            <p className="text-xs text-depro-gray mt-0.5">{sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-depro-border p-5 shadow-sm">
          <h2 className="font-bold text-depro-dark mb-4">Carga semanal del equipo (AU)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={WEEKLY_LOAD}>
              <XAxis dataKey="day" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8 }} />
              <Bar dataKey="load" fill={PALMEIRAS.accent} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-depro-border p-5 shadow-sm">
          <h2 className="font-bold text-depro-dark mb-4">Estado de la plantilla</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {DEMO_PLAYERS.map((p) => (
              <div key={p.id} className="flex flex-col items-center gap-1">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-xs font-black border-2 bg-white"
                  style={{ borderColor: loadBandColor(p.loadBand) }}
                >
                  {p.avatar}
                </div>
                <span className="text-[10px] text-depro-gray truncate w-full text-center">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-depro-border bg-white p-4 flex items-start gap-3">
        <img src="/logo-nexgent.png" alt="NexGent" className="h-5 object-contain flex-shrink-0 mt-0.5" />
        <p className="text-xs text-depro-gray leading-relaxed">
          Demo comercial <strong className="text-depro-dark">NexGent × DEPRO</strong> · {PALMEIRAS.shortName} · Datos de ejemplo. Producción: agregación GPS en tiempo real + predicción IA de riesgo.
        </p>
      </div>
    </div>
  );
}
