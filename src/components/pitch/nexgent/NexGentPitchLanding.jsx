import { Fragment } from "react";
import {
  ArrowRight, BarChart3, Brain, Building2, Calendar, CheckCircle2,
  ChevronRight, Clock, Shield, Sparkles, Target, TrendingUp, Users, Zap,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { PitchNav, PitchFooter } from "./PitchLayout";
import NexGentFeatureShowcase, { HeroAnimatedDemo } from "./NexGentFeatureDemos";
import NexGentCommissionCalculator from "./NexGentCommissionCalculator";
import { COMPARE_VALUES, COMPARE_CATEGORIES } from "../../../lib/nexgentCompareData";
import {
  PALMEIRAS, DEPRO_ACCENT, DEPRO_LOGO, NEXGENT_LOGO, nexgentUrl,
} from "../../../lib/nexgentConfig";

const ACCENT = DEPRO_ACCENT;
const CLUB_ACCENT = PALMEIRAS.accent;

const ADVANTAGE_ICONS = [Brain, Zap, Shield, BarChart3, Target, Sparkles];
const WORKFLOW_ICONS = [Calendar, Target, TrendingUp, BarChart3];
const ROADMAP_COLORS = ["#6366F1", "#0A36F7", "#006437", "#F59E0B", "#8B5CF6", "#22C55E"];

function CompareCell({ value, t }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-50">
        <CheckCircle2 size={18} className="text-green-500" />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-50">
        <X size={14} className="text-gray-300" />
      </span>
    );
  }
  const label = value === "partial" ? t("compare.partial") : value === "addon" ? t("compare.addon") : t("compare.limited");
  return (
    <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
      {label}
    </span>
  );
}

function ExternalCta({ href, className, style, children }) {
  if (!href) return null;
  return <a href={href} className={className} style={style}>{children}</a>;
}

