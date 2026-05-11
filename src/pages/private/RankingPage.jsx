import { useState } from "react";
import {
  Trophy, Zap, CheckCircle, Flame, Star, Medal, Crown,
  TrendingUp, Users, Calendar, Activity,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { rankingData } from "../../data/mockData";

const TABS = ["Diario", "Semanal", "Mensual"];
const TAB_KEY = { Diario: "daily", Semanal: "weekly", Mensual: "monthly" };

const BADGE_STYLE = {
  Elite:   { bg: "#EEF1FF", color: "#0A36F7", label: "Elite" },
  Pro:     { bg: "#EAF9E6", color: "#3BC21D", label: "Pro" },
  Premium: { bg: "#FEFAE7", color: "#B8940A", label: "Premium" },
  Base:    { bg: "#F5F5F5", color: "#6B7280", label: "Base" },
};

const FEED_ICON = {
  session:     { Icon: CheckCircle, color: "#3BC21D", bg: "#EAF9E6" },
  streak:      { Icon: Flame,       color: "#FB2C39", bg: "#FEE8EA" },
  achievement: { Icon: Trophy,      color: "#B8940A", bg: "#FEFAE7" },
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
          color={player.club.primaryColor}
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
        <p className="font-bold text-depro-dark text-sm leading-tight">{player.name.split(" ")[0]}</p>
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

export default function RankingPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Semanal");

  const key = TAB_KEY[activeTab];
  const sorted = [...rankingData.leaderboard].sort((a, b) => b.points[key] - a.points[key]);
  const myEntry = sorted.find((p) => p.id === user?.id) ?? sorted[3];
  const myRank  = sorted.indexOf(myEntry) + 1;
  const top3    = sorted.slice(0, 3).map((p) => ({ ...p, points: { ...p.points, _tab: p.points[key] } }));
  const rest     = sorted.slice(3).map((p) => ({ ...p, points: { ...p.points, _tab: p.points[key] } }));
  const topScore = sorted[0]?.points[key] || 1;

  const accent = user?.club?.primaryColor || "#0A36F7";

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-depro-dark">Ranking</h1>
          <p className="text-depro-gray text-sm mt-0.5">Compite con los mejores jugadores de la plataforma</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-white border border-depro-border rounded-xl px-4 py-2 shadow-card">
          <Users size={15} className="text-depro-blue" />
          <span className="text-sm font-semibold text-depro-dark">{sorted.length} jugadores</span>
        </div>
      </div>

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
            {myEntry?.avatar}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-depro-gray uppercase tracking-wide">Mi posición</p>
            <p className="font-black text-depro-dark text-lg leading-tight">#{myRank} de {sorted.length}</p>
            <p className="text-xs text-depro-gray truncate">{myEntry?.club?.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-6">
          {[
            { icon: Star,     label: "Puntos semana", value: myEntry?.points.weekly.toLocaleString() },
            { icon: Flame,    label: "Racha",          value: `${myEntry?.streak}d` },
            { icon: Activity, label: "Sesiones",       value: myEntry?.sessionsCompleted },
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
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  activeTab === tab
                    ? "bg-white text-depro-dark shadow-card"
                    : "text-depro-gray hover:text-depro-dark"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Podium */}
          <div className="bg-white border border-depro-border rounded-2xl p-6 shadow-card">
            <div className="flex items-end justify-center gap-4 mb-2">
              {top3.map((p, i) => (
                <PodiumStep
                  key={p.id}
                  player={p}
                  rank={i + 1}
                  isCurrentUser={p.id === (user?.id ?? myEntry?.id)}
                />
              ))}
            </div>
          </div>

          {/* Rest of the list */}
          <div className="bg-white border border-depro-border rounded-2xl shadow-card overflow-hidden">
            {rest.map((player, i) => {
              const rank = i + 4;
              const isMe = player.id === (user?.id ?? myEntry?.id);
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
                    style={{ backgroundColor: player.club.primaryColor + "20", color: player.club.primaryColor }}
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
                        style={{ width: `${pct}%`, backgroundColor: isMe ? "#0A36F7" : player.club.primaryColor + "99" }}
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
          </div>
        </div>

        {/* Right: Activity feed */}
        <div className="space-y-4">
          <h2 className="font-bold text-depro-dark flex items-center gap-2">
            <TrendingUp size={16} className="text-depro-blue" />
            Actividad reciente
          </h2>

          <div className="space-y-2">
            {rankingData.activityFeed.map((item) => {
              const { Icon, color, bg } = FEED_ICON[item.type] ?? FEED_ICON.session;
              const isMe = item.userId === (user?.id ?? myEntry?.id);

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
  );
}
