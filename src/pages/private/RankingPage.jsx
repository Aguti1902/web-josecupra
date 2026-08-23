import { Component, useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Trophy, Zap, CheckCircle, Flame, Star, Medal, Crown,
  TrendingUp, Users, Calendar, Activity,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import FeatureGate from "../../components/private/FeatureGate";
import FriendsPanel, { processInviteFromUrl } from "../../components/private/FriendsPanel";
import RankingCharts from "../../components/private/RankingCharts";
import {
  getFriends,
  fetchFriendProfiles,
  registerSocialProfile,
} from "../../lib/playerFriends";
import {
  getMaxWeightByWeek,
  getTopWeightedExercises,
  getImprovementSummary,
  buildPublicStats,
} from "../../lib/loadAnalytics";

// ── Utilidades de localStorage ─────────────────────────────
function weekKey(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() - offset * 7);
  const day = d.getDay() || 7;
  const mon = new Date(d);
  mon.setDate(d.getDate() - day + 1);
  return mon.toISOString().slice(0, 10);
}

function getCompletedDays(userId, wk) {
  try { return JSON.parse(localStorage.getItem(`depro_progress_${userId}_${wk}`) || "[]").length; }
  catch { return 0; }
}

function getTotalSessions(userId) {
  try {
    const plan = JSON.parse(localStorage.getItem(`depro_plan_${userId}`) || "null");
    if (!plan) return { total: 0, completed: 0 };
    const all = plan.flatMap((d) => d.sessions || []);
    return { total: all.length, completed: all.filter((s) => s.status === "completed").length };
  } catch { return { total: 0, completed: 0 }; }
}

const TESTS = ["resistencia","sprint","cod","cmj"];
function getLastTests(userId) {
  const out = {};
  TESTS.forEach((t) => {
    try {
      const hist = JSON.parse(localStorage.getItem(`depro_test_${userId}_${t}`) || "[]");
      if (hist.length >= 2) out[t] = { prev: hist[hist.length-2].value, last: hist[hist.length-1].value, date: hist[hist.length-1].date };
    } catch {}
  });
  return out;
}

