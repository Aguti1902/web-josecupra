import { Link, Navigate } from "react-router-dom";
import {
  ArrowRight, Calendar, Activity, BarChart3, Users, Zap, Brain, FileText,
  Clock, Target, TrendingUp, Shield, User, Building2, Trophy, MessageCircle,
  Dumbbell, Palette, Globe, Smartphone, WifiOff, RefreshCw,
} from "lucide-react";
import PageHero from "../../components/public/holded/PageHero";
import { HoldedFeatureSection } from "../../components/public/holded/HoldedMockups";
import {
  PageBenefitsGrid, PageStepsSection, PageCompareSection, PageMiniFaq,
} from "../../components/public/holded/PageSections";
import { FootballStorySection } from "../../components/public/holded/HoldedHomeSections";
import {
  SessionsMockup, LoadMockup, TestsMockup, ClubOverviewMockup,
  PlayerPlanMockup, DashboardMockup,
} from "../../components/public/LandingMockups";
import { FEATURE_PAGES, PRODUCT_SLUGS, OTHER_SLUGS } from "../../data/featurePagesMeta";

const ICON_MAP = {
  Calendar, Activity, BarChart3, Users, Zap, Brain, FileText, Clock, Target,
  TrendingUp, Shield, User, Building2, Trophy, MessageCircle, Dumbbell,
  Palette, Globe, Smartphone, WifiOff, RefreshCw,
};

const MOCKUP_MAP = {
  sessions: <SessionsMockup />,
  load: <LoadMockup />,
  tests: <TestsMockup />,
  club: <ClubOverviewMockup />,
  player: <PlayerPlanMockup />,
  dashboard: <DashboardMockup />,
};

function resolveFeature(slug) {
  const raw = FEATURE_PAGES[slug];
  if (!raw) return null;
  const mockup = MOCKUP_MAP[raw.mockupKey] || <SessionsMockup />;
  return {
    ...raw,
    mockup,
    benefits: raw.benefits.map((b) => ({ ...b, icon: ICON_MAP[b.icon] || Zap })),
    hero: {
      ...raw.hero,
      visual: raw.hero.visual !== undefined ? raw.hero.visual : mockup,
    },
  };
}

function FeatureCard({ slug, f }) {
  return (
    <Link
      to={`/funcionalidades/${slug}`}
      className="rounded-2xl border border-gray-200 p-6 hover:border-holded-blue hover:shadow-lg transition-all group bg-gray-50"
    >
      {f.badge && (
        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded mb-2 inline-block ${f.badge === "NUEVO" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
          {f.badge}
        </span>
      )}
      <p className="text-xs font-bold text-holded-blue uppercase mb-2">{f.label}</p>
      <h3 className="font-black text-gray-900 mb-2 group-hover:text-holded-blue transition-colors leading-snug">{f.title}</h3>
      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{f.desc}</p>
      <span className="text-sm font-bold text-gray-400 group-hover:text-holded-blue inline-flex items-center gap-1">
        Explorar <ArrowRight size={14} />
      </span>
    </Link>
  );
}

export default function FeaturesPage({ slug }) {
  const feature = slug ? resolveFeature(slug) : null;

  if (slug && !feature) {
    return <Navigate to="/funcionalidades" replace />;
  }

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

  const productCount = PRODUCT_SLUGS.length;
  const otherCount = OTHER_SLUGS.length;

  const topProducts = PRODUCT_SLUGS.slice(0, 4);

  return (
    <>
      <PageHero
        variant="split"
        theme="accent"
        badge="Plataforma DEPRO"
        title="Todas las funcionalidades en un solo lugar"
        description={`${productCount} productos core y ${otherCount} módulos complementarios — conectados para entrenadores, clubs y jugadores.`}
        bullets={["Datos compartidos entre módulos", "IA explicable y editable", "Export PDF e informes", "PWA con modo offline"]}
        primaryCta={{ label: "Probar gratis", to: "/comprar" }}
        secondaryCta={{ label: "Ver precios", to: "/precios" }}
        visual={
          <div className="grid grid-cols-2 gap-3">
            {topProducts.map((key) => (
              <Link
                key={key}
                to={`/funcionalidades/${key}`}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:border-holded-blue/40 hover:bg-white/10 transition-all group"
              >
                <p className="text-[10px] font-bold uppercase text-holded-blue-light mb-1">{FEATURE_PAGES[key].label}</p>
                <p className="text-sm font-black text-white group-hover:text-holded-blue-light transition-colors leading-snug line-clamp-2">
                  {FEATURE_PAGES[key].title}
                </p>
              </Link>
            ))}
          </div>
        }
      />
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-holded-blue mb-3">Productos</p>
            <h2 className="text-3xl font-black text-gray-900 mb-4">Módulos principales</h2>
            <p className="text-gray-500">Planificación, carga, tests, plantilla y productos DEPRO Coach y Club.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-16">
            {PRODUCT_SLUGS.map((key) => (
              <FeatureCard key={key} slug={key} f={FEATURE_PAGES[key]} />
            ))}
          </div>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-holded-blue mb-3">Otras funcionalidades</p>
            <h2 className="text-3xl font-black text-gray-900 mb-4">Complementos y extras</h2>
            <p className="text-gray-500">IA, ranking, biblioteca, white-label, export PDF y modo offline.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {OTHER_SLUGS.map((key) => (
              <FeatureCard key={key} slug={key} f={FEATURE_PAGES[key]} />
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
