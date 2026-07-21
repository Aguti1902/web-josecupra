import { createContext, useContext, useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { getTutorialSteps, getTutorialKey } from "../../lib/tutorialSteps";

const TutorialContext = createContext(null);

export function TutorialProvider({ user, children }) {
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const steps = getTutorialSteps(user);

  const start = useCallback(() => {
    setStepIndex(0);
    setActive(true);
  }, []);

  const finish = useCallback(() => {
    const key = getTutorialKey(user);
    if (key) localStorage.setItem(key, "1");
    setActive(false);
    setStepIndex(0);
  }, [user]);

  const skip = finish;

  const next = useCallback(() => {
    if (stepIndex >= steps.length - 1) finish();
    else setStepIndex((i) => i + 1);
  }, [stepIndex, steps.length, finish]);

  const prev = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  // Auto-start first visit
  useEffect(() => {
    if (!user?.id || steps.length === 0) return;
    const key = getTutorialKey(user);
    if (key && !localStorage.getItem(key)) {
      const t = setTimeout(() => setActive(true), 800);
      return () => clearTimeout(t);
    }
  }, [user?.id, steps.length]);

  return (
    <TutorialContext.Provider value={{ active, start, finish, skip, next, prev, stepIndex, steps }}>
      {children}
      {active && steps.length > 0 && (
        <TutorialOverlay
          step={steps[stepIndex]}
          stepIndex={stepIndex}
          total={steps.length}
          onNext={next}
          onPrev={prev}
          onSkip={skip}
        />
      )}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const ctx = useContext(TutorialContext);
  if (!ctx) return { start: () => {}, active: false };
  return ctx;
}

function computeTooltipPosition(step, rect, tooltipSize) {
  const margin = 16;
  const gap = 16;
  const tw = tooltipSize?.width || 340;
  const th = tooltipSize?.height || 280;

  if (step.placement === "center" || step.target === "center" || !rect) {
    return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  }

  const isAiStep = String(step.target || "").includes("ai-assistant");
  const nearBottom = rect.bottom > window.innerHeight - 120;

  // FAB del asistente IA: anclar por bottom/right (sin transform, evita conflicto con animaciones)
  if (isAiStep) {
    const gap = 20;
    const right = Math.max(margin, window.innerWidth - rect.right);
    let bottom = window.innerHeight - rect.top + gap;
    const maxBottom = window.innerHeight - th - margin;
    if (bottom > maxBottom) bottom = maxBottom;
    return { bottom, right, top: "auto", left: "auto" };
  }

  if (nearBottom && step.placement === "top") {
    let left = rect.left + rect.width - tw;
    left = Math.max(margin, Math.min(left, window.innerWidth - tw - margin));
    let bottom = window.innerHeight - rect.top + gap;
    const maxBottom = window.innerHeight - th - margin;
    if (bottom > maxBottom) bottom = maxBottom;
    return { bottom, right: window.innerWidth - left - tw, top: "auto", left: "auto" };
  }

  let top;
  let left;
  let transform;

  switch (step.placement) {
    case "right":
      top = rect.top + rect.height / 2;
      left = rect.left + rect.width + gap;
      transform = "translateY(-50%)";
      break;
    case "left":
      top = rect.top + rect.height / 2;
      left = rect.left - tw - gap;
      transform = "translateY(-50%)";
      break;
    case "bottom":
      top = rect.top + rect.height + gap;
      left = Math.min(rect.left, window.innerWidth - tw - margin);
      break;
    case "top":
      top = rect.top - gap;
      left = Math.min(rect.left, window.innerWidth - tw - margin);
      transform = "translateY(-100%)";
      break;
    default:
      top = rect.top + rect.height + gap;
      left = rect.left;
  }

  // Mantener tooltip dentro del viewport
  if (transform === "translateY(-100%)") {
    if (top - th < margin) top = margin + th;
  } else if (transform === "translateY(-50%)") {
    if (top - th / 2 < margin) {
      top = margin + th / 2;
    } else if (top + th / 2 > window.innerHeight - margin) {
      top = window.innerHeight - margin - th / 2;
    }
  } else {
    if (top + th > window.innerHeight - margin) {
      top = rect.top - gap;
      transform = "translateY(-100%)";
      if (top - th < margin) top = margin + th;
    }
    if (top < margin) top = margin;
  }

  left = Math.max(margin, Math.min(left, window.innerWidth - tw - margin));

  return { top, left, transform };
}

function TutorialOverlay({ step, stepIndex, total, onNext, onPrev, onSkip }) {
  const [rect, setRect] = useState(null);
  const [pos, setPos] = useState({ top: "50%", left: "50%", transform: "translate(-50%, -50%)" });
  const tooltipRef = useRef(null);

  useEffect(() => {
    const update = () => {
      if (step.target === "center") {
        setRect(null);
        return;
      }
      const el = document.querySelector(step.target);
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height, bottom: r.bottom, right: r.right });
      if (!String(step.target || "").includes("ai-assistant")) {
        el.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    const iv = setInterval(update, 300);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      clearInterval(iv);
    };
  }, [step]);

  useLayoutEffect(() => {
    const measure = () => {
      const size = tooltipRef.current
        ? { width: tooltipRef.current.offsetWidth, height: tooltipRef.current.offsetHeight }
        : null;
      setPos(computeTooltipPosition(step, rect, size));
    };
    measure();
    window.addEventListener("resize", measure);
    const ro = tooltipRef.current ? new ResizeObserver(measure) : null;
    if (tooltipRef.current) ro.observe(tooltipRef.current);
    return () => {
      window.removeEventListener("resize", measure);
      ro?.disconnect();
    };
  }, [step, rect, stepIndex]);

  return createPortal(
    <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true">
      {/* Overlay con spotlight */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <mask id="tutorial-spotlight">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={rect.left - 8}
                y={rect.top - 8}
                width={rect.width + 16}
                height={rect.height + 16}
                rx="14"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="rgba(15,23,42,0.72)" mask="url(#tutorial-spotlight)" />
      </svg>

      {/* Ring highlight */}
      {rect && (
        <div
          className="fixed rounded-2xl pointer-events-none ring-2 ring-depro-blue ring-offset-2 ring-offset-transparent shadow-[0_0_0_4px_rgba(10,54,247,0.25)]"
          style={{ top: rect.top - 8, left: rect.left - 8, width: rect.width + 16, height: rect.height + 16 }}
        />
      )}

      {/* Tooltip — contenedor posicionado + tarjeta animada (evita que fade-in-up pise transform) */}
      <div
        className="fixed z-[201] w-[min(340px,calc(100vw-32px))] pointer-events-none"
        style={{
          top: pos.top,
          left: pos.left,
          bottom: pos.bottom,
          right: pos.right,
          ...(pos.transform ? { transform: pos.transform } : {}),
        }}
      >
        <div
          ref={tooltipRef}
          className="bg-white rounded-2xl shadow-2xl border border-depro-border p-5 pointer-events-auto animate-fade-in-up max-h-[min(420px,calc(100vh-120px))] overflow-y-auto"
        >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-depro-blue to-indigo-600 flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-depro-blue">
              Paso {stepIndex + 1} de {total}
            </p>
          </div>
          <button onClick={onSkip} className="p-1.5 text-depro-gray hover:text-depro-dark rounded-lg hover:bg-depro-gray-light">
            <X size={16} />
          </button>
        </div>

        <h3 className="text-lg font-black text-depro-dark mb-2">{step.title}</h3>
        <p className="text-sm text-depro-gray leading-relaxed mb-5">{step.body}</p>

        {/* Progress dots */}
        <div className="flex gap-1 mb-4">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${i <= stepIndex ? "bg-depro-blue" : "bg-depro-border"}`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onSkip}
            className="text-xs font-semibold text-depro-gray hover:text-depro-dark px-2 py-1"
          >
            Saltar tour
          </button>
          <div className="flex gap-2">
            {stepIndex > 0 && (
              <button
                onClick={onPrev}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold border border-depro-border hover:bg-depro-gray-light"
              >
                <ChevronLeft size={16} /> Atrás
              </button>
            )}
            <button
              onClick={onNext}
              className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-bold bg-depro-blue text-white hover:bg-depro-blue-dark shadow-depro"
            >
              {stepIndex >= total - 1 ? "¡Empezar!" : "Siguiente"}
              {stepIndex < total - 1 && <ChevronRight size={16} />}
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
