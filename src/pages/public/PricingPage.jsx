import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, X, Gift, User, Building2, Users, ChevronRight, Shield, Zap, HelpCircle } from "lucide-react";
import PageHero from "../../components/public/holded/PageHero";
import { isClubSelfServeOpen } from "../../lib/productAvailability";
import { PLANS as CHECKOUT_PLANS, formatPrice, applyClubDiscount } from "../../lib/checkoutPlans";
import {
  PageBenefitsGrid, PageMiniFaq, PageCompareSection,
} from "../../components/public/holded/PageSections";

function planPriceLabel(planId, fallback = "—") {
  const p = CHECKOUT_PLANS[planId];
  return p ? formatPrice(p.price) : fallback;
}

const PLANS = {
  coach: [
    {
      planId: "coach-starter",
      name: "Standard",
      hi: true,
      limits: { teams: "1 equipo", players: "Hasta 25 jugadores", staff: "1 entrenador" },
      features: [
        "Microciclo y mesociclo automáticos",
        "Dos sesiones por tipo de entreno al mes",
        "Actualización automática al cambiar de mes",
        "Cuestionario de equipo (días, partido, material, gym)",
        "1 equipo incluido",
        "Tests de equipo incluidos",
        "Extras +5€: refresco con balón, PDF de sesiones, cargas, +3 equipos",
      ],
      notIncluded: [
        "Descarga de sesiones en PDF (extra)",
        "Control de cargas (extra)",
        "Refresco ilimitado con balón (extra)",
        "Más de 1 equipo (extra +3)",
      ],
    },
    {
      planId: "coach-premium",
      name: "Premium",
      hi: false,
      limits: { teams: "Hasta 4 equipos", players: "Hasta 60 jugadores", staff: "1 entrenador" },
      features: [
        "Todo lo de Standard",
        "Refresco ilimitado de calentamientos con balón",
        "Descarga de sesiones en PDF",
        "Control de cargas",
        "Hasta 4 equipos (1 + 3 extra)",
        "Tests de equipo incluidos",
        "Descuento vs 30€ + 20€ de extras (50€ → 45€)",
      ],
      notIncluded: [],
    },
  ],
  club: [
    {
      planId: "club-inicial",
      name: "Inicial",
      hi: false,
      limits: { teams: "Hasta 3 equipos", players: "80 jugadores", staff: "2 staff" },
      features: [
        "Panel coordinador centralizado",
        "Periodización IA por categoría",
        "White-label (logo + colores)",
        "Código de club para jugadores",
        "Control de carga multi-equipo",
        "Tests T1→T3 por plantilla",
        "Onboarding guiado incluido",
        "Soporte email <24h",
      ],
      notIncluded: [
        "Más de 3 equipos",
        "GPS multi-equipo",
        "KPIs ejecutivos",
        "API e integraciones",
      ],
    },
    {
      planId: "club-pro",
      name: "Profesional",
      hi: true,
      limits: { teams: "Hasta 8 equipos", players: "200 jugadores", staff: "5 staff" },
      features: [
        "Todo lo de Inicial",
        "Hasta 8 equipos activos",
        "Import GPS multi-equipo",
        "KPIs para dirección deportiva",
        "Informes mensuales automáticos",
        "Comparativa entre categorías",
        "Formación staff en vivo (1 sesión)",
        "Soporte chat + email <12h",
      ],
      notIncluded: [
        "Equipos ilimitados",
        "API REST",
        "SLA dedicado",
        "Scouting integrado",
      ],
    },
    {
      planId: "club-elite",
      name: "Elite",
      hi: false,
      limits: { teams: "Equipos ilimitados", players: "Jugadores ilimitados", staff: "Staff ilimitado" },
      features: [
        "Todo lo de Profesional",
        "Equipos, jugadores y staff sin límite",
        "API REST + webhooks",
        "Integración scouting / ERP",
        "SLA 99,9% dedicado",
        "Account manager asignado",
        "Formación presencial opcional",
        "Personalización avanzada white-label",
      ],
      notIncluded: [],
    },
  ],
  player: [
    {
      planId: "player-essential",
      name: "Standard",
      hi: false,
      limits: { teams: "Individual", players: "1 perfil", staff: "Sin entrenador vinculado" },
      features: [
        "Plan mensual IA por posición",
        "Sesiones adaptadas a objetivos",
        "Ejercicios de prevención básicos",
        "Export PDF del plan",
        "Registro RPE post-sesión",
        "Descuento −10% con código club",
        "Soporte email",
      ],
      notIncluded: [
        "Ajuste semanal automático IA",
        "Tests con ratings",
        "Ranking de equipo",
        "Feedback bidireccional coach",
      ],
    },
    {
      planId: "player-pro",
      name: "Premium",
      hi: true,
      limits: { teams: "Individual", players: "1 perfil", staff: "Coach vinculado opcional" },
      features: [
        "Todo lo de Esencial",
        "Ajuste semanal IA según feedback",
        "Tests físicos con ratings",
        "Percentiles por categoría",
        "Ranking motivacional del equipo",
        "Feedback directo al entrenador",
        "Alertas de sobrecarga personal",
        "Conexión automática con club DEPRO",
      ],
      notIncluded: [
        "Planificación multi-deporte",
        "Informes para terceros",
      ],
    },
  ],
};

