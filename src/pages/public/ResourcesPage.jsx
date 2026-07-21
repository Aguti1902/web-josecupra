import { useState } from "react";
import { BookOpen, MessageCircle, Phone, Check, Video, FileText, HelpCircle, Mail } from "lucide-react";
import PageHero from "../../components/public/holded/PageHero";
import {
  PageResourceGrid, PageBenefitsGrid, PageMiniFaq, PageStepsSection,
} from "../../components/public/holded/PageSections";

export default function ResourcesPage() {
  const [enviado, setEnviado] = useState(false);
  const [form, setForm] = useState({ nombre: "", email: "", mensaje: "" });

  return (
    <>
      <PageHero
        variant="split"
        theme="accent"
        badge="Recursos · Academy"
        title="Aprende, explora y contacta"
        description="Documentación, guías metodológicas, webinars y soporte directo para sacar el máximo partido a DEPRO — ya seas entrenador, coordinador o jugador."
        bullets={["Guías paso a paso", "Artículos de metodología", "Webinars en vivo", "Soporte en español <24h"]}
        primaryCta={{ label: "Ir a contacto", to: "/recursos#contacto" }}
        secondaryCta={{ label: "Probar DEPRO", to: "/comprar" }}
        visual={
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: BookOpen, label: "Academy", val: "12 guías" },
              { icon: MessageCircle, label: "Blog", val: "24 artículos" },
              { icon: Video, label: "Webinars", val: "6 sesiones" },
              { icon: HelpCircle, label: "Soporte", val: "<24h" },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
                <Icon size={24} className="text-holded-blue-light mx-auto mb-2" />
                <p className="text-xs font-bold text-white/60 uppercase">{label}</p>
                <p className="text-lg font-black text-white mt-1">{val}</p>
              </div>
            ))}
          </div>
        }
      />

      <PageResourceGrid
        dark={false}
        label="Academy"
        title="Guías para empezar"
        items={[
          { tag: "Entrenador", title: "Primer microciclo en 10 minutos", desc: "Wizard, plantilla y generación de sesiones A/B/C paso a paso.", href: "#" },
          { tag: "Club", title: "Onboarding de academia completa", desc: "Equipos, staff, códigos de jugador y panel coordinador.", href: "#" },
          { tag: "Carga", title: "Implementar RPE con tu plantilla", desc: "Cómo conseguir adherencia del 85% en dos semanas.", href: "#" },
          { tag: "Tests", title: "Batería T1→T2→T3", desc: "Qué tests hacer, cuándo y cómo interpretar ratings.", href: "#" },
          { tag: "Jugador", title: "Tu plan personal DEPRO Player", desc: "Perfil, objetivos, feedback y ranking explicados.", href: "#" },
          { tag: "IA", title: "Cómo funciona la IA de DEPRO", desc: "Motores de reglas, no caja negra — metodología transparente.", href: "#" },
        ]}
      />

      <PageResourceGrid
        dark
        label="Blog"
        title="Metodología y buenas prácticas"
        items={[
          { tag: "Periodización", title: "Mesociclos en categorías base", desc: "Progresión semanal adaptada a edades 8–16 años.", href: "#" },
          { tag: "Prevención", title: "ACWR y prevención de lesiones", desc: "Umbrales B2/B3 y cuándo actuar como entrenador.", href: "#" },
          { tag: "Tests", title: "Yo-Yo IR1: interpretación por posición", desc: "Referencias por categoría y cómo usar percentiles.", href: "#" },
          { tag: "Club", title: "Estandarizar el departamento físico", desc: "Coherencia metodológica entre 5+ equipos de academia.", href: "#" },
        ]}
      />

      <PageStepsSection
        dark={false}
        label="Webinars"
        title="Sesiones en vivo con el equipo DEPRO"
        description="Próximas sesiones gratuitas — regístrate y te avisamos."
        steps={[
          { title: "Planificación IA en vivo", desc: "Demo completa: de cero a mesociclo en 20 minutos con Q&A al final." },
          { title: "Control de carga práctico", desc: "Implementación de RPE y wellness con plantilla real de categoría juvenil." },
          { title: "DEPRO Club para academias", desc: "Panel coordinador, white-label y KPIs para dirección deportiva." },
        ]}
      />

      <PageBenefitsGrid
        dark
        label="Soporte"
        title="Estamos aquí para ayudarte"
        items={[
          { icon: Mail, title: "Email soporte", desc: "soporte@depro.es — respuesta en menos de 24 horas laborables." },
          { icon: MessageCircle, title: "Chat en app", desc: "Disponible en planes Pro y superiores desde tu panel." },
          { icon: Phone, title: "Onboarding club", desc: "Sesión personalizada incluida en planes Profesional y Elite." },
        ]}
      />

      <PageMiniFaq
        dark={false}
        title="Preguntas sobre recursos y soporte"
        items={[
          { q: "¿Las guías son gratuitas?", a: "Sí. Academy y blog son abiertos. Algunos webinars requieren registro gratuito." },
          { q: "¿Hay documentación técnica para integraciones?", a: "La documentación API está disponible para clientes Elite. Contacta con ventas para acceso." },
          { q: "¿Ofrecéis formación presencial?", a: "Para clubs con plan Profesional o Elite podemos organizar sesión presencial bajo presupuesto." },
        ]}
      />

      <section id="contacto" className="py-20 md:py-24 bg-holded-dark border-t border-white/5">
        <div className="max-w-xl mx-auto px-4">
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-holded-blue-light mb-3">Contacto</p>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-2">Escríbenos</h2>
            <p className="text-holded-muted text-sm">Respondemos en menos de 24h laborables. Ventas, soporte y demos de club.</p>
          </div>
          {enviado ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center">
              <Check size={32} className="text-holded-green mx-auto mb-3" />
              <p className="font-bold text-white">Mensaje enviado</p>
              <p className="text-sm text-holded-muted mt-2">Te responderemos pronto.</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setEnviado(true); }} className="space-y-3">
              <input required placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-holded-blue" />
              <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-holded-blue" />
              <textarea required rows={4} placeholder="Tu mensaje — ventas, soporte, demo club..." value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-holded-blue resize-none" />
              <button type="submit" className="w-full py-3.5 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-100 flex items-center justify-center gap-2">
                <FileText size={16} /> Enviar mensaje
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
