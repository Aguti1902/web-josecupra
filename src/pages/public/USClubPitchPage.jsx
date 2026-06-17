import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, BarChart3, Calendar, ChevronRight, DollarSign,
  Layers, LineChart, Shield, Sparkles, Target, TrendingUp,
  Users, Zap, Activity, Trophy, CheckCircle2, Menu, X,
} from "lucide-react";

const SETUP_FEE = 15000;
const MONTHLY_FEE = 1500;
const COMMISSION_RATE = 0.1;

const NAV = [
  { id: "vision", label: "Vision" },
  { id: "platform", label: "Platform" },
  { id: "results", label: "Results" },
  { id: "pricing", label: "Pricing" },
  { id: "partner", label: "Partner Earnings" },
];

const FEATURES = [
  {
    id: "sessions",
    icon: Calendar,
    title: "Every session. Planned & branded.",
    headline: "Microcycles, mesocycles & match-day prep — all in one place.",
    bullets: [
      "Weekly training calendar mapped to your real training days",
      "Type A / B / C / D sessions with load logic built in",
      "Club-branded PDF exports for every session",
      "Coaches see exactly what to run — no guesswork",
    ],
    stat: { label: "Hours saved / coach / week", value: "6+" },
    color: "#0A36F7",
  },
  {
    id: "squad",
    icon: Users,
    title: "Full squad intelligence",
    headline: "Roster, roles, filters & player profiles — centralized.",
    bullets: [
      "Complete squad registry with position, age & notes",
      "Manual + registered players in one unified view",
      "Coach panel with team-level visibility",
      "Multi-team support for academies & coordinators",
    ],
    stat: { label: "Data points / player", value: "40+" },
    color: "#8B5CF6",
  },
  {
    id: "tests",
    icon: Activity,
    title: "Physical testing that actually means something",
    headline: "T1 → T2 → T3 evolution vs team average — automatic.",
    bullets: [
      "Endurance, sprint, COD & CMJ tracked per season",
      "Color-coded ratings vs team average (not arbitrary thresholds)",
      "Sparkline evolution per player across evaluations",
      "Identify who is progressing — and who needs intervention",
    ],
    stat: { label: "Evaluations / season", value: "3×4" },
    color: "#22C55E",
  },
  {
    id: "loads",
    icon: TrendingUp,
    title: "Load monitoring (sRPE science)",
    headline: "Volume × RPE × specificity — weekly traffic lights.",
    bullets: [
      "Team & individual load tracking per session",
      "Scientific sRPE-based classification",
      "Monthly load calendar for periodization review",
      "Prevent overload before it becomes injury",
    ],
    stat: { label: "Sessions tracked / week", value: "4+" },
    color: "#F59E0B",
  },
];

const PROOF_STATS = [
  { value: "100%", label: "White-label — your logo, your colors" },
  { value: "3", label: "Age blocks from U9 to U19" },
  { value: "24/7", label: "Cloud access for all staff" },
  { value: "97%", label: "Platform retention target" },
];

