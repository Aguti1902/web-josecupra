import { createContext, useContext, useState, useCallback } from "react";
import { clients as initialClients, weeklyPlan as initialPlan } from "../data/mockData";

const AdminContext = createContext(null);

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

  // ── PLAN ──────────────────────────────────────────────────────────
  const updateSession = useCallback((clientId, dayIdx, sessionIdx, updates) => {
    setClientPlans((prev) => {
      const plans = JSON.parse(JSON.stringify(prev));
      if (plans[clientId]?.[dayIdx]?.sessions?.[sessionIdx]) {
        plans[clientId][dayIdx].sessions[sessionIdx] = {
          ...plans[clientId][dayIdx].sessions[sessionIdx],
          ...updates,
        };
      }
      return plans;
    });
  }, []);

  const addSession = useCallback((clientId, dayIdx, session) => {
    setClientPlans((prev) => {
      const plans = JSON.parse(JSON.stringify(prev));
      if (!plans[clientId]) return prev;
      plans[clientId][dayIdx].sessions.push({ ...session, id: Date.now() });
      return plans;
    });
  }, []);

  const deleteSession = useCallback((clientId, dayIdx, sessionIdx) => {
    setClientPlans((prev) => {
      const plans = JSON.parse(JSON.stringify(prev));
      plans[clientId][dayIdx].sessions.splice(sessionIdx, 1);
      return plans;
    });
  }, []);

  const addExercise = useCallback((clientId, dayIdx, sessionIdx, exercise) => {
    setClientPlans((prev) => {
      const plans = JSON.parse(JSON.stringify(prev));
      plans[clientId][dayIdx].sessions[sessionIdx].exercises.push({
        ...exercise,
        id: Date.now(),
      });
      return plans;
    });
  }, []);

  const updateExercise = useCallback((clientId, dayIdx, sessionIdx, exIdx, updates) => {
    setClientPlans((prev) => {
      const plans = JSON.parse(JSON.stringify(prev));
      plans[clientId][dayIdx].sessions[sessionIdx].exercises[exIdx] = {
        ...plans[clientId][dayIdx].sessions[sessionIdx].exercises[exIdx],
        ...updates,
      };
      return plans;
    });
  }, []);

  const deleteExercise = useCallback((clientId, dayIdx, sessionIdx, exIdx) => {
    setClientPlans((prev) => {
      const plans = JSON.parse(JSON.stringify(prev));
      plans[clientId][dayIdx].sessions[sessionIdx].exercises.splice(exIdx, 1);
      return plans;
    });
  }, []);

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
        clientPlans,
        clientContent,
        clientFeedback,
        updateSession,
        addSession,
        deleteSession,
        addExercise,
        updateExercise,
        deleteExercise,
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
