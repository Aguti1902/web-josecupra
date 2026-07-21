import {
  Users, Smartphone, Target, TrendingUp, MessageCircle, Trophy, Zap, Heart,
} from "lucide-react";
import PageHero from "../../components/public/holded/PageHero";
import { HoldedFeatureSection } from "../../components/public/holded/HoldedMockups";
import {
  PageBenefitsGrid, PageStepsSection, PageMiniFaq,
} from "../../components/public/holded/PageSections";
import { FootballStorySection } from "../../components/public/holded/HoldedHomeSections";
import { PlayerPlanMockup } from "../../components/public/LandingMockups";

export default function ParaJugadoresPage() {
  return (
    <>
      <PageHero
        variant="split"
        theme="dark"
        badge="DEPRO Player · Plan personal"
        title="Tu preparación física adaptada a ti"
        description="Plan mensual IA según posición, nivel, lesiones y objetivos. Feedback al entrenador, tests con ratings y ranking del equipo incluidos."
        bullets={["Plan adaptativo semanal", "Tests con ratings por posición", "Feedback directo al entrenador", "Ranking motivacional del equipo"]}
        primaryCta={{ label: "Probar DEPRO Player", to: "/comprar?audience=player" }}
        secondaryCta={{ label: "Tengo código de club", to: "/login" }}
        visual={<PlayerPlanMockup />}
      />
      <HoldedFeatureSection
        dark={false}
        label="Plan personalizado"
        title="IA que conoce tu posición y objetivos"
        desc="No es un PDF genérico — DEPRO Player genera sesiones según tu posición, pierna dominante, historial de lesiones y feedback semanal."
        bullets={["Sesiones por posición", "Ajuste semanal automático", "Ejercicios de prevención", "Progresión visible"]}
        mockup={<PlayerPlanMockup />}
        ctaLink="/comprar?audience=player"
        ctaText="Obtener mi plan"
      />
      <PageBenefitsGrid
        dark={false}
        label="Tu panel"
        title="Todo lo que incluye DEPRO Player"
        items={[
          { icon: Target, title: "Plan por posición", desc: "Delantero, medio, defensa o portero — cargas y ejercicios específicos para tu rol." },
          { icon: TrendingUp, title: "Tests y ratings", desc: "Evalúa tu condición física y compárate con percentiles de tu categoría." },
          { icon: MessageCircle, title: "Feedback al coach", desc: "Comunica sensaciones, molestias o motivación directamente a tu entrenador." },
          { icon: Trophy, title: "Ranking del equipo", desc: "Competición sana: adherencia, tests y progresión visible para motivarte." },
          { icon: Smartphone, title: "Desde el móvil", desc: "Consulta tu sesión del día, registra RPE y completa wellness en segundos." },
          { icon: Heart, title: "Prevención de lesiones", desc: "Ejercicios de activación y prevención integrados según tu historial." },
        ]}
      />
      <section className="py-20 bg-holded-dark border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Users size={36} className="text-holded-blue-light mx-auto mb-5" />
          <h2 className="text-2xl md:text-3xl font-black text-white mb-4">¿Tu club usa DEPRO?</h2>
          <p className="text-holded-muted max-w-lg mx-auto mb-6 leading-relaxed">
            Pide el código a tu entrenador y regístrate con un <strong className="text-white">15% de descuento</strong> en tu plan.
            Además, compartirás datos de carga y tests con el cuerpo técnico automáticamente.
          </p>
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white text-sm font-bold px-5 py-2.5 rounded-full">
            <Zap size={16} className="text-holded-green" /> Código club · −15% en tu suscripción
          </div>
        </div>
      </section>
      <PageStepsSection
        dark={false}
        label="Cómo empezar"
        title="Tu plan en tres pasos"
        steps={[
          { title: "Regístrate", desc: "Con email o Google. Si tienes código de club, introdúcelo al registrarte." },
          { title: "Completa tu perfil", desc: "Posición, objetivos, lesiones previas y días disponibles para entrenar." },
          { title: "Entrena y mejora", desc: "Recibe tu plan semanal, registra RPE y sigue tu progresión en el ranking." },
        ]}
      />
      <FootballStorySection
        dark
        label="DEPRO Player"
        title="Preparación física profesional, accesible"
        desc="Lo que antes solo tenían jugadores de elite — planificación individual, seguimiento y feedback — ahora en tu bolsillo."
        bullets={["Plan IA semanal", "Tests con percentiles", "Conexión con tu entrenador"]}
      />
      <PageMiniFaq
        dark={false}
        items={[
          { q: "¿Necesito un entrenador para usar DEPRO Player?", a: "No. Puedes usarlo de forma independiente. Si tu club usa DEPRO, conectas con tu entrenador automáticamente." },
          { q: "¿Qué incluye el descuento de club?", a: "15% en tu suscripción mensual al registrarte con el código que te da tu entrenador o club." },
          { q: "¿Puedo cancelar cuando quiera?", a: "Sí. Sin permanencia. Cancela desde tu perfil en cualquier momento." },
        ]}
      />
    </>
  );
}
