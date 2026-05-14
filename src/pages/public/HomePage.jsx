import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight, CheckCircle, Star, Users, User, Zap, BarChart3,
  Calendar, Shield, Trophy, Play, Target, Activity, Flame,
  Layers, Dumbbell, Wind,
} from "lucide-react";

/* ─────────────────────────────────────────────
   HERO
───────────────────────────────────────────── */
function Hero() {
  const { t } = useTranslation();
  return (
    <section className="relative min-h-[100svh] flex items-end overflow-hidden bg-depro-dark">
      <div className="absolute inset-0 overflow-hidden">
        <img src="/foto5.jpg" alt="DEPRO Training" className="w-full h-full object-cover object-center hero-zoom" />
        <div className="absolute inset-0 bg-gradient-to-t from-depro-dark via-depro-dark/60 to-depro-dark/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-depro-dark/80 via-depro-dark/30 to-transparent" />
      </div>
      <div className="absolute top-0 left-0 right-0 h-1 bg-animated" />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { left: "10%", top: "20%", delay: "0s", size: "3px" },
          { left: "25%", top: "60%", delay: "1s", size: "4px" },
          { left: "70%", top: "30%", delay: "0.5s", size: "3px" },
          { left: "85%", top: "70%", delay: "1.5s", size: "5px" },
          { left: "45%", top: "45%", delay: "2s", size: "3px" },
        ].map((p, i) => (
          <div key={i} className="absolute rounded-full bg-white/20 animate-float-slow"
            style={{ left: p.left, top: p.top, animationDelay: p.delay, width: p.size, height: p.size }} />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-32">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-8 animate-in">
            <span className="w-2.5 h-2.5 bg-depro-red rounded-sm flex-shrink-0 animate-glow" />
            <span className="text-xs font-bold uppercase tracking-widest text-white/70">
              {t("home.hero_label")}
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl xl:text-8xl font-black tracking-tight leading-[0.95] mb-6 animate-in-delay-1">
            <span className="text-white">{t("home.hero_title_1")}</span><br />
            <span className="text-depro-blue">{t("home.hero_title_highlight")}</span><br />
            <span className="text-white">{t("home.hero_title_2")}</span>
          </h1>

          <div className="h-1 bg-depro-blue rounded-full mb-6 animate-draw" style={{ maxWidth: "280px" }} />

          <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-xl mb-10 animate-in-delay-2">
            {t("home.hero_subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-16 animate-in-delay-3">
            <a href="#precios" className="group relative overflow-hidden bg-depro-blue hover:bg-depro-blue-dark text-white font-bold px-8 py-4 rounded-xl text-base transition-all flex items-center justify-center gap-2 shadow-depro-lg">
              <span className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
              <User size={18} /> {t("home.hero_btn_player")}
            </a>
            <a href="#contacto" className="border-2 border-white/30 hover:border-white text-white font-bold px-8 py-4 rounded-xl text-base transition-all flex items-center justify-center gap-2 hover:bg-white/10 backdrop-blur-sm">
              <Users size={18} /> {t("home.hero_btn_club")}
            </a>
          </div>

          <div className="flex items-center gap-8 animate-in-delay-4">
            {[
              { val: "150+", key: "hero_stat_players" },
              { val: "12+",  key: "hero_stat_clubs" },
              { val: "97%",  key: "hero_stat_retention" },
            ].map((s, i) => (
              <div key={s.key} className="flex items-center gap-4">
                {i > 0 && <div className="w-px h-8 bg-white/20" />}
                <div>
                  <div className="text-2xl font-black text-white stat-number">{s.val}</div>
                  <div className="text-xs text-white/50 font-medium">{t(`home.${s.key}`)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 right-6 md:right-12 animate-float bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-4 flex items-center gap-4">
        <div className="w-10 h-10 bg-depro-blue rounded-xl flex items-center justify-center animate-glow flex-shrink-0">
          <Zap size={18} className="text-white" />
        </div>
        <div>
          <div className="text-xs text-white/60">{t("home.hero_plan_activated")}</div>
          <div className="text-sm font-bold text-white">{t("home.hero_sessions_active")}</div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center pt-1.5">
          <div className="w-1 h-2.5 bg-white/60 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   MARQUEE
───────────────────────────────────────────── */
function Marquee() {
  const { t } = useTranslation();
  const items = t("home.marquee_items", { returnObjects: true });
  const doubled = [...items, ...items];
  return (
    <div className="bg-depro-dark py-4 overflow-hidden border-y border-white/5">
      <div className="flex gap-12 marquee-track whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="text-sm font-bold text-white/50 uppercase tracking-wider flex-shrink-0">
            — {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SERVICIOS
───────────────────────────────────────────── */
function Servicios() {
  const { t } = useTranslation();
  const playerFeatures = t("home.player_features", { returnObjects: true });
  const clubFeatures   = t("home.club_features",   { returnObjects: true });

  return (
    <section id="servicios" className="py-24 bg-depro-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="section-label justify-center mb-3">
            <span className="w-2.5 h-2.5 bg-depro-red rounded-sm" />
            {t("home.services_label")}
          </div>
          <h2 className="section-title">{t("home.services_title")}</h2>
          <p className="section-subtitle mx-auto max-w-xl text-center">{t("home.services_subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Jugador */}
          <div id="jugadores" className="bg-white rounded-3xl overflow-hidden shadow-card group hover:shadow-card-hover transition-all">
            <div className="aspect-video overflow-hidden relative">
              <img src="/foto3.jpg" alt="Jugador DEPRO" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-depro-blue/60 to-transparent" />
              <div className="absolute bottom-5 left-5">
                <span className="bg-white text-depro-blue text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
                  {t("home.player_badge")}
                </span>
              </div>
            </div>
            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-depro-blue-light rounded-xl flex items-center justify-center">
                  <User size={20} className="text-depro-blue" />
                </div>
                <h3 className="text-2xl font-black text-depro-dark">{t("home.player_title")}</h3>
              </div>
              <p className="text-depro-gray mb-6 leading-relaxed">{t("home.player_desc")}</p>
              <div className="space-y-2 mb-8">
                {playerFeatures.map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-sm text-depro-gray">
                    <CheckCircle size={14} className="text-depro-blue flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <Link to="/comprar" className="btn-primary flex items-center gap-2 w-full justify-center">
                {t("home.player_cta")} <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Club */}
          <div id="clubs" className="bg-white rounded-3xl overflow-hidden shadow-card group hover:shadow-card-hover transition-all">
            <div className="aspect-video overflow-hidden relative">
              <img src="/foto4.jpg" alt="Club DEPRO" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-depro-dark/60 to-transparent" />
              <div className="absolute bottom-5 left-5">
                <span className="bg-white text-depro-dark text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
                  {t("home.club_badge")}
                </span>
              </div>
            </div>
            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-depro-gray-light rounded-xl flex items-center justify-center">
                  <Users size={20} className="text-depro-dark" />
                </div>
                <h3 className="text-2xl font-black text-depro-dark">{t("home.club_title")}</h3>
              </div>
              <p className="text-depro-gray mb-6 leading-relaxed">{t("home.club_desc")}</p>
              <div className="space-y-3 mb-8">
                {clubFeatures.map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <CheckCircle size={16} className="text-depro-blue flex-shrink-0" />
                    <span className="text-sm text-depro-gray">{f}</span>
                  </div>
                ))}
              </div>
              <a href="#clubs-detail" className="btn-secondary flex items-center gap-2 w-full justify-center">
                {t("home.club_cta")} <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   ZONA JUGADOR — Precios
───────────────────────────────────────────── */
function ZonaJugador() {
  const { t } = useTranslation();
  const blocks = [
    { icon: Flame,  label: t("weekly_plan.warm_up"),    color: "#FB2C39", bg: "#FEE8EA" },
    { icon: Zap,    label: t("weekly_plan.main_block"),  color: "#0A36F7", bg: "#EEF1FF" },
    { icon: Target, label: t("weekly_plan.complementary"), color: "#3BC21D", bg: "#EAF9E6" },
    { icon: Wind,   label: t("weekly_plan.cool_down"),   color: "#6B7280", bg: "#F5F5F5" },
  ];
  const basicFeatures   = t("home.basic_features",   { returnObjects: true });
  const premiumFeatures = t("home.premium_features", { returnObjects: true });

  return (
    <section id="precios" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <div className="section-label mb-3">
            <span className="w-2.5 h-2.5 bg-depro-red rounded-sm" />
            {t("home.pricing_label")}
          </div>
          <h2 className="section-title mb-5">
            {t("home.pricing_title_1")}<br />
            <span className="text-depro-blue">{t("home.pricing_title_2")}</span>
          </h2>
          <p className="text-depro-gray leading-relaxed text-lg">{t("home.pricing_desc")}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-14">
          {blocks.map((b) => (
            <div key={b.label} className="flex items-center gap-3 px-4 py-3 rounded-xl border font-semibold text-sm"
              style={{ borderColor: b.color + "30", backgroundColor: b.bg, color: b.color }}>
              <b.icon size={16} style={{ color: b.color, flexShrink: 0 }} />
              {b.label}
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-4">
          {/* BÁSICO */}
          <div className="relative flex flex-col rounded-3xl border border-depro-border bg-white overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
            <div className="h-1 w-full bg-depro-blue" />
            <div className="flex flex-col flex-1 p-8">
              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-widest text-depro-blue mb-3">{t("home.basic_plan")}</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-5xl font-black text-depro-dark leading-none">{t("home.basic_price")}</span>
                  <span className="text-depro-gray text-sm mb-1">{t("home.basic_period")}</span>
                </div>
                <p className="text-depro-gray text-sm">{t("home.basic_subtext")}</p>
              </div>
              <div className="h-px bg-depro-border mb-6" />
              <ul className="space-y-3 flex-1 mb-8">
                {basicFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-depro-gray">
                    <CheckCircle size={15} className="text-depro-blue mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/comprar?plan=basic" className="w-full bg-depro-blue hover:bg-depro-blue-dark text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors text-sm">
                {t("home.basic_cta")} <ArrowRight size={15} />
              </Link>
              <p className="text-center text-[11px] text-depro-gray mt-3">{t("home.cancel_anytime")}</p>
            </div>
          </div>

          {/* PREMIUM */}
          <div className="relative flex flex-col rounded-3xl border-2 border-depro-blue bg-white overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
            <div className="h-1.5 w-full bg-depro-blue" />
            <div className="absolute top-5 right-5">
              <span className="bg-depro-blue text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wide">
                {t("home.recommended")}
              </span>
            </div>
            <div className="flex flex-col flex-1 p-8">
              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-widest text-depro-blue mb-3">{t("home.premium_plan")}</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-5xl font-black text-depro-dark leading-none">{t("home.premium_price")}</span>
                  <span className="text-depro-gray text-sm mb-1">{t("home.basic_period")}</span>
                </div>
                <p className="text-depro-gray text-sm">{t("home.premium_subtext")}</p>
              </div>
              <div className="h-px bg-depro-border mb-6" />
              <ul className="space-y-3 flex-1 mb-8">
                {premiumFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-depro-gray">
                    <CheckCircle size={15} className="text-depro-blue mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/comprar?plan=premium" className="w-full bg-depro-blue hover:bg-depro-blue-dark text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors text-sm">
                {t("home.premium_cta")} <ArrowRight size={15} />
              </Link>
              <p className="text-center text-[11px] text-depro-gray mt-3">{t("home.cancel_anytime")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   ZONA CLUB
───────────────────────────────────────────── */
function ZonaClub() {
  const { t } = useTranslation();
  const featureIcons = [Shield, Calendar, Play, BarChart3, Target, Users];
  const features = t("home.club_zone_features", { returnObjects: true });

  return (
    <section id="clubs-detail" className="py-24 bg-depro-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div className="order-2 lg:order-1">
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-card-hover aspect-video">
                <img src="/foto5.jpg" alt="Club entrenamiento" className="w-full h-full object-cover" />
              </div>
              <div className="absolute top-5 left-5 bg-white rounded-xl p-4 shadow-card flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-depro-blue flex items-center justify-center text-white font-black text-sm">FC</div>
                <div>
                  <div className="text-xs text-depro-gray">{t("home.club_zone_active")}</div>
                  <div className="text-sm font-bold text-depro-dark">{t("home.club_zone_identity")}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="section-label mb-3">
              <span className="w-2.5 h-2.5 bg-depro-red rounded-sm" />
              {t("home.club_zone_label")}
            </div>
            <h2 className="section-title mb-6">
              {t("home.club_zone_title_1")}<br />
              <span className="text-depro-blue">{t("home.club_zone_title_2")}</span>
            </h2>
            <p className="text-depro-gray leading-relaxed text-lg">{t("home.club_zone_desc")}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => {
            const Icon = featureIcons[i] || Shield;
            return (
              <div key={f.title} className="card group">
                <div className="w-10 h-10 bg-depro-blue-light rounded-xl flex items-center justify-center mb-4 group-hover:bg-depro-blue transition-colors">
                  <Icon size={20} className="text-depro-blue group-hover:text-white transition-colors" />
                </div>
                <h4 className="font-bold text-depro-dark mb-2">{f.title}</h4>
                <p className="text-sm text-depro-gray leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   SOBRE DEPRO
───────────────────────────────────────────── */
function SobreDepro() {
  const { t } = useTranslation();
  const credentials = t("home.about_credentials", { returnObjects: true });

  return (
    <section id="sobre" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="section-label mb-3">
              <span className="w-2.5 h-2.5 bg-depro-red rounded-sm" />
              {t("home.about_label")}
            </div>
            <h2 className="section-title mb-6">
              {t("home.about_title_1")}<br />
              <span className="text-depro-blue">{t("home.about_title_2")}</span>
            </h2>
            <p className="text-depro-gray leading-relaxed text-lg mb-6">{t("home.about_desc_1")}</p>
            <p className="text-depro-gray leading-relaxed mb-8">{t("home.about_desc_2")}</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {credentials.map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-depro-gray">
                  <span className="w-1.5 h-1.5 bg-depro-blue rounded-full flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            <a href="#contacto" className="btn-primary inline-flex items-center gap-2">
              {t("home.about_cta")} <ArrowRight size={16} />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 rounded-2xl overflow-hidden shadow-card aspect-[16/9]">
              <img src="/foto2.jpg" alt="Preparador DEPRO" className="w-full h-full object-cover" />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-card aspect-square">
              <img src="/foto3.jpg" alt="Entrenamiento" className="w-full h-full object-cover" />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-card aspect-square">
              <img src="/foto4.jpg" alt="Preparación física" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   PRUEBA SOCIAL
───────────────────────────────────────────── */
function PruebaSocial() {
  const { t } = useTranslation();
  const testimonios = [
    { nombre: "Alejandro Torres", rol: "Mediocampista · U21", texto: "En 6 meses pasé de U18 a U21. El plan personalizado marcó la diferencia — no es contenido genérico, es un sistema real hecho para mí.", rating: 5, ini: "AT", color: "#0A36F7" },
    { nombre: "FC Almería Juvenil", rol: "Club · U17", texto: "La plataforma con nuestros colores y logo impresionó a los padres desde el primer día. La estructura de sesiones es impecable.", rating: 5, ini: "FA", color: "#FB2C39" },
    { nombre: "Pedro Delgado", rol: "Extremo · 2ª División", texto: "Eliminé mis problemas recurrentes de isquiotibiales con el protocolo de prevención. Y mis métricas de velocidad mejoraron un 15%.", rating: 5, ini: "PD", color: "#3BC21D" },
    { nombre: "Club Deportivo Gijón", rol: "Entrenador Jefe · U19", texto: "La guía técnico-táctica integrada es lo que más valoro. Nuestros asistentes diseñan tareas con criterio metodológico ahora.", rating: 5, ini: "CG", color: "#F6CC12" },
  ];

  return (
    <section className="py-24 bg-depro-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="section-label justify-center mb-3">
            <span className="w-2.5 h-2.5 bg-depro-red rounded-sm" />
            {t("home.results_label")}
          </div>
          <h2 className="section-title">{t("home.results_title")}</h2>
          <p className="section-subtitle mx-auto max-w-xl text-center">{t("home.results_subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {testimonios.map((t_item, idx) => (
            <div key={t_item.nombre} className="card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" style={{ backgroundColor: t_item.color }} />
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-black flex-shrink-0 animate-float"
                  style={{ backgroundColor: t_item.color, animationDelay: `${idx * 0.5}s` }}>
                  {t_item.ini}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-depro-dark">{t_item.nombre}</div>
                  <div className="text-xs text-depro-gray">{t_item.rol}</div>
                  <div className="flex gap-0.5 mt-1">
                    {Array(t_item.rating).fill(0).map((_, i) => (
                      <Star key={i} size={12} className="text-depro-yellow fill-depro-yellow" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-depro-gray text-sm leading-relaxed">"{t_item.texto}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   CÓMO FUNCIONA
───────────────────────────────────────────── */
function ComoFunciona() {
  const { t } = useTranslation();
  const steps = t("home.process_steps", { returnObjects: true });

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="section-label justify-center mb-3">
            <span className="w-2.5 h-2.5 bg-depro-red rounded-sm" />
            {t("home.process_label")}
          </div>
          <h2 className="section-title">{t("home.process_title")}</h2>
        </div>

        <div className="grid sm:grid-cols-5 gap-6 relative">
          <div className="hidden sm:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-depro-border overflow-hidden">
            <div className="h-full bg-depro-blue animate-draw" />
          </div>
          {steps.map((s, i) => (
            <div key={i} className="relative text-center group">
              <div className="w-16 h-16 rounded-2xl bg-depro-blue flex items-center justify-center mx-auto mb-5 shadow-depro relative z-10 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <span className="text-white font-black text-lg">{s.n}</span>
              </div>
              <h3 className="font-bold text-depro-dark mb-2 group-hover:text-depro-blue transition-colors">{s.title}</h3>
              <p className="text-sm text-depro-gray leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border-2 border-depro-blue bg-depro-blue-light p-8 text-center">
          <div className="flex items-center justify-center gap-2 text-depro-blue font-bold text-sm mb-3">
            <Zap size={16} />
            {t("home.methodology_label")}
          </div>
          <h3 className="text-xl font-black text-depro-dark mb-2">{t("home.methodology_title")}</h3>
          <p className="text-depro-gray max-w-xl mx-auto text-sm leading-relaxed">{t("home.methodology_desc")}</p>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   CONTACTO
───────────────────────────────────────────── */
function Contacto() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ nombre: "", email: "", tipo: "", mensaje: "", clubCode: "" });
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e) => { e.preventDefault(); setEnviado(true); };

  return (
    <section id="contacto" className="py-24 bg-depro-dark">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 mb-6">
          <span className="w-2.5 h-2.5 bg-depro-red rounded-sm" />
          <span className="text-xs font-bold uppercase tracking-widest text-depro-yellow">
            {t("home.contact_start_label")}
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
          {t("home.contact_title")}
        </h2>
        <p className="text-gray-400 text-lg mb-12">{t("home.contact_subtitle")}</p>

        {enviado ? (
          <div className="bg-white/10 border border-white/20 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-depro-blue rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{t("home.contact_sent_title")}</h3>
            <p className="text-gray-400">{t("home.contact_sent_desc")}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 text-left shadow-depro-lg">
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-depro-dark mb-1.5">{t("home.contact_full_name")}</label>
                <input type="text" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="admin-input w-full" placeholder={t("home.contact_full_name")} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-depro-dark mb-1.5">{t("home.contact_email_label")}</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="admin-input w-full" placeholder="tu@email.com" />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-depro-dark mb-1.5">{t("home.contact_iam")}</label>
              <select required value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="admin-input w-full">
                <option value="">{t("home.contact_select")}</option>
                <option value="jugador-basic">{t("home.contact_opt_basic")}</option>
                <option value="jugador-premium">{t("home.contact_opt_premium")}</option>
                <option value="club">{t("home.contact_opt_club")}</option>
                <option value="entrenador">{t("home.contact_opt_coach")}</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-depro-dark mb-1.5">{t("home.contact_goal")}</label>
              <textarea required rows={4} value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                className="admin-input w-full resize-none" placeholder={t("home.contact_goal_placeholder")} />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-depro-dark mb-1.5">
                {t("home.contact_club_code_label")} <span className="text-depro-gray font-normal">{t("home.contact_club_code_optional")}</span>
              </label>
              <input type="text" value={form.clubCode} onChange={(e) => setForm({ ...form, clubCode: e.target.value.toUpperCase() })}
                className="admin-input w-full uppercase tracking-wider" placeholder="EJ. DEPRO-FCB-2025" maxLength={32} />
              <p className="text-xs text-depro-gray mt-1.5">{t("home.contact_club_code_hint")}</p>
            </div>
            <button type="submit" className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2">
              {t("home.contact_submit")} <ArrowRight size={18} />
            </button>
            <p className="text-center text-xs text-depro-gray mt-4">{t("home.contact_note")}</p>
          </form>
        )}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-depro-dark border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <img src="/logo blanco.png" alt="DEPRO" className="h-6 w-auto" />
          <div className="text-sm text-gray-500">
            © 2025 DEPRO. {t("home.footer_rights")}
          </div>
          <div className="flex items-center gap-5 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">{t("home.footer_privacy")}</a>
            <a href="#" className="hover:text-white transition-colors">{t("home.footer_terms")}</a>
            <a href="#contacto" className="hover:text-white transition-colors">{t("home.footer_contact")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div className="bg-white">
      <Hero />
      <Marquee />
      <Servicios />
      <ZonaJugador />
      <ZonaClub />
      <SobreDepro />
      <PruebaSocial />
      <ComoFunciona />
      <Contacto />
      <Footer />
    </div>
  );
}
