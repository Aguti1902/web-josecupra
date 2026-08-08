import {
  HoldedHero, HoldedStatsBand, HoldedProductGrid,
} from "../../components/public/holded/HoldedShell";
import {
  HoldedFeatureSection, HoldedStatsMockup, HoldedIntegrationsMockup, HoldedFloatingCardsMockup,
} from "../../components/public/holded/HoldedMockups";
import {
  HoldedDarkHeroBlock,
  ExtraToolsSection, PricingTeaserSection, WhyDeproSection,
  HowItWorksSection, RolesSection, AISection,
  ImpactStatsSection, TestimonialsSection, VideoSection, FAQSection,
  FootballStorySection,
} from "../../components/public/holded/HoldedHomeSections";
import { SessionsMockup, TestsMockup } from "../../components/public/LandingMockups";

/** Agrupa secciones del mismo tema y elimina borde superior duplicado */
function SectionBlock({ children, className = "" }) {
  return (
    <div className={`[&>section:first-child]:border-t-0 ${className}`}>
      {children}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <HoldedDarkHeroBlock>
        <HoldedHero />
        <HoldedStatsBand />
      </HoldedDarkHeroBlock>

      {/* Blanco: planificación + analítica */}
      <SectionBlock className="rounded-t-[2.5rem] md:rounded-t-[3rem] -mt-1 relative z-10 overflow-hidden">
        <HoldedFeatureSection
          compact
          dark={false}
          label="Planificación"
          title="DEPRO elimina el estrés de la planificación semanal"
          desc="Genera microciclos completos con sesiones A/B/C adaptadas a categoría, fase y material. Edita, sustituye y duplica en segundos."
          bullets={["Microciclos y mesociclos automáticos", "Sesiones A/B/C validadas", "Modo DEPRO o Personalizado", "180+ ejercicios en biblioteca compartida"]}
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
      </SectionBlock>

      {/* Oscuro: carga + tests + sesiones + herramientas */}
      <SectionBlock>
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
          bullets={["Sprint, salto, agilidad y más", "Seguimiento T1 → T2 → T3", "Ratings automáticos", "Evolución por temporada"]}
          mockup={<TestsMockup />}
          ctaLink="/funcionalidades/tests"
        />
        <HoldedFeatureSection
          label="Sesiones"
          title="Sesiones editables y compartibles al instante"
          desc="Cada sesión generada es editable, exportable y compartible con tu plantilla."
          bullets={["Sesiones flotantes editables", "Export PDF", "Compartir con jugadores", "Histórico completo"]}
          mockup={<HoldedFloatingCardsMockup />}
          ctaLink="/funcionalidades/planificacion"
        />
        <ExtraToolsSection dark />
      </SectionBlock>

      {/* Blanco: productos + precios */}
      <SectionBlock>
        <HoldedProductGrid dark={false} />
        <PricingTeaserSection dark={false} />
      </SectionBlock>

      {/* Oscuro: cómo funciona | blanco: por qué DEPRO */}
      <SectionBlock>
        <WhyDeproSection dark={false} />
        <HowItWorksSection dark />
      </SectionBlock>

      {/* Blanco: perfiles + IA */}
      <SectionBlock>
        <RolesSection dark={false} />
        <AISection dark={false} />
      </SectionBlock>

      {/* Oscuro: impacto + testimonios */}
      <SectionBlock>
        <ImpactStatsSection dark />
        <TestimonialsSection dark />
      </SectionBlock>

      {/* Blanco: vídeo demo */}
      <SectionBlock>
        <VideoSection dark={false} />
      </SectionBlock>

      {/* Oscuro: editorial — placeholder imagen */}
      <FootballStorySection
        dark
        label="En el campo"
        title="Preparación física donde ocurre: en el césped"
        desc="DEPRO conecta lo que planificas en el panel con lo que ejecutas en cada sesión. Microciclos, carga y tests alineados con la realidad de tu categoría."
        bullets={[
          "Sesiones adaptadas a fase y material del club",
          "Control de carga con feedback de los jugadores",
          "Histórico de temporada siempre accesible",
        ]}
        to="/funcionalidades/planificacion"
        ctaText="Explorar planificación"
      />

      {/* Blanco: editorial — placeholder imagen */}
      <FootballStorySection
        dark={false}
        reverse
        label="Tu club"
        title="Staff coordinado, plantilla comprometida"
        desc="Entrenador, coordinador y jugadores en la misma plataforma. Adherencia visible, tests registrados y evolución clara para todo el departamento."
        bullets={[
          "Panel multi-equipo para academias y clubs",
          "Jugadores con plan y ranking en el móvil",
          "Informes listos para dirección deportiva",
        ]}
        to="/para-clubs"
        ctaText="Ver DEPRO Club"
      />

      {/* FAQ ampliado */}
      <SectionBlock>
        <FAQSection dark={false} />
      </SectionBlock>
    </>
  );
}
