import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Trophy, Users, Calendar, CheckCircle, Flame, TrendingUp, Activity } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import FeatureGate from "../../components/private/FeatureGate";
import FriendsPanel from "../../components/private/FriendsPanel";
import RankingCharts from "../../components/private/RankingCharts";
import {
  RankingPodium,
  PositionCard,
  StreakMedals,
  RecordCards,
  ChallengeList,
  ClassificationTable,
} from "../../components/private/RankingBoard";
import {
  getFriends,
  fetchFriendProfiles,
  processInviteFromUrl,
  registerSocialProfile,
} from "../../lib/playerFriends";
import {
  getMaxWeightByWeek,
  getTopWeightedExercises,
  getImprovementSummary,
} from "../../lib/loadAnalytics";
import {
  RANKING_POINTS,
  buildActivity,
  buildRankingBoard,
  legacyFriendSnapshot,
  monthLabel,
  positionHint,
  rankingSnapshot,
  readPlayerSources,
  readTeamPeers,
  recentMonthAnchors,
} from "../../lib/rankingEngine";

const POINT_RULES = [
  { label: "Sesión registrada en tu planificación", pts: `+${RANKING_POINTS.session} pts` },
  { label: "Semana con todas las sesiones hechas", pts: `+${RANKING_POINTS.perfectWeek} pts` },
  { label: "Mejora de marca (fuerza, velocidad o resistencia)", pts: `+${RANKING_POINTS.record} pts` },
  { label: "Mesociclo terminado", pts: `+${RANKING_POINTS.mesocycle} pts` },
];

const LEAGUES = [
  { id: "monthly", label: "Liga mensual" },
  { id: "weekly", label: "Liga semanal" },
  { id: "global", label: "Global" },
];

const FEED_ICON = {
  session: { Icon: CheckCircle, color: "#111111" },
  streak: { Icon: Flame, color: "#FB2C39" },
  achievement: { Icon: TrendingUp, color: "#FB2C39" },
};

