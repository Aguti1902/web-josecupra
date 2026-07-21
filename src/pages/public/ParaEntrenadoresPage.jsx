import {
  Calendar, Activity, BarChart3, FileText, Clock, Brain,
} from "lucide-react";
import PageHero from "../../components/public/holded/PageHero";
import { HoldedFeatureSection } from "../../components/public/holded/HoldedMockups";
import {
  PageBenefitsGrid, PageStepsSection, PageCompareSection,
  PageMiniFaq,
} from "../../components/public/holded/PageSections";
import { FootballStorySection } from "../../components/public/holded/HoldedHomeSections";
import { SessionsMockup, LoadMockup } from "../../components/public/LandingMockups";

export default function ParaEntrenadoresPage() {
  return (
    <>
      <PageHero
        variant="split"
        theme="dark"
        badge="DEPRO Coach · Entrenador individual"
        title="Tu asistente de planificación personal"
        description="Microciclos IA, sesiones A/B/C, plantilla, control de carga y tests en un solo producto. Diseñado para entrenadores que quieren resultados, no hojas de cálculo."
        bullets={["Wizard de alta en 5 minutos", "Sesión del día automática", "Control de carga B2/B3", "Export PDF profesional"]}
        stats={[{ val: "40h", label: "Ahorradas al mes" }, { val: "160×", label: "Más rápido planificando" }]}
        primaryCta={{ label: "Probar DEPRO Coach", to: "/comprar?audience=coach" }}
        secondaryCta={{ label: "Ver funcionalidades", to: "/funcionalidades" }}
        visual={<SessionsMockup />}
      />
      <HoldedFeatureSection
        reverse
        dark={false}
        label="Panel entrenador"
        title="Todo tu departamento físico en un panel"
        desc="Desde el dashboard ves la sesión del día, alertas de carga, tests pendientes y estado de la plantilla."
        bullets={["Dashboard con sesión del día", "Alertas de sobrecarga", "Tests T1→T3 programables", "Biblioteca de ejercicios editable"]}
        mockup={<SessionsMockup />}
        ctaLink="/funcionalidades/planificacion"
        ctaText="Explorar planificación"
      />
      <PageBenefitsGrid
        dark
        label="Ventajas"
        title="Por qué entrenadores eligen DEPRO Coach"
        description="Más tiempo en el campo, menos en el ordenador."
        items={[
          { icon: Calendar, title: "Planificación automática", desc: "Mesociclos y sesiones A/B/C generados según categoría, fase y material." },
          { icon: Activity, title: "Control de carga", desc: "RPE y wellness con alertas B2/B3 antes de que aparezca la lesión." },
          { icon: BarChart3, title: "Tests físicos", desc: "Batería T1→T3 con ratings y evolución por jugador." },
          { icon: FileText, title: "Export PDF", desc: "Sesiones listas para imprimir o compartir con tu staff." },
          { icon: Clock, title: "Setup en 5 min", desc: "Wizard guiado: categoría, días, material y listo." },
          { icon: Brain, title: "IA explicable", desc: "Motores de reglas validados — sabes por qué se propone cada sesión." },
        ]}
      />
      <HoldedFeatureSection
        label="Control de carga"
        title="Monitoriza a tu plantilla sin complicaciones"
        desc="Los jugadores registran RPE en segundos. Tú ves semáforos, tendencias y alertas automáticas."
        bullets={["RPE post-sesión por jugador", "Wellness diario opcional", "Semáforo de plantilla", "Histórico de temporada"]}
        mockup={<LoadMockup />}
        ctaLink="/funcionalidades/cargas"
        ctaText="Ver control de carga"
      />
      <PageStepsSection
        dark={false}
        label="Primeros pasos"
        title="De registro a microciclo en tres pasos"
        steps={[
          { title: "Regístrate y configura", desc: "Indica categoría, días de entrenamiento, fase de temporada y material disponible." },
          { title: "Añade tu plantilla", desc: "Alta manual o comparte un enlace. Posición, lesiones y datos físicos por jugador." },
          { title: "Genera y entrena", desc: "DEPRO crea tu mesociclo. Marca sesiones completadas y ajusta sobre la marcha." },
        ]}
      />
      <PageCompareSection
        dark
        label="Comparativa"
        title="DEPRO Coach vs métodos tradicionales"
        rows={[
          { label: "Planificación semanal", before: "4–6 horas", after: "15 minutos" },
          { label: "Control de carga", before: "WhatsApp / sensaciones", after: "RPE + alertas automáticas" },
          { label: "Tests físicos", before: "Excel disperso", after: "Panel con ratings T1→T3" },
          { label: "Comunicación jugadores", before: "Grupos de chat", after: "Panel integrado" },
        ]}
      />
      <FootballStorySection
        dark={false}
        label="Resultados"
        title="Más tiempo en el césped, menos en Excel"
        desc="Entrenadores de categorías base y semi-profesional reportan hasta 40 horas mensuales ahorradas en planificación y seguimiento administrativo."
        bullets={["Sesiones listas cada lunes", "Alertas antes de lesiones", "Informes para dirección"]}
      />
      <PageMiniFaq
        dark={false}
        items={[
          { q: "¿Necesito conocimientos de periodización?", a: "No. DEPRO aplica metodología validada automáticamente. Puedes editar todo si prefieres control total." },
          { q: "¿Funciona solo o con club?", a: "DEPRO Coach es independiente. Si tu club contrata DEPRO Club, compartís plantilla y datos." },
          { q: "¿Hay app móvil?", a: "DEPRO es web responsive — funciona en móvil, tablet y ordenador sin instalar nada." },
        ]}
      />
    </>
  );
}
