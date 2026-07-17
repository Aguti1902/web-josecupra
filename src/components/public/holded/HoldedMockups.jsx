import { Link } from "react-router-dom";
import { Check, ArrowUp } from "lucide-react";

/** Mockup principal estilo Holded — sesión / panel DEPRO */
export function HoldedHeroMockup() {
  return (
    <div className="relative w-full max-w-4xl mx-auto mt-12 lg:mt-16">
      <div className="absolute -inset-8 bg-holded-blue/20 rounded-[3rem] blur-3xl opacity-60" aria-hidden="true" />
      <div className="relative bg-[#f8fafc] rounded-2xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-white border-b border-gray-200">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-[11px] font-mono text-gray-400 ml-2 flex-1 text-center">app.depro.es/dashboard/sesion</span>
        </div>
        <div className="flex min-h-[320px]">
          <div className="w-14 bg-[#0a0e17] py-5 flex flex-col items-center gap-4 shrink-0">
            {["▦", "📅", "👥", "📊", "⚡"].map((icon, i) => (
              <div key={i} className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm ${i === 0 ? "bg-holded-blue" : "bg-white/8 text-white/50"}`}>
                {icon}
              </div>
            ))}
          </div>
          <div className="flex-1 flex">
            <div className="flex-1 p-6 bg-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sesión · Microciclo</p>
                  <h3 className="text-xl font-black text-gray-900 mt-0.5">Cadete A · Pretemporada</h3>
                  <p className="text-sm text-gray-500 mt-1">Viernes · Protocolo B · Fuerza-Velocidad</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-depro-blue to-indigo-600 flex items-center justify-center text-white font-black text-lg">D</div>
              </div>
              <div className="space-y-2 mb-4">
                {[
                  { name: "Activación + movilidad", reps: "10 min", done: true },
                  { name: "Salto vertical + sprint 20m", reps: "4×6", done: true },
                  { name: "Fuerza unilateral + core", reps: "3×8", done: false },
                ].map((ex, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center ${ex.done ? "bg-holded-green text-white" : "border-2 border-gray-200"}`}>
                      {ex.done && <Check size={12} strokeWidth={3} />}
                    </div>
                    <span className="text-sm font-medium text-gray-800 flex-1">{ex.name}</span>
                    <span className="text-xs font-bold text-gray-400">{ex.reps}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400">Duración estimada</span>
                <span className="text-lg font-black text-gray-900">52 min</span>
              </div>
            </div>
            <div className="w-56 bg-[#f1f5f9] border-l border-gray-200 p-4 hidden md:block">
              <div className="flex gap-1 mb-4">
                {["General", "Carga", "Historial"].map((t, i) => (
                  <span key={t} className={`text-[10px] font-bold px-2 py-1 rounded-md ${i === 0 ? "bg-gray-900 text-white" : "text-gray-400"}`}>{t}</span>
                ))}
              </div>
              <div className="space-y-3 text-xs">
                <div><p className="text-gray-400 mb-0.5">Equipo</p><p className="font-bold text-gray-800">Cadete A</p></div>
                <div><p className="text-gray-400 mb-0.5">Jugadores</p><p className="font-bold text-gray-800">22 activos</p></div>
                <div><p className="text-gray-400 mb-0.5">Carga media RPE</p><p className="font-bold text-holded-green">6.8 / 10</p></div>
              </div>
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <p className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                  <Check size={10} /> Revisada por IA
                </p>
                <p className="text-[10px] text-emerald-600 mt-0.5">Protocolo validado · 17/07/2026</p>
              </div>
              <div className="mt-4">
                <p className="text-[10px] text-gray-400 mb-1">Adherencia semana</p>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full w-[85%] bg-holded-green rounded-full" />
                </div>
                <p className="text-[10px] font-bold text-gray-600 mt-1">85%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -top-4 -right-4 md:right-8 w-24 h-24 rounded-full bg-holded-dark border-4 border-holded-blue flex flex-col items-center justify-center text-center shadow-xl z-10">
        <Check size={20} className="text-holded-green mb-0.5" strokeWidth={3} />
        <span className="text-[8px] font-bold text-white leading-tight px-2">Planificación IA certificada</span>
      </div>
    </div>
  );
}

/** Mockup ingresos / stats estilo Holded contabilidad */
export function HoldedStatsMockup() {
  const bars = [35, 55, 45, 70, 60, 85, 75, 92];
  return (
    <div className="bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] p-6 w-full max-w-md border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Adherencia · Temporada</p>
          <p className="text-3xl font-black text-gray-900 mt-1">87%</p>
        </div>
        <span className="text-xs font-bold text-holded-green bg-emerald-50 px-2 py-1 rounded-full">↑ 12.4%</span>
      </div>
      <div className="flex items-end gap-1.5 h-28 mb-4">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-holded-green to-emerald-400 opacity-90" style={{ height: `${h}%` }} />
        ))}
      </div>
      {[
        { label: "Sesiones completadas", val: "156" },
        { label: "Tests registrados", val: "48" },
        { label: "Alertas resueltas", val: "12" },
      ].map((r) => (
        <div key={r.label} className="flex items-center justify-between py-2 border-t border-gray-100 text-sm">
          <span className="text-gray-500">{r.label}</span>
          <span className="font-bold text-gray-800">{r.val}</span>
        </div>
      ))}
    </div>
  );
}

