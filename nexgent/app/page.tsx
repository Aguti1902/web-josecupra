/**
 * DEMO vs PRODUCCIÓN
 * ------------------
 * DEMO: landing de pitch comercial con CTA a /app/inicio.
 * PRODUCCIÓN: CMS, A/B testing, analytics, formulario de contacto CRM.
 */

import Link from "next/link";
import { ArrowRight, Brain, Activity, Users, Shield, Zap } from "lucide-react";
import { DEMO_CLUB } from "@/lib/seed-data";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <header className="border-b border-slate-800/80 backdrop-blur sticky top-0 z-50 bg-slate-950/90">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-blue-700 flex items-center justify-center text-xs font-black">NG</div>
            <span className="font-bold text-lg">NexGent</span>
          </div>
          <Link
            href="/app/inicio"
            className="text-sm font-bold px-4 py-2 rounded-lg bg-amber-400 text-slate-900 hover:bg-amber-300 transition-colors"
          >
            Entrar a la plataforma
          </Link>
        </div>
      </header>

      {/* 1. Apertura */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <p className="text-amber-400 text-sm font-bold uppercase tracking-widest mb-4">Inteligencia para clubes de élite</p>
        <h1 className="text-4xl md:text-6xl font-black leading-tight max-w-4xl">
          El resto de clubes top ya compite con{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-blue-400">IA y datos</span>
          . ¿Y el tuyo?
        </h1>
        <p className="text-xl text-slate-400 mt-6 max-w-2xl leading-relaxed">
          NexGent unifica rendimiento, salud, planificación y scouting en una plataforma que habla el idioma de tu staff — no al revés.
        </p>
        <Link
          href="/app/inicio"
          className="inline-flex items-center gap-2 mt-10 px-8 py-4 rounded-xl bg-amber-400 text-slate-900 font-black text-lg hover:bg-amber-300 transition-all hover:scale-[1.02] shadow-lg shadow-amber-400/20"
        >
          Entrar a la plataforma <ArrowRight size={22} />
        </Link>
      </section>

      {/* 2. Diferenciación */}
      <section className="border-y border-slate-800 bg-slate-900/50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-black mb-4">No es otra plataforma que hay que aprender</h2>
          <p className="text-slate-400 max-w-3xl text-lg leading-relaxed">
            NexGent se adapta al <strong className="text-white">GPS y al flujo de trabajo que ya tenéis</strong> — Catapult, STATSports, Polar, WIMU — en lugar de sustituirlos. Importáis vuestros datos, la IA los interpreta, y el staff sigue trabajando como siempre, pero con una capa de inteligencia encima.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {[
              { icon: Zap, title: "Sin fricción", desc: "Compatible con vuestros exports actuales. Cero migración forzada." },
              { icon: Shield, title: "White-label", desc: "Vuestra marca en cada pantalla. Los jugadores ven al club, no a un SaaS genérico." },
              { icon: Brain, title: "IA contextual", desc: "Resúmenes, clasificación de carga y diagramas tácticos en lenguaje natural." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6">
                <Icon className="text-amber-400 mb-3" size={28} />
                <h3 className="font-bold text-lg">{title}</h3>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Producto — tres bloques */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-black mb-10">Una plataforma, tres pilares</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="rounded-2xl border border-blue-800/50 bg-blue-950/30 p-6">
            <Brain className="text-blue-400 mb-4" size={32} />
            <h3 className="font-black text-xl text-blue-300">Cerebro central</h3>
            <p className="text-slate-400 text-sm mt-2 mb-4">Datos e IA unificados</p>
            <ul className="text-sm text-slate-300 space-y-2">
              <li>· Chat del staff con resumen IA</li>
              <li>· Buscador inteligente</li>
              <li>· Dashboard ejecutivo</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-emerald-800/50 bg-emerald-950/30 p-6">
            <Activity className="text-emerald-400 mb-4" size={32} />
            <h3 className="font-black text-xl text-emerald-300">Rendimiento y salud</h3>
            <p className="text-slate-400 text-sm mt-2 mb-4">Carga, sesiones, médico</p>
            <ul className="text-sm text-slate-300 space-y-2">
              <li>· Import GPS + clasificación IA</li>
              <li>· Sesiones con diagrama IA</li>
              <li>· Estado clínico y readaptación</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-amber-800/50 bg-amber-950/30 p-6">
            <Users className="text-amber-400 mb-4" size={32} />
            <h3 className="font-black text-xl text-amber-300">Jugador y negocio</h3>
            <p className="text-slate-400 text-sm mt-2 mb-4">Scouting, cantera, dirección</p>
            <ul className="text-sm text-slate-300 space-y-2">
              <li>· Informes de scouting CRUD</li>
              <li>· Cantera sin hardware GPS</li>
              <li>· KPIs para dirección deportiva</li>
            </ul>
          </div>
        </div>
        <p className="text-center text-slate-500 text-sm mt-8">
          Referencia demo: {DEMO_CLUB.name}
        </p>
      </section>

      {/* 4. Cierre — piloto */}
      <section className="border-t border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-black">Empezad con un piloto acotado y medible</h2>
          <p className="text-slate-400 mt-4 text-lg leading-relaxed">
            No pedimos un compromiso total el primer día. Un piloto de 8–12 semanas con un equipo, métricas claras de adopción del staff y reducción de carga mal gestionada. Si los números cuadran, escalamos.
          </p>
          <Link
            href="/app/inicio"
            className="inline-flex items-center gap-2 mt-10 px-10 py-4 rounded-xl bg-amber-400 text-slate-900 font-black text-lg hover:bg-amber-300 transition-all shadow-xl shadow-amber-400/25"
          >
            Ver la plataforma en vivo <ArrowRight size={22} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-8 text-center text-slate-600 text-sm">
        © {new Date().getFullYear()} NexGent · Demo comercial
      </footer>
    </div>
  );
}
