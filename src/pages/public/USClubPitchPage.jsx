import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import {
  ArrowRight, BarChart3, Building2, Calendar, CheckCircle2,
  ChevronRight, Clock, DollarSign, MapPin, Sparkles,
  Mail, Menu, Target, TrendingUp, Users, X,
} from "lucide-react";
import { PlatformHeroQuickTour, PlatformFeatureShowcase } from "../../components/pitch/PlatformDemoFrames";
import { ClubDashboardExplorer } from "../../components/pitch/ClubDashboardExplorer";
import USPitchLanguageSwitcher, { initUSPitchLanguage } from "../../components/pitch/USPitchLanguageSwitcher";

const SETUP_FEE = 15000;
const MONTHLY_FEE = 1500;
const COMMISSION_RATE = 0.1;
const ACCENT = "#0A36F7";
const EXAMPLE_ACCENT = "#0D8F4D";
const NEXGENT_LOGO = "/LOGO NEXGENT.png";

const NAV_IDS = ["overview", "example", "platform", "explorer", "roi", "workflow", "pricing", "partner"];

const EXAMPLE_CLUB = {
  name: "Fundació Cornellà",
  city: "Cornellà de Llobregat, Barcelona",
  teams: 5,
  players: 94,
  coaches: 8,
  trainingDays: "Mon · Wed · Fri",
  category: "U13 – U19",
  logo: "/LOGO CLUBS/CORNELLA.jpeg",
};

const IMPLEMENTED_CLUB_LOGOS = [
  { name: "Fundació Cornellà", src: "/LOGO CLUBS/CORNELLA.jpeg" },
  { name: "Club Partner 2", src: "/LOGO CLUBS/Logo_EBP.png" },
  { name: "Club Partner 3", src: "/LOGO CLUBS/WhatsApp Image 2026-06-17 at 10.45.35.jpeg" },
  { name: "Club Partner 4", src: "/LOGO CLUBS/WhatsApp Image 2026-06-17 at 10.45.54.jpeg" },
];

const COMPARE_ROW_KEYS = [
  { key: "branded", depro: true, sheets: false, generic: false },
  { key: "periodization", depro: true, sheets: "partial", generic: false },
  { key: "tests", depro: true, sheets: false, generic: "addon" },
  { key: "loads", depro: true, sheets: false, generic: false },
  { key: "pdf", depro: true, sheets: false, generic: "limited" },
  { key: "multiTeam", depro: true, sheets: true, generic: "limited" },
];

const FAQ_KEYS = ["size", "training", "monthly", "individual", "data"];

const WORKFLOW_KEYS = ["01", "02", "03", "04"];

const EXAMPLE_WEEK_KEYS = ["monday", "wednesday", "friday", "saturday"];
const EXAMPLE_METRIC_KEYS = ["endurance", "sprint", "load"];

function fmtUSD(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function ImplementedClubsCarousel() {
  const { t } = useTranslation("usPitch");
  const [startIdx, setStartIdx] = useState(0);
  const visibleCount = 3;
  const logos = IMPLEMENTED_CLUB_LOGOS.length ? IMPLEMENTED_CLUB_LOGOS : [];

  useEffect(() => {
    if (logos.length <= visibleCount) return undefined;
    const t = setInterval(() => {
      setStartIdx((i) => (i + 1) % logos.length);
    }, 2300);
    return () => clearInterval(t);
  }, [logos.length]);

  const visible = logos.map((_, i) => logos[(startIdx + i) % logos.length]).slice(0, visibleCount);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{t("carousel.title")}</p>
        <span className="text-xs text-gray-500">{t("carousel.subtitle")}</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {visible.map((club, idx) => (
          <div key={`${club.name}-${idx}`} className="h-20 rounded-xl border border-gray-200 bg-white px-3 py-2 flex items-center justify-center">
            <img src={club.src} alt={club.name} className="max-h-full max-w-full object-contain" />
          </div>
        ))}
      </div>
    </div>
  );
}

const ANALYST_ANNUAL_COST = 65000;

