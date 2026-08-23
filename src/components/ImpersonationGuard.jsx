import { Component, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getImpersonationSnapshot,
  stopImpersonation,
} from "../lib/adminImpersonation";

function exitToAdmin() {
  stopImpersonation();
  window.location.assign("/admin/users");
}

class ViewAsErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-4">
            <p className="text-lg font-bold text-depro-dark">No se pudo cargar el panel de esta cuenta</p>
            <p className="text-sm text-depro-gray">
              Ha ocurrido un error al mostrar su vista. Vuelve al panel admin para seguir trabajando.
            </p>
            <button
              type="button"
              onClick={exitToAdmin}
              className="px-4 py-2.5 rounded-xl bg-depro-blue text-white text-sm font-bold"
            >
              Volver a admin
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function ImpersonationBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[80] bg-amber-400 text-amber-950 px-4 py-2.5 flex items-center justify-between gap-3 shadow-sm">
      <p className="text-xs sm:text-sm font-semibold truncate">
        Estás viendo el panel de un usuario. Si la pantalla se queda en blanco, pulsa volver.
      </p>
      <button
        type="button"
        onClick={exitToAdmin}
        className="shrink-0 px-3 py-1.5 rounded-lg bg-white text-amber-950 text-xs font-bold hover:bg-amber-50"
      >
        Volver a admin
      </button>
    </div>
  );
}

/** Barra de salida + captura de errores mientras el admin ve el panel de otra cuenta. */
export default function ImpersonationGuard({ children }) {
  const { user } = useAuth();
  const [snap, setSnap] = useState(() => getImpersonationSnapshot());

  useEffect(() => {
    setSnap(getImpersonationSnapshot());
    const onStorage = () => setSnap(getImpersonationSnapshot());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [user?.impersonating]);

  const active = !!(user?.impersonating || snap);
  if (!active) return children;

  return (
    <div className="min-h-screen pt-11">
      <ImpersonationBanner />
      <ViewAsErrorBoundary>
        {children}
      </ViewAsErrorBoundary>
    </div>
  );
}
