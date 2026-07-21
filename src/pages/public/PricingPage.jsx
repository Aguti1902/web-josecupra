import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Gift, User, Building2, Users, ChevronRight, Shield, Zap, HelpCircle } from "lucide-react";
import PageHero from "../../components/public/holded/PageHero";
import {
  PageBenefitsGrid, PageMiniFaq, PageCtaBanner, PageCompareSection,
} from "../../components/public/holded/PageSections";

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

  const faqByAudience = {
    coach: [
      { q: "¿Puedo cambiar de plan después?", a: "Sí. Upgrade o downgrade en cualquier momento desde tu perfil. El cambio se aplica en el siguiente ciclo de facturación." },
      { q: "¿Qué pasa al terminar la prueba?", a: "Si no introduces tarjeta, tu cuenta se pausa. Tus datos se conservan 30 días por si quieres reactivar." },
    ],
    club: [
      { q: "¿Incluye formación para el staff?", a: "Sí. Onboarding guiado y sesión de formación en vivo incluida en planes Profesional y Elite." },
      { q: "¿Hay descuento por volumen?", a: "Clubs con más de 15 equipos pueden solicitar pricing personalizado. Escríbenos desde recursos/contacto." },
    ],
    player: [
      { q: "¿Cómo funciona el descuento de club?", a: "Al registrarte con el código de tu entrenador obtienes 15% de descuento permanente en tu suscripción." },
      { q: "¿Puedo usar DEPRO Player sin club?", a: "Sí. Es totalmente independiente. El código de club es opcional y añade descuento + conexión con tu entrenador." },
    ],
  };

  return (
    <>
      <PageHero
        variant="centered"
        theme="dark"
        badge="Precios · Transparentes"
        title="Planes que crecen contigo"
        description="Elige el perfil que mejor encaje — entrenador individual, club/academia o jugador. Todos incluyen prueba gratuita sin tarjeta."
        bullets={["Sin permanencia", "Cancela cuando quieras", "Datos conservados 30 días", "Soporte en español"]}
        primaryCta={{ label: "Empezar prueba gratis", to: "/comprar" }}
        secondaryCta={{ label: "Comparar funcionalidades", to: "/funcionalidades" }}
      />
      <section className="py-4 bg-holded-dark border-b border-white/5">
        <div className="max-w-xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-bold px-4 py-2 rounded-full">
            <Gift size={15} className="text-holded-green" /> 15 días gratis · Sin tarjeta de crédito
          </div>
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
                {plan.hi && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-holded-blue mb-2">Más popular</span>
                )}
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
          <p className="text-center text-xs text-gray-400 mt-8">Precios sin IVA · Facturación mensual · Descuentos anuales disponibles bajo solicitud</p>
        </div>
      </section>
      <PageBenefitsGrid
        dark
        label="Incluido en todos los planes"
        title="Lo que nunca pagas aparte"
        items={[
          { icon: Shield, title: "Datos seguros", desc: "Servidores en la UE, cifrado en tránsito y copias de seguridad diarias." },
          { icon: Zap, title: "Actualizaciones", desc: "Nuevas funcionalidades y mejoras incluidas sin coste adicional." },
          { icon: HelpCircle, title: "Soporte en español", desc: "Email y chat con respuesta en menos de 24 horas laborables." },
        ]}
      />
      <PageCompareSection
        dark={false}
        label="Valor"
        title="¿Por qué DEPRO y no alternativas?"
        rows={[
          { label: "Planificación IA", before: "Plantillas genéricas", after: "Microciclos personalizados" },
          { label: "Control de carga", before: "No incluido / extra", after: "Integrado desde Pro" },
          { label: "Multi-perfil", before: "Solo entrenador", after: "Coach + Club + Player" },
          { label: "Precio entrada", before: "50–200€/mes", after: "Desde 14,99€/mes" },
        ]}
      />
      <PageMiniFaq dark title="Preguntas sobre precios" items={faqByAudience[audience]} />
      <PageCtaBanner
        dark={false}
        title="¿No sabes qué plan elegir?"
        description="Empieza la prueba gratuita y escala cuando lo necesites. O escríbenos y te ayudamos a elegir."
        ctaLabel="Probar gratis"
        ctaTo="/comprar"
        secondaryLabel="Contactar"
        secondaryTo="/recursos#contacto"
      />
    </>
  );
}
