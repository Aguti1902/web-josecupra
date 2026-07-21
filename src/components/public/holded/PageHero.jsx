import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";

const THEMES = {
  dark: {
    wrap: "bg-holded-dark text-white",
    badge: "bg-holded-blue/20 border-holded-blue/30 text-holded-blue-light",
    title: "text-white",
    desc: "text-holded-muted",
    bullet: "text-holded-muted",
    check: "text-holded-green",
    primary: "bg-white text-gray-900 hover:bg-gray-100",
    secondary: "border border-white/25 text-white hover:bg-white/5",
    statVal: "text-white",
    statLabel: "text-holded-muted",
    glow: (
      <>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(37,99,235,0.25),transparent)]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] -translate-x-1/3 translate-y-1/2" />
      </>
    ),
  },
  light: {
    wrap: "bg-white text-gray-900 border-b border-gray-100",
    badge: "bg-blue-50 border-blue-100 text-holded-blue",
    title: "text-gray-900",
    desc: "text-gray-500",
    bullet: "text-gray-600",
    check: "text-holded-green",
    primary: "bg-gray-900 text-white hover:bg-gray-800",
    secondary: "border border-gray-300 text-gray-900 hover:bg-gray-50",
    statVal: "text-gray-900",
    statLabel: "text-gray-500",
    glow: (
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_80%_0%,rgba(37,99,235,0.08),transparent)]" />
    ),
  },
  accent: {
    wrap: "bg-gradient-to-br from-holded-dark via-[#0f172a] to-indigo-950 text-white",
    badge: "bg-white/10 border-white/20 text-holded-blue-light",
    title: "text-white",
    desc: "text-white/70",
    bullet: "text-white/75",
    check: "text-holded-green",
    primary: "bg-holded-blue text-white hover:bg-holded-blue/90",
    secondary: "border border-white/30 text-white hover:bg-white/10",
    statVal: "text-white",
    statLabel: "text-white/60",
    glow: (
      <>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-holded-blue/20 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[80px]" />
      </>
    ),
  },
};

/**
 * Hero reutilizable para páginas internas — cada página puede elegir variant + theme.
 * variant: centered | split | editorial | compact
 */
export default function PageHero({
  variant = "centered",
  theme = "dark",
  badge,
  title,
  description,
  bullets = [],
  stats = [],
  primaryCta = { label: "Probar gratis", to: "/comprar" },
  secondaryCta,
  visual,
  align = "left",
}) {
  const t = THEMES[theme] || THEMES.dark;
  const isSplit = variant === "split" || variant === "editorial";
  const py = variant === "compact" ? "pt-24 pb-10" : "pt-28 pb-16 md:pb-20";

  return (
    <section className={`relative overflow-hidden ${t.wrap}`}>
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">{t.glow}</div>
      <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 ${py}`}>
        <div className={`${isSplit ? "grid lg:grid-cols-2 gap-12 lg:gap-16 items-center" : ""} ${variant === "centered" ? "text-center max-w-3xl mx-auto" : ""}`}>
          <div className={isSplit && align === "right" ? "lg:order-2" : ""}>
            {badge && (
              <span className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border mb-5 ${t.badge}`}>
                {badge}
              </span>
            )}
            <h1 className={`text-3xl sm:text-4xl md:text-[2.75rem] font-black tracking-tight leading-[1.1] mb-5 ${t.title} ${variant === "centered" ? "mx-auto" : "max-w-xl"}`}>
              {title}
            </h1>
            {description && (
              <p className={`text-base md:text-lg leading-relaxed mb-6 ${t.desc} ${variant === "centered" ? "mx-auto max-w-2xl" : "max-w-lg"}`}>
                {description}
              </p>
            )}
            {bullets.length > 0 && (
              <ul className={`space-y-2.5 mb-8 ${variant === "centered" ? "text-left max-w-md mx-auto" : ""}`}>
                {bullets.map((b) => (
                  <li key={b} className={`flex items-start gap-2.5 text-sm ${t.bullet}`}>
                    <Check size={16} className={`${t.check} mt-0.5 shrink-0`} />
                    {b}
                  </li>
                ))}
              </ul>
            )}
            {stats.length > 0 && (
              <div className={`grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8 ${variant === "centered" ? "max-w-xl mx-auto" : "max-w-lg"}`}>
                {stats.map(({ val, label }) => (
                  <div key={label} className={`rounded-xl border ${theme === "light" ? "border-gray-200 bg-gray-50" : "border-white/10 bg-white/5"} p-4 text-center`}>
                    <p className={`text-2xl font-black tabular-nums ${t.statVal}`}>{val}</p>
                    <p className={`text-[11px] mt-1 leading-snug ${t.statLabel}`}>{label}</p>
                  </div>
                ))}
              </div>
            )}
            <div className={`flex flex-col sm:flex-row gap-3 ${variant === "centered" ? "justify-center" : ""}`}>
              <Link to={primaryCta.to} className={`inline-flex items-center justify-center gap-2 font-bold px-7 py-3.5 rounded-full transition-colors shadow-sm ${t.primary}`}>
                {primaryCta.label} <ArrowRight size={16} />
              </Link>
              {secondaryCta && (
                <Link to={secondaryCta.to} className={`inline-flex items-center justify-center gap-2 font-bold px-7 py-3.5 rounded-full transition-colors ${t.secondary}`}>
                  {secondaryCta.label}
                </Link>
              )}
            </div>
          </div>
          {isSplit && visual && (
            <div className={`${align === "right" ? "lg:order-1" : ""} ${variant === "editorial" ? "relative" : ""}`}>
              {variant === "editorial" && (
                <div className="absolute -inset-4 bg-holded-blue/15 rounded-3xl blur-2xl" aria-hidden="true" />
              )}
              <div className="relative">{visual}</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
