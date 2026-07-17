import { HoldedHero } from "../../components/public/holded/HoldedShell";
import { HoldedFeatureSection } from "../../components/public/holded/HoldedMockups";
import { SessionsMockup } from "../../components/public/LandingMockups";

export default function ParaEntrenadoresPage() {
  return (
    <>
      <HoldedHero subtitle="DEPRO Coach · Entrenador individual" />
      <HoldedFeatureSection
        reverse
        dark={false}
        label="DEPRO Coach"
        title="Tu asistente de planificación personal"
        desc="Microciclos IA, sesiones A/B/C, plantilla y tests en un solo producto."
        bullets={["Wizard de alta en 5 minutos", "Sesión del día automática", "Control de carga B2/B3", "Export PDF"]}
        mockup={<SessionsMockup />}
        ctaLink="/comprar?audience=coach"
        ctaText="Probar DEPRO Coach"
      />
    </>
  );
}