function fmtUSD(n) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function PartnerCalculator() {
  const [clubs, setClubs] = useState(3);
  const [months, setMonths] = useState(12);

  const calc = useMemo(() => {
    const setupComm = SETUP_FEE * COMMISSION_RATE;
    const monthlyComm = MONTHLY_FEE * COMMISSION_RATE;
    const oneTime = setupComm * clubs;
    const recurringPerMonth = monthlyComm * clubs;
    const recurringTotal = recurringPerMonth * months;
    const yearOne = oneTime + recurringTotal;
    return { setupComm, monthlyComm, oneTime, recurringPerMonth, recurringTotal, yearOne };
  }, [clubs, months]);

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      <div className="space-y-8">
        <div>
          <label className="flex justify-between text-sm font-bold text-white/80 mb-3">
            <span>Clubs closed</span>
            <span className="text-white font-black text-lg">{clubs}</span>
          </label>
          <input
            type="range"
            min={1}
            max={24}
            value={clubs}
            onChange={(e) => setClubs(Number(e.target.value))}
            className="w-full accent-emerald-400 h-2 rounded-full cursor-pointer"
          />
          <div className="flex justify-between text-xs text-white/40 mt-1">
            <span>1 club</span>
            <span>24 clubs / year</span>
          </div>
        </div>
        <div>
          <label className="flex justify-between text-sm font-bold text-white/80 mb-3">
            <span>Recurring commission horizon</span>
            <span className="text-white font-black text-lg">{months} mo</span>
          </label>
          <input
            type="range"
            min={1}
            max={36}
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="w-full accent-emerald-400 h-2 rounded-full cursor-pointer"
          />
        </div>
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-sm text-white/70 space-y-2">
          <p><strong className="text-white">10% partner commission</strong> on every deal you close:</p>
          <ul className="space-y-1 pl-4 list-disc marker:text-emerald-400">
            <li>{fmtUSD(calc.setupComm)} one-time per club ({fmtUSD(SETUP_FEE)} setup)</li>
            <li>{fmtUSD(calc.monthlyComm)}/month per club ({fmtUSD(MONTHLY_FEE)} subscription)</li>
          </ul>
        </div>
      </div>

      <div className="space-y-4">
        {[
          { label: "One-time setup commissions", value: calc.oneTime, accent: "text-emerald-300" },
          { label: `Recurring (${months} months)`, value: calc.recurringTotal, accent: "text-sky-300" },
          { label: "Total partner earnings", value: calc.yearOne, accent: "text-white", big: true },
        ].map((row) => (
          <div
            key={row.label}
            className={`rounded-2xl border border-white/10 p-5 ${row.big ? "bg-gradient-to-br from-emerald-500/20 to-sky-500/10" : "bg-white/5"}`}
          >
            <div className="text-xs font-bold uppercase tracking-wider text-white/50 mb-1">{row.label}</div>
            <div className={`font-black stat-number ${row.big ? "text-4xl md:text-5xl" : "text-2xl md:text-3xl"} ${row.accent}`}>
              {fmtUSD(row.value)}
            </div>
            {row.big && (
              <div className="text-sm text-white/60 mt-2">
                + {fmtUSD(calc.recurringPerMonth)}/mo ongoing while clubs stay active
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function MockChart({ active }) {
  const bars = [42, 55, 48, 62, 58, 71, 68, 78, 74, 85];
  return (
    <div className="rounded-2xl bg-depro-dark p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-white/40">Team evolution</div>
          <div className="text-white font-bold">Sprint 30m · season avg</div>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-500/20 text-green-400">
          ↑ 8.2% vs T1
        </span>
      </div>
      <div className="flex items-end gap-2 h-32">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-md transition-all duration-500"
            style={{
              height: `${h}%`,
              backgroundColor: active ? "#22C55E" : "#0A36F7",
              opacity: i === bars.length - 1 ? 1 : 0.35 + (i / bars.length) * 0.5,
            }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-3 text-[10px] text-white/30 font-bold">
        {["T1 W1", "T1 W4", "T2 W1", "T2 W4", "T3 W1", "T3 W4", "Playoffs", "Final", "Now", "Proj"].map((l) => (
          <span key={l} className="hidden sm:inline">{l}</span>
        ))}
      </div>
    </div>
  );
}

export default function USClubPitchPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(FEATURES[0].id);
  const [scrolled, setScrolled] = useState(false);

  const feature = FEATURES.find((f) => f.id === activeFeature) || FEATURES[0];
  const FeatureIcon = feature.icon;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white overflow-x-hidden">
      {/* Nav */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#050816]/90 backdrop-blur-xl border-b border-white/10" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo blanco.png" alt="DEPRO" className="h-6 w-auto" />
            <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest text-white/40">Club OS · US</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => scrollTo(n.id)}
                className="px-3 py-2 text-xs font-bold text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                {n.label}
              </button>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => scrollTo("partner")}
            className="hidden sm:flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs px-4 py-2 rounded-full transition-colors"
          >
            Partner calc <ChevronRight size={14} />
          </button>
          <button type="button" className="md:hidden p-2 text-white/70" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#050816] px-4 py-3 space-y-1">
            {NAV.map((n) => (
              <button key={n.id} type="button" onClick={() => scrollTo(n.id)} className="block w-full text-left py-2.5 text-sm font-semibold text-white/70">
                {n.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="vision" className="relative min-h-[100svh] flex items-center pt-20">
        <div className="absolute inset-0">
          <img src="/foto5.jpg" alt="" className="w-full h-full object-cover opacity-30 hero-zoom" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050816] via-[#050816]/80 to-[#050816]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A36F7]/20 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-8 animate-in">
              <Sparkles size={14} /> Revolutionary club performance OS
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] mb-6 animate-in-delay-1">
              Own your club&apos;s<br />
              <span className="text-shimmer">entire performance stack.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed mb-10 animate-in-delay-2">
              DEPRO gives US clubs a private, branded platform — every training session,
              every player stat, every physical test, every load metric — so coaches
              coach and directors see real evolution.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 animate-in-delay-3">
              <button type="button" onClick={() => scrollTo("platform")} className="inline-flex items-center justify-center gap-2 bg-depro-blue hover:bg-blue-600 text-white font-bold px-8 py-4 rounded-xl transition-colors">
                Explore the platform <ArrowRight size={18} />
              </button>
              <button type="button" onClick={() => scrollTo("pricing")} className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 text-white font-bold px-8 py-4 rounded-xl transition-colors">
                View pricing
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 animate-in-delay-4">
            {PROOF_STATS.map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-sm">
                <div className="text-2xl md:text-3xl font-black text-white stat-number">{s.value}</div>
                <div className="text-xs text-white/50 mt-1 leading-snug">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem → Solution */}
      <section className="py-24 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-red-400 mb-4 block">The problem</span>
              <h2 className="text-3xl md:text-4xl font-black mb-6">Clubs are drowning in spreadsheets, PDFs & WhatsApp.</h2>
              <ul className="space-y-4 text-white/60">
                {[
                  "Training plans live in 5 different places — none connected to results",
                  "Physical data is collected once a year and never compared to the team",
                  "Coaches can't see load vs performance — injuries feel random",
                  "Directors have zero dashboard to prove development to parents & sponsors",
                ].map((t) => (
                  <li key={t} className="flex gap-3">
                    <span className="text-red-400 flex-shrink-0 mt-0.5">✕</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4 block">The DEPRO answer</span>
              <h2 className="text-3xl md:text-4xl font-black mb-6">One platform. Your brand. Total visibility.</h2>
              <ul className="space-y-4">
                {[
                  "Periodized micro & meso cycles delivered to coaches automatically",
                  "Player tests rated vs team average — evolution visible in 3 clicks",
                  "Load monitoring with scientific sRPE classification",
                  "White-label: your logo, colors & identity on every screen & PDF",
                ].map((t) => (
                  <li key={t} className="flex gap-3 text-white/80">
                    <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive platform */}
      <section id="platform" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-depro-blue mb-3 block">Interactive walkthrough</span>
            <h2 className="text-4xl md:text-5xl font-black mb-4">Click each module. See what clubs get.</h2>
            <p className="text-white/50">Built for academy directors, technical coordinators & head coaches.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              const active = f.id === activeFeature;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFeature(f.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold border transition-all ${
                    active
                      ? "bg-white text-black border-white shadow-lg scale-105"
                      : "bg-white/5 text-white/60 border-white/10 hover:border-white/30"
                  }`}
                >
                  <Icon size={16} /> {f.title.split(".")[0]}
                </button>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-stretch">
            <div
              className="rounded-3xl border border-white/10 p-8 flex flex-col transition-all duration-300"
              style={{ background: `linear-gradient(135deg, ${feature.color}18, transparent)` }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: feature.color + "30" }}>
                <FeatureIcon size={24} style={{ color: feature.color }} />
              </div>
              <h3 className="text-2xl md:text-3xl font-black mb-3">{feature.headline}</h3>
              <ul className="space-y-3 flex-1">
                {feature.bullets.map((b) => (
                  <li key={b} className="flex gap-2 text-white/70 text-sm">
                    <ChevronRight size={16} className="flex-shrink-0 mt-0.5" style={{ color: feature.color }} />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-6 border-t border-white/10 flex items-end justify-between">
                <div>
                  <div className="text-xs text-white/40 uppercase font-bold tracking-wider">{feature.stat.label}</div>
                  <div className="text-4xl font-black stat-number" style={{ color: feature.color }}>{feature.stat.value}</div>
                </div>
                <Trophy size={40} className="text-white/10" />
              </div>
            </div>
            <MockChart active={activeFeature === "tests"} />
          </div>
        </div>
      </section>

      {/* Results */}
      <section id="results" className="py-24 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: LineChart, title: "See evolution", desc: "Track every player across T1, T2, T3 vs the team average — green, yellow, red automatically." },
              { icon: Shield, title: "Your brand", desc: "Logo, primary & secondary colors on dashboard, sessions & PDF exports. Parents see YOUR club." },
              { icon: Layers, title: "All age groups", desc: "Block 1 (U9–U12), Block 2 (U13–U15), Block 3 (U16–U19) — content auto-matched to category." },
            ].map((card) => (
              <div key={card.title} className="rounded-2xl bg-white/5 border border-white/10 p-6 hover:border-white/20 transition-colors group">
                <card.icon size={28} className="text-depro-blue mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-black text-xl mb-2">{card.title}</h3>
                <p className="text-sm text-white/55 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-3 block">Investment</span>
            <h2 className="text-4xl md:text-5xl font-black mb-4">Simple, premium pricing.</h2>
            <p className="text-white/50 max-w-xl mx-auto">One setup. One monthly. Full platform ownership under your club brand.</p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="relative rounded-3xl border-2 border-amber-400/50 bg-gradient-to-b from-amber-400/10 to-transparent p-8 md:p-10 overflow-hidden">
              <div className="absolute top-4 right-4 text-xs font-black uppercase tracking-wider bg-amber-400 text-black px-3 py-1 rounded-full">
                Club license
              </div>
              <div className="flex items-center gap-2 text-amber-400 text-sm font-bold mb-6">
                <Zap size={16} /> White-label performance OS
              </div>
              <div className="mb-2">
                <span className="text-white/50 text-sm">Setup (one-time)</span>
                <div className="text-5xl font-black stat-number">{fmtUSD(SETUP_FEE)}</div>
              </div>
              <div className="text-white/30 text-2xl font-light my-4">+</div>
              <div className="mb-8">
                <span className="text-white/50 text-sm">Platform license</span>
                <div className="text-4xl font-black stat-number">{fmtUSD(MONTHLY_FEE)}<span className="text-lg text-white/40 font-bold">/mo</span></div>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-white/70">
                {[
                  "Unlimited coaches & teams within the club",
                  "Full session library + periodization engine",
                  "Physical testing + load monitoring suite",
                  "Branded PDF session exports",
                  "Dedicated onboarding & configuration",
                  "Priority support",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:info@depro.es?subject=DEPRO%20US%20Club%20Demo"
                className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black transition-colors"
              >
                Book a live demo <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Partner calculator */}
      <section id="partner" className="py-24 bg-gradient-to-br from-emerald-950/40 via-[#050816] to-sky-950/30 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12 items-start">
            <div className="lg:col-span-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
                <DollarSign size={14} /> Partner program
              </div>
              <h2 className="text-4xl font-black mb-4">Your earnings calculator.</h2>
              <p className="text-white/55 leading-relaxed mb-6">
                Close club deals in the US market and earn <strong className="text-white">10% commission</strong> on
                setup fees plus <strong className="text-white">10% recurring</strong> on every monthly subscription —
                for as long as the club stays active.
              </p>
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-sm text-white/60">
                <strong className="text-white block mb-1">Example — 1 club closed:</strong>
                {fmtUSD(SETUP_FEE * COMMISSION_RATE)} upfront + {fmtUSD(MONTHLY_FEE * COMMISSION_RATE)}/mo recurring
              </div>
            </div>
            <div className="lg:col-span-3">
              <PartnerCalculator />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-white/10">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <BarChart3 size={40} className="mx-auto text-depro-blue mb-6" />
          <h2 className="text-3xl md:text-4xl font-black mb-4">Ready to show this to your next club?</h2>
          <p className="text-white/50 mb-8">
            DEPRO is live, battle-tested in European academies, and ready for US expansion.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="mailto:info@depro.es?subject=DEPRO%20US%20Partnership" className="btn-primary px-8 py-4 rounded-xl font-bold">
              Partner with DEPRO
            </a>
            <Link to="/" className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-white/20 text-white/70 hover:text-white font-bold transition-colors">
              depro.es
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-white/5 text-center text-xs text-white/30">
        © {new Date().getFullYear()} DEPRO · Club Performance OS · Confidential partner deck
      </footer>
    </div>
  );
}
