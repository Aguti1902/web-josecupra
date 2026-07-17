import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { HoldedHero } from "../../components/public/holded/HoldedShell";
import { HoldedFeatureSection } from "../../components/public/holded/HoldedMockups";
import { SessionsMockup, LoadMockup, TestsMockup } from "../../components/public/LandingMockups";

const FEATURES = {
  planificacion: {
    label: "Planificación",
    title: "Microciclos y mesociclos automáticos",
    desc: "La IA genera sesiones A/B/C según categoría, fase competitiva y material disponible.",
    bullets: ["Mesociclos editables", "Distribución semanal automática", "Protocolos A/B/C", "Biblioteca 90+ ejercicios"],
    mockup: <SessionsMockup />,
  },
  cargas: {
    label: "Control de carga",
    title: "Monitoriza RPE y wellness en tiempo real",
    desc: "Detecta sobrecargas antes de que se conviertan en lesiones.",
    bullets: ["RPE por sesión", "Sueño, fatiga, ánimo", "Alertas automáticas", "Histórico por jugador"],
    mockup: <LoadMockup />,
  },
  tests: {
    label: "Tests físicos",
    title: "Evaluación y seguimiento T1→T3",
    desc: "Batería completa con ratings y evolución por jugador.",
    bullets: ["Sprint y salto", "Resistencia Yo-Yo", "Comparativas", "Export dirección deportiva"],
    mockup: <TestsMockup />,
  },
  plantilla: {
    label: "Plantilla",
    title: "Gestión completa de jugadores",
    desc: "Fichas con lesiones, posición, peso y código de acceso al club.",
    bullets: ["Alta manual o por código", "Datos físicos", "Notas privadas", "Multi-equipo"],
    mockup: <SessionsMockup />,
  },
};

export default function FeaturesPage({ slug }) {
  const feature = slug ? FEATURES[slug] : null;

  if (feature) {
    return (
      <>
        <section className="pt-24 pb-12 bg-holded-dark text-center px-4">
          <p className="text-holded-blue-light text-xs font-bold uppercase tracking-widest mb-3">{feature.label}</p>
          <h1 className="text-4xl font-black text-white max-w-2xl mx-auto">{feature.title}</h1>
        </section>
        <HoldedFeatureSection
          dark={false}
          label={feature.label}
          title={feature.title}
          desc={feature.desc}
          bullets={feature.bullets}
          mockup={feature.mockup}
          ctaLink="/comprar"
          ctaText="Probar 15 días gratis"
        />
      </>
    );
  }

  return (
    <>
      <HoldedHero subtitle="Todas las funcionalidades DEPRO" />
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(FEATURES).map(([key, f]) => (
            <Link key={key} to={`/funcionalidades/${key}`} className="rounded-2xl border border-gray-200 p-6 hover:border-holded-blue hover:shadow-lg transition-all group">
              <p className="text-xs font-bold text-holded-blue uppercase mb-2">{f.label}</p>
              <h2 className="font-black text-gray-900 mb-2 group-hover:text-holded-blue transition-colors">{f.title}</h2>
              <span className="text-sm font-bold text-gray-400 group-hover:text-holded-blue inline-flex items-center gap-1">Explorar <ArrowRight size={14} /></span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
