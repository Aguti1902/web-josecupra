import { Link } from "react-router-dom";
import { ArrowRight, Play, Bot, Workflow, Brain, BarChart3, Target, Sparkles } from "lucide-react";
import {
  HoldedHero, HoldedStatsBand, HoldedProductGrid,
} from "../../components/public/holded/HoldedShell";
import {
  HoldedFeatureSection, HoldedStatsMockup, HoldedIntegrationsMockup, HoldedFloatingCardsMockup,
} from "../../components/public/holded/HoldedMockups";
import { AI_ENGINE_SCENES } from "../../components/public/holded/HoldedAIVisuals";
import { SessionsMockup, LoadMockup, TestsMockup } from "../../components/public/LandingMockups";

const AI_ENGINES = [
  {
    id: "coach",
    icon: Workflow,
    name: "Motor DEPRO Coach",
    desc: "Microciclos deterministas por categoría, fase y material disponible.",
    tag: "Planificación",
  },
  {
    id: "player",
    icon: Brain,
    name: "Plan engine jugador",
    desc: "Planes adaptativos según posición, lesiones y feedback del jugador.",
    tag: "Personalización",
  },
  {
    id: "load",
    icon: BarChart3,
    name: "Clasificador de carga",
    desc: "RPE + wellness con alertas automáticas de sobrecarga.",
    tag: "Monitorización",
  },
  {
    id: "period",
    icon: Target,
    name: "Periodización",
    desc: "Mesociclos con progresión semanal y descarga automática.",
    tag: "Temporada",
  },
];

function AISection() {
  return (
    <section id="ia" className="py-20 md:py-28 bg-holded-dark relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgba(37,99,235,0.15),transparent)]" aria-hidden="true" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-flex items-center gap-2 bg-holded-blue/15 border border-holded-blue/25 text-holded-blue-light text-xs font-bold px-4 py-1.5 rounded-full mb-5">
            <Bot size={14} /> Inteligencia artificial deportiva
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">IA que entiende el deporte</h2>
          <p className="text-holded-muted leading-relaxed">
            Motores de reglas validados — no caja negra. Cada sesión es trazable, editable y sustituible por el entrenador.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4 lg:gap-5">
          {AI_ENGINES.map(({ id, icon: Icon, name, desc, tag }) => {
            const Scene = AI_ENGINE_SCENES[id];
            return (
              <div
                key={id}
                className="group relative rounded-2xl border border-white/8 bg-holded-card/60 p-6 hover:border-holded-blue/35 hover:bg-holded-card transition-all overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-holded-blue/5 rounded-full blur-2xl group-hover:bg-holded-blue/10 transition-colors" aria-hidden="true" />
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-holded-blue/20 flex items-center justify-center shrink-0">
                      <Icon size={20} className="text-holded-blue-light" strokeWidth={2} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-holded-muted">{tag}</span>
                      <h3 className="font-black text-white text-lg leading-tight">{name}</h3>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-holded-muted leading-relaxed mb-4">{desc}</p>
                <Scene />
                <p className="text-[10px] text-holded-muted/60 mt-3 flex items-center gap-1">
                  <Sparkles size={10} className="opacity-60" /> Pasa el ratón para ver la simulación
                </p>
              </div>
            );
          })}
        </div>
        <div className="mt-10 rounded-2xl border border-white/8 bg-white/5 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <div className="w-14 h-14 rounded-2xl bg-holded-green/15 border border-holded-green/25 flex items-center justify-center shrink-0">
            <Sparkles size={26} className="text-holded-green" />
          </div>
          <div className="flex-1">
            <h3 className="font-black text-white text-lg mb-1">Validada por entrenadores, no por marketing</h3>
            <p className="text-sm text-holded-muted leading-relaxed">
              Cada recomendación de la IA sigue protocolos deportivos reales. Puedes editar, sustituir o duplicar cualquier sesión en segundos.
            </p>
          </div>
          <Link
            to="/funcionalidades#ia"
            className="inline-flex items-center gap-2 text-sm font-bold text-holded-blue-light hover:text-white transition-colors shrink-0"
          >
            Ver motores IA <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function VideoSection() {
  return (
    <section className="py-20 bg-holded-dark border-t border-white/5">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-black text-white mb-4">Mira DEPRO en acción</h2>
        <p className="text-holded-muted mb-8">De cero a microciclo completo en 3 minutos.</p>
        <div className="aspect-video rounded-2xl border border-white/10 bg-white/5 flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-full bg-holded-blue/20 flex items-center justify-center">
            <Play size={28} className="text-holded-blue-light ml-1" />
          </div>
          <p className="font-bold text-white/80">Vídeo explicativo próximamente</p>
        </div>
      </div>
    </section>
  );
}

function OpportunitySection() {
  return (
    <section className="py-20 md:py-28 bg-holded-dark border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4 max-w-2xl mx-auto">
          De la planificación a la sesión en el campo
        </h2>
        <p className="text-holded-muted max-w-xl mx-auto mb-10">
          Todo conectado: mesociclo → microciclo → sesión del día → feedback del jugador → ajuste automático.
        </p>
        <Link to="/comprar" className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-8 py-3.5 rounded-full hover:bg-gray-100">
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
      <HoldedStatsBand />
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
