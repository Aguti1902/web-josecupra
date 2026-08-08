import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { clients as initialClients, weeklyPlan as initialPlan } from "../data/mockData";
import { supabase } from "../lib/supabase";
import { loadPlayerPlan, savePlayerPlan } from "../lib/playerPlanStorage";

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
          { id: 1, title: "Rondo 4v2 - Technique", url: "#", size: "42 MB", uploadedAt: "Apr 15, 2025", session: "Technical Foundation" },
          { id: 2, title: "Sprint Mechanics - Full Breakdown", url: "#", size: "58 MB", uploadedAt: "Apr 16, 2025", session: "Physical Conditioning" },
          { id: 3, title: "Positional Play 8v8", url: "#", size: "71 MB", uploadedAt: "Apr 17, 2025", session: "Tactical + Technical" },
        ],
        pdfs: [
          { id: 1, title: "Week 15 - Full Plan PDF", url: "#", size: "1.2 MB", uploadedAt: "Apr 14, 2025" },
          { id: 2, title: "Hamstring Prevention Protocol", url: "#", size: "0.8 MB", uploadedAt: "Apr 10, 2025" },
        ],
      };
      feedbackMap[c.id] = [
        {
          id: 1,
          date: "Apr 18, 2025",
          week: "Week 15",
          message: "Great improvement in your first touch this week. The rondo sessions are clearly paying off. I noticed you're still hesitating before shooting — next week we'll focus specifically on decision-making in the final third.",
          adjustments: ["Added extra finishing sessions on Tue/Thu", "Increased pressing intensity", "New 1v1 duel module added"],
          rating: 8,
          nextFocus: "Decision-making in front of goal",
        },
        {
          id: 2,
          date: "Apr 11, 2025",
          week: "Week 14",
          message: "Excellent week physically. Sprint numbers are up 12% from baseline. Technically you need to work on your weak foot — starting to add some specific exercises for that.",
          adjustments: ["Weak foot exercises added to warm-up", "Sprint protocol adjusted", "Recovery session moved to Wednesday"],
          rating: 7,
          nextFocus: "Weak foot development",
        },
      ];
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
        if (!next[id]) {
          next[id] = [];
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
      const players = (json.users || [])
        .filter((u) => u.type === "player")
        .map(mapPlayerToClient);
      setClients(players);
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
    if (clientId && plan) savePlayerPlan(clientId, plan);
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

  // ── FEEDBACK ──────────────────────────────────────────────────────
  const addFeedback = useCallback((clientId, feedback) => {
    setClientFeedback((prev) => ({
      ...prev,
      [clientId]: [
        {
          ...feedback,
          id: Date.now(),
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        },
        ...(prev[clientId] || []),
      ],
    }));
  }, []);

  const deleteFeedback = useCallback((clientId, feedbackId) => {
    setClientFeedback((prev) => ({
      ...prev,
      [clientId]: prev[clientId].filter((f) => f.id !== feedbackId),
    }));
  }, []);

  return (
    <AdminContext.Provider
      value={{
        clients,
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
