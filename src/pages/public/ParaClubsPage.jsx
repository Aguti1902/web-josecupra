import { Link } from "react-router-dom";
import { ArrowRight, Building2, Shield, Palette } from "lucide-react";
import { HoldedHero } from "../../components/public/holded/HoldedShell";
import { HoldedFeatureSection } from "../../components/public/holded/HoldedMockups";
import { ClubOverviewMockup } from "../../components/public/LandingMockups";

export default function ParaClubsPage() {
  return (
    <>
      <HoldedHero subtitle="DEPRO para clubs y academias" />
      <HoldedFeatureSection
        label="DEPRO Club"
        title="Gestiona todos tus equipos desde un solo panel"
        desc="Coordinadores, entrenadores y jugadores conectados. White-label con tu logo y colores."
        bullets={["Multi-equipo y multi-staff", "Código de club para jugadores", "Panel coordinador", "Periodización por categoría"]}
        mockup={<ClubOverviewMockup />}
        ctaLink="/comprar?audience=club"
        ctaText="Probar DEPRO Club"
      />
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-6">
          {[
            { icon: Building2, title: "Multi-equipo", desc: "Sub-9 a Juvenil en un solo club." },
            { icon: Palette, title: "White-label", desc: "Logo, colores y banner personalizados." },
            { icon: Shield, title: "Coordinador", desc: "Supervisa todos los equipos sin crear nada manual." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-gray-200 p-6">
              <Icon size={24} className="text-holded-blue mb-3" />
              <h3 className="font-black text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/comprar?audience=club" className="inline-flex items-center gap-2 bg-holded-blue text-white font-bold px-8 py-3.5 rounded-full">
            Empezar con mi club <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
