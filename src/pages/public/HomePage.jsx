import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight, Check, Sparkles, Users, User, Building2,
  Activity, BarChart3, Calendar, Shield, Zap, Gift, ChevronRight, Clock, TrendingUp,
} from "lucide-react";

/** Mockup animado del microciclo IA — sustituye a un gif real con CSS puro */
function AnimatedPlanMockup() {
  const bars = [62, 88, 45, 95, 70, 38, 55];
  return (
    <div className="relative w-full max-w-sm mx-auto lg:mx-0">
      <div className="absolute -inset-4 bg-depro-blue/10 rounded-[2rem] blur-2xl" aria-hidden="true" />
      <div className="relative bg-white rounded-2xl border border-depro-border shadow-xl p-5 depro-float">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-depro-blue flex items-center justify-center">
              <Sparkles size={13} className="text-white" />
            </div>
            <span className="text-xs font-bold text-depro-dark">Microciclo IA · Semana 12</span>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 depro-pulse-dot" /> Live
          </span>
        </div>
        <div className="flex items-end gap-1.5 h-20 mb-4">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 bg-depro-blue-light rounded-t-md overflow-hidden flex items-end">
              <div
                className="w-full bg-gradient-to-t from-depro-blue to-depro-blue-dark rounded-t-md depro-grow-bar"
                style={{ "--bar-h": `${h}%`, animationDelay: `${i * 0.12}s` }}
              />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {[
            { label: "Sesión A · Activación", done: true },
            { label: "Sesión B · Fuerza-velocidad", done: true },
            { label: "Sesión C · Descarga", done: false },
          ].map((s, i) => (
            <div key={s.label} className="flex items-center gap-2.5 text-xs depro-fade-in" style={{ animationDelay: `${0.3 + i * 0.25}s` }}>
              <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${s.done ? "bg-depro-blue" : "border-2 border-depro-border"}`}>
                {s.done && <Check size={9} className="text-white" />}
              </div>
              <span className={s.done ? "text-depro-gray line-through" : "text-depro-dark font-medium"}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const { t } = useTranslation();
  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 bg-white border-b border-depro-border overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f5f5f5_1px,transparent_1px),linear-gradient(to_bottom,#f5f5f5_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_40%,transparent_100%)] pointer-events-none" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_auto] gap-12 items-center">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-depro-yellow/15 text-depro-dark text-xs font-bold px-3.5 py-1.5 rounded-full mb-5 border border-depro-yellow/40">
              <Gift size={13} className="text-amber-600" />
              {t("home.hero_trial_badge")}
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest text-depro-blue mb-5">
              {t("home.hero_label")}
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-depro-dark tracking-tight leading-[1.05] mb-6">
              {t("home.hero_title")}
            </h1>
            <p className="text-lg md:text-xl text-depro-gray leading-relaxed max-w-2xl mb-10">
              {t("home.hero_subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <a href="#precios" className="btn-primary inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm">
                {t("home.hero_cta_primary")} <ArrowRight size={16} />
              </a>
              <a href="#producto" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-depro-dark border border-depro-border rounded-xl hover:bg-depro-gray-light transition-colors">
                {t("home.hero_cta_secondary")}
              </a>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-depro-gray mb-12">
              <Clock size={12} /> {t("home.hero_trial_note")}
            </p>
            <div className="flex flex-wrap gap-8 text-sm">
              {[
                { val: "100%", key: "hero_stat_ai" },
                { val: "3", key: "hero_stat_profiles" },
                { val: "24/7", key: "hero_stat_access" },
              ].map((s) => (
                <div key={s.key}>
                  <div className="text-2xl font-black text-depro-dark">{s.val}</div>
                  <div className="text-depro-gray">{t(`home.${s.key}`)}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden lg:block">
            <AnimatedPlanMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Mini-mockup animado dentro de cada tarjeta de feature — refuerzo visual sin gifs pesados */
function FeatureMockup({ variant, accentClass }) {
  if (variant === "load") {
    return (
      <div className="flex items-end gap-1 h-8 mt-1">
        {[40, 70, 55, 90, 65].map((h, i) => (
          <div key={i} className="flex-1 bg-depro-blue-light rounded-sm overflow-hidden flex items-end">
            <div className={`w-full rounded-sm depro-grow-bar ${accentClass}`} style={{ "--bar-h": `${h}%`, animationDelay: `${i * 0.1}s` }} />
          </div>
        ))}
      </div>
    );
  }
  if (variant === "pulse") {
    return (
      <div className="flex items-center gap-1.5 mt-1">
        <span className="w-2 h-2 rounded-full bg-depro-blue depro-pulse-dot" />
        <span className="w-2 h-2 rounded-full bg-depro-blue depro-pulse-dot" style={{ animationDelay: "0.3s" }} />
        <span className="w-2 h-2 rounded-full bg-depro-blue depro-pulse-dot" style={{ animationDelay: "0.6s" }} />
      </div>
    );
  }
  return (
    <div className="w-full h-1.5 bg-depro-blue-light rounded-full overflow-hidden mt-1">
      <div className="h-full bg-depro-blue rounded-full depro-fill-bar" />
    </div>
  );
}

function Producto() {
  const { t } = useTranslation();
  const icons = [Sparkles, Activity, BarChart3, Calendar, Shield, Zap];
  const mockups = ["fill", "fill", "load", "pulse", "fill", "pulse"];
  const features = t("home.product_features", { returnObjects: true });

  return (
    <section id="producto" className="py-20 md:py-28 bg-depro-gray-light">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-depro-blue mb-3">{t("home.product_label")}</p>
          <h2 className="text-3xl md:text-4xl font-black text-depro-dark tracking-tight mb-4">{t("home.product_title")}</h2>
          <p className="text-depro-gray leading-relaxed">{t("home.product_desc")}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = icons[i] || Sparkles;
            return (
              <div key={f.title} className="bg-white rounded-2xl border border-depro-border p-6 hover:border-depro-blue/30 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-depro-blue-light flex items-center justify-center mb-4">
                  <Icon size={20} className="text-depro-blue" />
                </div>
                <h3 className="font-bold text-depro-dark mb-2">{f.title}</h3>
                <p className="text-sm text-depro-gray leading-relaxed">{f.desc}</p>
                <FeatureMockup variant={mockups[i] || "fill"} accentClass="bg-gradient-to-t from-depro-blue to-depro-blue-dark" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PricingCard({ plan, audience, highlighted }) {
  const { t } = useTranslation();
  const features = plan.features || [];

  return (
    <div className={`relative flex flex-col rounded-2xl border bg-white p-6 md:p-8 h-full transition-shadow ${highlighted ? "border-depro-blue shadow-lg ring-1 ring-depro-blue/20" : "border-depro-border hover:shadow-md"}`}>
      {plan.badge && (
        <span className="absolute -top-3 left-6 bg-depro-blue text-white text-[10px] font-bold uppercase tracking-wide px-3 py-1 rounded-full">
          {plan.badge}
        </span>
      )}
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-depro-gray mb-2">{plan.name}</p>
        <div className="flex items-end gap-1 mb-2">
          <span className="text-4xl font-black text-depro-dark leading-none">{plan.price}</span>
          <span className="text-depro-gray text-sm mb-1">{t("home.price_period")}</span>
        </div>
        <p className="text-sm text-depro-gray">{plan.subtext}</p>
      </div>
      <ul className="space-y-3 flex-1 mb-8">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-depro-gray">
            <Check size={15} className="text-depro-blue mt-0.5 flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      <Link
        to={plan.ctaLink || `/comprar?audience=${audience}&plan=${plan.id}`}
        className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${highlighted ? "bg-depro-blue hover:bg-depro-blue-dark text-white" : "border border-depro-border text-depro-dark hover:bg-depro-gray-light"}`}
      >
        {plan.cta || t("home.plan_cta")} <ChevronRight size={15} />
      </Link>
      <p className="text-center text-[11px] text-depro-gray mt-2.5">{t("home.plan_trial_hint")}</p>
    </div>
  );
}

function Precios() {
  const { t } = useTranslation();
  const [audience, setAudience] = useState("coach");

  const plans = t(`home.pricing_${audience}`, { returnObjects: true });
  const planList = Array.isArray(plans) ? plans : [];

  const tabs = [
    { id: "coach", icon: User, label: t("home.tab_coach") },
    { id: "club", icon: Building2, label: t("home.tab_club") },
    { id: "player", icon: Users, label: t("home.tab_player") },
  ];

  return (
    <section id="precios" className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-depro-blue mb-3">{t("home.pricing_label")}</p>
          <h2 className="text-3xl md:text-4xl font-black text-depro-dark tracking-tight mb-4">{t("home.pricing_title")}</h2>
          <p className="text-depro-gray leading-relaxed mb-4">{t("home.pricing_desc")}</p>
          <div className="inline-flex items-center gap-2 bg-depro-yellow/15 border border-depro-yellow/40 text-depro-dark text-sm font-bold px-4 py-2 rounded-full">
            <Gift size={15} className="text-amber-600" /> {t("home.pricing_trial_badge")}
          </div>
        </div>

        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1 rounded-xl bg-depro-gray-light border border-depro-border">
            {tabs.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setAudience(id)}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${audience === id ? "bg-white text-depro-dark shadow-sm" : "text-depro-gray hover:text-depro-dark"}`}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-depro-gray mb-8 max-w-xl mx-auto">
          {t(`home.pricing_${audience}_desc`)}
        </p>

        <div className={`grid gap-6 ${planList.length === 2 ? "md:grid-cols-2 max-w-3xl mx-auto" : "md:grid-cols-3"}`}>
          {planList.map((plan, i) => (
            <PricingCard key={plan.id} plan={plan} audience={audience} highlighted={plan.highlighted || i === 1} />
          ))}
        </div>

        <p className="text-center text-xs text-depro-gray mt-8">{t("home.pricing_footnote")}</p>
      </div>
    </section>
  );
}

function Referidos() {
  const { t } = useTranslation();
  const steps = t("home.referral_steps", { returnObjects: true });

  return (
    <section id="referidos" className="py-20 md:py-28 bg-depro-dark text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-depro-yellow text-xs font-bold uppercase tracking-widest mb-4">
              <Gift size={14} /> {t("home.referral_label")}
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">{t("home.referral_title")}</h2>
            <p className="text-white/70 leading-relaxed mb-8">{t("home.referral_desc")}</p>
            <a href="#contacto" className="inline-flex items-center gap-2 bg-white text-depro-dark font-bold px-6 py-3 rounded-xl text-sm hover:bg-white/90 transition-colors">
              {t("home.referral_cta")} <ArrowRight size={16} />
            </a>
          </div>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div key={step.title} className="flex gap-4 p-5 rounded-xl bg-white/5 border border-white/10">
                <div className="w-8 h-8 rounded-lg bg-depro-blue flex items-center justify-center text-sm font-black flex-shrink-0">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-bold mb-1">{step.title}</h3>
                  <p className="text-sm text-white/60">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ComoFunciona() {
  const { t } = useTranslation();
  const steps = t("home.process_steps", { returnObjects: true });

  return (
    <section id="como-funciona" className="py-20 md:py-28 bg-depro-gray-light">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-depro-blue mb-3">{t("home.process_label")}</p>
          <h2 className="text-3xl md:text-4xl font-black text-depro-dark tracking-tight">{t("home.process_title")}</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={s.title} className="relative">
              <div className="text-xs font-bold text-depro-blue mb-3">0{i + 1}</div>
              <h3 className="font-bold text-depro-dark mb-2">{s.title}</h3>
              <p className="text-sm text-depro-gray leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SobreDepro() {
  const { t } = useTranslation();
  return (
    <section id="sobre" className="py-20 md:py-28 bg-white border-t border-depro-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-depro-blue mb-3">{t("home.about_label")}</p>
            <h2 className="text-3xl md:text-4xl font-black text-depro-dark tracking-tight mb-4">{t("home.about_title")}</h2>
            <p className="text-depro-gray leading-relaxed mb-4">{t("home.about_desc_1")}</p>
            <p className="text-depro-gray leading-relaxed">{t("home.about_desc_2")}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {(t("home.about_stats", { returnObjects: true }) || []).map((s) => (
              <div key={s.label} className="rounded-2xl border border-depro-border p-5 bg-depro-gray-light/50">
                <div className="text-2xl font-black text-depro-blue mb-1">{s.value}</div>
                <div className="text-sm text-depro-gray">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Contacto() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ nombre: "", email: "", tipo: "", mensaje: "", clubCode: "" });
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e) => { e.preventDefault(); setEnviado(true); };

  return (
    <section id="contacto" className="py-20 md:py-28 bg-depro-gray-light">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-depro-dark mb-3">{t("home.contact_title")}</h2>
          <p className="text-depro-gray">{t("home.contact_subtitle")}</p>
        </div>
        {enviado ? (
          <div className="bg-white border border-depro-border rounded-2xl p-10 text-center">
            <div className="w-12 h-12 bg-depro-blue rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={24} className="text-white" />
            </div>
            <h3 className="font-bold text-depro-dark mb-2">{t("home.contact_sent_title")}</h3>
            <p className="text-sm text-depro-gray">{t("home.contact_sent_desc")}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-depro-border rounded-2xl p-6 md:p-8 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-depro-dark mb-1.5">{t("home.contact_full_name")}</label>
                <input type="text" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="admin-input w-full" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-depro-dark mb-1.5">{t("home.contact_email_label")}</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="admin-input w-full" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-depro-dark mb-1.5">{t("home.contact_iam")}</label>
              <select required value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="admin-input w-full">
                <option value="">{t("home.contact_select")}</option>
                <option value="entrenador">{t("home.contact_opt_coach")}</option>
                <option value="club">{t("home.contact_opt_club")}</option>
                <option value="jugador">{t("home.contact_opt_player")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-depro-dark mb-1.5">{t("home.contact_goal")}</label>
              <textarea required rows={3} value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })} className="admin-input w-full resize-none" placeholder={t("home.contact_goal_placeholder")} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-depro-dark mb-1.5">
                {t("home.contact_club_code_label")} <span className="text-depro-gray font-normal">{t("home.contact_club_code_optional")}</span>
              </label>
              <input type="text" value={form.clubCode} onChange={(e) => setForm({ ...form, clubCode: e.target.value.toUpperCase() })} className="admin-input w-full uppercase tracking-wider" placeholder="DEPRO-CLUB-2026" maxLength={32} />
              <p className="text-xs text-depro-gray mt-1.5">{t("home.contact_club_code_hint")}</p>
            </div>
            <button type="submit" className="btn-primary w-full py-3.5 flex items-center justify-center gap-2">
              {t("home.contact_submit")} <ArrowRight size={16} />
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-white border-t border-depro-border py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <img src="/logo.png" alt="DEPRO" className="h-6 w-auto" />
          <p className="text-sm text-depro-gray">© {new Date().getFullYear()} DEPRO. {t("home.footer_rights")}</p>
          <div className="flex items-center gap-6 text-sm text-depro-gray">
            <a href="#" className="hover:text-depro-dark transition-colors">{t("home.footer_privacy")}</a>
            <a href="#" className="hover:text-depro-dark transition-colors">{t("home.footer_terms")}</a>
            <a href="#contacto" className="hover:text-depro-dark transition-colors">{t("home.footer_contact")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <div className="bg-white">
      <Hero />
      <Producto />
      <Precios />
      <Referidos />
      <ComoFunciona />
      <SobreDepro />
      <Contacto />
      <Footer />
    </div>
  );
}
