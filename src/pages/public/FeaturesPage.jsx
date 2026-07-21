import { Link } from "react-router-dom";
import {
  ArrowRight, Calendar, Activity, BarChart3, Users, Zap, Brain, FileText,
  Clock, Target, TrendingUp, Shield,
} from "lucide-react";
import PageHero from "../../components/public/holded/PageHero";
import { HoldedFeatureSection } from "../../components/public/holded/HoldedMockups";
import {
  PageBenefitsGrid, PageStepsSection, PageCompareSection,
  PageMiniFaq,
} from "../../components/public/holded/PageSections";
import { FootballStorySection } from "../../components/public/holded/HoldedHomeSections";
import { SessionsMockup, LoadMockup, TestsMockup, ClubOverviewMockup } from "../../components/public/LandingMockups";

const FEATURES = {
  planificacion: {
    label: "Planificación",
    title: "Microciclos y mesociclos automáticos",
    desc: "La IA genera sesiones A/B/C según categoría, fase competitiva y material disponible. Edita, duplica o regenera en segundos.",
    bullets: ["Mesociclos editables", "Distribución semanal automática", "Protocolos A/B/C", "Biblioteca 90+ ejercicios"],
    mockup: <SessionsMockup />,
    hero: {
      variant: "split",
      theme: "dark",
      badge: "Planificación · DEPRO Coach",
      description: "Genera microciclos completos con sesiones A, B y C adaptadas a tu categoría, fase de temporada y material disponible. Sin hojas de cálculo ni plantillas rotas.",
      bullets: ["Mesociclos en menos de 2 minutos", "Protocolos A/B/C automáticos", "Biblioteca con 90+ ejercicios", "Export PDF para el staff"],
      stats: [{ val: "160×", label: "Más rápido que Excel" }, { val: "90+", label: "Ejercicios catalogados" }],
      primaryCta: { label: "Probar planificación", to: "/comprar?audience=coach" },
      secondaryCta: { label: "Ver precios", to: "/precios" },
      visual: <SessionsMockup />,
    },
    benefits: [
      { icon: Calendar, title: "Mesociclos inteligentes", desc: "Pretemporada, competición y transición con progresión semanal automática y semanas de descarga." },
      { icon: Zap, title: "Sesiones A/B/C", desc: "Tres protocolos por semana con intensidad, volumen y objetivos diferenciados según el día." },
      { icon: Brain, title: "Motor IA validado", desc: "Reglas deportivas deterministas — no una caja negra. Sabes por qué se propone cada sesión." },
      { icon: FileText, title: "Export profesional", desc: "PDF con ejercicios, series, reps y notas listo para compartir con tu staff o dirección." },
      { icon: Clock, title: "Ahorro de tiempo", desc: "Entrenadores reportan hasta 40 horas menos al mes en planificación administrativa." },
      { icon: Target, title: "Por categoría", desc: "Prebenjamín a Juvenil con cargas, duraciones y ejercicios ajustados automáticamente." },
    ],
    steps: [
      { title: "Configura tu equipo", desc: "Indica categoría, fase de temporada, días de entrenamiento y material disponible en el wizard." },
      { title: "Genera el mesociclo", desc: "DEPRO crea semanas completas con sesiones A/B/C, progresión y descargas automáticas." },
      { title: "Entrena y ajusta", desc: "Marca sesiones completadas, edita ejercicios concretos o regenera la semana si cambia el calendario." },
    ],
    compare: [
      { label: "Tiempo de planificación", before: "4–6 h/semana", after: "15 min/semana" },
      { label: "Consistencia metodológica", before: "Depende del entrenador", after: "Protocolos estandarizados" },
      { label: "Adaptación a lesiones", before: "Manual", after: "Alertas + ajuste automático" },
      { label: "Histórico de temporadas", before: "Carpetas dispersas", after: "Todo en la nube" },
    ],
    faq: [
      { q: "¿Puedo editar las sesiones generadas?", a: "Sí. Cada ejercicio, serie y rep es editable. También puedes duplicar semanas o regenerar con nuevos parámetros." },
      { q: "¿Funciona para fútbol sala?", a: "DEPRO adapta cargas y ejercicios según modalidad, categoría y número de entrenamientos semanales." },
    ],
    story: {
      title: "Periodización que evoluciona con tu club",
      desc: "Desde pretemporada hasta playoffs, DEPRO mantiene coherencia metodológica entre equipos y temporadas.",
      bullets: ["Mesociclos por fase", "Histórico multi-temporada", "Coordinación entre equipos"],
    },
  },
  cargas: {
    label: "Control de carga",
    title: "Monitoriza RPE y wellness en tiempo real",
    desc: "Detecta sobrecargas antes de que se conviertan en lesiones. RPE, sueño, fatiga y alertas automáticas por jugador.",
    bullets: ["RPE por sesión", "Sueño, fatiga, ánimo", "Alertas automáticas", "Histórico por jugador"],
    mockup: <LoadMockup />,
    hero: {
      variant: "split",
      theme: "accent",
      badge: "Monitorización · Wellness",
      description: "Recoge RPE post-sesión y cuestionarios de wellness diarios. DEPRO cruza datos y avisa cuando un jugador entra en zona de riesgo.",
      bullets: ["RPE por sesión y jugador", "Wellness: sueño, fatiga, ánimo", "Alertas B2/B3 automáticas", "Dashboard acumulado semanal"],
      stats: [{ val: "85%", label: "Adherencia media" }, { val: "−32%", label: "Lesiones evitables" }],
      primaryCta: { label: "Activar control de carga", to: "/comprar?audience=coach" },
      secondaryCta: { label: "Para clubs", to: "/para-clubs" },
      visual: <LoadMockup />,
    },
    benefits: [
      { icon: Activity, title: "RPE post-sesión", desc: "Escala 1–10 con registro por jugador y sesión. Acumulado semanal visible de un vistazo." },
      { icon: TrendingUp, title: "Wellness diario", desc: "Sueño, fatiga muscular, estado de ánimo y dolor. Tendencias de 7 y 28 días." },
      { icon: Shield, title: "Alertas inteligentes", desc: "Umbrales B2 (precaución) y B3 (stop) basados en literatura deportiva y tu historial." },
      { icon: Users, title: "Vista por plantilla", desc: "Semáforo de todo el equipo: quién está en verde, ámbar o rojo esta semana." },
      { icon: BarChart3, title: "Ratios ACWR", desc: "Carga aguda vs crónica calculada automáticamente para prevenir picos peligrosos." },
      { icon: FileText, title: "Informes dirección", desc: "Export mensual con resumen de cargas, alertas y jugadores en riesgo para la junta." },
    ],
    steps: [
      { title: "Activa el módulo", desc: "Habilita RPE y wellness en la configuración del equipo. Los jugadores reciben notificación en su panel." },
      { title: "Recoge datos", desc: "Tras cada sesión el jugador registra RPE en 10 segundos. Wellness opcional cada mañana." },
      { title: "Actúa con alertas", desc: "DEPRO avisa cuando un jugador supera umbrales. Ajusta la sesión del día o planifica descarga." },
    ],
    compare: [
      { label: "Detección de sobrecarga", before: "Subjetiva / tardía", after: "Alertas automáticas" },
      { label: "Registro de datos", before: "WhatsApp / papel", after: "App integrada" },
      { label: "Histórico por jugador", before: "Inexistente", after: "Toda la temporada" },
      { label: "Coordinación multi-equipo", before: "Imposible", after: "Panel club centralizado" },
    ],
    faq: [
      { q: "¿Los jugadores tienen que rellenar algo?", a: "Sí, RPE post-sesión (10 segundos) y wellness diario opcional. Sin datos no hay alertas fiables." },
      { q: "¿Se integra con GPS?", a: "En planes Pro y Club puedes importar datos GPS para enriquecer el análisis de carga externa." },
    ],
    story: {
      title: "Prevención basada en datos reales",
      desc: "Clubs que monitorizan carga de forma sistemática reducen lesiones musculares evitables y mejoran la disponibilidad del plantel.",
      bullets: ["Alertas antes de la lesión", "Histórico longitudinal", "Coordinación médica"],
    },
  },
  tests: {
    label: "Tests físicos",
    title: "Evaluación y seguimiento T1→T3",
    desc: "Batería completa con ratings, percentiles y evolución por jugador a lo largo de la temporada.",
    bullets: ["Sprint y salto", "Resistencia Yo-Yo", "Comparativas", "Export dirección deportiva"],
    mockup: <TestsMockup />,
    hero: {
      variant: "centered",
      theme: "light",
      badge: "Evaluación · T1 → T2 → T3",
      description: "Programa baterías físicas en tres momentos de la temporada. Compara resultados, genera ratings y detecta jugadores en riesgo de rendimiento.",
      bullets: ["Sprint 20m, salto CMJ, Yo-Yo IR1", "Ratings automáticos por posición", "Gráficos de evolución T1→T3", "Informe PDF para dirección"],
      stats: [{ val: "12+", label: "Tests disponibles" }, { val: "T1→T3", label: "Seguimiento trimestral" }],
      primaryCta: { label: "Empezar evaluaciones", to: "/comprar?audience=coach" },
      secondaryCta: { label: "Ver demo", to: "/recursos" },
    },
    benefits: [
      { icon: BarChart3, title: "Batería completa", desc: "Sprint, salto, agilidad, resistencia intermitente y tests de fuerza adaptados a edad." },
      { icon: Target, title: "Ratings por posición", desc: "Percentiles calculados según categoría y posición — no comparas un portero con un extremo." },
      { icon: TrendingUp, title: "Evolución T1→T3", desc: "Gráficos de progresión trimestral con alertas de estancamiento o regresión." },
      { icon: Users, title: "Ranking interno", desc: "Clasificación del plantel por test y global. Motiva la competencia sana entre jugadores." },
      { icon: FileText, title: "Informe dirección", desc: "PDF ejecutivo con KPIs del departamento físico para la junta directiva." },
      { icon: Shield, title: "Datos objetivos", desc: "Decisiones de convocatoria y minutos basadas en evidencia, no en sensaciones." },
    ],
    steps: [
      { title: "Programa la batería", desc: "Elige tests, fecha y jugadores convocados. DEPRO genera la hoja de registro digital." },
      { title: "Registra resultados", desc: "Introduce tiempos y distancias en el panel o deja que los jugadores registren en su perfil." },
      { title: "Analiza y compara", desc: "Ratings automáticos, gráficos T1→T3 y comparativas con la media del equipo y categoría." },
    ],
    compare: [
      { label: "Registro de tests", before: "Excel / papel", after: "Panel digital" },
      { label: "Análisis de resultados", before: "Manual, horas", after: "Instantáneo" },
      { label: "Seguimiento longitudinal", before: "Sin histórico", after: "T1, T2, T3 automático" },
      { label: "Comunicación dirección", before: "Email informal", after: "Informe PDF profesional" },
    ],
    faq: [
      { q: "¿Qué tests incluye DEPRO?", a: "Sprint 20m, CMJ, Yo-Yo IR1, agilidad, flexibilidad y tests de fuerza. Se amplían según feedback de clubs." },
      { q: "¿Sirve para categorías base?", a: "Sí. Los percentiles y referencias se ajustan por edad y categoría federativa." },
    ],
    story: {
      title: "Objetividad en cada trimestre",
      desc: "La dirección deportiva quiere números, no sensaciones. DEPRO convierte tus evaluaciones en informes claros y accionables.",
      bullets: ["Ratings automáticos", "Evolución visual", "Export ejecutivo"],
    },
  },
  plantilla: {
    label: "Plantilla",
    title: "Gestión completa de jugadores",
    desc: "Fichas con lesiones, posición, datos físicos y código de acceso al club. Alta manual o por invitación.",
    bullets: ["Alta manual o por código", "Datos físicos", "Notas privadas", "Multi-equipo"],
    mockup: <ClubOverviewMockup />,
    hero: {
      variant: "editorial",
      theme: "dark",
      badge: "Plantilla · Multi-equipo",
      description: "Centraliza fichas de jugadores con posición, datos antropométricos, historial de lesiones y notas privadas del staff. Códigos de club para alta self-service.",
      bullets: ["Ficha completa por jugador", "Código de club para altas", "Lesiones y aptitud médica", "Vista multi-equipo para coordinadores"],
      primaryCta: { label: "Gestionar plantilla", to: "/comprar?audience=club" },
      secondaryCta: { label: "DEPRO Coach", to: "/para-entrenadores" },
      visual: <ClubOverviewMockup />,
    },
    benefits: [
      { icon: Users, title: "Ficha 360°", desc: "Posición, pierna dominante, peso, altura, historial de lesiones y contacto de emergencia." },
      { icon: Shield, title: "Lesiones y aptitud", desc: "Registro de lesiones activas, fechas de alta médica y restricciones de entrenamiento." },
      { icon: Zap, title: "Código de club", desc: "Los jugadores se registran solos con el código del club. Sin carga administrativa para el entrenador." },
      { icon: FileText, title: "Notas privadas", desc: "Observaciones del staff visibles solo para entrenadores autorizados — nunca para el jugador." },
      { icon: Calendar, title: "Multi-equipo", desc: "Un jugador puede pertenecer a varios equipos del club con permisos diferenciados." },
      { icon: Target, title: "Datos para la IA", desc: "Posición, lesiones y nivel alimentan los motores de planificación y personalización." },
    ],
    steps: [
      { title: "Crea tu plantilla", desc: "Alta manual jugador a jugador o comparte el código de club para registro self-service." },
      { title: "Completa fichas", desc: "Posición, datos físicos, lesiones activas y objetivos individuales por jugador." },
      { title: "Conecta con el resto", desc: "Planificación, carga y tests usan automáticamente los datos de cada ficha." },
    ],
    compare: [
      { label: "Alta de jugadores", before: "Formularios / WhatsApp", after: "Código self-service" },
      { label: "Historial de lesiones", before: "Memoria del fisio", after: "Registro centralizado" },
      { label: "Vista coordinador", before: "No existe", after: "Todos los equipos" },
      { label: "Datos para planificación", before: "Desconectados", after: "Integrados en IA" },
    ],
    faq: [
      { q: "¿Cuántos jugadores puedo tener?", a: "Depende del plan: Starter 25, Pro 60, Premium ilimitado. Clubs tienen límites por tier." },
      { q: "¿El jugador ve las notas privadas?", a: "No. Las notas del staff son exclusivas para entrenadores y coordinadores autorizados." },
    ],
    story: {
      title: "Una base de datos viva para tu club",
      desc: "La plantilla no es un Excel estático — es el núcleo que alimenta planificación, carga, tests y comunicación con jugadores.",
      bullets: ["Self-service con código", "Lesiones integradas", "Multi-equipo"],
    },
  },
};

