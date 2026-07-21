import { Link } from "react-router-dom";
import { useState } from "react";
import { ArrowRight, Check, ChevronDown } from "lucide-react";

function sx(dark) {
  return {
    section: dark ? "py-20 md:py-24 bg-holded-dark border-t border-white/5" : "py-20 md:py-24 bg-white border-t border-gray-100",
    h2: dark ? "text-white" : "text-gray-900",
    body: dark ? "text-holded-muted" : "text-gray-500",
    label: dark ? "text-holded-blue-light" : "text-holded-blue",
    card: dark
      ? "rounded-2xl border border-white/8 bg-holded-card/50 p-6 hover:border-holded-blue/30 transition-all"
      : "rounded-2xl border border-gray-200 bg-gray-50 p-6 hover:border-holded-blue/30 hover:shadow-md transition-all",
    cardTitle: dark ? "text-white" : "text-gray-900",
    iconBox: dark ? "bg-holded-blue/20 text-holded-blue-light" : "bg-holded-blue/10 text-holded-blue",
  };
}

export function PageSectionHeader({ dark = true, label, title, description, centered = true }) {
  const s = sx(dark);
  return (
    <div className={`mb-12 ${centered ? "text-center max-w-2xl mx-auto" : "max-w-xl"}`}>
      {label && <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${s.label}`}>{label}</p>}
      <h2 className={`text-2xl md:text-3xl font-black mb-4 ${s.h2}`}>{title}</h2>
      {description && <p className={`leading-relaxed ${s.body}`}>{description}</p>}
    </div>
  );
}

export function PageBenefitsGrid({ dark = false, label, title, description, items }) {
  const s = sx(dark);
  return (
    <section className={s.section}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <PageSectionHeader dark={dark} label={label} title={title} description={description} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(({ icon: Icon, title: t, desc }) => (
            <div key={t} className={s.card}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${s.iconBox}`}>
                <Icon size={20} />
              </div>
              <h3 className={`font-black mb-2 ${s.cardTitle}`}>{t}</h3>
              <p className={`text-sm leading-relaxed ${s.body}`}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PageStepsSection({ dark = true, label, title, description, steps }) {
  const s = sx(dark);
  return (
    <section className={s.section}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <PageSectionHeader dark={dark} label={label} title={title} description={description} />
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map(({ title: t, desc }, i) => (
            <div key={t} className={s.card}>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${s.label}`}>Paso {i + 1}</span>
              <h3 className={`font-black text-lg mt-2 mb-3 ${s.cardTitle}`}>{t}</h3>
              <p className={`text-sm leading-relaxed ${s.body}`}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PageCompareSection({ dark = false, label, title, rows }) {
  const s = sx(dark);
  return (
    <section className={s.section}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <PageSectionHeader dark={dark} label={label} title={title} />
        <div className={`rounded-2xl border overflow-hidden ${dark ? "border-white/10" : "border-gray-200"}`}>
          {rows.map(({ label: l, before, after }, i) => (
            <div
              key={l}
              className={`grid grid-cols-3 gap-4 px-5 py-4 text-sm ${i > 0 ? (dark ? "border-t border-white/8" : "border-t border-gray-100") : ""} ${dark ? "bg-holded-card/30" : "bg-white"}`}
            >
              <span className={`font-bold ${s.cardTitle}`}>{l}</span>
              <span className={s.body}>{before}</span>
              <span className={`font-semibold ${dark ? "text-holded-green" : "text-emerald-600"}`}>{after}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PageMiniFaq({ dark = false, title = "Preguntas frecuentes", items }) {
  const s = sx(dark);
  const [open, setOpen] = useState(null);
  return (
    <section className={s.section}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <PageSectionHeader dark={dark} label="FAQ" title={title} centered />
        <div className="space-y-3">
          {items.map(({ q, a }, i) => (
            <div key={q} className={`rounded-xl border overflow-hidden ${dark ? "border-white/8 bg-holded-card/40" : "border-gray-200 bg-white"}`}>
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className={`w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-bold ${s.cardTitle} ${dark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}
              >
                {q}
                <ChevronDown size={18} className={`shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && (
                <div className={`px-5 pb-4 text-sm leading-relaxed ${s.body} ${dark ? "border-t border-white/8" : "border-t border-gray-100"}`}>
                  {a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PageCtaBanner({ dark = true, title, description, ctaLabel, ctaTo = "/comprar", secondaryLabel, secondaryTo }) {
  const s = sx(dark);
  return (
    <section className={s.section}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 className={`text-2xl md:text-3xl font-black mb-4 ${s.h2}`}>{title}</h2>
        <p className={`mb-8 max-w-xl mx-auto ${s.body}`}>{description}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to={ctaTo}
            className={`inline-flex items-center justify-center gap-2 font-bold px-8 py-3.5 rounded-full transition-colors ${dark ? "bg-white text-gray-900 hover:bg-gray-100" : "bg-gray-900 text-white hover:bg-gray-800"}`}
          >
            {ctaLabel} <ArrowRight size={16} />
          </Link>
          {secondaryLabel && secondaryTo && (
            <Link
              to={secondaryTo}
              className={`inline-flex items-center justify-center gap-2 font-bold px-8 py-3.5 rounded-full transition-colors ${dark ? "border border-white/25 text-white hover:bg-white/5" : "border border-gray-300 text-gray-900 hover:bg-gray-50"}`}
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export function PageResourceGrid({ dark = false, label, title, items }) {
  const s = sx(dark);
  return (
    <section className={s.section}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <PageSectionHeader dark={dark} label={label} title={title} />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(({ tag, title: t, desc, href = "#" }) => (
            <a key={t} href={href} className={`${s.card} block group`}>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${s.label}`}>{tag}</span>
              <h3 className={`font-black mt-2 mb-2 group-hover:text-holded-blue transition-colors ${s.cardTitle}`}>{t}</h3>
              <p className={`text-sm ${s.body}`}>{desc}</p>
              <span className={`inline-flex items-center gap-1 text-sm font-bold mt-4 ${s.label}`}>
                Leer más <ArrowRight size={14} />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PageCheckList({ dark = true, title, items, ctaLabel, ctaTo }) {
  const s = sx(dark);
  return (
    <section className={s.section}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className={`text-2xl font-black mb-6 text-center ${s.h2}`}>{title}</h2>
        <ul className="space-y-3 mb-8">
          {items.map((item) => (
            <li key={item} className={`flex items-start gap-3 text-sm ${s.body}`}>
              <Check size={18} className="text-holded-green mt-0.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        {ctaLabel && (
          <div className="text-center">
            <Link to={ctaTo || "/comprar"} className={`inline-flex items-center gap-2 font-bold px-7 py-3 rounded-full ${dark ? "bg-white text-gray-900" : "bg-gray-900 text-white"}`}>
              {ctaLabel} <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
