import {
  Building2, Shield, Palette, Users, BarChart3, Globe,
} from "lucide-react";
import PageHero from "../../components/public/holded/PageHero";
import { HoldedFeatureSection } from "../../components/public/holded/HoldedMockups";
import {
  PageBenefitsGrid, PageStepsSection, PageCompareSection,
  PageMiniFaq, PageCtaBanner,
} from "../../components/public/holded/PageSections";
import { FootballStorySection } from "../../components/public/holded/HoldedHomeSections";
import { ClubOverviewMockup, LoadMockup } from "../../components/public/LandingMockups";

export default function ParaClubsPage() {
  return (
    <>
      <PageHero
        variant="centered"
        theme="accent"
        badge="DEPRO Club · Academias y clubs"
        title="Gestiona todos tus equipos desde un solo panel"
        description="Coordinadores, entrenadores y jugadores conectados. White-label con tu logo, periodización por categoría y KPIs para la dirección deportiva."
        bullets={["Multi-equipo y multi-staff", "Código de club para jugadores", "Panel coordinador centralizado", "White-label con tu marca"]}
        stats={[
          { val: "∞", label: "Equipos por club" },
          { val: "100%", label: "Datos centralizados" },
          { val: "24/7", label: "Acceso en la nube" },
        ]}
        primaryCta={{ label: "Probar DEPRO Club", to: "/comprar?audience=club" }}
        secondaryCta={{ label: "Solicitar demo", to: "/recursos#contacto" }}
      />
      <HoldedFeatureSection
        label="Panel coordinador"
        title="Visibilidad total sin microgestión"
        desc="El coordinador ve cargas, tests y planificación de todos los equipos sin crear sesiones manualmente."
        bullets={["Dashboard multi-equipo", "Alertas de carga global", "KPIs de departamento físico", "Informes para junta directiva"]}
        mockup={<ClubOverviewMockup />}
        ctaLink="/comprar?audience=club"
        ctaText="Empezar con mi club"
      />
      <PageBenefitsGrid
        dark={false}
        label="Para academias"
        title="Todo lo que un club necesita"
        items={[
          { icon: Building2, title: "Multi-equipo", desc: "Prebenjamín a Juvenil en un solo club. Cada entrenador con su panel, el coordinador con vista global." },
          { icon: Palette, title: "White-label", desc: "Logo, colores corporativos y banner personalizados. Tus jugadores ven tu marca, no la nuestra." },
          { icon: Shield, title: "Roles y permisos", desc: "Coordinador, entrenador y staff con accesos diferenciados. Notas privadas solo para autorizados." },
          { icon: Users, title: "Código de club", desc: "Jugadores se registran solos. Sin carga administrativa para el cuerpo técnico." },
          { icon: BarChart3, title: "KPIs dirección", desc: "Informes mensuales de carga, tests y disponibilidad del plantel para la junta." },
          { icon: Globe, title: "Multi-sede", desc: "Varias instalaciones o categorías bajo la misma licencia club." },
        ]}
      />
      <HoldedFeatureSection
        reverse
        dark
        label="Monitorización global"
        title="Control de carga en todos los equipos"
        desc="Detecta equipos o jugadores en zona de riesgo antes de que impacte en resultados o lesiones."
        bullets={["Semáforo por equipo", "Alertas B2/B3 centralizadas", "Comparativa entre categorías", "Export para departamento médico"]}
        mockup={<LoadMockup />}
        ctaLink="/funcionalidades/cargas"
        ctaText="Ver control de carga"
      />
      <PageStepsSection
        dark={false}
        label="Implementación"
        title="Tu club operativo en una semana"
        steps={[
          { title: "Alta del club", desc: "Registro, logo, colores y creación de equipos por categoría. Invita a entrenadores por email." },
          { title: "Onboarding equipos", desc: "Cada entrenador configura su plantilla. Jugadores se unen con código de club." },
          { title: "Operación continua", desc: "Planificación, carga y tests fluyen al panel coordinador. Informes mensuales automáticos." },
        ]}
      />
      <PageCompareSection
        dark
        label="Antes y después"
        title="DEPRO Club vs gestión manual"
        rows={[
          { label: "Visibilidad multi-equipo", before: "WhatsApp + Excel", after: "Panel centralizado" },
          { label: "Coherencia metodológica", before: "Cada entrenador a su manera", after: "Protocolos estandarizados" },
          { label: "Alta de jugadores", before: "Formularios en papel", after: "Código self-service" },
          { label: "Informes dirección", before: "Inexistentes", after: "PDF mensual automático" },
        ]}
      />
      <FootballStorySection
        dark={false}
        label="Academias"
        title="Metodología unificada, identidad propia"
        desc="Academias que estandarizan su departamento físico mejoran resultados deportivos y reducen lesiones evitables — con la imagen de marca del club en cada pantalla."
        bullets={["White-label completo", "Coordinación entre equipos", "Datos para decisiones"]}
      />
      <PageMiniFaq
        dark={false}
        items={[
          { q: "¿Cuántos entrenadores incluye?", a: "Depende del plan: Inicial 2 staff, Profesional 5, Elite ilimitado. Se amplían con add-ons." },
          { q: "¿Podemos migrar datos existentes?", a: "Sí. Importamos plantillas desde Excel en el onboarding. Contacta con soporte para casos complejos." },
          { q: "¿Hay API para integraciones?", a: "Disponible en plan Elite para conectar con ERP, apps de scouting o plataformas médicas." },
        ]}
      />
      <PageCtaBanner
        dark
        title="Digitaliza tu academia con DEPRO Club"
        description="Prueba 15 días gratis. Configura equipos, invita staff y genera tu primer informe en días."
        ctaLabel="Empezar con mi club"
        ctaTo="/comprar?audience=club"
        secondaryLabel="Ver precios club"
        secondaryTo="/precios"
      />
    </>
  );
}
