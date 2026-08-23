import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { clients as initialClients, weeklyPlan as initialPlan } from "../data/mockData";
import { supabase } from "../lib/supabase";
import { loadPlayerPlan, savePlayerPlan, persistPlayerPlanRemote } from "../lib/playerPlanStorage";
import {
  getPlayerFeedback,
  addPlayerFeedback,
  deletePlayerFeedback,
  archivePlayerFeedback as archiveStoredFeedback,
} from "../lib/playerFeedback";

const AdminContext = createContext(null);

function clientInitials(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";
}

/** Convierte un usuario jugador de /api/admin-users al formato de cliente del panel. */
export function mapPlayerToClient(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: "player",
    plan: user.plan || "player-essential",
    billingSource: user.billingSource || null,
    phone: user.phone || user.telefono || null,
    telefono: user.telefono || user.phone || null,
    age: user.edad || user.age || null,
    objective: user.objetivo || (Array.isArray(user.objetivos) ? user.objetivos.join(" + ") : null),
    trainingDays: user.frecuencia || null,
    disponibles: user.disponibles || null,
    diaCompeticion: user.diaCompeticion || null,
    material: user.material || null,
    planPendingManual: !!user.planPendingManual,
    club: {
      name: user.clubName || "Plan individual",
      logo: clientInitials(user.name),
      primaryColor: "#0A36F7",
    },
    joinedDate: user.created_at
      ? new Date(user.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
      : undefined,
    subscriptionStatus: user.subscriptionStatus,
  };
}

function defaultContent() {
  return { videos: [], pdfs: [] };
}

// Initial admin state: one plan per client, content library per client
function buildInitialState() {
  const plans = {};
  const content = {};
  const feedbackMap = {};

  initialClients
    .filter((c) => c.role !== "admin")
    .forEach((c) => {
      plans[c.id] = JSON.parse(JSON.stringify(initialPlan));
      content[c.id] = {
        videos: [
          { id: 1, title: "Sprint Mechanics - Full Breakdown", url: "#", size: "58 MB", uploadedAt: "Apr 16, 2025", session: "Physical Conditioning" },
          { id: 2, title: "Hamstring Prevention Protocol", url: "#", size: "0.8 MB", uploadedAt: "Apr 10, 2025", session: "Prevention" },
        ],
        pdfs: [
          { id: 1, title: "Week 15 - Full Plan PDF", url: "#", size: "1.2 MB", uploadedAt: "Apr 14, 2025" },
          { id: 2, title: "Hamstring Prevention Protocol", url: "#", size: "0.8 MB", uploadedAt: "Apr 10, 2025" },
        ],
      };
      // Sin feedback mock: solo mensajes realmente enviados por el preparador
      feedbackMap[c.id] = [];
    });

  return { plans, content, feedbackMap };
}

const initialState = buildInitialState();

