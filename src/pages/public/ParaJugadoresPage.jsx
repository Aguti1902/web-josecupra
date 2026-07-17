import { Users } from "lucide-react";
import { HoldedHero } from "../../components/public/holded/HoldedShell";
import { HoldedFeatureSection } from "../../components/public/holded/HoldedMockups";
import { PlayerPlanMockup } from "../../components/public/LandingMockups";

export default function ParaJugadoresPage() {
  return (
    <>
      <HoldedHero subtitle="DEPRO Player · Tu plan personal" />
      <HoldedFeatureSection
        label="DEPRO Player"
        title="Tu preparación física adaptada a ti"
        desc="Plan mensual IA según posición, nivel, lesiones y objetivos. Feedback y ranking incluidos."
        bullets={["Plan adaptativo semanal", "Tests con ratings", "Feedback al entrenador", "Ranking del equipo"]}
        mockup={<PlayerPlanMockup />}
        ctaLink="/comprar?audience=player"
        ctaText="Probar DEPRO Player"
      />
      <section className="py-16 bg-holded-dark text-center px-4">
        <Users size={32} className="text-holded-blue-light mx-auto mb-4" />
        <p className="text-holded-muted max-w-md mx-auto text-sm">
          ¿Tu club usa DEPRO? Pide el código a tu entrenador y obtén un <strong className="text-white">15% de descuento</strong>.
        </p>
      </section>
    </>
  );
}