function FeaturesIndexVisual() {
  const icons = [Calendar, Activity, BarChart3, Users];
  const keys = Object.keys(FEATURES);
  return (
    <div className="grid grid-cols-2 gap-3">
      {keys.map((key, i) => {
        const Icon = icons[i];
        const f = FEATURES[key];
        return (
          <Link
            key={key}
            to={`/funcionalidades/${key}`}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:border-holded-blue/40 hover:bg-white/10 transition-all group"
          >
            <Icon size={22} className="text-holded-blue-light mb-3" />
            <p className="text-[10px] font-bold uppercase text-holded-blue-light mb-1">{f.label}</p>
            <p className="text-sm font-black text-white group-hover:text-holded-blue-light transition-colors leading-snug">{f.title}</p>
          </Link>
        );
      })}
    </div>
  );
}

export default function FeaturesPage({ slug }) {
  const feature = slug ? FEATURES[slug] : null;

  if (feature) {
    const h = feature.hero;
    return (
      <>
        <PageHero
          variant={h.variant}
          theme={h.theme}
          badge={h.badge}
          title={feature.title}
          description={h.description}
          bullets={h.bullets}
          stats={h.stats}
          primaryCta={h.primaryCta}
          secondaryCta={h.secondaryCta}
          visual={h.visual}
        />
        <HoldedFeatureSection
          reverse
          dark={false}
          label={feature.label}
          title={`Todo lo que incluye ${feature.label.toLowerCase()}`}
          desc={feature.desc}
          bullets={feature.bullets}
          mockup={feature.mockup}
          ctaLink={h.primaryCta.to}
          ctaText={h.primaryCta.label}
        />
        <PageBenefitsGrid
          dark
          label="Beneficios"
          title={`Por qué usar ${feature.label} en DEPRO`}
          description="Funcionalidades diseñadas con entrenadores reales de categorías base y semi-profesional."
          items={feature.benefits}
        />
        <PageStepsSection
          dark={false}
          label="Cómo funciona"
          title="Tres pasos para empezar"
          description="Configuración rápida, resultados desde el primer día."
          steps={feature.steps}
        />
        <PageCompareSection
          dark
          label="Antes y después"
          title="DEPRO vs métodos tradicionales"
          rows={feature.compare}
        />
        <FootballStorySection
          dark={false}
          label="En la práctica"
          title={feature.story.title}
          desc={feature.story.desc}
          bullets={feature.story.bullets}
        />
        <PageMiniFaq dark={false} items={feature.faq} />
      </>
    );
  }

  return (
    <>
      <PageHero
        variant="split"
        theme="accent"
        badge="Plataforma DEPRO"
        title="Todas las funcionalidades en un solo lugar"
        description="Planificación, control de carga, tests físicos, plantilla e IA deportiva — conectados para entrenadores, clubs y jugadores."
        bullets={["4 módulos core + IA integrada", "Datos compartidos entre equipos", "Export PDF e informes", "App web y móvil"]}
        primaryCta={{ label: "Probar gratis", to: "/comprar" }}
        secondaryCta={{ label: "Ver precios", to: "/precios" }}
        visual={<FeaturesIndexVisual />}
      />
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-holded-blue mb-3">Módulos</p>
            <h2 className="text-3xl font-black text-gray-900 mb-4">Explora cada funcionalidad</h2>
            <p className="text-gray-500">Cada módulo se integra con el resto — planificación usa datos de plantilla, carga alimenta alertas y tests generan ratings.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Object.entries(FEATURES).map(([key, f]) => (
              <Link key={key} to={`/funcionalidades/${key}`} className="rounded-2xl border border-gray-200 p-6 hover:border-holded-blue hover:shadow-lg transition-all group bg-gray-50">
                <p className="text-xs font-bold text-holded-blue uppercase mb-2">{f.label}</p>
                <h3 className="font-black text-gray-900 mb-2 group-hover:text-holded-blue transition-colors leading-snug">{f.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{f.desc}</p>
                <span className="text-sm font-bold text-gray-400 group-hover:text-holded-blue inline-flex items-center gap-1">
                  Explorar <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <PageBenefitsGrid
        dark
        label="Integración"
        title="Todo conectado, nada duplicado"
        description="Los datos fluyen entre módulos sin exportar ni copiar."
        items={[
          { icon: Brain, title: "IA transversal", desc: "Planificación, carga y tests comparten el mismo motor de reglas deportivas." },
          { icon: Users, title: "Plantilla central", desc: "Una ficha alimenta planificación, wellness, tests y comunicación con jugadores." },
          { icon: Shield, title: "Alertas cruzadas", desc: "Una lesión registrada ajusta automáticamente la sesión del día." },
        ]}
      />
    </>
  );
}