const COMPARE_BY_AUDIENCE = {
  coach: [
    { label: "Equipos", values: ["1", "3", "∞"] },
    { label: "Jugadores", values: ["25", "60", "∞"] },
    { label: "Tests de equipo", values: ["✓", "✓"] },
    { label: "PDF de sesiones", values: ["extra", "✓"] },
    { label: "Control de carga", values: ["extra", "✓"] },
  ],
  club: [
    { label: "Equipos incluidos", values: ["3", "8", "∞"] },
    { label: "Jugadores totales", values: ["80", "200", "∞"] },
    { label: "Staff / entrenadores", values: ["2", "5", "∞"] },
    { label: "White-label", values: ["✓", "✓", "✓"] },
    { label: "API", values: ["—", "—", "✓"] },
  ],
  player: [
    { label: "Plan IA mensual", values: ["✓", "✓"] },
    { label: "Ajuste semanal IA", values: ["—", "✓"] },
    { label: "Tests + ratings", values: ["—", "✓"] },
    { label: "Ranking equipo", values: ["—", "✓"] },
    { label: "Descuento código club", values: ["−10%", "−10%"] },
  ],
};

export default function PricingPage() {
  const [audience, setAudience] = useState("coach");
  const tabs = [
    { id: "coach", icon: User, label: "Entrenador" },
    { id: "club", icon: Building2, label: "Club" },
    { id: "player", icon: Users, label: "Jugador" },
  ];
  const list = PLANS[audience] || [];
  const tierNames = list.map((p) => p.name);

  const faqByAudience = {
    coach: [
      { q: "¿Puedo cambiar de plan después?", a: "Sí. Upgrade o downgrade en cualquier momento desde tu perfil. El cambio se aplica en el siguiente ciclo de facturación." },
      { q: "¿Qué pasa si supero el límite de jugadores?", a: "Te avisamos al acercarte al límite. Puedes ampliar al plan superior o eliminar jugadores inactivos." },
      { q: "¿Qué pasa al terminar la prueba?", a: "Si no introduces tarjeta, tu cuenta se pausa. Tus datos se conservan 30 días por si quieres reactivar." },
    ],
    club: [
      { q: "¿Qué cuenta como un equipo?", a: "Cada categoría independiente (ej. Cadete A, Juvenil B) cuenta como 1 equipo. Los grupos dentro del mismo equipo no suman." },
      { q: "¿Puedo añadir equipos extra?", a: "Sí, con add-on de +3 equipos por 79€/mes en plan Inicial, o upgrade a Profesional (8 equipos) / Elite (ilimitado)." },
      { q: "¿Incluye formación para el staff?", a: "Onboarding guiado en todos los planes. Sesión en vivo incluida en Profesional y Elite." },
    ],
    player: [
      { q: "¿Cómo funciona el descuento de club?", a: "Al registrarte con el código de tu entrenador obtienes 10% de descuento permanente en tu suscripción. El club recibe una comisión del 10% sobre esas ventas." },
      { q: "¿Puedo usar DEPRO Player sin club?", a: "Sí. Es totalmente independiente. El código de club es opcional y añade descuento + conexión con tu entrenador." },
      { q: "¿Premium tiene prueba gratis?", a: "No. La prueba de 15 días aplica solo al plan Standard. Premium se cobra desde el primer día (seguimiento humano, plazas limitadas)." },
    ],
  };

  return (
    <>
      <PageHero
        variant="centered"
        theme="dark"
        badge="Precios · Transparentes"
        title="Planes que crecen contigo"
        description="Elige el perfil que mejor encaje — entrenador individual, club/academia o jugador. Standard (jugador) incluye 15 días de prueba; Premium jugador no tiene prueba gratis."
        bullets={["Sin permanencia", "Cancela cuando quieras", "Datos conservados 30 días", "Soporte en español"]}
        primaryCta={{ label: "Empezar prueba gratis", to: "/comprar" }}
        secondaryCta={{ label: "Comparar funcionalidades", to: "/funcionalidades" }}
      />
      <section className="py-4 bg-holded-dark border-b border-white/5">
        <div className="max-w-xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-bold px-4 py-2 rounded-full">
            <Gift size={15} className="text-holded-green" /> 15 días gratis en Standard · Premium sin prueba
          </div>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center mb-10 -mx-4 px-4 overflow-x-auto">
            <div className="inline-flex p-1 rounded-full bg-gray-100 border border-gray-200 min-w-0 shrink-0">
              {tabs.map(({ id, icon: Icon, label }) => (
                <button key={id} type="button" onClick={() => setAudience(id)} className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${audience === id ? "bg-holded-blue text-white shadow" : "text-gray-500 hover:text-gray-800"}`}>
                  <Icon size={16} /> {label}
                </button>
              ))}
            </div>
          </div>

          {audience === "club" && (
            <p className="text-center text-sm text-gray-500 mb-8 max-w-2xl mx-auto">
              {!isClubSelfServeOpen() && (
                <span className="block mb-3 font-semibold text-amber-800">
                  Contratación pública de Club: próximamente. El producto se conserva para acabarlo más adelante.
                </span>
              )}
              Cada plan club limita el número de <strong className="text-gray-800">equipos activos</strong>, jugadores totales y cuentas de staff.
              Un equipo = una categoría (Cadete A, Juvenil B…).
            </p>
          )}

          <div className={`grid gap-6 ${list.length === 2 ? "md:grid-cols-2 max-w-4xl mx-auto" : "md:grid-cols-3"}`}>
            {list.map((plan) => (
              <div key={plan.name} className={`rounded-2xl border bg-white p-6 md:p-8 flex flex-col ${plan.hi ? "border-holded-blue shadow-xl ring-1 ring-holded-blue/20 md:scale-[1.02]" : "border-gray-200"}`}>
                {plan.hi && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-holded-blue mb-2">Más popular</span>
                )}
                <p className="text-xs font-bold uppercase text-gray-400 mb-2">{plan.name}</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-black text-gray-900">{planPriceLabel(plan.planId)}</span>
                  <span className="text-gray-400 text-sm mb-1">/ mes</span>
                </div>
                {audience === "player" && plan.planId && (
                  <p className="text-xs text-holded-green font-semibold mb-4">
                    {formatPrice(applyClubDiscount(CHECKOUT_PLANS[plan.planId].price))}/mes con código club (−10%)
                  </p>
                )}
                {audience !== "player" && <div className="mb-4" />}

                <div className={`rounded-xl p-4 mb-5 ${plan.hi ? "bg-blue-50 border border-blue-100" : "bg-gray-50 border border-gray-100"}`}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Límites del plan</p>
                  <ul className="space-y-1.5">
                    <li className="text-sm font-bold text-gray-900">{plan.limits.teams}</li>
                    <li className="text-sm text-gray-600">{plan.limits.players}</li>
                    <li className="text-sm text-gray-600">{plan.limits.staff}</li>
                  </ul>
                </div>

                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Incluye</p>
                <ul className="space-y-2 flex-1 mb-5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check size={14} className="text-holded-green mt-0.5 shrink-0" />{f}
                    </li>
                  ))}
                </ul>

                {plan.notIncluded.length > 0 && (
                  <>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">No incluye</p>
                    <ul className="space-y-2 mb-6">
                      {plan.notIncluded.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-gray-400">
                          <X size={14} className="mt-0.5 shrink-0" />{f}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {audience === "club" && !isClubSelfServeOpen() ? (
                  <span className="w-full py-3.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 mt-auto bg-gray-100 text-gray-500 cursor-not-allowed">
                    Próximamente
                  </span>
                ) : (
                  <Link to={`/comprar?audience=${audience}`} className={`w-full py-3.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 mt-auto ${plan.hi ? "bg-holded-blue text-white hover:bg-holded-blue/90" : "border border-gray-200 text-gray-800 hover:bg-gray-50"}`}>
                    Probar 15 días gratis <ChevronRight size={15} />
                  </Link>
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-8">Precios sin IVA · Facturación mensual · Descuentos anuales (−15%) bajo solicitud</p>
        </div>
      </section>

      {/* Tabla comparativa por perfil */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-holded-blue mb-3">Comparativa</p>
            <h2 className="text-2xl font-black text-gray-900">Límites entre planes</h2>
          </div>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white min-w-[480px] sm:min-w-0">
            <div
              className="grid gap-4 px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100"
              style={{ gridTemplateColumns: `1.4fr repeat(${list.length}, 1fr)` }}
            >
              <span>Concepto</span>
              {tierNames.map((n) => <span key={n} className="text-center">{n}</span>)}
            </div>
            {COMPARE_BY_AUDIENCE[audience]?.map((row, i) => (
              <div
                key={row.label}
                className={`grid gap-4 px-5 py-3.5 text-sm ${i > 0 ? "border-t border-gray-100" : ""}`}
                style={{ gridTemplateColumns: `1.4fr repeat(${list.length}, 1fr)` }}
              >
                <span className="font-semibold text-gray-800">{row.label}</span>
                {row.values.map((val, j) => (
                  <span key={j} className={`text-center ${j === 1 && list.length === 3 ? "font-bold text-holded-blue" : "text-gray-600"}`}>
                    {val}
                  </span>
                ))}
              </div>
            ))}
          </div>
          </div>
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
          { label: "Control de carga", before: "No incluido / extra", after: "Extra +5€ o Premium" },
          { label: "Multi-perfil", before: "Solo entrenador", after: "Coach + Club + Player" },
          { label: "Precio entrada", before: "50–200€/mes", after: "Desde 30€/mes (entrenador)" },
        ]}
      />
      <PageMiniFaq dark={false} title="Preguntas sobre precios" items={faqByAudience[audience]} />
    </>
  );
}