export default function NexGentPitchLanding() {
  const { t } = useTranslation("nexgentPitch");
  const demoUrl = nexgentUrl("/app/inicio");
  const slidesUrl = nexgentUrl("/presentacion");
  const compareRows = t("compare.rows", { returnObjects: true });
  const compareCategories = t("compare.categories", { returnObjects: true });
  const advantages = t("advantages.items", { returnObjects: true });
  const workflowSteps = t("workflow.steps", { returnObjects: true });
  const roadmapPhases = t("roadmap.phases", { returnObjects: true });
  const moduleGroups = t("modules.groups", { returnObjects: true });

  let lastCategory = null;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <PitchNav />

      <section id="overview" className="pt-28 pb-16 md:pt-32 md:pb-24 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <img src={NEXGENT_LOGO} alt="NexGent" className="h-14 md:h-16 object-contain" />
                <span className="text-gray-300 text-xl">×</span>
                <img src={DEPRO_LOGO} alt="DEPRO" className="h-10 md:h-12 object-contain" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: ACCENT }}>{t("hero.eyebrow")}</p>
              <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-black tracking-tight leading-[1.05] text-gray-900 mb-6">{t("hero.title")}</h1>
              <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-xl">{t("hero.desc")}</p>
              <div className="flex flex-wrap gap-3 mb-10">
                <ExternalCta href={demoUrl} className="inline-flex items-center gap-2 text-white font-bold px-6 py-3.5 rounded-lg transition-colors hover:opacity-90" style={{ backgroundColor: ACCENT }}>
                  {t("hero.ctaDemo")} <ArrowRight size={18} />
                </ExternalCta>
                <a href="#plataforma" className="inline-flex items-center gap-2 border border-gray-300 hover:border-gray-400 text-gray-800 font-bold px-6 py-3.5 rounded-lg transition-colors">
                  {t("hero.ctaExplore")}
                </a>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
                {[
                  { v: "20+", l: t("hero.statModules") },
                  { v: "IA", l: t("hero.statAi") },
                  { v: "100%", l: t("hero.statWhitelabel") },
                ].map((s) => (
                  <div key={s.l}>
                    <div className="text-2xl font-black text-gray-900">{s.v}</div>
                    <div className="text-xs text-gray-500 font-medium">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <HeroAnimatedDemo />
          </div>
        </div>
      </section>

      <section id="alianza" className="py-16 border-b border-gray-100 bg-depro-blue-light/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{t("alliance.eyebrow")}</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">{t("alliance.title")}</h2>
            <p className="text-gray-600 leading-relaxed">{t("alliance.desc")}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <img src={NEXGENT_LOGO} alt="NexGent" className="h-14 mb-4 object-contain" />
              <h3 className="font-black text-lg mb-2">{t("alliance.nexgentTitle")}</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                {t("alliance.nexgentBullets", { returnObjects: true }).map((item) => (
                  <li key={item} className="flex gap-2"><CheckCircle2 size={14} className="text-green-500 flex-shrink-0 mt-0.5" /> {item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <img src={DEPRO_LOGO} alt="DEPRO" className="h-12 mb-4 object-contain" />
              <h3 className="font-black text-lg mb-2">{t("alliance.deproTitle")}</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                {t("alliance.deproBullets", { returnObjects: true }).map((item) => (
                  <li key={item} className="flex gap-2"><CheckCircle2 size={14} className="text-green-500 flex-shrink-0 mt-0.5" /> {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="palmeiras" className="py-20 bg-gray-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{t("palmeiras.eyebrow")}</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">{t("palmeiras.title", { club: PALMEIRAS.shortName })}</h2>
            <p className="text-gray-600 leading-relaxed">{t("palmeiras.desc")}</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <img src={PALMEIRAS.logo} alt={PALMEIRAS.shortName} className="w-14 h-14 rounded-xl border border-gray-200 bg-white p-1.5 object-contain" />
                <div>
                  <h3 className="text-xl font-black">{PALMEIRAS.name}</h3>
                  <p className="text-sm text-gray-500">{PALMEIRAS.city} · {PALMEIRAS.category}</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {[
                  { icon: Users, label: t("palmeiras.players"), value: String(PALMEIRAS.players) },
                  { icon: Building2, label: t("palmeiras.teams"), value: String(PALMEIRAS.teams) },
                  { icon: Calendar, label: t("palmeiras.training"), value: PALMEIRAS.trainingDays },
                  { icon: Target, label: t("palmeiras.staff"), value: t("palmeiras.staffValue", { count: PALMEIRAS.coaches }) },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 rounded-xl bg-gray-50 border border-gray-100 p-4">
                    <item.icon size={18} className="flex-shrink-0" style={{ color: CLUB_ACCENT }} />
                    <div>
                      <div className="text-xs text-gray-400 font-semibold">{item.label}</div>
                      <div className="font-bold text-gray-900">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
              <ExternalCta href={demoUrl} className="inline-flex items-center gap-2 font-bold text-sm px-5 py-2.5 rounded-lg text-white transition-opacity hover:opacity-90" style={{ backgroundColor: CLUB_ACCENT }}>
                {t("palmeiras.openDashboard")} <ChevronRight size={16} />
              </ExternalCta>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="text-xs font-bold text-gray-400 uppercase mb-3">{t("palmeiras.snapshot")}</div>
                <div className="font-black text-gray-900 mb-1">Estêvão · ED · #10</div>
                <div className="text-xs text-gray-500 mb-4">{t("palmeiras.playerPlan")}</div>
                <div className="space-y-2 text-xs">
                  {[
                    { t: "Resistencia T3", v: "8.4", r: "+9% vs media" },
                    { t: "Sprint 30m", v: "3.92s", r: "Top 3 plantilla" },
                    { t: "Carga GPS", v: "2.665 AU", r: "Óptima" },
                  ].map((m) => (
                    <div key={m.t} className="flex justify-between gap-2 py-2 border-b border-gray-50 last:border-0">
                      <span className="text-gray-500">{m.t}</span>
                      <span className="font-bold text-gray-800 text-right">{m.v}<br /><span className="text-green-600 font-semibold">{m.r}</span></span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
                <div className="text-xs font-bold text-green-700 uppercase mb-2">Resultado dirección</div>
                <p className="text-sm text-green-900 leading-relaxed">&quot;{t("palmeiras.directorQuote")}&quot;</p>
                <p className="text-xs text-green-700 mt-2 font-semibold">{t("palmeiras.directorRole")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="plataforma" className="py-20 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{t("platform.eyebrow")}</p>
            <h2 className="text-3xl md:text-4xl font-black mb-4">{t("platform.title")}</h2>
            <p className="text-gray-600 leading-relaxed">{t("platform.desc")}</p>
          </div>
          <NexGentFeatureShowcase />

          {Array.isArray(moduleGroups) && (
            <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {moduleGroups.map((group) => (
                <div key={group.title} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-3">{group.title}</h4>
                  <ul className="space-y-1.5">
                    {group.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs text-gray-700">
                        <CheckCircle2 size={12} className="text-green-500 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="ventajas" className="py-20 bg-gray-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{t("advantages.eyebrow")}</p>
            <h2 className="text-3xl md:text-4xl font-black mb-4">{t("advantages.title")}</h2>
            <p className="text-gray-600 leading-relaxed">{t("advantages.desc")}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(advantages) && advantages.map(({ title, desc }, i) => {
              const Icon = ADVANTAGE_ICONS[i] ?? Sparkles;
              return (
                <div key={title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${ACCENT}15` }}>
                    <Icon size={22} style={{ color: ACCENT }} />
                  </div>
                  <h3 className="font-black text-lg mb-2">{title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="roadmap" className="py-20 border-b border-gray-100 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{t("roadmap.eyebrow")}</p>
            <h2 className="text-3xl md:text-4xl font-black mb-4">{t("roadmap.title")}</h2>
            <p className="text-gray-600 leading-relaxed">{t("roadmap.desc")}</p>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute left-[19px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-indigo-200 via-blue-200 to-green-200" />
            <div className="space-y-5">
              {Array.isArray(roadmapPhases) && roadmapPhases.map((phase, i) => (
                <div key={phase.phase} className="relative flex gap-6 lg:gap-8">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-black z-10 shadow-md ring-4 ring-white" style={{ backgroundColor: ROADMAP_COLORS[i] }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="text-xs font-black uppercase tracking-wider" style={{ color: ROADMAP_COLORS[i] }}>{phase.phase}</span>
                      <span className="text-xs text-gray-400 font-semibold">{phase.period}</span>
                      {phase.duration && <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{phase.duration}</span>}
                    </div>
                    <h3 className="font-black text-lg text-gray-900 mb-1">{phase.title}</h3>
                    {phase.subtitle && <p className="text-sm text-gray-500 mb-3">{phase.subtitle}</p>}
                    <ul className="grid sm:grid-cols-2 gap-2">
                      {phase.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5" style={{ color: ROADMAP_COLORS[i] }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="comparativa" className="py-20 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{t("compare.eyebrow")}</p>
            <h2 className="text-3xl md:text-4xl font-black mb-4">{t("compare.title")}</h2>
            <p className="text-gray-600 leading-relaxed">{t("compare.desc")}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-lg bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-4 font-bold text-gray-700 bg-gray-50 sticky left-0 z-10 min-w-[220px]">{t("compare.capability")}</th>
                    <th className="p-4 font-black text-center min-w-[130px]" style={{ color: ACCENT, background: "linear-gradient(180deg, #eff6ff, #dbeafe)" }}>
                      {t("compare.us")}
                    </th>
                    <th className="p-4 font-bold text-center text-gray-500 bg-gray-50 min-w-[110px]">{t("compare.sheets")}</th>
                    <th className="p-4 font-bold text-center text-gray-500 bg-gray-50 min-w-[110px]">{t("compare.generic")}</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(compareRows) && compareRows.map((label, i) => {
                    const cat = COMPARE_CATEGORIES[i];
                    const showCatHeader = cat !== lastCategory;
                    if (showCatHeader) lastCategory = cat;
                    const catLabel = compareCategories?.[cat];
                    return (
                      <Fragment key={label}>
                        {showCatHeader && catLabel && (
                          <tr className="bg-gray-900">
                            <td colSpan={4} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-300">
                              {catLabel}
                            </td>
                          </tr>
                        )}
                        <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/80 transition-colors">
                          <td className="p-4 text-gray-700 font-medium bg-white sticky left-0 z-10 border-r border-gray-50">{label}</td>
                          <td className="p-4 text-center" style={{ backgroundColor: "#eff6ff40" }}>
                            <CompareCell value={COMPARE_VALUES[i]?.depro} t={t} />
                          </td>
                          <td className="p-4 text-center"><CompareCell value={COMPARE_VALUES[i]?.sheets} t={t} /></td>
                          <td className="p-4 text-center"><CompareCell value={COMPARE_VALUES[i]?.generic} t={t} /></td>
                        </tr>
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section id="comisiones" className="py-20 bg-gray-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{t("commission.eyebrow")}</p>
            <h2 className="text-3xl md:text-4xl font-black mb-4">{t("commission.sectionTitle")}</h2>
            <p className="text-gray-600 leading-relaxed">{t("commission.sectionDesc")}</p>
          </div>
          <NexGentCommissionCalculator />
        </div>
      </section>

      <section className="py-20 bg-gray-900 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-green-400 mb-3">{t("workflow.eyebrow")}</p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">{t("workflow.title")}</h2>
            <p className="text-gray-400 leading-relaxed">{t("workflow.desc")}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.isArray(workflowSteps) && workflowSteps.map(({ title, desc }, i) => {
              const Icon = WORKFLOW_ICONS[i] ?? Calendar;
              return (
                <div key={title} className="rounded-xl border border-gray-700 bg-gray-800/50 p-5">
                  <div className="text-xs font-black text-green-400 mb-2">{String(i + 1).padStart(2, "0")}</div>
                  <Icon size={24} className="text-white mb-3" />
                  <h3 className="font-bold text-white mb-2">{title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {(slidesUrl || demoUrl) && (
        <section className="py-20 md:py-28">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">{t("cta.title")}</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-10">{t("cta.desc")}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <ExternalCta href={slidesUrl} className="inline-flex items-center gap-2 w-full sm:w-auto justify-center border-2 border-gray-900 text-gray-900 font-black px-8 py-4 rounded-xl hover:bg-gray-900 hover:text-white transition-colors">
                {t("cta.slides")} <ArrowRight size={20} />
              </ExternalCta>
              <ExternalCta href={demoUrl} className="inline-flex items-center gap-2 w-full sm:w-auto justify-center text-white font-black px-8 py-4 rounded-xl shadow-depro hover:opacity-90 transition-opacity" style={{ backgroundColor: ACCENT }}>
                {t("cta.demo")} <ArrowRight size={20} />
              </ExternalCta>
            </div>
            <p className="text-xs text-gray-400 mt-8 flex items-center justify-center gap-2">
              <Clock size={14} /> {t("cta.footnote")}
            </p>
          </div>
        </section>
      )}

      <PitchFooter />
    </div>
  );
}
