import { useTranslation } from "react-i18next";
import { shouldShowTrialWatermark } from "../../lib/subscription";

/**
 * Marca de agua diagonal durante el periodo de prueba.
 * Envuelve el contenido y añade overlay no interactivo.
 */
export default function TrialWatermark({ user, children, className = "" }) {
  const { t } = useTranslation();
  const show = shouldShowTrialWatermark(user);

  if (!show) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative ${className}`}>
      {children}
      <div
        className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[inherit]"
        aria-hidden
      >
        <div className="absolute inset-0 flex flex-wrap content-center justify-center gap-8 opacity-[0.09] rotate-[-24deg] scale-110 select-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="text-2xl md:text-3xl font-black uppercase tracking-widest text-depro-dark whitespace-nowrap"
            >
              {t("trial.watermark")}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