// ── Construir ranking real del usuario ─────────────────────
function buildRealRanking(user) {
  const uid   = user?.id;
  const name  = user?.name || user?.email || "Tú";
  const plan  = user?.plan || "básico";
  const color = user?.club?.primaryColor || "#0A36F7";
  const wk    = weekKey();
  const wkPrev= weekKey(1);

  // Sesiones esta semana y la anterior
  const thisWeek = getCompletedDays(uid, wk);
  const lastWeek = getCompletedDays(uid, wkPrev);
  const { total, completed } = getTotalSessions(uid);
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Tests recientes (para el feed)
  const tests = getLastTests(uid);

  // Construir leaderboard con el jugador real + compañeros de equipo del registry
  const teamId  = user?.team?.id || (typeof user?.team === "string" ? user.team : null);
  const registry = [];
  try {
    const reg = JSON.parse(localStorage.getItem(`depro_team_registry_${teamId}`) || "[]");
    reg.forEach((p) => { if (p.id !== uid) registry.push(p); });
  } catch {}

  const myEntry = {
    id:      uid,
    name,
    avatar:  name.split(" ").map((n) => n[0]).join("").slice(0,2).toUpperCase(),
    plan,
    club:    { primaryColor: color },
    points:  {
      daily:   thisWeek > 0 ? thisWeek * 20 : 0,
      weekly:  thisWeek * 20 + pct,
      monthly: completed * 15 + pct,
    },
    sessions: { thisWeek, lastWeek, total, completed },
    streak:  thisWeek,
  };

  // Compañeros de equipo (datos parciales)
  const teammates = registry.map((p) => {
    const tw = getCompletedDays(p.id, wk);
    const { total: t2, completed: c2 } = getTotalSessions(p.id);
    const p2 = t2 > 0 ? Math.round((c2/t2)*100) : 0;
    return {
      id:      p.id,
      name:    p.name || p.email || "Jugador",
      avatar:  (p.name || "J").split(" ").map((n) => n[0]).join("").slice(0,2).toUpperCase(),
      plan:    p.plan || "básico",
      club:    { primaryColor: "#0A36F7" },
      points:  { daily: tw*20, weekly: tw*20+p2, monthly: c2*15+p2 },
      sessions: { thisWeek: tw, lastWeek: 0, total: t2, completed: c2 },
      streak:  tw,
    };
  });

  const leaderboard = [myEntry, ...teammates];

  // Construir feed de actividad desde el historial real
  const feed = [];
  let feedId = 0;

  // Sesiones completadas esta semana
  if (thisWeek > 0) {
    feed.push({
      id: feedId++, userId: uid, type: "session", name,
      action: `completaste ${thisWeek} sesión${thisWeek>1?"es":""} esta semana`,
      detail: `${pct}% del plan completado`,
      timeAgo: "Esta semana",
    });
  }

  // Mejoras en tests físicos
  const testLabels = { resistencia: "Resistencia", sprint: "Sprint", cod: "COD 5-10-5", cmj: "Salto CMJ" };
  const testUnits  = { resistencia: "rectas", sprint: "seg", cod: "seg", cmj: "cm" };
  Object.entries(tests).forEach(([key, data]) => {
    const diff = parseFloat((data.last - data.prev).toFixed(2));
    if (diff !== 0) {
      const better = key === "sprint" || key === "cod" ? diff < 0 : diff > 0;
      if (better) {
        const absDiff = Math.abs(diff);
        feed.push({
          id: feedId++, userId: uid, type: "achievement", name,
          action: `mejoraste ${testLabels[key]} en ${absDiff} ${testUnits[key]}`,
          detail: `Nuevo valor: ${data.last} ${testUnits[key]}`,
          timeAgo: data.date || "Reciente",
        });
      }
    }
  });

  // Racha semanas anteriores
  if (lastWeek > 0) {
    feed.push({
      id: feedId++, userId: uid, type: "streak", name,
      action: `completaste ${lastWeek} sesión${lastWeek>1?"es":""} la semana pasada`,
      detail: "Mantén la racha",
      timeAgo: "Semana pasada",
    });
  }

  return { leaderboard, activityFeed: feed, myEntry };
}

function entryFromSocialProfile(profile) {
  const weekly = profile.stats?.weeklySessions ?? 0;
  const pct = profile.stats?.planPct ?? 0;
  const completed = profile.stats?.completedSessions ?? 0;
  const name = profile.name || "Jugador";
  return {
    id: profile.userId,
    name,
    avatar: name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
    plan: profile.plan || "básico",
    club: { primaryColor: "#0A36F7" },
    points: {
      daily: weekly * 20 + (profile.stats?.maxWeight || 0),
      weekly: weekly * 20 + pct + (profile.stats?.maxWeight || 0) * 2,
      monthly: completed * 15 + pct + (profile.stats?.loadCount || 0) * 5,
    },
    sessions: { thisWeek: weekly, lastWeek: 0, total: profile.stats?.totalSessions || 0, completed },
    streak: weekly,
    stats: profile.stats,
  };
}

function buildFriendsRanking(user, friendProfiles) {
  const base = buildRealRanking(user);
  const friendEntries = friendProfiles.map(entryFromSocialProfile);
  const myStats = buildPublicStats(user?.id);
  const myEntry = {
    ...base.myEntry,
    stats: {
      ...myStats,
      weeklySessions: base.myEntry.sessions?.thisWeek,
      planPct: getTotalSessions(user?.id).total
        ? Math.round((getTotalSessions(user?.id).completed / getTotalSessions(user?.id).total) * 100)
        : 0,
      completedSessions: getTotalSessions(user?.id).completed,
      totalSessions: getTotalSessions(user?.id).total,
    },
  };
  const leaderboard = [myEntry, ...friendEntries.filter((f) => f.id !== user?.id)];
  return { ...base, leaderboard, myEntry, friendProfiles };
}