const ROI_SCENARIOS = {
  conservative: {
    hoursSavedPerCoachWeek: 1.5,
    coachHourlyRate: 40,
    adminHoursSavedWeek: 2,
    adminHourlyRate: 50,
    retentionLiftPct: 0.01,
    injuryReductionPerPlayer: 60,
  },
  realistic: {
    hoursSavedPerCoachWeek: 2.5,
    coachHourlyRate: 45,
    adminHoursSavedWeek: 3,
    adminHourlyRate: 55,
    retentionLiftPct: 0.025,
    injuryReductionPerPlayer: 120,
  },
  ambitious: {
    hoursSavedPerCoachWeek: 4,
    coachHourlyRate: 50,
    adminHoursSavedWeek: 5,
    adminHourlyRate: 60,
    retentionLiftPct: 0.04,
    injuryReductionPerPlayer: 200,
  },
};

function ClubROICalculator() {
  const { t } = useTranslation("usPitch");
  const [coaches, setCoaches] = useState(EXAMPLE_CLUB.coaches);
  const [players, setPlayers] = useState(EXAMPLE_CLUB.players);
  const [annualFee, setAnnualFee] = useState(2800);
  const [scenarioKey, setScenarioKey] = useState("realistic");

  const scenario = ROI_SCENARIOS[scenarioKey];

  const roi = useMemo(() => {
    const {
      hoursSavedPerCoachWeek,
      coachHourlyRate,
      adminHoursSavedWeek,
      adminHourlyRate,
      retentionLiftPct,
      injuryReductionPerPlayer,
    } = scenario;

    const coachTimeSaved = coaches * hoursSavedPerCoachWeek * 52 * coachHourlyRate;
    const adminTimeSaved = adminHoursSavedWeek * 52 * adminHourlyRate;
    const retentionValue = players * retentionLiftPct * annualFee;
    const injurySavings = players * injuryReductionPerPlayer;
    const playersRetained = players * retentionLiftPct;

    const totalBenefit = coachTimeSaved + adminTimeSaved + retentionValue + injurySavings;
    const yearOneCost = SETUP_FEE + MONTHLY_FEE * 12;
    const yearTwoPlusCost = MONTHLY_FEE * 12;
    const yearOneNet = totalBenefit - yearOneCost;
    const yearOneROI = yearOneCost > 0 ? (yearOneNet / yearOneCost) * 100 : 0;
    const paybackMonths = totalBenefit > 0 ? Math.ceil((yearOneCost / totalBenefit) * 12) : 12;
    const yearTwoROI = yearTwoPlusCost > 0 ? ((totalBenefit - yearTwoPlusCost) / yearTwoPlusCost) * 100 : 0;
    const hoursSavedPerWeek = coaches * hoursSavedPerCoachWeek + adminHoursSavedWeek;
    const hoursSavedTotal = hoursSavedPerWeek * 52;
    const costPerPlayerMonth = players > 0 ? yearOneCost / players / 12 : 0;
    const breakEvenPlayersRetained = annualFee > 0 ? yearOneCost / annualFee : 0;
    const analystSavings = ANALYST_ANNUAL_COST - yearTwoPlusCost;

    return {
      coachTimeSaved,
      adminTimeSaved,
      retentionValue,
      injurySavings,
      totalBenefit,
      yearOneCost,
      yearTwoPlusCost,
      yearOneNet,
      yearOneROI,
      yearTwoROI,
      paybackMonths,
      hoursSavedPerWeek,
      hoursSavedTotal,
      playersRetained,
      retentionLiftPct,
      costPerPlayerMonth,
      breakEvenPlayersRetained,
      analystSavings,
      benefitMultiplier: yearTwoPlusCost > 0 ? totalBenefit / yearTwoPlusCost : 0,
    };
  }, [coaches, players, annualFee, scenario]);

  return (
    <div>
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{t("roi.assumptionModel")}</p>
        <div className="flex flex-wrap gap-2">
          {Object.keys(ROI_SCENARIOS).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setScenarioKey(key)}
              className={`text-sm font-bold px-4 py-2 rounded-lg border transition-all ${
                scenarioKey === key
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {t(`roi.scenarios.${key}.label`)}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">{t(`roi.scenarios.${scenarioKey}.desc`)}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-10 mb-8">
        <div className="space-y-7">
          <div>
            <label className="flex justify-between text-sm font-semibold text-gray-700 mb-3">
              <span>{t("roi.coachingStaff")}</span>
              <span className="text-gray-900 font-black">{coaches}</span>
            </label>
            <input type="range" min={2} max={20} value={coaches} onChange={(e) => setCoaches(Number(e.target.value))} className="w-full accent-blue-600" />
          </div>
          <div>
            <label className="flex justify-between text-sm font-semibold text-gray-700 mb-3">
              <span>{t("roi.registeredPlayers")}</span>
              <span className="text-gray-900 font-black">{players}</span>
            </label>
            <input type="range" min={40} max={250} step={2} value={players} onChange={(e) => setPlayers(Number(e.target.value))} className="w-full accent-blue-600" />
          </div>
          <div>
            <label className="flex justify-between text-sm font-semibold text-gray-700 mb-3">
              <span>{t("roi.avgAnnualFee")}</span>
              <span className="text-gray-900 font-black">{fmtUSD(annualFee)}</span>
            </label>
            <input type="range" min={1500} max={6000} step={100} value={annualFee} onChange={(e) => setAnnualFee(Number(e.target.value))} className="w-full accent-blue-600" />
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3 text-sm">
            <p className="font-bold text-gray-900">
              {t("roi.modelInputs", { scenario: t(`roi.scenarios.${scenarioKey}.label`).toLowerCase() })}
            </p>
            <ul className="text-xs text-gray-600 space-y-1.5">
              <li>{t("roi.inputCoach", { hours: scenario.hoursSavedPerCoachWeek, rate: scenario.coachHourlyRate })}</li>
              <li>{t("roi.inputAdmin", { hours: scenario.adminHoursSavedWeek })}</li>
              <li>{t("roi.inputRetention", { pct: (scenario.retentionLiftPct * 100).toFixed(1), amount: scenario.injuryReductionPerPlayer })}</li>
            </ul>
          </div>

          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">{t("roi.vsHiring")}</p>
            <p className="text-sm text-gray-700 leading-relaxed">
              <Trans
                i18nKey="roi.analystText"
                ns="usPitch"
                values={{ analystCost: fmtUSD(ANALYST_ANNUAL_COST), deproCost: fmtUSD(roi.yearTwoPlusCost) }}
                components={{ strong: <strong className="text-gray-900" /> }}
              />
              {roi.analystSavings > 0 && (
                <Trans
                  i18nKey="roi.analystSaving"
                  ns="usPitch"
                  values={{ saving: fmtUSD(roi.analystSavings) }}
                  components={{ strong: <strong className="text-green-700" /> }}
                />
              )}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-gray-900 bg-white p-6 md:p-8 shadow-lg">
          <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">{t("roi.estimatedValue")}</div>
          <div className="text-4xl md:text-5xl font-black text-gray-900 mb-1">{fmtUSD(roi.totalBenefit)}</div>
          <p className="text-sm text-gray-500 mb-2">{t("roi.totalBenefit", { cost: fmtUSD(roi.yearOneCost) })}</p>
          <p className="text-xs text-blue-700 font-semibold mb-6">
            {t("roi.breakEven", { cost: fmtUSD(roi.costPerPlayerMonth), players: roi.breakEvenPlayersRetained.toFixed(1) })}
          </p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { l: t("roi.year1Roi"), v: `${Math.round(roi.yearOneROI)}%`, highlight: true },
              { l: t("roi.payback"), v: t("roi.paybackMo", { months: roi.paybackMonths }), highlight: false },
              { l: t("roi.year2Roi"), v: `${Math.round(roi.yearTwoROI)}%`, highlight: false },
              { l: t("roi.hoursSaved"), v: `${roi.hoursSavedTotal.toLocaleString()}h`, highlight: false },
            ].map((s) => (
              <div key={s.l} className={`rounded-xl p-3 border ${s.highlight ? "border-blue-200 bg-blue-50" : "border-gray-100 bg-gray-50"}`}>
                <div className="text-[10px] font-bold uppercase text-gray-400">{s.l}</div>
                <div className={`font-black stat-number ${s.highlight ? "text-2xl text-blue-700" : "text-xl text-gray-900"}`}>{s.v}</div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
            {[
              { l: t("roi.coachPlanning"), v: roi.coachTimeSaved },
              { l: t("roi.adminSaved"), v: roi.adminTimeSaved },
              { l: t("roi.retention", { pct: (roi.retentionLiftPct * 100).toFixed(1) }), v: roi.retentionValue },
              { l: t("roi.injuryLoad"), v: roi.injurySavings },
            ].map((row) => (
              <div key={row.l} className="flex justify-between gap-4">
                <span className="text-gray-500">{row.l}</span>
                <span className="font-bold text-gray-900">{fmtUSD(row.v)}</span>
              </div>
            ))}
            <div className="flex justify-between gap-4 pt-2 border-t border-gray-100 font-bold">
              <span className="text-gray-900">{t("roi.year1Net")}</span>
              <span className={roi.yearOneNet >= 0 ? "text-green-600" : "text-red-600"}>{fmtUSD(roi.yearOneNet)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            icon: Clock,
            stat: `${roi.hoursSavedPerWeek}h`,
            label: t("roi.savedPerWeek"),
            sub: t("roi.savedPerWeekSub", { coaches, coachH: scenario.hoursSavedPerCoachWeek, adminH: scenario.adminHoursSavedWeek }),
          },
          {
            icon: Users,
            stat: roi.playersRetained.toFixed(1),
            label: t("roi.playersRetained"),
            sub: t("roi.playersRetainedSub", { pct: (roi.retentionLiftPct * 100).toFixed(1), players, value: fmtUSD(roi.retentionValue) }),
          },
          {
            icon: TrendingUp,
            stat: fmtUSD(roi.injurySavings),
            label: t("roi.injuryAvoided"),
            sub: t("roi.injuryAvoidedSub", { amount: scenario.injuryReductionPerPlayer }),
          },
          {
            icon: DollarSign,
            stat: `${roi.benefitMultiplier.toFixed(1)}×`,
            label: t("roi.benefitMultiplier"),
            sub: t("roi.benefitMultiplierSub", { benefit: fmtUSD(roi.totalBenefit), fee: fmtUSD(roi.yearTwoPlusCost) }),
          },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <item.icon size={20} className="text-blue-600 mb-3" />
            <div className="text-3xl font-black text-gray-900 stat-number">{item.stat}</div>
            <div className="text-sm font-bold text-gray-800 mt-1">{item.label}</div>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">{item.sub}</p>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-gray-400 leading-relaxed text-center max-w-3xl mx-auto">
        {t("roi.disclaimer")}
      </p>
    </div>
  );
}

function PartnerCalculator() {
  const { t } = useTranslation("usPitch");
  const [clubs, setClubs] = useState(4);
  const [months, setMonths] = useState(12);

  const calc = useMemo(() => {
    const setupComm = SETUP_FEE * COMMISSION_RATE;
    const monthlyComm = MONTHLY_FEE * COMMISSION_RATE;
    return {
      setupComm,
      monthlyComm,
      oneTime: setupComm * clubs,
      recurringPerMonth: monthlyComm * clubs,
      recurringTotal: monthlyComm * clubs * months,
      yearOne: setupComm * clubs + monthlyComm * clubs * months,
    };
  }, [clubs, months]);

  return (
    <div className="grid lg:grid-cols-2 gap-10">
      <div className="space-y-8">
        <div>
          <label className="flex justify-between text-sm font-semibold text-gray-700 mb-3">
            <span>{t("partner.clubsClosed")}</span>
            <span className="text-gray-900 font-black text-xl">{clubs}</span>
          </label>
          <input type="range" min={1} max={24} value={clubs} onChange={(e) => setClubs(Number(e.target.value))} className="w-full accent-blue-600" />
        </div>
        <div>
          <label className="flex justify-between text-sm font-semibold text-gray-700 mb-3">
            <span>{t("partner.horizon")}</span>
            <span className="text-gray-900 font-black text-xl">{months}</span>
          </label>
          <input type="range" min={1} max={36} value={months} onChange={(e) => setMonths(Number(e.target.value))} className="w-full accent-blue-600" />
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-600 space-y-2">
          <p className="font-semibold text-gray-900">{t("partner.dealTerms")}</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>{t("partner.setupComm", { comm: fmtUSD(calc.setupComm), setup: fmtUSD(SETUP_FEE) })}</li>
            <li>{t("partner.monthlyComm", { comm: fmtUSD(calc.monthlyComm), monthly: fmtUSD(MONTHLY_FEE) })}</li>
          </ul>
        </div>
      </div>
      <div className="space-y-4">
        {[
          { label: t("partner.setupCommissions"), value: calc.oneTime },
          { label: t("partner.recurring", { months }), value: calc.recurringTotal },
          { label: t("partner.totalEarnings"), value: calc.yearOne, highlight: true },
        ].map((r) => (
          <div key={r.label} className={`rounded-xl border p-5 ${r.highlight ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-white"}`}>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{r.label}</div>
            <div className={`font-black stat-number ${r.highlight ? "text-4xl text-blue-700" : "text-2xl text-gray-900"}`}>{fmtUSD(r.value)}</div>
            {r.highlight && (
              <p className="text-sm text-gray-500 mt-2">{t("partner.whileSubscribed", { amount: fmtUSD(calc.recurringPerMonth) })}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const PARTNER_ONLY_NAV = ["roi", "partner"];

function PitchFooter({ variant }) {
  const { t } = useTranslation("usPitch");
  const isPartner = variant === "partner";

  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 pb-8 border-b border-gray-200">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <img src="/logo.png" alt="DEPRO" className="h-9 w-auto" />
            <div className="hidden sm:block w-px h-8 bg-gray-200" />
            <div className="flex items-center gap-3">
              <img src={NEXGENT_LOGO} alt="Nexgent" className="h-8 w-auto object-contain" />
              <div className="text-left max-w-xs">
                <p className="text-xs font-bold text-gray-900 leading-snug">
                  <Trans i18nKey="footer.nexgent" ns="usPitch" components={{ strong: <strong /> }} />
                </p>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{t("footer.nexgentDesc")}</p>
              </div>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-400 text-center mt-6">
          {t(isPartner ? "footer.copyrightPartner" : "footer.copyrightClient", { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}

export function USClubPitchPage({ variant = "partner" }) {
  const { t, i18n } = useTranslation("usPitch");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    initUSPitchLanguage(i18n);
  }, [i18n]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const isPartner = variant === "partner";
  const navIds = isPartner ? NAV_IDS : NAV_IDS.filter((id) => !PARTNER_ONLY_NAV.includes(id));

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Nav */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100" : "bg-white"}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="DEPRO" className="h-7 w-auto" />
            <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest text-gray-400">{t("nav.brand")}</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-1">
            {navIds.map((id) => (
              <button key={id} type="button" onClick={() => scrollTo(id)} className="px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-50">
                {t(`nav.${id}`)}
              </button>
            ))}
          </nav>
          <div className="hidden sm:flex items-center gap-2">
            <USPitchLanguageSwitcher />
            {isPartner ? (
              <button type="button" onClick={() => scrollTo("partner")} className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                {t("nav.partnerCta")} <ChevronRight size={14} />
              </button>
            ) : (
              <a href="mailto:info@depro.es?subject=DEPRO%20Club%20Demo" className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                {t("nav.clientCta")} <ChevronRight size={14} />
              </a>
            )}
          </div>
          <button type="button" className="lg:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {menuOpen && (
          <div className="lg:hidden border-t border-gray-100 px-4 py-3 bg-white space-y-1">
            <div className="pb-3 mb-2 border-b border-gray-100">
              <USPitchLanguageSwitcher />
            </div>
            {navIds.map((id) => (
              <button key={id} type="button" onClick={() => scrollTo(id)} className="block w-full text-left py-2.5 text-sm font-medium text-gray-600">{t(`nav.${id}`)}</button>
            ))}
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="overview" className="pt-28 pb-16 md:pt-32 md:pb-24 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-4">{t("hero.eyebrow")}</p>
              <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-black tracking-tight leading-[1.05] text-gray-900 mb-6">
                {t("hero.title1")}<br />{t("hero.title2")}<br />{t("hero.title3")}
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-xl">{t("hero.desc")}</p>
              <div className="flex flex-wrap gap-3 mb-10">
                <button type="button" onClick={() => scrollTo("explorer")} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3.5 rounded-lg transition-colors">
                  {t("hero.ctaExplorer")} <ArrowRight size={18} />
                </button>
                <button type="button" onClick={() => scrollTo("platform")} className="inline-flex items-center gap-2 border border-gray-300 hover:border-gray-400 text-gray-800 font-bold px-6 py-3.5 rounded-lg transition-colors">
                  {t("hero.ctaFeatures")}
                </button>
              </div>
              <div className={`grid gap-4 pt-6 border-t border-gray-100 ${isPartner ? "grid-cols-3" : "grid-cols-3"}`}>
                {(isPartner
                  ? [
                      { v: "$15k", l: t("hero.statSetup") },
                      { v: "$1.5k", l: t("hero.statMonthly") },
                      { v: "10%", l: t("hero.statPartner") },
                    ]
                  : [
                      { v: "$15k", l: t("hero.statSetup") },
                      { v: "$1.5k", l: t("hero.statMonthly") },
                      { v: t("hero.statLive"), l: t("hero.statLiveSub") },
                    ]
                ).map((s) => (
                  <div key={s.l}>
                    <div className="text-2xl font-black text-gray-900">{s.v}</div>
                    <div className="text-xs text-gray-500 font-medium">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <PlatformHeroQuickTour accent={ACCENT} />
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <ImplementedClubsCarousel />
        </div>
      </section>

      {/* Example club */}
      <section id="example" className="py-20 bg-gray-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{t("example.eyebrow")}</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">{t("example.title", { club: EXAMPLE_CLUB.name })}</h2>
            <p className="text-gray-600 leading-relaxed">{t("example.desc")}</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-10">
            <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl border border-gray-200 bg-white p-1.5 flex items-center justify-center overflow-hidden">
                  <img src={EXAMPLE_CLUB.logo} alt={EXAMPLE_CLUB.name} className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">{EXAMPLE_CLUB.name}</h3>
                  <p className="text-sm text-gray-500">{EXAMPLE_CLUB.city} · {EXAMPLE_CLUB.category}</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {[
                  { icon: Users, label: t("example.players"), value: String(EXAMPLE_CLUB.players) },
                  { icon: Building2, label: t("example.teams"), value: String(EXAMPLE_CLUB.teams) },
                  { icon: Calendar, label: t("example.schedule"), value: EXAMPLE_CLUB.trainingDays },
                  { icon: Target, label: t("example.coaches"), value: t("example.coachesValue", { count: EXAMPLE_CLUB.coaches }) },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 rounded-xl bg-gray-50 border border-gray-100 p-4">
                    <item.icon size={18} className="flex-shrink-0" style={{ color: EXAMPLE_ACCENT }} />
                    <div>
                      <div className="text-xs text-gray-400 font-semibold">{item.label}</div>
                      <div className="font-bold text-gray-900">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-6 space-y-4">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{t("example.sampleWeek")}</h4>
                {EXAMPLE_WEEK_KEYS.map((key) => {
                  const row = t(`example.week.${key}`, { returnObjects: true });
                  return (
                  <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                    <span className="font-bold text-gray-900 w-24 flex-shrink-0">{row.day}</span>
                    <span className="font-semibold w-44 flex-shrink-0" style={{ color: EXAMPLE_ACCENT }}>{row.session}</span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded w-fit">{row.load}</span>
                    <span className="text-gray-500 text-xs">{row.note}</span>
                  </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="text-xs font-bold text-gray-400 uppercase mb-3">{t("example.playerSnapshot")}</div>
                <div className="font-black text-gray-900 mb-1">Pol García · CM · #8</div>
                <div className="text-xs text-gray-500 mb-4">{t("example.playerPlan")}</div>
                <div className="space-y-2 text-xs">
                  {EXAMPLE_METRIC_KEYS.map((key) => {
                    const m = t(`example.metrics.${key}`, { returnObjects: true });
                    return (
                    <div key={key} className="flex justify-between gap-2 py-2 border-b border-gray-50 last:border-0">
                      <span className="text-gray-500">{m.t}</span>
                      <span className="font-bold text-gray-800 text-right">{m.v}<br /><span className="text-green-600 font-semibold">{m.r}</span></span>
                    </div>
                    );
                  })}
                </div>
              </div>
              <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
                <div className="text-xs font-bold text-green-700 uppercase mb-2">{t("example.directorOutcome")}</div>
                <p className="text-sm text-green-900 leading-relaxed">{t("example.directorQuote")}</p>
                <p className="text-xs text-green-700 mt-2 font-semibold">{t("example.directorRole")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform — demo + features */}
      <section id="platform" className="py-20 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{t("platform.eyebrow")}</p>
            <h2 className="text-3xl md:text-4xl font-black mb-4">{t("platform.title")}</h2>
            <p className="text-gray-600 leading-relaxed">{t("platform.desc")}</p>
          </div>
          <PlatformFeatureShowcase accent={ACCENT} />
        </div>
      </section>

      {/* Full interactive club dashboard */}
      <section id="explorer" className="py-20 md:py-28 bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mb-10 md:mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-green-400 mb-3">{t("explorer.eyebrow")}</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">{t("explorer.title")}</h2>
            <p className="text-gray-400 text-lg leading-relaxed">{t("explorer.desc")}</p>
          </div>
          <ClubDashboardExplorer
            club={{
              name: EXAMPLE_CLUB.name,
              abbrev: "FC",
              logo: EXAMPLE_CLUB.logo,
              accent: EXAMPLE_ACCENT,
              team: "Sub-15 A",
            }}
          />
          <p className="text-center text-xs text-gray-500 mt-6">{t("explorer.footnote", { club: EXAMPLE_CLUB.name })}</p>
        </div>
      </section>

      {isPartner && (
      <section id="roi" className="py-20 bg-gray-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{t("roi.eyebrow")}</p>
            <h2 className="text-3xl md:text-4xl font-black mb-4">{t("roi.title")}</h2>
            <p className="text-gray-600 leading-relaxed">{t("roi.desc")}</p>
          </div>
          <ClubROICalculator />
        </div>
      </section>
      )}

      {/* Workflow */}
      <section id="workflow" className="py-20 bg-gray-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{t("workflow.eyebrow")}</p>
            <h2 className="text-3xl md:text-4xl font-black mb-4">{t("workflow.title")}</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {WORKFLOW_KEYS.map((step) => {
              const w = t(`workflow.steps.${step}`, { returnObjects: true });
              return (
              <div key={step} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="text-3xl font-black text-blue-100 mb-2">{step}</div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 mb-2">
                  <Clock size={12} /> {w.time}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{w.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{w.desc}</p>
              </div>
              );
            })}
          </div>

          <div className="mt-16 rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-black text-gray-900">{t("workflow.compareTitle")}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="px-6 py-3 text-xs font-bold text-gray-400 uppercase">{t("workflow.capability")}</th>
                    <th className="px-4 py-3 text-xs font-bold text-blue-600 uppercase text-center">{t("workflow.depro")}</th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase text-center">{t("workflow.spreadsheets")}</th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase text-center">{t("workflow.generic")}</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROW_KEYS.map((row) => (
                    <tr key={row.key} className="border-b border-gray-50">
                      <td className="px-6 py-3 text-gray-700">{t(`workflow.compareRows.${row.key}`)}</td>
                      {["depro", "sheets", "generic"].map((k) => {
                        const val = row[k];
                        return (
                          <td key={k} className="px-4 py-3 text-center">
                            {val === true ? (
                              <CheckCircle2 size={18} className="inline text-green-500" />
                            ) : val === false ? (
                              <span className="text-gray-300">—</span>
                            ) : (
                              <span className="text-xs font-semibold text-amber-600">{t(`workflow.${val}`)}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{t("pricing.eyebrow")}</p>
            <h2 className="text-3xl md:text-4xl font-black mb-4">{t("pricing.title")}</h2>
            <p className="text-gray-600">{t("pricing.desc")}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto items-start">
            <div className="rounded-2xl border-2 border-gray-900 bg-white p-8 shadow-lg">
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{t("pricing.enterprise.badge")}</div>
              <p className="text-xs font-semibold text-gray-500 mb-6">{t("pricing.enterprise.subtitle")}</p>
              <div className="mb-1 text-sm text-gray-500">{t("pricing.enterprise.setupLabel")}</div>
              <div className="text-5xl font-black text-gray-900 mb-6">{fmtUSD(SETUP_FEE)}</div>
              <div className="border-t border-gray-100 pt-6 mb-6">
                <div className="text-sm text-gray-500 mb-1">{t("pricing.enterprise.monthlyLabel")}</div>
                <div className="text-4xl font-black text-gray-900">{fmtUSD(MONTHLY_FEE)}<span className="text-base font-semibold text-gray-400">/mo</span></div>
                <div className="text-xs text-gray-400 mt-1">{t("pricing.enterprise.yearRecurring", { amount: fmtUSD(MONTHLY_FEE * 12) })}</div>
                <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-900 leading-relaxed">
                  <Trans i18nKey="pricing.enterprise.included" ns="usPitch" components={{ strong: <strong className="font-bold" /> }} />
                </div>
              </div>
              <ul className="space-y-2.5 mb-8 text-sm text-gray-600">
                {(t("pricing.enterprise.features", { returnObjects: true }) || []).map((item) => (
                  <li key={item} className="flex gap-2"><CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" />{item}</li>
                ))}
              </ul>
              <a href="mailto:info@depro.es?subject=DEPRO%20US%20Club%20Demo" className="flex items-center justify-center gap-2 w-full py-3.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-bold transition-colors">
                <Mail size={16} /> {t("pricing.enterprise.cta")}
              </a>
            </div>

            <div className="rounded-2xl border-2 border-blue-200 bg-white p-8 shadow-lg relative">
              <span className="absolute -top-3 left-6 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-blue-600 text-white">
                {t("pricing.custom.badge")}
              </span>
              <div className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2 mt-2">{t("pricing.custom.title")}</div>
              <p className="text-xs font-semibold text-gray-500 mb-6">{t("pricing.custom.subtitle")}</p>
              <div className="mb-1 text-sm text-gray-500">{t("pricing.custom.setupLabel")}</div>
              <div className="text-4xl md:text-5xl font-black text-gray-900 mb-2">{t("pricing.custom.price")}</div>
              <p className="text-sm font-semibold text-gray-600 mb-6">
                <Trans i18nKey="pricing.custom.priceNote" ns="usPitch" values={{ setupFee: fmtUSD(SETUP_FEE) }} components={{ strong: <strong className="text-gray-900" /> }} />
              </p>
              <div className="border-t border-gray-100 pt-6 mb-6">
                <div className="rounded-lg border border-violet-100 bg-violet-50 px-4 py-3 text-xs text-violet-900 leading-relaxed">
                  <Trans i18nKey="pricing.custom.highlight" ns="usPitch" components={{ strong: <strong className="font-bold" /> }} />
                </div>
              </div>
              <ul className="space-y-2.5 mb-8 text-sm text-gray-600">
                {(t("pricing.custom.features", { returnObjects: true }) || []).map((item, i) => {
                  const icons = [Sparkles, MapPin, BarChart3, Calendar, Building2, Users];
                  const Icon = icons[i] || Sparkles;
                  return (
                  <li key={item} className="flex gap-2">
                    <Icon size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                  );
                })}
              </ul>
              <a href="mailto:info@depro.es?subject=DEPRO%20Custom%20Software%20Quote" className="flex items-center justify-center gap-2 w-full py-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors">
                <Mail size={16} /> {t("pricing.custom.cta")}
              </a>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-6 max-w-2xl mx-auto">
            <Trans
              i18nKey="pricing.footnote"
              ns="usPitch"
              values={{ club: EXAMPLE_CLUB.name, setup: fmtUSD(SETUP_FEE), monthly: fmtUSD(MONTHLY_FEE) }}
              components={{ strong: <strong className="text-gray-500" /> }}
            />
          </p>
        </div>
      </section>

      {/* Partner */}
      {isPartner && (
      <section id="partner" className="py-20 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{t("partner.eyebrow")}</p>
            <h2 className="text-3xl md:text-4xl font-black mb-4">{t("partner.title")}</h2>
            <p className="text-gray-600 leading-relaxed">
              <Trans
                i18nKey="partner.desc"
                ns="usPitch"
                values={{
                  setup: fmtUSD(SETUP_FEE),
                  monthly: fmtUSD(MONTHLY_FEE),
                  setupComm: fmtUSD(SETUP_FEE * COMMISSION_RATE),
                  monthlyComm: fmtUSD(MONTHLY_FEE * COMMISSION_RATE),
                }}
                components={{ strong: <strong /> }}
              />
            </p>
          </div>
          <PartnerCalculator />
        </div>
      </section>
      )}

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-black mb-8 text-center">{t("faq.title")}</h2>
          <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {FAQ_KEYS.map((key) => (
              <div key={key} className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-bold text-gray-900 text-sm mb-2">{t(`faq.items.${key}.q`)}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{t(`faq.items.${key}.a`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <BarChart3 size={36} className="mx-auto text-blue-600 mb-4" />
          <h2 className="text-2xl md:text-3xl font-black mb-3">{isPartner ? t("cta.title") : t("cta.clientTitle")}</h2>
          <p className="text-gray-500 mb-8">{isPartner ? t("cta.desc") : t("cta.clientDesc")}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {isPartner ? (
              <a href="mailto:info@depro.es?subject=DEPRO%20US%20Partnership" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-lg">
                {t("cta.partner")}
              </a>
            ) : (
              <a href="mailto:info@depro.es?subject=DEPRO%20Club%20Demo" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-lg">
                {t("cta.clientDemo")}
              </a>
            )}
            <Link to="/" className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg border border-gray-300 text-gray-600 font-bold hover:border-gray-400">
              {t("cta.home")}
            </Link>
          </div>
        </div>
      </section>

      <PitchFooter variant={variant} />
    </div>
  );
}

export default USClubPitchPage;