/** Mockup bancos / integraciones → clubs conectados */
export function HoldedIntegrationsMockup() {
  const clubs = ["FC Demo", "Academia", "Base", "Juvenil", "Pro", "+50"];
  return (
    <div className="relative w-full max-w-lg">
      <div className="bg-white rounded-2xl shadow-xl p-5 border border-gray-100">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Equipos conectados</p>
        <div className="grid grid-cols-3 gap-2">
          {clubs.map((c) => (
            <div key={c} className="aspect-square rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600 p-2 text-center">
              {c}
            </div>
          ))}
        </div>
      </div>
      <div className="absolute -bottom-6 -right-4 w-52 bg-holded-dark rounded-2xl p-4 shadow-2xl border border-white/10">
        <p className="text-[10px] text-holded-muted mb-1">Carga media hoy</p>
        <p className="text-2xl font-black text-white">6.8</p>
        <div className="h-12 mt-2 flex items-end gap-0.5">
          {[40, 65, 50, 80, 70, 90, 75].map((h, i) => (
            <div key={i} className="flex-1 bg-holded-green/80 rounded-t" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[10px]">
          <span className="text-holded-green">↑ Sesiones 3/3</span>
          <span className="text-holded-muted">RPE ok</span>
        </div>
      </div>
    </div>
  );
}

/** Mockup facturas flotantes → sesiones flotantes */
export function HoldedFloatingCardsMockup() {
  return (
    <div className="relative w-full max-w-md h-72 mx-auto">
      <div className="absolute top-8 left-0 right-8 bg-white rounded-xl shadow-lg p-4 border border-gray-100 transform -rotate-2">
        <p className="text-[10px] text-gray-400 font-bold">SESIÓN S-24011</p>
        <p className="text-lg font-black text-depro-blue mt-1">Fuerza-Velocidad</p>
        <p className="text-xs text-gray-500">Cadete A · 52 min</p>
      </div>
      <div className="absolute top-20 right-0 w-44 bg-white rounded-xl shadow-xl p-4 border border-gray-100 transform rotate-3 z-10">
        <p className="text-[10px] text-gray-400 font-bold">SESIÓN S-24012</p>
        <p className="text-lg font-black text-depro-blue mt-1">Descarga activa</p>
        <p className="text-xs text-gray-500">Juvenil · 45 min</p>
      </div>
      <div className="absolute bottom-0 left-4 right-4 bg-[#f8fafc] rounded-xl border border-gray-200 p-4 shadow-md">
        <div className="grid grid-cols-4 gap-2 text-[9px] font-bold text-gray-400 uppercase mb-2">
          <span>Ejercicio</span><span>Series</span><span>Carga</span><span>Total</span>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="grid grid-cols-4 gap-2 py-1.5 border-t border-gray-100 text-xs text-gray-700">
            <span className="truncate">Ejercicio {i}</span><span>3×8</span><span>Media</span><span className="font-bold">✓</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GoogleIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export function HoldedCheckItem({ children }) {
  return (
    <li className="flex items-start gap-3 text-sm text-holded-muted leading-relaxed">
      <span className="w-5 h-5 rounded-full bg-holded-blue/20 flex items-center justify-center shrink-0 mt-0.5">
        <Check size={12} className="text-holded-blue-light" strokeWidth={3} />
      </span>
      {children}
    </li>
  );
}

export function HoldedFeatureSection({ label, title, desc, bullets, mockup, reverse = false, dark = true, ctaLink = "/funcionalidades", ctaText = "Explorar funcionalidad" }) {
  const bg = dark ? "bg-holded-dark" : "bg-white";
  const titleColor = dark ? "text-white" : "text-gray-900";
  const descColor = dark ? "text-holded-muted" : "text-gray-500";
  const labelColor = dark ? "text-holded-blue-light" : "text-holded-blue";
  const btnClass = dark
    ? "inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-6 py-3 rounded-full text-sm hover:bg-gray-100 transition-colors"
    : "inline-flex items-center gap-2 bg-gray-900 text-white font-bold px-6 py-3 rounded-full text-sm hover:bg-gray-800 transition-colors";

  return (
    <section className={`py-20 md:py-28 ${bg} relative overflow-hidden`}>
      {dark && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-holded-blue/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[80px]" />
        </div>
      )}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {!reverse ? (
            <>
              <div>{mockup}</div>
              <div>
                <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${labelColor}`}>{label}</p>
                <h2 className={`text-3xl md:text-[2.5rem] font-black tracking-tight mb-5 leading-tight ${titleColor}`}>{title}</h2>
                <p className={`leading-relaxed mb-6 ${descColor}`}>{desc}</p>
                <ul className="space-y-4 mb-8">{bullets.map((b) => <HoldedCheckItem key={b}>{b}</HoldedCheckItem>)}</ul>
                <Link to={ctaLink} className={btnClass}>{ctaText} →</Link>
              </div>
            </>
          ) : (
            <>
              <div className="lg:order-2">{mockup}</div>
              <div className="lg:order-1">
                <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${labelColor}`}>{label}</p>
                <h2 className={`text-3xl md:text-[2.5rem] font-black tracking-tight mb-5 leading-tight ${titleColor}`}>{title}</h2>
                <p className={`leading-relaxed mb-6 ${descColor}`}>{desc}</p>
                <ul className="space-y-4 mb-8">{bullets.map((b) => <HoldedCheckItem key={b}>{b}</HoldedCheckItem>)}</ul>
                <Link to={ctaLink} className={btnClass}>{ctaText} →</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export function ScrollToTop() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 left-6 z-40 w-10 h-10 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white/60 hover:text-white hover:bg-white/20 flex items-center justify-center transition-colors hidden md:flex"
      aria-label="Volver arriba"
    >
      <ArrowUp size={18} />
    </button>
  );
}
