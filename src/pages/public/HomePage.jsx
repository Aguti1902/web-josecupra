import { Link } from "react-router-dom";
import { ArrowRight, Play, Bot, Cpu, Workflow, Brain, BarChart3, Target } from "lucide-react";
import {
  HoldedHero, HoldedPlatformBand, HoldedProductGrid,
} from "../../components/public/holded/HoldedShell";
import {
  HoldedFeatureSection, HoldedStatsMockup, HoldedIntegrationsMockup, HoldedFloatingCardsMockup,
} from "../../components/public/holded/HoldedMockups";
import { SessionsMockup, LoadMockup, TestsMockup } from "../../components/public/LandingMockups";

function LightStatsBand() {
  const stats = [
    { val: "3", label: "Perfiles en uno" },
    { val: "90+", label: "Ejercicios en biblioteca" },
    { val: "15", label: "Días de prueba gratis" },
    { val: "100%", label: "Planificación automática" },
  ];
  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <p className="text-center text-sm text-gray-500 mb-8 font-medium">
          Entrenadores, clubs y jugadores ya optimizan su rendimiento con DEPRO
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl md:text-4xl font-black text-holded-blue">{s.val}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AISection() {
  const engines = [
    { icon: Workflow, name: "Motor DEPRO Coach", desc: "Microciclos deterministas por categoría y material." },
    { icon: Brain, name: "Plan engine jugador", desc: "Planes adaptativos según posición, lesiones y feedback." },
    { icon: BarChart3, name: "Clasificador de carga", desc: "RPE + wellness con alertas automáticas." },
    { icon: Target, name: "Periodización", desc: "Mesociclos con progresión semanal automática." },
  ];
  return (
    <section id="ia" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 bg-blue-50 text-holded-blue text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <Bot size={14} /> Inteligencia artificial deportiva
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">IA que entiende el deporte</h2>
          <p className="text-gray-500">Motores de reglas validados. Cada sesión es trazable, editable y sustituible.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {engines.map(({ icon: Icon, name, desc }) => (
            <div key={name} className="rounded-2xl border border-gray-200 p-6 hover:border-holded-blue/30 hover:shadow-lg transition-all bg-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Icon size={20} className="text-holded-blue" />
                </div>
                <h3 className="font-black text-gray-900">{name}</h3>
              </div>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-2xl bg-gray-50 border border-gray-200 p-6 flex items-center gap-4">
          <Cpu size={36} className="text-holded-blue shrink-0" />
          <p className="text-sm text-gray-600">
            React + Supabase · Stripe · Motores propios · Offline-first · Integración GPS en Premium.
          </p>
        </div>
      </div>
    </section>
  );
}

function VideoSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-black text-gray-900 mb-4">Mira DEPRO en acción</h2>
        <p className="text-gray-500 mb-8">De cero a microciclo completo en 3 minutos.</p>
        <div className="aspect-video rounded-2xl border-2 border-dashed border-gray-300 bg-white flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
            <Play size={28} className="text-holded-blue ml-1" />
          </div>
          <p className="font-bold text-gray-700">Vídeo explicativo próximamente</p>
        </div>
      </div>
    </section>
  );
}

function OpportunitySection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 max-w-2xl mx-auto">
          De la planificación a la sesión en el campo
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto mb-10">
          Todo conectado: mesociclo → microciclo → sesión del día → feedback del jugador → ajuste automático.
        </p>
        <Link to="/comprar" className="inline-flex items-center gap-2 bg-gray-900 text-white font-bold px-8 py-3.5 rounded-full hover:bg-gray-800">
          Empezar gratis <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <HoldedHero />
      <LightStatsBand />
      <HoldedPlatformBand />
      <HoldedFeatureSection
        label="Planificación"
        title="DEPRO elimina el estrés de la planificación semanal"
        desc="Genera microciclos completos con sesiones A/B/C adaptadas a categoría, fase y material. Edita, sustituye y duplica en segundos."
        bullets={["Microciclos y mesociclos automáticos", "Sesiones A/B/C validadas", "Modo DEPRO o Personalizado", "90+ ejercicios en biblioteca"]}
        mockup={<SessionsMockup />}
        ctaLink="/funcionalidades/planificacion"
        ctaText="Explorar planificación"
      />
      <HoldedFeatureSection
        reverse
        dark={false}
        label="Analítica"
        title="Un compañero en tu viaje de rendimiento"
        desc="Informes en tiempo real de adherencia, carga y tests. Tu staff siempre con datos actualizados."
        bullets={["Adherencia por jugador y equipo", "Informes en tiempo real", "Export para dirección deportiva", "Histórico completo de temporada"]}
        mockup={<HoldedStatsMockup />}
        ctaLink="/funcionalidades/cargas"
        ctaText="Explorar analítica"
      />
      <HoldedFeatureSection
        label="Control de carga"
        title="Visibilidad total de tu flujo de entrenamiento"
        desc="Monitoriza RPE, wellness y alertas. Concilia la carga planificada con la ejecutada."
        bullets={["Conciliación carga planificada vs real", "Previsión de sobrecarga", "Alertas automáticas", "Dashboard por categoría"]}
        mockup={<HoldedIntegrationsMockup />}
        ctaLink="/funcionalidades/cargas"
      />
      <HoldedFeatureSection
        reverse
        dark={false}
        label="Tests físicos"
        title="De la evaluación al seguimiento longitudinal"
        desc="Batería T1→T3 con ratings, tendencias y comparativas por jugador."
        bullets={["Sprint, salto, Yo-Yo y más", "Seguimiento T1 → T2 → T3", "Ratings automáticos", "Evolución por temporada"]}
        mockup={<TestsMockup />}
        ctaLink="/funcionalidades/tests"
      />
      <HoldedFeatureSection
        label="Sesiones"
        title="Facturación y mucho más — adaptado al deporte"
        desc="Cada sesión generada es editable, exportable y compartible con tu plantilla al instante."
        bullets={["Sesiones flotantes editables", "Export PDF", "Compartir con jugadores", "Historial completo"]}
        mockup={<HoldedFloatingCardsMockup />}
        ctaLink="/funcionalidades/planificacion"
      />
      <HoldedProductGrid />
      <AISection />
      <VideoSection />
      <OpportunitySection />
    </>
  );
}
