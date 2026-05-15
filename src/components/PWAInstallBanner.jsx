import { useState, useEffect } from "react";
import { X, Share, Plus } from "lucide-react";

/* Detecta iOS */
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}
/* Detecta si ya está instalada como app */
function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;
}

export default function PWAInstallBanner() {
  const [showAndroid, setShowAndroid] = useState(false); // prompt nativo Android/Chrome
  const [showIOS, setShowIOS]         = useState(false); // instrucciones manuales iOS
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [dismissed, setDismissed]     = useState(false);

  useEffect(() => {
    // No mostrar si ya está instalada o el usuario ya la descartó esta sesión
    if (isStandalone()) return;
    if (sessionStorage.getItem("pwa_dismissed")) return;

    // Android / Chrome: escuchar el evento beforeinstallprompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Solo mostrar en móvil
      if (window.innerWidth <= 768) {
        setTimeout(() => setShowAndroid(true), 3000);
      }
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS Safari: mostrar banner de instrucciones
    if (isIOS() && window.innerWidth <= 768) {
      setTimeout(() => setShowIOS(true), 3000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleDismiss = () => {
    setShowAndroid(false);
    setShowIOS(false);
    setDismissed(true);
    sessionStorage.setItem("pwa_dismissed", "1");
  };

  const handleInstallAndroid = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowAndroid(false);
    if (outcome === "accepted") sessionStorage.setItem("pwa_dismissed", "1");
  };

  if (dismissed) return null;

  /* ── Banner Android/Chrome ── */
  if (showAndroid) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
        <div className="bg-[#1A1A2E] rounded-2xl shadow-2xl overflow-hidden border border-white/10">
          <div className="flex items-center gap-4 px-4 py-4">
            {/* Logo */}
            <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-white/20 bg-white/10 flex items-center justify-center">
              <img src="/icons/icon-192.png" alt="DEPRO" className="w-full h-full object-cover" />
            </div>
            {/* Texto */}
            <div className="flex-1 min-w-0">
              <div className="font-black text-white text-base leading-tight">Añadir DEPRO a tu pantalla</div>
              <div className="text-white/60 text-xs mt-0.5">Accede como una app, sin navegador</div>
            </div>
            {/* Cerrar */}
            <button onClick={handleDismiss} className="text-white/40 hover:text-white/80 p-1 flex-shrink-0">
              <X size={18} />
            </button>
          </div>
          <div className="px-4 pb-4">
            <button onClick={handleInstallAndroid}
              className="w-full py-3 rounded-xl font-bold text-sm text-[#1A1A2E] bg-white hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
              <Plus size={16} /> Instalar app
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Banner iOS Safari ── */
  if (showIOS) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
        <div className="bg-[#1A1A2E] rounded-2xl shadow-2xl overflow-hidden border border-white/10">
          {/* Cabecera */}
          <div className="flex items-center gap-4 px-4 pt-4 pb-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-white/20">
              <img src="/icons/icon-192.png" alt="DEPRO" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="font-black text-white text-base leading-tight">Añadir DEPRO a tu pantalla</div>
              <div className="text-white/60 text-xs mt-0.5">2 pasos para instalarlo como app</div>
            </div>
            <button onClick={handleDismiss} className="text-white/40 hover:text-white/80 p-1 flex-shrink-0">
              <X size={18} />
            </button>
          </div>

          {/* Instrucciones */}
          <div className="px-4 pb-4 space-y-2">
            <div className="flex items-center gap-3 bg-white/10 rounded-xl px-3 py-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                <span className="text-white/80 font-black text-xs">1</span>
              </div>
              <div className="text-white/80 text-sm flex-1">
                Pulsa el botón <Share size={13} className="inline mx-0.5 text-white" /> <strong className="text-white">Compartir</strong> en Safari
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 rounded-xl px-3 py-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                <span className="text-white/80 font-black text-xs">2</span>
              </div>
              <div className="text-white/80 text-sm flex-1">
                Selecciona <Plus size={13} className="inline mx-0.5 text-white" /> <strong className="text-white">Añadir a pantalla de inicio</strong>
              </div>
            </div>
          </div>

          {/* Flecha apuntando a la barra de Safari */}
          <div className="flex justify-center pb-3">
            <div className="flex flex-col items-center gap-1 text-white/40">
              <div className="text-[10px] font-medium">Barra de herramientas de Safari</div>
              <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
                <path d="M10 12 L0 0 L20 0 Z" fill="currentColor" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