const TAB_IDS = [
  { id: "daily", labelKey: "ranking.daily" },
  { id: "weekly", labelKey: "ranking.weekly" },
  { id: "monthly", labelKey: "ranking.monthly" },
];

const BADGE_STYLE = {
  Elite:   { bg: "#EEF1FF", color: "#0A36F7", label: "Elite" },
  Pro:     { bg: "#EAF9E6", color: "#3BC21D", label: "Pro" },
  Premium: { bg: "#FEFAE7", color: "#B8940A", label: "Premium" },
  Base:    { bg: "#F5F5F5", color: "#6B7280", label: "Base" },
};

const FEED_ICON = {
  session:     { Icon: CheckCircle,  color: "#3BC21D", bg: "#EAF9E6" },
  streak:      { Icon: Flame,        color: "#FB2C39", bg: "#FEE8EA" },
  achievement: { Icon: TrendingUp,   color: "#B8940A", bg: "#FEFAE7" },
  test:        { Icon: Zap,          color: "#8B5CF6", bg: "#F3E8FF" },
};

function Avatar({ initials, color, size = "md" }) {
  const s = size === "lg" ? "w-14 h-14 text-base" : size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return (
    <div
      className={`${s} rounded-2xl flex items-center justify-center font-black flex-shrink-0`}
      style={{ backgroundColor: (color || "#0A36F7") + "20", color: color || "#0A36F7" }}
    >
      {initials}
    </div>
  );
}

function PodiumStep({ player, rank, isCurrentUser }) {
  const heights = { 1: "h-28", 2: "h-20", 3: "h-16" };
  const orders  = { 1: "order-2", 2: "order-1", 3: "order-3" };
  const crowns  = { 1: Crown, 2: Medal, 3: Medal };
  const crownColors = { 1: "#F6CC12", 2: "#9CA3AF", 3: "#CD7F32" };
  const CrownIcon = crowns[rank];

  return (
    <div className={`flex flex-col items-center gap-2 ${orders[rank]}`}>
      {/* Crown */}
      <CrownIcon size={rank === 1 ? 22 : 16} style={{ color: crownColors[rank] }} />

      {/* Avatar */}
      <div className={`relative ${isCurrentUser ? "ring-2 ring-depro-blue ring-offset-2 rounded-2xl" : ""}`}>
        <Avatar
          initials={player.avatar}
          color={player.club?.primaryColor}
          size={rank === 1 ? "lg" : "md"}
        />
        <span
          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full text-white text-xs font-black flex items-center justify-center"
          style={{ backgroundColor: crownColors[rank] }}
        >
          {rank}
        </span>
      </div>

      <div className="text-center">
        <p className="font-bold text-depro-dark text-sm leading-tight">{String(player?.name || "Jugador").split(/\s+/)[0]}</p>
        <p className="text-xs text-depro-gray">{player.points._tab?.toLocaleString()} pts</p>
      </div>

      {/* Podium block */}
      <div
        className={`w-20 ${heights[rank]} rounded-t-xl flex items-end justify-center pb-2`}
        style={{ background: rank === 1 ? "linear-gradient(to top, #0828C4, #0A36F7)" : rank === 2 ? "#E5E7EB" : "#F3F4F6" }}
      >
        <span className={`text-lg font-black ${rank === 1 ? "text-white" : "text-depro-gray"}`}>{rank}</span>
      </div>
    </div>
  );
}