export function AdminProvider({ children }) {
  const [clientPlans, setClientPlans] = useState(initialState.plans);
  const [clientContent, setClientContent] = useState(initialState.content);
  const [clientFeedback, setClientFeedback] = useState(initialState.feedbackMap);
  const [clients, setClients] = useState(
    initialClients.filter((c) => c.role !== "admin")
  );
  const [allUsers, setAllUsers] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);

  const ensureClientAssets = useCallback((clientIds) => {
    if (!clientIds.length) return;
    setClientPlans((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const id of clientIds) {
        const stored = loadPlayerPlan(id);
        if (stored && !stored.planError) {
          if (JSON.stringify(next[id]) !== JSON.stringify(stored)) {
            next[id] = stored;
            changed = true;
          }
        } else if (!next[id]) {
          next[id] = JSON.parse(JSON.stringify(initialPlan));
          changed = true;
        }
      }
      return changed ? next : prev;
    });
    setClientContent((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const id of clientIds) {
        if (!next[id]) {
          next[id] = defaultContent();
          changed = true;
        }
      }
      return changed ? next : prev;
    });
    setClientFeedback((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const id of clientIds) {
        const stored = getPlayerFeedback(id);
        if (JSON.stringify(next[id] || []) !== JSON.stringify(stored)) {
          next[id] = stored;
          changed = true;
        } else if (!next[id]) {
          next[id] = stored;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, []);

  const refreshClients = useCallback(async () => {
    setClientsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const res = await fetch("/api/admin-users", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return;
      const list = (json.users || []);
      const players = list
        .filter((u) => u.type === "player" || u.role === "player")
        .map(mapPlayerToClient);
      setClients(players);
      setAllUsers(list.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role || (u.type === "player" ? "player" : u.role),
        teamRole: u.teamRole,
        tipo: u.type,
        type: u.type,
        clubId: u.clubId,
        plan: u.plan,
        subscriptionStatus: u.subscriptionStatus,
        billingSource: u.billingSource,
        manualPrice: u.manualPrice,
        clubCode: u.clubCode,
        isSoloCoach: u.isSoloCoach,
      })));
      try {
        localStorage.setItem("depro_admin_clients", JSON.stringify(
          list.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role || (u.type === "player" ? "player" : u.role),
            teamRole: u.teamRole,
            tipo: u.type,
            type: u.type,
            clubId: u.clubId,
            plan: u.plan,
            subscriptionStatus: u.subscriptionStatus,
            billingSource: u.billingSource,
            manualPrice: u.manualPrice,
          }))
        ));
      } catch { /* ignore */ }
      ensureClientAssets(players.map((p) => p.id));
    } catch {
      /* sin conexión: mantener lista actual */
    } finally {
      setClientsLoading(false);
    }
  }, [ensureClientAssets]);

  useEffect(() => {
    refreshClients();
  }, [refreshClients]);

  // ── PLAN ──────────────────────────────────────────────────────────
  const persistClientPlan = useCallback((clientId, plan) => {
    if (clientId && plan) {
      savePlayerPlan(clientId, plan);
      void persistPlayerPlanRemote(clientId, plan);
    }
  }, []);

  const updateSession = useCallback((clientId, dayIdx, sessionIdx, updates) => {
    setClientPlans((prev) => {
      const plans = JSON.parse(JSON.stringify(prev));
      if (plans[clientId]?.[dayIdx]?.sessions?.[sessionIdx]) {
        plans[clientId][dayIdx].sessions[sessionIdx] = {
          ...plans[clientId][dayIdx].sessions[sessionIdx],
          ...updates,
        };
        persistClientPlan(clientId, plans[clientId]);
      }
      return plans;
    });
  }, [persistClientPlan]);

  const addSession = useCallback((clientId, dayIdx, session) => {
    setClientPlans((prev) => {
      const plans = JSON.parse(JSON.stringify(prev));
      if (!plans[clientId]) plans[clientId] = JSON.parse(JSON.stringify(initialPlan));
      plans[clientId][dayIdx].sessions.push({ ...session, id: Date.now() });
      persistClientPlan(clientId, plans[clientId]);
      return plans;
    });
  }, [persistClientPlan]);

  const deleteSession = useCallback((clientId, dayIdx, sessionIdx) => {
    setClientPlans((prev) => {
      const plans = JSON.parse(JSON.stringify(prev));
      plans[clientId][dayIdx].sessions.splice(sessionIdx, 1);
      persistClientPlan(clientId, plans[clientId]);
      return plans;
    });
  }, [persistClientPlan]);

  const addExercise = useCallback((clientId, dayIdx, sessionIdx, exercise) => {
    setClientPlans((prev) => {
      const plans = JSON.parse(JSON.stringify(prev));
      plans[clientId][dayIdx].sessions[sessionIdx].exercises.push({
        ...exercise,
        id: Date.now(),
      });
      persistClientPlan(clientId, plans[clientId]);
      return plans;
    });
  }, [persistClientPlan]);

  const updateExercise = useCallback((clientId, dayIdx, sessionIdx, exIdx, updates) => {
    setClientPlans((prev) => {
      const plans = JSON.parse(JSON.stringify(prev));
      plans[clientId][dayIdx].sessions[sessionIdx].exercises[exIdx] = {
        ...plans[clientId][dayIdx].sessions[sessionIdx].exercises[exIdx],
        ...updates,
      };
      persistClientPlan(clientId, plans[clientId]);
      return plans;
    });
  }, [persistClientPlan]);

  const deleteExercise = useCallback((clientId, dayIdx, sessionIdx, exIdx) => {
    setClientPlans((prev) => {
      const plans = JSON.parse(JSON.stringify(prev));
      plans[clientId][dayIdx].sessions[sessionIdx].exercises.splice(exIdx, 1);
      persistClientPlan(clientId, plans[clientId]);
      return plans;
    });
  }, [persistClientPlan]);

  const setClientPlan = useCallback((clientId, plan) => {
    setClientPlans((prev) => ({ ...prev, [clientId]: plan }));
    persistClientPlan(clientId, plan);
  }, [persistClientPlan]);

  // ── CONTENT ───────────────────────────────────────────────────────
  const addVideo = useCallback((clientId, video) => {
    setClientContent((prev) => ({
      ...prev,
      [clientId]: {
        ...prev[clientId],
        videos: [
          { ...video, id: Date.now(), uploadedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) },
          ...(prev[clientId]?.videos || []),
        ],
      },
    }));
  }, []);

  const deleteVideo = useCallback((clientId, videoId) => {
    setClientContent((prev) => ({
      ...prev,
      [clientId]: {
        ...prev[clientId],
        videos: prev[clientId].videos.filter((v) => v.id !== videoId),
      },
    }));
  }, []);

  const addPdf = useCallback((clientId, pdf) => {
    setClientContent((prev) => ({
      ...prev,
      [clientId]: {
        ...prev[clientId],
        pdfs: [
          { ...pdf, id: Date.now(), uploadedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) },
          ...(prev[clientId]?.pdfs || []),
        ],
      },
    }));
  }, []);

  const deletePdf = useCallback((clientId, pdfId) => {
    setClientContent((prev) => ({
      ...prev,
      [clientId]: {
        ...prev[clientId],
        pdfs: prev[clientId].pdfs.filter((p) => p.id !== pdfId),
      },
    }));
  }, []);

  // ── FEEDBACK (persistido → visible para el jugador) ───────────────
  const addFeedback = useCallback((clientId, feedback) => {
    const saved = addPlayerFeedback(clientId, feedback);
    if (!saved) return;
    setClientFeedback((prev) => ({
      ...prev,
      [clientId]: getPlayerFeedback(clientId),
    }));
  }, []);

  const deleteFeedback = useCallback((clientId, feedbackId) => {
    deletePlayerFeedback(clientId, feedbackId);
    setClientFeedback((prev) => ({
      ...prev,
      [clientId]: getPlayerFeedback(clientId),
    }));
  }, []);

  const archiveFeedback = useCallback((clientId, feedbackId) => {
    archiveStoredFeedback(clientId, feedbackId);
    setClientFeedback((prev) => ({
      ...prev,
      [clientId]: getPlayerFeedback(clientId),
    }));
  }, []);

  return (
    <AdminContext.Provider
      value={{
        clients,
        allUsers,
        clientsLoading,
        refreshClients,
        clientPlans,
        clientContent,
        clientFeedback,
        updateSession,
        addSession,
        deleteSession,
        addExercise,
        updateExercise,
        deleteExercise,
        setClientPlan,
        addVideo,
        deleteVideo,
        addPdf,
        deletePdf,
        addFeedback,
        deleteFeedback,
        archiveFeedback,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
