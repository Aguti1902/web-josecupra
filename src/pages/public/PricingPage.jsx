import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Gift, User, Building2, Users, ChevronRight } from "lucide-react";
export default function PricingPage() {
  const [audience, setAudience] = useState("coach");
  const plans = {
    coach: [
      { name: "Starter", price: "14,99€", sub: "1 equipo · 25 jugadores", features: ["Microciclo IA", "Sesiones A/B/C", "Panel entrenador", "Export PDF"], hi: false },
      { name: "Pro", price: "29,99€", sub: "3 equipos · 60 jugadores", features: ["Todo Starter +", "Control de carga", "Tests T1→T3", "Histórico"], hi: true },
      { name: "Premium", price: "49,99€", sub: "Ilimitado", features: ["Todo Pro +", "Import GPS", "Diagramas IA", "Soporte prioritario"], hi: false },
    ],
    club: [
      { name: "Inicial", price: "199€", sub: "3 equipos · 80 jugadores", features: ["Panel centralizado", "Periodización IA", "White-label", "2 staff"], hi: false },
      { name: "Profesional", price: "399€", sub: "8 equipos · 200 jugadores", features: ["Todo Inicial +", "GPS multi-equipo", "KPIs dirección", "5 staff"], hi: true },
      { name: "Elite", price: "699€", sub: "Ilimitado", features: ["Todo Pro +", "API", "Scouting", "SLA dedicado"], hi: false },
    ],
    player: [
      { name: "Esencial", price: "19,99€", sub: "Plan mensual IA", features: ["Plan mensual IA", "Adaptado a posición", "PDF", "Código club -15%"], hi: false },
      { name: "Pro", price: "39,99€", sub: "Plan adaptativo", features: ["Todo Esencial +", "Ajuste semanal IA", "Tests ratings", "Alertas"], hi: true },
    ],
  };
  const tabs = [
    { id: "coach", icon: User, label: "Entrenador" },
    { id: "club", icon: Building2, label: "Club" },
    { id: "player", icon: Users, label: "Jugador" },
  ];
  const list = plans[audience] || [];

  return (
    <>
      <section className="pt-28 pb-12 bg-holded-dark text-center px-4">
        <p className="text-holded-blue-light text-xs font-bold uppercase tracking-widest mb-3">Precios</p>
        <h1 className="text-4xl font-black text-white mb-4">Planes que crecen contigo</h1>
        <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-bold px-4 py-2 rounded-full">
          <Gift size={15} /> 15 días gratis · Sin tarjeta
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center mb-10">
            <div className="inline-flex p-1 rounded-full bg-gray-100 border border-gray-200">
              {tabs.map(({ id, icon: Icon, label }) => (
                <button key={id} type="button" onClick={() => setAudience(id)} className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${audience === id ? "bg-holded-blue text-white shadow" : "text-gray-500 hover:text-gray-800"}`}>
                  <Icon size={16} /> {label}
                </button>
              ))}
            </div>
          </div>
          <div className={`grid gap-6 ${list.length === 2 ? "md:grid-cols-2 max-w-3xl mx-auto" : "md:grid-cols-3"}`}>
            {list.map((plan) => (
              <div key={plan.name} className={`rounded-2xl border bg-white p-8 flex flex-col ${plan.hi ? "border-holded-blue shadow-xl ring-1 ring-holded-blue/20 scale-[1.02]" : "border-gray-200"}`}>
                <p className="text-xs font-bold uppercase text-gray-400 mb-2">{plan.name}</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-black text-gray-900">{plan.price}</span>
                  <span className="text-gray-400 text-sm mb-1">/ mes</span>
                </div>
                <p className="text-sm text-gray-500 mb-6">{plan.sub}</p>
                <ul className="space-y-2.5 flex-1 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600"><Check size={14} className="text-holded-green mt-0.5 shrink-0" />{f}</li>
                  ))}
                </ul>
                <Link to={`/comprar?audience=${audience}`} className={`w-full py-3.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 ${plan.hi ? "bg-holded-blue text-white hover:bg-holded-blue/90" : "border border-gray-200 text-gray-800 hover:bg-gray-50"}`}>
                  Probar 15 días gratis <ChevronRight size={15} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