class RankingErrorBoundary extends Component {
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
        <div className="dash-page">
          <div className="bg-white border border-depro-border rounded-2xl p-8 text-center">
            <Trophy size={36} className="mx-auto mb-3 text-depro-border" />
            <p className="font-bold text-depro-dark mb-1">No se pudo cargar el ranking</p>
            <p className="text-sm text-depro-gray">Inténtalo de nuevo en unos segundos. Tus datos de entrenamiento no se han perdido.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function lum(hex) {
  try {
    const h = (hex || "#000").replace("#", "");
    return (0.299 * parseInt(h.slice(0,2),16) + 0.587 * parseInt(h.slice(2,4),16) + 0.114 * parseInt(h.slice(4,6),16)) / 255;
  } catch { return 0; }
}

function RankingPageInner() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("weekly");
  const [rankingMode, setRankingMode] = useState("friends");
  const [friends, setFriends] = useState(() => getFriends(user?.id));
  const [friendProfiles, setFriendProfiles] = useState([]);
  const [inviteNotice, setInviteNotice] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    const pctData = getTotalSessions(user.id);
    const pct = pctData.total ? Math.round((pctData.completed / pctData.total) * 100) : 0;
    registerSocialProfile(user, {
      weeklySessions: getCompletedDays(user.id, weekKey()),
      planPct: pct,
      completedSessions: pctData.completed,
      totalSessions: pctData.total,
    });
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const ids = friends.map((f) => f.id);
    if (!ids.length) {
      setFriendProfiles([]);
      return;
    }
    fetchFriendProfiles(ids).then(setFriendProfiles);
  }, [user?.id, friends]);

  useEffect(() => {
    const code = searchParams.get("invite");
    if (!code || !user?.id) return;
    const normalized = String(code).toUpperCase().replace(/^.*invite=/i, "").split("&")[0];
    if (getFriends(user.id).some((f) => f.inviteCode === normalized)) return;
    processInviteFromUrl(user, normalized, (next) => {
      setFriends(next);
      setInviteNotice("¡Amigo añadido correctamente!");
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("invite");
      setSearchParams(nextParams, { replace: true });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const rankingData = useMemo(() => {
    try {
      if (rankingMode === "friends") {
        return buildFriendsRanking(user, friendProfiles);
      }
      return buildRealRanking(user);
    } catch {
      return { leaderboard: [], activityFeed: [], myEntry: null };
    }
  }, [user, rankingMode, friendProfiles]);

  const weightWeeks = useMemo(() => {
    try { return getMaxWeightByWeek(user?.id); } catch { return []; }
  }, [user?.id]);
  const topExercises = useMemo(() => {
    try { return getTopWeightedExercises(user?.id); } catch { return []; }
  }, [user?.id]);
  const improvement = useMemo(() => {
    try { return getImprovementSummary(user?.id); } catch { return null; }
  }, [user?.id]);

  const key = TAB_IDS.some((tab) => tab.id === activeTab) ? activeTab : "weekly";
  const sorted = [...(rankingData.leaderboard || [])].sort(
    (a, b) => (Number(b.points?.[key]) || 0) - (Number(a.points?.[key]) || 0),
  );
  const myEntry = sorted.find((p) => p.id === user?.id) ?? null;
  const myRank  = myEntry ? sorted.indexOf(myEntry) + 1 : null;
  const top3    = sorted.slice(0, 3).map((p) => ({ ...p, points: { ...p.points, _tab: Number(p.points?.[key]) || 0 } }));
  const rest    = sorted.slice(3).map((p) => ({ ...p, points: { ...p.points, _tab: Number(p.points?.[key]) || 0 } }));
  const topScore = Number(sorted[0]?.points?.[key]) || 1;

  const raw    = user?.club?.primaryColor || "#0A36F7";
  const accent = lum(raw) > 0.75 ? "#0A36F7" : raw;

  return (
    <FeatureGate user={user} feature="ranking">
    <div className="dash-page space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-depro-dark">{t("ranking.title")}</h1>
          <p className="text-depro-gray text-sm mt-0.5">{t("ranking.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-depro-gray-light p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setRankingMode("friends")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${rankingMode === "friends" ? "bg-white text-depro-dark shadow-card" : "text-depro-gray"}`}
            >
              Amigos
            </button>
            <button
              type="button"
              onClick={() => setRankingMode("team")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${rankingMode === "team" ? "bg-white text-depro-dark shadow-card" : "text-depro-gray"}`}
            >
              Equipo
            </button>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white border border-depro-border rounded-xl px-4 py-2 shadow-card">
            <Users size={15} className="text-depro-blue" />
            <span className="text-sm font-semibold text-depro-dark">{sorted.length} {t("dashboard.players").toLowerCase()}</span>
          </div>
        </div>
      </div>

      {inviteNotice && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">{inviteNotice}</p>
      )}

      <FriendsPanel user={user} onFriendsChange={setFriends} />

      {improvement && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <span className="font-bold">Mejora reciente:</span>{" "}
          {improvement.exerciseName} — de {improvement.from} kg a {improvement.to} kg (+{improvement.diff} kg)
        </div>
      )}

      <RankingCharts
        weightWeeks={weightWeeks}
        topExercises={topExercises}
        friendsProfiles={friendProfiles}
        accent={accent}
      />

      {/* My position banner */}
      <div
        className="rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
        style={{ background: `linear-gradient(135deg, ${accent}18 0%, ${accent}08 100%)`, border: `1px solid ${accent}30` }}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black flex-shrink-0"
            style={{ backgroundColor: accent + "20", color: accent }}
          >
            {user?.avatar || user?.name?.[0]?.toUpperCase() || "👤"}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-depro-gray uppercase tracking-wide">{t("ranking.your_position")}</p>
            <p className="font-black text-depro-dark text-lg leading-tight">
              {myRank ? `#${myRank} ${t("common.of")} ${sorted.length}` : t("common.no_data")}
            </p>
            <p className="text-xs text-depro-gray truncate">{myEntry?.club?.name || user?.name || "—"}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-6">
          {[
            { icon: Star,     label: t("ranking.points"),       value: myEntry ? myEntry.points.weekly.toLocaleString() : "—" },
            { icon: Flame,    label: t("ranking.streak"),       value: myEntry?.streak != null ? `${myEntry.streak}d` : "—" },
            { icon: Activity, label: t("dashboard.sessions"),   value: myEntry?.sessionsCompleted ?? "—" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Icon size={12} style={{ color: accent }} />
                <span className="text-[10px] font-bold text-depro-gray uppercase tracking-wide">{label}</span>
              </div>
              <p className="font-black text-depro-dark text-base">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ranking + Feed — two columns on large */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Left: Leaderboard */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 bg-depro-gray-light p-1 rounded-xl w-fit">
            {TAB_IDS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-depro-dark shadow-card"
                    : "text-depro-gray hover:text-depro-dark"
                }`}
              >
                {t(tab.labelKey)}
              </button>
            ))}
          </div>

          {/* Podium / Empty state */}
          {sorted.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-depro-border rounded-2xl p-10 text-center">
              <Trophy size={40} className="mx-auto mb-3 text-depro-border" />
              <p className="font-bold text-depro-dark mb-1">{t("ranking.no_ranking")}</p>
              <p className="text-sm text-depro-gray max-w-xs mx-auto">{t("ranking.no_ranking_desc")}</p>
            </div>
          ) : (
            <div className="bg-white border border-depro-border rounded-2xl p-6 shadow-card">
              <div className="flex items-end justify-center gap-4 mb-2">
                {top3.map((p, i) => (
                  <PodiumStep
                    key={p.id}
                    player={p}
                    rank={i + 1}
                    isCurrentUser={p.id === user?.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Rest of the list */}
          {rest.length > 0 && <div className="bg-white border border-depro-border rounded-2xl shadow-card overflow-hidden">
            {rest.map((player, i) => {
              const rank = i + 4;
              const isMe = player.id === user?.id;
              const pct  = Math.round((player.points[key] / topScore) * 100);
              const badge = BADGE_STYLE[player.badge] ?? BADGE_STYLE.Base;

              return (
                <div
                  key={player.id}
                  className={`flex items-center gap-4 px-5 py-3.5 border-b border-depro-border last:border-b-0 transition-colors ${
                    isMe ? "bg-depro-blue/5" : "hover:bg-depro-gray-light/60"
                  }`}
                  style={isMe ? { borderLeft: "3px solid #0A36F7" } : {}}
                >
                  {/* Rank */}
                  <span className="text-sm font-black text-depro-gray w-5 text-center flex-shrink-0">
                    {rank}
                  </span>

                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{ backgroundColor: (player.club?.primaryColor || "#0A36F7") + "20", color: player.club?.primaryColor || "#0A36F7" }}
                  >
                    {player.avatar}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`font-bold text-sm truncate ${isMe ? "text-depro-blue" : "text-depro-dark"}`}>
                        {player.name}{isMe && " (tú)"}
                      </span>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: badge.bg, color: badge.color }}
                      >
                        {badge.label}
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-1.5 h-1 bg-depro-gray-light rounded-full overflow-hidden w-full max-w-xs">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: isMe ? "#0A36F7" : (player.club?.primaryColor || "#0A36F7") + "99" }}
                      />
                    </div>
                  </div>

                  {/* Points + streak */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-depro-dark text-sm">{player.points[key].toLocaleString()}</p>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      <Flame size={10} className="text-depro-red" />
                      <span className="text-[10px] text-depro-gray">{player.streak}d</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>}
        </div>

        {/* Right: Activity feed */}
        <div className="space-y-4">
          <h2 className="font-bold text-depro-dark flex items-center gap-2">
            <TrendingUp size={16} className="text-depro-blue" />
            {t("ranking.activity_feed")}
          </h2>

          {(rankingData.activityFeed || []).length === 0 ? (
            <div className="bg-white border border-depro-border rounded-xl p-6 text-center text-sm text-depro-gray">
              <Activity size={24} className="mx-auto mb-2 text-depro-border" />
              {t("ranking.no_activity")}
            </div>
          ) : null}

          <div className="space-y-2">
            {(rankingData.activityFeed || []).map((item) => {
              const { Icon, color, bg } = FEED_ICON[item.type] ?? FEED_ICON.session;
              const isMe = item.userId === user?.id;

              return (
                <div
                  key={item.id}
                  className={`bg-white border rounded-xl p-3.5 flex gap-3 ${
                    isMe ? "border-depro-blue/30 bg-depro-blue/5" : "border-depro-border"
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: bg }}
                  >
                    <Icon size={14} style={{ color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-depro-dark leading-snug">
                      <span className={`font-bold ${isMe ? "text-depro-blue" : ""}`}>
                        {isMe ? "Tú" : item.name}
                      </span>{" "}
                      {item.action}
                    </p>
                    <p className="text-[11px] text-depro-gray mt-0.5 truncate">{item.detail}</p>
                    <p className="text-[10px] text-depro-gray/60 mt-1">{item.timeAgo}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="bg-white border border-depro-border rounded-xl p-4">
            <p className="text-xs font-bold text-depro-dark mb-3 uppercase tracking-wide">Cómo se calculan los puntos</p>
            <div className="space-y-2">
              {[
                { icon: CheckCircle, color: "#3BC21D", label: "Sesión completada", pts: "+50 pts" },
                { icon: Flame,       color: "#FB2C39", label: "Día de racha",       pts: "+20 pts" },
                { icon: Trophy,      color: "#B8940A", label: "Logro desbloqueado", pts: "+100 pts" },
                { icon: Calendar,    color: "#0A36F7", label: "Consistencia semanal",pts: "+150 pts" },
              ].map(({ icon: Icon, color, label, pts }) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Icon size={12} style={{ color }} />
                    <span className="text-depro-gray">{label}</span>
                  </div>
                  <span className="font-bold text-depro-dark">{pts}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </FeatureGate>
  );
}

export default function RankingPage() {
  return (
    <RankingErrorBoundary>
      <RankingPageInner />
    </RankingErrorBoundary>
  );
}
