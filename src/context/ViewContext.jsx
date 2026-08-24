import { createContext, useContext, useState } from "react";
import { useAuth } from "./AuthContext";
import { isProCoachUser } from "../lib/clubAuto/clubAutoCoachBridge";

const ViewContext = createContext({ viewingTeam: null, setViewingTeam: () => {} });

export function useView() { return useContext(ViewContext); }

/** Equipo activo: el que mira el coordinador, el asignado, o el primero en ProCoach. */
export function useActiveTeam() {
  const { user } = useAuth();
  const { viewingTeam } = useView();
  if (viewingTeam) return viewingTeam;
  if (user?.team) return user.team;
  const teams = user?.club?.teams || [];
  if (isProCoachUser(user) && teams.length) return teams[0];
  return null;
}

/** El coordinador, al entrar en un equipo, edita igual que el entrenador. */
export function useIsReadOnly() {
  return false;
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
