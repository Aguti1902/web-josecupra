import { useState } from "react";
import {
  ChevronRight,
  Play,
  Star,
  Users,
  Target,
  Award,
  ArrowRight,
  CheckCircle,
  Calendar,
  BarChart3,
  Shield,
  Zap,
  Trophy,
  Clock,
  User,
  Building2,
  ChevronDown,
} from "lucide-react";
import { testimonials } from "../../data/mockData";

/* ── HERO ─────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-950 to-gray-950" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-600/8 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-pitch-600/6 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 px-4 py-1.5 rounded-full text-sm font-semibold mb-8 animate-fade-in">
          <Zap size={14} />
          Elite Football Training Systems
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-[1.05] animate-slide-up">
          Professional football
          <br />
          <span className="text-gradient">training systems</span>
          <br />
          for coaches & clubs
        </h1>

        <p className="mt-8 text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
          Methodology · Planning · Real performance.
          <br />
          <span className="text-gray-300">We manage your training like an external staff.</span>
        </p>

        {/* CTA Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#services" className="group btn-primary px-8 py-4 text-base flex items-center gap-2">
            <Building2 size={18} />
            For Clubs
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
          <a href="#services" className="group btn-secondary px-8 py-4 text-base flex items-center gap-2">
            <User size={18} />
            For Players
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { value: "150+", label: "Players trained" },
            { value: "12+", label: "Partner clubs" },
            { value: "8", label: "Years experience" },
            { value: "97%", label: "Retention rate" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl md:text-4xl font-black text-white">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div className="mt-16 flex justify-center animate-bounce">
          <ChevronDown size={24} className="text-gray-600" />
        </div>
      </div>
    </section>
  );
}

/* ── SERVICES ─────────────────────────────────────────────────── */
function Services() {
  const [active, setActive] = useState("clubs");

  const services = {
    clubs: {
      icon: Building2,
      color: "brand",
      headline: "For Clubs",
      tagline: "Complete management of your training department",
      items: [
        {
          icon: Calendar,
          title: "Annual Planning",
          desc: "Full season periodization. Pre-season, competitive, and transition blocks designed for your squad.",
        },
        {
          icon: Target,
          title: "Structured Sessions",
          desc: "Every session scripted with objectives, exercises, timing, and coaching cues. Ready to deliver.",
        },
        {
          icon: Users,
          title: "Individual Programs",
          desc: "Each player gets a personalized development plan inside the team structure.",
        },
        {
          icon: BarChart3,
          title: "Performance Tracking",
          desc: "Weekly reviews, load monitoring, and adjustment of training based on real data.",
        },
        {
          icon: Shield,
          title: "Accompaniment",
          desc: "Ongoing coach consultation. We adapt in real-time to your results and needs.",
        },
      ],
    },
    players: {
      icon: User,
      color: "pitch",
      headline: "For Players",
      tagline: "Individual development system to reach your potential",
      items: [
        {
          icon: Zap,
          title: "Individual Technique",
          desc: "Passing, control, finishing — broken down and rebuilt with precision. Video + PDF resources.",
        },
        {
          icon: Trophy,
          title: "Physical Preparation",
          desc: "Speed, coordination, injury prevention. Built around your position and playing calendar.",
        },
        {
          icon: Target,
          title: "Specific Programs",
          desc: "Tailored to your age, level, and objective. Whether you're going pro or playing weekly 5-a-side.",
        },
        {
          icon: Calendar,
          title: "Weekly Structure",
          desc: "Day-by-day sessions with clear objectives. You always know what to train and why.",
        },
        {
          icon: BarChart3,
          title: "Progress Reviews",
          desc: "Regular feedback from your personal coach. Adjustments based on your development.",
        },
      ],
    },
  };

  const s = services[active];
  const Icon = s.icon;

  return (
    <section id="services" className="py-24 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="badge bg-white/5 border border-white/10 text-gray-400 mb-4">
            <Target size={12} />
            Services
          </div>
          <h2 className="section-title">Built for those who are serious</h2>
          <p className="section-subtitle mx-auto text-center">
            Two distinct systems. Both with one goal: real improvement.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-1.5 flex gap-1">
            {[
              { key: "clubs", label: "For Clubs", icon: Building2 },
              { key: "players", label: "For Players", icon: User },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActive(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  active === tab.key
                    ? "bg-brand-500 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left headline */}
          <div className="lg:col-span-2 flex flex-col justify-center">
            <div className="w-14 h-14 bg-brand-500/10 border border-brand-500/20 rounded-2xl flex items-center justify-center mb-6">
              <Icon size={28} className="text-brand-400" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-3">{s.headline}</h3>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">{s.tagline}</p>
            <a href="#cta" className="btn-primary inline-flex items-center gap-2 w-fit">
              Book a Call
              <ArrowRight size={16} />
            </a>
          </div>

          {/* Right grid */}
          <div className="lg:col-span-3 grid sm:grid-cols-2 gap-4">
            {s.items.map((item, i) => (
              <div key={i} className={`card group ${i === 4 ? "sm:col-span-2" : ""}`}>
                <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-500/20 transition-colors">
                  <item.icon size={20} className="text-brand-400" />
                </div>
                <h4 className="font-semibold text-white mb-2">{item.title}</h4>
                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── ABOUT ────────────────────────────────────────────────────── */
function About() {
  return (
    <section id="about" className="py-24 bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image side */}
          <div className="relative">
            <div className="aspect-[4/5] rounded-3xl bg-gradient-to-br from-brand-900/30 to-gray-900 border border-white/10 overflow-hidden flex items-end">
              {/* Placeholder photo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-brand-500 to-pitch-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-5xl font-black text-white">J</span>
                  </div>
                  <p className="text-gray-600 text-sm">[ Your photo here ]</p>
                </div>
              </div>
              {/* Floating card */}
              <div className="absolute bottom-6 left-6 right-6 bg-glass rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pitch-500/20 rounded-xl flex items-center justify-center">
                    <Trophy size={20} className="text-pitch-400" />
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">8+ Years on the pitch</div>
                    <div className="text-gray-400 text-xs">Real experience, not theory</div>
                  </div>
                </div>
              </div>
            </div>
            {/* Badge */}
            <div className="absolute -top-6 -right-6 bg-brand-500 rounded-2xl px-5 py-3 shadow-xl shadow-brand-500/30">
              <div className="text-white font-black text-2xl">150+</div>
              <div className="text-brand-100 text-xs font-medium">Players trained</div>
            </div>
          </div>

          {/* Text side */}
          <div>
            <div className="badge bg-white/5 border border-white/10 text-gray-400 mb-6">
              <User size={12} />
              About the Coach
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              I've been where
              <br />
              <span className="text-gradient">your players are.</span>
            </h2>
            <p className="text-gray-400 leading-relaxed mb-6 text-lg">
              I'm Jose. Former semi-professional footballer, now dedicated to building the systems 
              that I wish I had access to when I was developing.
            </p>
            <p className="text-gray-400 leading-relaxed mb-8">
              After 8 years playing and coaching at semi-professional and youth level across Spain, 
              I saw the same problem everywhere: talented players and coaches with no real structure, 
              no methodology, no professional support system. That's what I built.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                "UEFA B License",
                "Physical prep certified",
                "8 years playing",
                "150+ players coached",
                "12 partner clubs",
                "Spain & international",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle size={16} className="text-pitch-400 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <a href="#cta" className="btn-primary inline-flex items-center gap-2">
              Work with me
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── PROOF ────────────────────────────────────────────────────── */
function SocialProof() {
  return (
    <section id="proof" className="py-24 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="badge bg-white/5 border border-white/10 text-gray-400 mb-4">
            <Star size={12} />
            Results
          </div>
          <h2 className="section-title">Real players. Real results.</h2>
          <p className="section-subtitle mx-auto text-center">
            Not testimonials from anonymous people. Names, clubs, and verified outcomes.
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {testimonials.map((t, i) => (
            <div key={i} className="card group hover:scale-[1.01] transition-transform">
              <div className="flex items-start gap-4 mb-5">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: t.color + "30", color: t.color }}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="font-semibold text-white">{t.name}</div>
                  <div className="text-sm text-gray-400">{t.role}</div>
                  <div className="text-xs text-gray-500">{t.club}</div>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {Array(t.rating).fill(0).map((_, j) => (
                    <Star key={j} size={14} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed text-sm">"{t.text}"</p>
            </div>
          ))}
        </div>

        {/* Training gallery placeholder */}
        <div className="rounded-3xl border border-white/10 bg-gray-900/50 p-8">
          <h3 className="text-xl font-semibold text-white mb-6 text-center">Training in action</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl bg-gray-800/50 border border-white/5 flex items-center justify-center group hover:border-brand-500/30 transition-colors cursor-pointer"
              >
                <div className="text-center">
                  <Play size={24} className="text-gray-600 group-hover:text-brand-400 transition-colors mx-auto" />
                  <div className="text-xs text-gray-600 mt-2">Video {i + 1}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── HOW IT WORKS ─────────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Apply",
      desc: "Fill in the form. Tell me about you, your level, and what you're chasing.",
      icon: ArrowRight,
    },
    {
      num: "02",
      title: "Discovery Call",
      desc: "30-minute video call. I ask you the right questions — and decide if we're a fit.",
      icon: Clock,
    },
    {
      num: "03",
      title: "Onboarding",
      desc: "You get access to your personalized dashboard. Training starts immediately.",
      icon: Zap,
    },
    {
      num: "04",
      title: "Train & Improve",
      desc: "Weekly programs, feedback, adjustments. You improve. We track it.",
      icon: BarChart3,
    },
  ];

  return (
    <section className="py-24 bg-gray-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="badge bg-white/5 border border-white/10 text-gray-400 mb-4">
            <Zap size={12} />
            Process
          </div>
          <h2 className="section-title">How it works</h2>
          <p className="section-subtitle mx-auto text-center">
            Simple. Deliberate. Every step designed to set you up for success.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-brand-500/30 to-transparent z-0" />
              )}
              <div className="card text-center relative z-10">
                <div className="w-14 h-14 bg-brand-500/10 border border-brand-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-brand-400 font-black text-lg">{step.num}</span>
                </div>
                <h3 className="font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Exclusivity note */}
        <div className="mt-12 bg-brand-500/5 border border-brand-500/20 rounded-2xl p-8 text-center">
          <div className="inline-flex items-center gap-2 text-brand-400 font-semibold text-sm mb-3">
            <Shield size={16} />
            Important
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            Not everyone gets accepted.
          </h3>
          <p className="text-gray-400 max-w-xl mx-auto">
            The discovery call is a filter. I only take on players and clubs I know I can truly help. 
            This keeps the quality of service at the highest level for everyone.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── CTA ──────────────────────────────────────────────────────── */
function CTA() {
  const [form, setForm] = useState({ name: "", email: "", role: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section id="cta" className="py-24 bg-gray-950 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/8 rounded-full blur-3xl" />
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="badge bg-white/5 border border-white/10 text-gray-400 mb-6 mx-auto inline-flex">
          <Calendar size={12} />
          Book a Call
        </div>
        <h2 className="section-title mb-4">Ready to level up?</h2>
        <p className="text-gray-400 text-lg mb-12">
          Fill in the form. I'll review it and reach out within 24 hours to schedule your call.
        </p>

        {sent ? (
          <div className="card text-center py-16">
            <div className="w-16 h-16 bg-pitch-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-pitch-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Application received!</h3>
            <p className="text-gray-400">I'll review it and contact you within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card text-left">
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Full name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors text-sm"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors text-sm"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">I am a...</label>
              <select
                required
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors text-sm"
              >
                <option value="">Select your role</option>
                <option value="player">Player (individual)</option>
                <option value="coach">Coach / Manager</option>
                <option value="club">Club / Academy</option>
                <option value="parent">Parent of a young player</option>
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                What's your main goal?
              </label>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors text-sm resize-none"
                placeholder="Tell me your situation, objectives, and what you're looking for..."
              />
            </div>
            <button type="submit" className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2">
              Send Application
              <ArrowRight size={18} />
            </button>
            <p className="text-center text-xs text-gray-600 mt-4">
              I'll get back to you within 24 hours. All serious inquiries are reviewed personally.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}

/* ── FOOTER ───────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-pitch-500 rounded-xl flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="text-white font-bold">Jose Football</span>
          </div>
          <div className="text-sm text-gray-600">
            © 2025 Jose Football Training Systems. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Terms</a>
            <a href="#cta" className="hover:text-gray-300 transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ── PAGE ─────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div>
      <Hero />
      <Services />
      <About />
      <SocialProof />
      <HowItWorks />
      <CTA />
      <Footer />
    </div>
  );
}
