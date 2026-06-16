import { createContext, useContext, useState } from "react";
import { useAuth } from "./AuthContext";

const ViewContext = createContext({ viewingTeam: null, setViewingTeam: () => {} });

export function useView() { return useContext(ViewContext); }

/** Devuelve el equipo "activo": el equipo visto por el coordinador o el equipo asignado al usuario. */
export function useActiveTeam() {
  const { user } = useAuth();
  const { viewingTeam } = useView();
  return viewingTeam || user?.team || null;
}

/** true si el rol actual es coordinador (no puede editar) */
export function useIsReadOnly() {
  const { user } = useAuth();
  const { viewingTeam } = useView();
  return user?.team_role === "coordinador" && !!viewingTeam;
}

export function ViewProvider({ children }) {
  const [viewingTeam, setViewingTeam] = useState(() => {
    try {
      const raw = sessionStorage.getItem("depro_view_as");
      if (!raw) return null;
      const { team } = JSON.parse(raw);
      sessionStorage.removeItem("depro_view_as");
      return team || null;
    } catch { return null; }
  });
  return (
    <ViewContext.Provider value={{ viewingTeam, setViewingTeam }}>
      {children}
    </ViewContext.Provider>
  );
}
