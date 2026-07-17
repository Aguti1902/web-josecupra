import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, MessageCircle, Phone, ArrowRight, Check } from "lucide-react";

export default function ResourcesPage() {
  const [enviado, setEnviado] = useState(false);
  const [form, setForm] = useState({ nombre: "", email: "", mensaje: "" });

  return (
    <>
      <section className="pt-28 pb-12 bg-holded-dark text-center px-4">
        <p className="text-holded-blue-light text-xs font-bold uppercase tracking-widest mb-3">Recursos</p>
        <h1 className="text-4xl font-black text-white mb-4">Aprende, explora y contacta</h1>
        <p className="text-holded-muted max-w-lg mx-auto">Documentación, blog y soporte para sacar el máximo partido a DEPRO.</p>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-6">
          {[
            { icon: BookOpen, title: "Academy", desc: "Guías paso a paso para entrenadores y coordinadores.", href: "#" },
            { icon: MessageCircle, title: "Blog", desc: "Periodización, carga y metodología deportiva.", href: "#" },
            { icon: Phone, title: "Webinars", desc: "Sesiones en vivo con el equipo DEPRO.", href: "#demo" },
          ].map(({ icon: Icon, title, desc, href }) => (
            <a key={title} href={href} className="rounded-2xl border border-gray-200 p-6 hover:border-holded-blue hover:shadow-lg transition-all block">
              <Icon size={24} className="text-holded-blue mb-3" />
              <h2 className="font-black text-gray-900 mb-1">{title}</h2>
              <p className="text-sm text-gray-500">{desc}</p>
            </a>
          ))}
        </div>
      </section>

      <section id="demo" className="py-16 bg-gray-50">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-black text-gray-900 mb-2">Reserva una demo</h2>
          <p className="text-gray-500 mb-8 text-sm">Te enseñamos DEPRO en 30 minutos.</p>
          <Link to="/comprar" className="inline-flex items-center gap-2 bg-holded-blue text-white font-bold px-8 py-3.5 rounded-full">
            Reservar demo gratuita <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section id="contacto" className="py-20 bg-holded-dark">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-2xl font-black text-white text-center mb-2">Contacto</h2>
          <p className="text-holded-muted text-center mb-8 text-sm">Respondemos en menos de 24h.</p>
          {enviado ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center">
              <Check size={32} className="text-holded-green mx-auto mb-3" />
              <p className="font-bold text-white">Mensaje enviado</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setEnviado(true); }} className="space-y-3">
              <input required placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-holded-blue" />
              <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-holded-blue" />
              <textarea required rows={4} placeholder="Tu mensaje" value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-holded-blue resize-none" />
              <button type="submit" className="w-full py-3.5 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-100">Enviar</button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