export default function RankingPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [league, setLeague] = useState("monthly");
  const [rankingMode, setRankingMode] = useState("friends");
  const [monthAnchor, setMonthAnchor] = useState(() => new Date());
  const [friends, setFriends] = useState(() => getFriends(user?.id));
  const [friendProfiles, setFriendProfiles] = useState([]);
  const [inviteNotice, setInviteNotice] = useState("");

  const months = useMemo(() => recentMonthAnchors(new Date(), 6), []);

  useEffect(() => {
    if (!user?.id) return;
    const sources = readPlayerSources(user.id);
    const snap = rankingSnapshot(sources);
    const scheduled = snap.sessionsScheduled || 0;
    registerSocialProfile(user, {
      weeklySessions: snap.weeklyDone,
      planPct: scheduled ? Math.round((snap.sessionsDone / scheduled) * 100) : 0,
      completedSessions: snap.sessionsDone,
      totalSessions: scheduled,
      ranking: snap,
    });
  }, [user]);

  const friendIds = friends.map((friend) => friend.id).join(",");

  useEffect(() => {
    if (!user?.id || !friendIds) return undefined;
    let cancelled = false;
    fetchFriendProfiles(friendIds.split(",")).then((profiles) => {
      if (!cancelled) setFriendProfiles(profiles);
    });
    return () => { cancelled = true; };
  }, [user?.id, friendIds]);

  useEffect(() => {
    const code = searchParams.get("invite");
    if (!code || !user?.id) return;
    const normalized = String(code).toUpperCase().replace(/^.*invite=/i, "").split("&")[0];
    if (getFriends(user.id).some((friend) => friend.inviteCode === normalized)) return;
    processInviteFromUrl(user, normalized, (next) => {
      setFriends(next);
      setInviteNotice("Amigo añadido. Ya entra en tu liga.");
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("invite");
      setSearchParams(nextParams, { replace: true });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const people = useMemo(() => {
    if (!user?.id) return [];
    const me = {
      id: user.id,
      name: user.name || user.email || "Tú",
      mine: true,
      sources: readPlayerSources(user.id),
    };
    if (rankingMode === "team") return [me, ...readTeamPeers(user)];
    const profiles = friendIds ? friendProfiles : [];
    const rivals = profiles
      .filter((profile) => profile.userId && profile.userId !== user.id)
      .map((profile) => ({
        id: profile.userId,
        name: profile.name || "Jugador",
        snapshot: profile.stats?.ranking || legacyFriendSnapshot(profile.stats || {}),
      }));
    return [me, ...rivals];
  }, [user, rankingMode, friendProfiles, friendIds]);

  const board = useMemo(() => buildRankingBoard({
    people,
    mode: league,
    anchorDate: league === "monthly" ? monthAnchor : new Date(),
    now: new Date(),
  }), [people, league, monthAnchor]);

  const weightWeeks = useMemo(() => getMaxWeightByWeek(user?.id), [user?.id]);
  const topExercises = useMemo(() => getTopWeightedExercises(user?.id), [user?.id]);
  const improvement = useMemo(() => getImprovementSummary(user?.id), [user?.id]);
  const activity = useMemo(
    () => buildActivity(board.mineScore, user?.name || "Tú"),
    [board.mineScore, user?.name],
  );

  const periodCaption = league === "weekly"
    ? "vs. semana anterior"
    : league === "global"
      ? "histórico"
      : "vs. mes anterior";
  const tableTitle = league === "monthly"
    ? `Clasificación (${monthLabel(monthAnchor)})`
    : league === "weekly"
      ? "Clasificación semanal"
      : "Clasificación global";
  const score = board.mineScore;

  return (
    <FeatureGate user={user} feature="ranking">
      <div className="dash-page space-y-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#111] text-white flex items-center justify-center flex-shrink-0">
              <Trophy size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#111]">{t("ranking.title")}</h1>
              <p className="text-sm text-neutral-500 mt-0.5">Compite, mejora y desbloquea logros</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-neutral-100 p-1 rounded-full">
              <button
                type="button"
                onClick={() => setRankingMode("friends")}
                className={`px-3 py-1.5 rounded-full text-xs font-bold ${rankingMode === "friends" ? "bg-[#111] text-white" : "text-neutral-500"}`}
              >
                Amigos
              </button>
              <button
                type="button"
                onClick={() => setRankingMode("team")}
                className={`px-3 py-1.5 rounded-full text-xs font-bold ${rankingMode === "team" ? "bg-[#111] text-white" : "text-neutral-500"}`}
              >
                Equipo
              </button>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-white border border-neutral-200 rounded-full px-3 py-1.5">
              <Users size={14} />
              <span className="text-xs font-bold text-[#111]">{board.ranked.length}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full sm:w-auto gap-1 bg-neutral-100 p-1 rounded-full">
            {LEAGUES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setLeague(item.id)}
                className={`flex-1 sm:flex-none px-2 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap ${
                  league === item.id ? "bg-[#FB2C39] text-white" : "text-neutral-600"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          {league === "monthly" && (
            <label className="inline-flex items-center gap-2 bg-white border border-neutral-200 rounded-full px-3 py-1.5 text-sm font-bold text-[#111]">
              <Calendar size={14} />
              <select
                aria-label="Mes de la liga"
                className="bg-transparent outline-none"
                value={monthLabel(monthAnchor)}
                onChange={(event) => {
                  const next = months.find((date) => monthLabel(date) === event.target.value);
                  if (next) setMonthAnchor(next);
                }}
              >
                {months.map((date) => (
                  <option key={monthLabel(date)} value={monthLabel(date)}>{monthLabel(date)}</option>
                ))}
              </select>
            </label>
          )}
        </div>

        {inviteNotice && (
          <p className="text-sm text-[#111] bg-white border border-neutral-200 rounded-xl px-4 py-3">{inviteNotice}</p>
        )}

        <div className="grid lg:grid-cols-5 gap-4 items-start">
          <div className="lg:col-span-3 space-y-4">
            <RankingPodium ranked={board.ranked} reliable={board.reliableEvolution} />
            <ClassificationTable
              ranked={board.ranked}
              title={tableTitle}
              reliable={board.reliableEvolution}
            />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <PositionCard
              entry={board.mine}
              total={board.ranked.length}
              hint={positionHint(board.mine, board.ranked.length)}
              reliable={board.reliableEvolution}
              periodCaption={periodCaption}
            />
            <StreakMedals medals={score?.medals || []} streak={score?.streak || 0} />
            <RecordCards records={score?.records} />
            <ChallengeList challenges={score?.challenges || []} />
          </div>
        </div>

        {improvement && (
          <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-[#111]">
            <span className="font-black">Mejora reciente:</span>{" "}
            {improvement.exerciseName} — de {improvement.from} a {improvement.to} {improvement.unit || ""}
          </div>
        )}

        <RankingCharts
          weightWeeks={weightWeeks}
          topExercises={topExercises}
          friendsProfiles={rankingMode === "friends" ? friendProfiles : []}
          accent="#FB2C39"
        />

        <FriendsPanel user={user} onFriendsChange={setFriends} />

        <div className="grid md:grid-cols-2 gap-4">
          <section className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-card">
            <h2 className="font-black text-[#111] text-sm mb-3">Cómo se calculan los puntos</h2>
            <div className="space-y-2">
              {POINT_RULES.map((rule) => (
                <div key={rule.label} className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-neutral-600">{rule.label}</span>
                  <span className="font-black text-[#111] flex-shrink-0">{rule.pts}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-neutral-400 mt-3">
              Solo cuentan los registros que haces tú en tu planificación. La liga mensual vuelve a cero cada mes.
            </p>
          </section>

          <section className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-card">
            <h2 className="font-black text-[#111] text-sm mb-3 flex items-center gap-2">
              <Activity size={14} /> {t("ranking.activity_feed")}
            </h2>
            {activity.length === 0 ? (
              <p className="text-sm text-neutral-500">{t("ranking.no_activity")}</p>
            ) : (
              <div className="space-y-2">
                {activity.map((item) => {
                  const meta = FEED_ICON[item.type] || FEED_ICON.session;
                  const Icon = meta.Icon;
                  return (
                    <div key={item.id} className="flex gap-3 rounded-xl border border-neutral-100 p-3">
                      <Icon size={16} color={meta.color} className="mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-[#111]"><span className="font-black">Tú</span> {item.action}</p>
                        <p className="text-xs text-neutral-500">{item.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </FeatureGate>
  );
}
