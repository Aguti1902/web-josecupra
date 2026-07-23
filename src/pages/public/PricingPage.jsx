import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, X, Gift, User, Building2, Users, ChevronRight, Shield, Zap, HelpCircle } from "lucide-react";
import PageHero from "../../components/public/holded/PageHero";
import {
  PageBenefitsGrid, PageMiniFaq, PageCompareSection,
} from "../../components/public/holded/PageSections";

const PLANS = {
  coach: [
    {
      name: "Starter",
      price: "14,99€",
      hi: false,
      limits: { teams: "1 equipo", players: "25 jugadores", staff: "1 entrenador" },
      features: [
        "Microciclo IA automático",
        "Sesiones A / B / C semanales",
        "Biblioteca 90+ ejercicios",
        "Panel entrenador completo",
        "Gestión básica de plantilla",
        "Export PDF de sesiones",
        "Soporte email <48h",
      ],
      notIncluded: [
        "Control de carga (RPE / wellness)",
        "Tests físicos T1→T3",
        "Import GPS",
        "Multi-equipo",
      ],
    },
    {
      name: "Pro",
      price: "29,99€",
      hi: true,
      limits: { teams: "3 equipos", players: "60 jugadores", staff: "1 entrenador" },
      features: [
        "Todo lo de Starter",
        "Control de carga RPE + wellness",
        "Alertas B2 / B3 automáticas",
        "Tests físicos T1→T3",
        "Ratings y evolución por jugador",
        "Histórico multi-temporada",
        "Semáforo de plantilla",
        "Soporte email <24h",
      ],
      notIncluded: [
        "Equipos ilimitados",
        "Import GPS",
        "Diagramas IA avanzados",
        "Soporte prioritario",
      ],
    },
    {
      name: "Premium",
      price: "49,99€",
      hi: false,
      limits: { teams: "Ilimitados", players: "Ilimitados", staff: "1 entrenador" },
      features: [
        "Todo lo de Pro",
        "Equipos y jugadores sin límite",
        "Import datos GPS (Catapult, WIMU…)",
        "Diagramas y esquemas IA",
        "Informes avanzados dirección",
        "Soporte prioritario <12h",
        "Acceso anticipado a novedades",
      ],
      notIncluded: [],
    },
  ],
  club: [
    {
      name: "Inicial",
      price: "199€",
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
      name: "Profesional",
      price: "399€",
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
      name: "Elite",
      price: "699€",
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
      name: "Esencial",
      price: "19,99€",
      hi: false,
      limits: { teams: "Individual", players: "1 perfil", staff: "Sin entrenador vinculado" },
      features: [
        "Plan mensual IA por posición",
        "Sesiones adaptadas a objetivos",
        "Ejercicios de prevención básicos",
        "Export PDF del plan",
        "Registro RPE post-sesión",
        "Descuento −15% con código club",
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
      name: "Pro",
      price: "39,99€",
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
    { label: "Control de carga", values: ["—", "✓", "✓"] },
    { label: "Tests T1→T3", values: ["—", "✓", "✓"] },
    { label: "Import GPS", values: ["—", "—", "✓"] },
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
    { label: "Descuento código club", values: ["−15%", "−15%"] },
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
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-4xl font-black text-gray-900">{plan.price}</span>
                  <span className="text-gray-400 text-sm mb-1">/ mes</span>
                </div>

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

                <Link to={`/comprar?audience=${audience}`} className={`w-full py-3.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 mt-auto ${plan.hi ? "bg-holded-blue text-white hover:bg-holded-blue/90" : "border border-gray-200 text-gray-800 hover:bg-gray-50"}`}>
                  Probar 15 días gratis <ChevronRight size={15} />
                </Link>
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
          { label: "Control de carga", before: "No incluido / extra", after: "Integrado desde Pro" },
          { label: "Multi-perfil", before: "Solo entrenador", after: "Coach + Club + Player" },
          { label: "Precio entrada", before: "50–200€/mes", after: "Desde 14,99€/mes" },
        ]}
      />
      <PageMiniFaq dark={false} title="Preguntas sobre precios" items={faqByAudience[audience]} />
    </>
  );
}
