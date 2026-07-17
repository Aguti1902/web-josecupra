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
} from "../../components/public/holded/HoldedHomeSections";
import { SessionsMockup, TestsMockup } from "../../components/public/LandingMockups";

export default function HomePage() {
  return (
    <>
      <HoldedDarkHeroBlock>
        <HoldedHero />
        <HoldedStatsBand />
      </HoldedDarkHeroBlock>

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
        label="Tests físicos"
        title="De la evaluación al seguimiento longitudinal"
        desc="Batería T1→T3 con ratings, tendencias y comparativas por jugador."
        bullets={["Sprint, salto, Yo-Yo y más", "Seguimiento T1 → T2 → T3", "Ratings automáticos", "Evolución por temporada"]}
        mockup={<TestsMockup />}
        ctaLink="/funcionalidades/tests"
      />
      <HoldedFeatureSection
        label="Sesiones"
        title="Sesiones editables y compartibles al instante"
        desc="Cada sesión generada es editable, exportable y compartible con tu plantilla."
        bullets={["Sesiones flotantes editables", "Export PDF", "Compartir con jugadores", "Historial completo"]}
        mockup={<HoldedFloatingCardsMockup />}
        ctaLink="/funcionalidades/planificacion"
      />

      <ExtraToolsSection />
      <HoldedProductGrid />
      <PricingTeaserSection />
      <WhyDeproSection />
      <HowItWorksSection />
      <RolesSection />
      <AISection />
      <ImpactStatsSection />
      <TestimonialsSection />
      <VideoSection />
      <FAQSection />
    </>
  );
}
