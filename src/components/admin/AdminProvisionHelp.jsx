import { Link } from "react-router-dom";
import { Building2, Dumbbell, User, ChevronRight } from "lucide-react";

const ITEMS = [
  {
    id: "club",
    to: "/admin/clubs?alta=club",
    icon: Building2,
    title: "Nuevo club",
    desc: "Club completo + coordinador + plan personalizado",
    activeClass: "border-depro-blue bg-blue-50/80 ring-1 ring-depro-blue/20",
    iconClass: "bg-depro-blue text-white",
  },
  {
    id: "coach",
    to: "/admin/users?alta=coach",
    icon: Dumbbell,
    title: "DEPRO Coach",
    desc: "Entrenador individual (sin club tradicional)",
    activeClass: "border-emerald-500 bg-emerald-50/80 ring-1 ring-emerald-500/20",
    iconClass: "bg-emerald-600 text-white",
  },
  {
    id: "player",
    to: "/admin/users?alta=player",
    icon: User,
    title: "Nuevo jugador",
    desc: "Jugador individual con plan y acceso manual",
    activeClass: "border-violet-500 bg-violet-50/80 ring-1 ring-violet-500/20",
    iconClass: "bg-violet-600 text-white",
  },
];

/** Guía rápida: dónde crear cada tipo de cuenta desde el admin */
export default function AdminProvisionHelp({ current }) {
  return (
    <div className="rounded-2xl border border-depro-border bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-4 md:p-5">
      <p className="text-xs font-bold uppercase tracking-widest text-depro-gray mb-1">
        Alta manual · ¿Qué quieres crear?
      </p>
      <p className="text-sm text-depro-gray mb-4">
        Elige el tipo de cuenta. Cada una se provisiona con plan y acceso sin pasar por Stripe.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {ITEMS.map(({ id, to, icon: Icon, title, desc, activeClass, iconClass }) => {
          const active = current === id;
          return (
            <Link
              key={id}
              to={to}
              className={`group flex items-start gap-3 p-4 rounded-xl border transition-all ${
                active
                  ? activeClass
                  : "border-depro-border bg-white hover:border-depro-blue/40 hover:shadow-md"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}>
                <Icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-depro-dark text-sm flex items-center gap-1">
                  {title}
                  {active && (
                    <span className="text-[10px] font-bold uppercase text-depro-blue bg-depro-blue/10 px-1.5 py-0.5 rounded">
                      Aquí
                    </span>
                  )}
                </p>
                <p className="text-xs text-depro-gray mt-0.5 leading-relaxed">{desc}</p>
              </div>
              {!active && (
                <ChevronRight size={16} className="text-depro-gray/40 group-hover:text-depro-blue shrink-0 mt-1" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
