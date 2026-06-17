import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, BarChart3, Building2, Calendar, CheckCircle2,
  ChevronRight, Clock, DollarSign,
  Mail, Menu, Target, TrendingUp, Users, X,
} from "lucide-react";
import { PlatformHeroQuickTour, PlatformFeatureShowcase } from "../../components/pitch/PlatformDemoFrames";
import { ClubDashboardExplorer } from "../../components/pitch/ClubDashboardExplorer";

const SETUP_FEE = 15000;
const MONTHLY_FEE = 1500;
const COMMISSION_RATE = 0.1;
const ACCENT = "#0A36F7";
const EXAMPLE_ACCENT = "#0D8F4D";

const NAV = [
  { id: "overview", label: "Overview" },
  { id: "example", label: "Example club" },
  { id: "platform", label: "Platform" },
  { id: "explorer", label: "Live dashboard" },
  { id: "roi", label: "Club ROI" },
  { id: "workflow", label: "Workflow" },
  { id: "pricing", label: "Pricing" },
  { id: "partner", label: "Partner" },
];

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

const WORKFLOW = [
  { step: "01", title: "Onboarding & branding", time: "Week 1", desc: "We configure your logo, colors, teams, training days and age blocks. Coaches receive login credentials." },
  { step: "02", title: "Plans go live", time: "Week 2", desc: "Microcycles and mesocycles appear automatically per category. Coaches open Session B on Wednesday — everything is ready." },
  { step: "03", title: "Squad & tests baseline", time: "Week 3", desc: "Roster imported. T1 physical tests recorded. Platform calculates team averages — every rating is relative, not generic." },
  { step: "04", title: "Weekly loads & evolution", time: "Ongoing", desc: "Coaches log volume, RPE and specificity. Directors see weekly traffic lights and T1→T2→T3 player evolution." },
];

const COMPARE_ROWS = [
  { feature: "Branded club platform (logo + colors)", depro: true, sheets: false, generic: false },
  { feature: "Periodized micro / meso cycles", depro: true, sheets: "Partial", generic: false },
  { feature: "Physical tests vs team average", depro: true, sheets: false, generic: "Add-on" },
  { feature: "Load monitoring (sRPE-based)", depro: true, sheets: false, generic: false },
  { feature: "Session PDF exports", depro: true, sheets: false, generic: "Limited" },
  { feature: "Multi-team academy support", depro: true, sheets: true, generic: "Limited" },
];

const FAQ = [
  { q: "Is this only for large academies?", a: "No. The sweet spot is 2–8 teams (80–200 players). Fundació Cornellà in our example runs 5 teams on one license." },
  { q: "Do coaches need training?", a: "1-hour onboarding call per staff. The UI is built for coaches, not data scientists." },
  { q: "What does the monthly fee include?", a: "Platform access plus full configuration of all training sessions for every mesocycle — every team, every session type, ready before coaches step on the field. No building plans from scratch." },
  { q: "What about individual player plans?", a: "DEPRO also offers individual player subscriptions — clubs can upsell private physical plans to families." },
  { q: "Who owns the data?", a: "The club. Export anytime. We do not sell player data." },
];

function fmtUSD(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function ImplementedClubsCarousel() {
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
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Already implemented in clubs</p>
        <span className="text-xs text-gray-500">Live environments running DEPRO</span>
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
    label: "Conservative",
    desc: "Minimal assumptions — easy to defend in a board meeting",
    hoursSavedPerCoachWeek: 1.5,
    coachHourlyRate: 40,
    adminHoursSavedWeek: 2,
    adminHourlyRate: 50,
    retentionLiftPct: 0.01,
    injuryReductionPerPlayer: 60,
  },
  realistic: {
    label: "Realistic",
    desc: "Based on Fundació Cornellà · our default reference academy",
    hoursSavedPerCoachWeek: 2.5,
    coachHourlyRate: 45,
    adminHoursSavedWeek: 3,
    adminHourlyRate: 55,
    retentionLiftPct: 0.025,
    injuryReductionPerPlayer: 120,
  },
  ambitious: {
    label: "Ambitious",
    desc: "Full adoption — every coach & director uses DEPRO daily",
    hoursSavedPerCoachWeek: 4,
    coachHourlyRate: 50,
    adminHoursSavedWeek: 5,
    adminHourlyRate: 60,
    retentionLiftPct: 0.04,
    injuryReductionPerPlayer: 200,
  },
};

function ClubROICalculator() {
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
      {/* Scenario toggle */}
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Assumption model</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(ROI_SCENARIOS).map(([key, s]) => (
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
              {s.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">{scenario.desc}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-10 mb-8">
        <div className="space-y-7">
          <div>
            <label className="flex justify-between text-sm font-semibold text-gray-700 mb-3">
              <span>Coaching staff</span>
              <span className="text-gray-900 font-black">{coaches}</span>
            </label>
            <input type="range" min={2} max={20} value={coaches} onChange={(e) => setCoaches(Number(e.target.value))} className="w-full accent-blue-600" />
          </div>
          <div>
            <label className="flex justify-between text-sm font-semibold text-gray-700 mb-3">
              <span>Registered players</span>
              <span className="text-gray-900 font-black">{players}</span>
            </label>
            <input type="range" min={40} max={250} step={2} value={players} onChange={(e) => setPlayers(Number(e.target.value))} className="w-full accent-blue-600" />
          </div>
          <div>
            <label className="flex justify-between text-sm font-semibold text-gray-700 mb-3">
              <span>Avg. annual fee per player</span>
              <span className="text-gray-900 font-black">{fmtUSD(annualFee)}</span>
            </label>
            <input type="range" min={1500} max={6000} step={100} value={annualFee} onChange={(e) => setAnnualFee(Number(e.target.value))} className="w-full accent-blue-600" />
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3 text-sm">
            <p className="font-bold text-gray-900">Model inputs ({scenario.label.toLowerCase()})</p>
            <ul className="text-xs text-gray-600 space-y-1.5">
              <li>{scenario.hoursSavedPerCoachWeek} h/week saved per coach · ${scenario.coachHourlyRate}/h loaded cost</li>
              <li>{scenario.adminHoursSavedWeek} h/week admin & coordination saved</li>
              <li>{(scenario.retentionLiftPct * 100).toFixed(1)}% retention lift · ${scenario.injuryReductionPerPlayer}/player injury savings</li>
            </ul>
          </div>

          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">vs. hiring in-house</p>
            <p className="text-sm text-gray-700 leading-relaxed">
              A US performance analyst or periodization specialist typically costs{" "}
              <strong className="text-gray-900">{fmtUSD(ANALYST_ANNUAL_COST)}/year</strong> (salary + tools).
              DEPRO year 2+ is <strong className="text-gray-900">{fmtUSD(roi.yearTwoPlusCost)}/year</strong>
              {roi.analystSavings > 0 && (
                <> — saving <strong className="text-green-700">{fmtUSD(roi.analystSavings)}</strong> vs. that hire while covering every team.</>
              )}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-gray-900 bg-white p-6 md:p-8 shadow-lg">
          <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Estimated annual value</div>
          <div className="text-4xl md:text-5xl font-black text-gray-900 mb-1">{fmtUSD(roi.totalBenefit)}</div>
          <p className="text-sm text-gray-500 mb-2">Total quantified benefit vs. {fmtUSD(roi.yearOneCost)} year-one investment</p>
          <p className="text-xs text-blue-700 font-semibold mb-6">
            ≈ {fmtUSD(roi.costPerPlayerMonth)}/player/month · break-even: retain {roi.breakEvenPlayersRetained.toFixed(1)} players/yr
          </p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { l: "Year 1 ROI", v: `${Math.round(roi.yearOneROI)}%`, highlight: true },
              { l: "Payback period", v: `${roi.paybackMonths} mo`, highlight: false },
              { l: "Year 2+ ROI", v: `${Math.round(roi.yearTwoROI)}%`, highlight: false },
              { l: "Hours saved / yr", v: `${roi.hoursSavedTotal.toLocaleString()}h`, highlight: false },
            ].map((s) => (
              <div key={s.l} className={`rounded-xl p-3 border ${s.highlight ? "border-blue-200 bg-blue-50" : "border-gray-100 bg-gray-50"}`}>
                <div className="text-[10px] font-bold uppercase text-gray-400">{s.l}</div>
                <div className={`font-black stat-number ${s.highlight ? "text-2xl text-blue-700" : "text-xl text-gray-900"}`}>{s.v}</div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
            {[
              { l: "Coach planning time saved", v: roi.coachTimeSaved },
              { l: "Admin & coordination saved", v: roi.adminTimeSaved },
              { l: `Retention (${(roi.retentionLiftPct * 100).toFixed(1)}% fewer exits)`, v: roi.retentionValue },
              { l: "Injury & load management", v: roi.injurySavings },
            ].map((row) => (
              <div key={row.l} className="flex justify-between gap-4">
                <span className="text-gray-500">{row.l}</span>
                <span className="font-bold text-gray-900">{fmtUSD(row.v)}</span>
              </div>
            ))}
            <div className="flex justify-between gap-4 pt-2 border-t border-gray-100 font-bold">
              <span className="text-gray-900">Year 1 net gain</span>
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
            label: "Saved per week",
            sub: `${coaches} coaches × ${scenario.hoursSavedPerCoachWeek} h + ${scenario.adminHoursSavedWeek} h admin — sessions built by DEPRO`,
          },
          {
            icon: Users,
            stat: roi.playersRetained.toFixed(1),
            label: "Players retained / yr",
            sub: `${(roi.retentionLiftPct * 100).toFixed(1)}% lift on ${players} players ≈ ${fmtUSD(roi.retentionValue)} value`,
          },
          {
            icon: TrendingUp,
            stat: fmtUSD(roi.injurySavings),
            label: "Injury cost avoided",
            sub: `$${scenario.injuryReductionPerPlayer}/player · industry benchmark −15–25% soft-tissue with load monitoring`,
          },
          {
            icon: DollarSign,
            stat: `${roi.benefitMultiplier.toFixed(1)}×`,
            label: "Benefit vs. annual fee",
            sub: `${fmtUSD(roi.totalBenefit)} value on ${fmtUSD(roi.yearTwoPlusCost)}/yr after setup year`,
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
        Illustrative model for partner conversations — not a financial guarantee. Actual ROI depends on club adoption,
        staff workflows and retention dynamics. Analyst comparison based on typical US academy salary benchmarks ($55–75k).
      </p>
    </div>
  );
}

function PartnerCalculator() {
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
            <span>Clubs closed per year</span>
            <span className="text-gray-900 font-black text-xl">{clubs}</span>
          </label>
          <input type="range" min={1} max={24} value={clubs} onChange={(e) => setClubs(Number(e.target.value))} className="w-full accent-blue-600" />
        </div>
        <div>
          <label className="flex justify-between text-sm font-semibold text-gray-700 mb-3">
            <span>Recurring horizon (months)</span>
            <span className="text-gray-900 font-black text-xl">{months}</span>
          </label>
          <input type="range" min={1} max={36} value={months} onChange={(e) => setMonths(Number(e.target.value))} className="w-full accent-blue-600" />
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-600 space-y-2">
          <p className="font-semibold text-gray-900">10% on every deal you close:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>{fmtUSD(calc.setupComm)} per club setup ({fmtUSD(SETUP_FEE)})</li>
            <li>{fmtUSD(calc.monthlyComm)}/month per active club ({fmtUSD(MONTHLY_FEE)}/mo)</li>
          </ul>
        </div>
      </div>
      <div className="space-y-4">
        {[
          { label: "Setup commissions (one-time)", value: calc.oneTime },
          { label: `Recurring (${months} mo)`, value: calc.recurringTotal },
          { label: "Total partner earnings", value: calc.yearOne, highlight: true },
        ].map((r) => (
          <div key={r.label} className={`rounded-xl border p-5 ${r.highlight ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-white"}`}>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{r.label}</div>
            <div className={`font-black stat-number ${r.highlight ? "text-4xl text-blue-700" : "text-2xl text-gray-900"}`}>{fmtUSD(r.value)}</div>
            {r.highlight && (
              <p className="text-sm text-gray-500 mt-2">+ {fmtUSD(calc.recurringPerMonth)}/mo while clubs stay subscribed</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function USClubPitchPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

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
            <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest text-gray-400">Club Platform · US</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((n) => (
              <button key={n.id} type="button" onClick={() => scrollTo(n.id)} className="px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-50">
                {n.label}
              </button>
            ))}
          </nav>
          <button type="button" onClick={() => scrollTo("partner")} className="hidden sm:flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
            Partner calculator <ChevronRight size={14} />
          </button>
          <button type="button" className="lg:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {menuOpen && (
          <div className="lg:hidden border-t border-gray-100 px-4 py-3 bg-white space-y-1">
            {NAV.map((n) => (
              <button key={n.id} type="button" onClick={() => scrollTo(n.id)} className="block w-full text-left py-2.5 text-sm font-medium text-gray-600">{n.label}</button>
            ))}
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="overview" className="pt-28 pb-16 md:pt-32 md:pb-24 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-4">Performance management for US youth clubs</p>
              <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-black tracking-tight leading-[1.05] text-gray-900 mb-6">
                Every session.<br />Every player.<br />Every metric — in one place.
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-xl">
                DEPRO is a white-label platform for academies that need serious periodization,
                physical testing, load monitoring and squad intelligence — under their own brand.
              </p>
              <div className="flex flex-wrap gap-3 mb-10">
                <button type="button" onClick={() => scrollTo("explorer")} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3.5 rounded-lg transition-colors">
                  Explore full dashboard <ArrowRight size={18} />
                </button>
                <button type="button" onClick={() => scrollTo("platform")} className="inline-flex items-center gap-2 border border-gray-300 hover:border-gray-400 text-gray-800 font-bold px-6 py-3.5 rounded-lg transition-colors">
                  All features
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
                {[
                  { v: "$15k", l: "Setup" },
                  { v: "$1.5k", l: "/ month · all sessions configured" },
                  { v: "10%", l: "Partner comm." },
                ].map((s) => (
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
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Concrete example</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">How {EXAMPLE_CLUB.name} uses DEPRO</h2>
            <p className="text-gray-600 leading-relaxed">
              A high-performance academy with 5 teams. Technical director wants one system instead of Excel + Google Drive + WhatsApp.
            </p>
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
                  { icon: Users, label: "Players registered", value: String(EXAMPLE_CLUB.players) },
                  { icon: Building2, label: "Teams", value: String(EXAMPLE_CLUB.teams) },
                  { icon: Calendar, label: "Training schedule", value: EXAMPLE_CLUB.trainingDays },
                  { icon: Target, label: "Coaching staff", value: `${EXAMPLE_CLUB.coaches} coaches` },
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
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Sample week — U15 Elite</h4>
                {[
                  { day: "Monday", session: "Session A · Extensive", load: "Low · 405 AU", note: "Technical possession · 45 min · RPE 3" },
                  { day: "Wednesday", session: "Session B · Intensive", load: "High · 890 AU", note: "Pressing triggers · 75 min · RPE 7" },
                  { day: "Friday", session: "Session C · Reactive", load: "Medium · 650 AU", note: "Transition game · 60 min · RPE 5" },
                  { day: "Saturday", session: "Match vs Gimnàstic Manresa", load: "Peak · 720 AU", note: "Load auto-tracked post-game" },
                ].map((row) => (
                  <div key={row.day} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                    <span className="font-bold text-gray-900 w-24 flex-shrink-0">{row.day}</span>
                    <span className="font-semibold w-44 flex-shrink-0" style={{ color: EXAMPLE_ACCENT }}>{row.session}</span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded w-fit">{row.load}</span>
                    <span className="text-gray-500 text-xs">{row.note}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="text-xs font-bold text-gray-400 uppercase mb-3">Player snapshot</div>
                <div className="font-black text-gray-900 mb-1">Pol García · CM · #8</div>
                <div className="text-xs text-gray-500 mb-4">U15 Elite · Premium plan</div>
                <div className="space-y-2 text-xs">
                  {[
                    { t: "Endurance T3", v: "545 rectas", r: "Excellent (+9% vs avg)" },
                    { t: "Sprint T3", v: "2.78 s", r: "Good (+4% vs avg)" },
                    { t: "Weekly load", v: "Medium", r: "Within team range" },
                  ].map((m) => (
                    <div key={m.t} className="flex justify-between gap-2 py-2 border-b border-gray-50 last:border-0">
                      <span className="text-gray-500">{m.t}</span>
                      <span className="font-bold text-gray-800 text-right">{m.v}<br /><span className="text-green-600 font-semibold">{m.r}</span></span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
                <div className="text-xs font-bold text-green-700 uppercase mb-2">Director outcome</div>
                <p className="text-sm text-green-900 leading-relaxed">
                  "We finally show parents objective progress — not opinions. Sponsors see a professional operation."
                </p>
                <p className="text-xs text-green-700 mt-2 font-semibold">— Technical Director, Fundació Cornellà</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform — demo + features */}
      <section id="platform" className="py-20 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Platform walkthrough</p>
            <h2 className="text-3xl md:text-4xl font-black mb-4">Every feature, one operating system</h2>
            <p className="text-gray-600 leading-relaxed">
              Explore the live demo on the left — click any capability on the right to see it in action.
            </p>
          </div>
          <PlatformFeatureShowcase accent={ACCENT} />
        </div>
      </section>

      {/* Full interactive club dashboard */}
      <section id="explorer" className="py-20 md:py-28 bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mb-10 md:mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-green-400 mb-3">Hands-on preview</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">
              Navigate the full club dashboard
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Full Sub-15 A roster (22 players), mesocycle calendar, microcycle sessions with drill previews,
              physical tests and cross-module navigation. This is how coaches and directors actually use DEPRO day to day.
            </p>
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
          <p className="text-center text-xs text-gray-500 mt-6">
            Branded preview · {EXAMPLE_CLUB.name} · corporate green theme
          </p>
        </div>
      </section>

      {/* Club ROI */}
      <section id="roi" className="py-20 bg-gray-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Return on investment</p>
            <h2 className="text-3xl md:text-4xl font-black mb-4">What clubs actually gain</h2>
            <p className="text-gray-600 leading-relaxed">
              DEPRO is not just software — it replaces hours of manual planning, reduces preventable injuries,
              and gives directors a retention tool parents understand. Adjust the sliders to model your academy.
            </p>
          </div>
          <ClubROICalculator />
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="py-20 bg-gray-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Implementation</p>
            <h2 className="text-3xl md:text-4xl font-black mb-4">Live in 3 weeks. Not 3 months.</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {WORKFLOW.map((w) => (
              <div key={w.step} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="text-3xl font-black text-blue-100 mb-2">{w.step}</div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 mb-2">
                  <Clock size={12} /> {w.time}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{w.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>

          {/* Comparison table */}
          <div className="mt-16 rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-black text-gray-900">Why clubs switch from spreadsheets</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="px-6 py-3 text-xs font-bold text-gray-400 uppercase">Capability</th>
                    <th className="px-4 py-3 text-xs font-bold text-blue-600 uppercase text-center">DEPRO</th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase text-center">Spreadsheets</th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase text-center">Generic apps</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map((row) => (
                    <tr key={row.feature} className="border-b border-gray-50">
                      <td className="px-6 py-3 text-gray-700">{row.feature}</td>
                      {["depro", "sheets", "generic"].map((k) => {
                        const val = row[k];
                        return (
                          <td key={k} className="px-4 py-3 text-center">
                            {val === true ? (
                              <CheckCircle2 size={18} className="inline text-green-500" />
                            ) : val === false ? (
                              <span className="text-gray-300">—</span>
                            ) : (
                              <span className="text-xs font-semibold text-amber-600">{val}</span>
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
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Investment</p>
            <h2 className="text-3xl md:text-4xl font-black mb-4">Enterprise-grade. Simple pricing.</h2>
            <p className="text-gray-600">
              One club license covers all teams, coaches and players. The monthly fee includes
              full configuration of every training session across each mesocycle — coaches open the app and it&apos;s ready.
            </p>
          </div>
          <div className="max-w-md mx-auto">
            <div className="rounded-2xl border-2 border-gray-900 bg-white p-8 shadow-lg">
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Club license · annual value</div>
              <div className="mb-1 text-sm text-gray-500">One-time setup — branding, teams & platform onboarding</div>
              <div className="text-5xl font-black text-gray-900 mb-6">{fmtUSD(SETUP_FEE)}</div>
              <div className="border-t border-gray-100 pt-6 mb-6">
                <div className="text-sm text-gray-500 mb-1">Monthly platform license</div>
                <div className="text-4xl font-black text-gray-900">{fmtUSD(MONTHLY_FEE)}<span className="text-base font-semibold text-gray-400">/mo</span></div>
                <div className="text-xs text-gray-400 mt-1">≈ {fmtUSD(MONTHLY_FEE * 12)}/year recurring</div>
                <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-900 leading-relaxed">
                  <strong className="font-bold">Included every month:</strong> DEPRO configures all sessions (A, B, C, D) for every team and category in each mesocycle — microcycles, tasks, loads and PDFs, ready to run.
                </div>
              </div>
              <ul className="space-y-2.5 mb-8 text-sm text-gray-600">
                {[
                  "Full mesocycle training setup — every session configured",
                  "Unlimited teams & coaches",
                  "Full periodization engine",
                  "Physical tests + load suite",
                  "Branded PDF exports",
                  "Onboarding & priority support",
                  "Dedicated success contact",
                ].map((i) => (
                  <li key={i} className="flex gap-2"><CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" />{i}</li>
                ))}
              </ul>
              <a href="mailto:info@depro.es?subject=DEPRO%20US%20Club%20Demo" className="flex items-center justify-center gap-2 w-full py-3.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-bold transition-colors">
                <Mail size={16} /> Request live demo
              </a>
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">Example: {EXAMPLE_CLUB.name} — {fmtUSD(SETUP_FEE)} setup + {fmtUSD(MONTHLY_FEE)}/mo</p>
          </div>
        </div>
      </section>

      {/* Partner */}
      <section id="partner" className="py-20 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Partner program</p>
            <h2 className="text-3xl md:text-4xl font-black mb-4">Your commission calculator</h2>
            <p className="text-gray-600 leading-relaxed">
              Close a club at {fmtUSD(SETUP_FEE)} setup + {fmtUSD(MONTHLY_FEE)}/mo and earn <strong>10%</strong> on both —
              {fmtUSD(SETUP_FEE * COMMISSION_RATE)} upfront plus {fmtUSD(MONTHLY_FEE * COMMISSION_RATE)}/month recurring per club.
            </p>
          </div>
          <PartnerCalculator />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-black mb-8 text-center">Common questions</h2>
          <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {FAQ.map((f) => (
              <div key={f.q} className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-bold text-gray-900 text-sm mb-2">{f.q}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <BarChart3 size={36} className="mx-auto text-blue-600 mb-4" />
          <h2 className="text-2xl md:text-3xl font-black mb-3">Ready for your next club meeting?</h2>
          <p className="text-gray-500 mb-8">Share this page. Run the demo. Close the deal.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="mailto:info@depro.es?subject=DEPRO%20US%20Partnership" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-lg">
              Partner with DEPRO
            </a>
            <Link to="/" className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg border border-gray-300 text-gray-600 font-bold hover:border-gray-400">
              depro.es
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-gray-100 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} DEPRO · Confidential partner presentation · /us-clubs
      </footer>
    </div>
  );
}
