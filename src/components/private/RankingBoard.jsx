import {
  Trophy, Crown, Flame, Dumbbell, Zap, Heart, Lock, Check,
  Calendar, Target, Shield,
} from "lucide-react";
import { formatRankingNumber } from "../../lib/rankingEngine";

const RED = "#FB2C39";
const INK = "#111111";

function initials(name) {
  return String(name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function shortName(name) {
  const parts = String(name || "Jugador").trim().split(/\s+/);
  if (parts.length < 2) return parts[0];
  return `${parts[0]} ${parts[1][0].toUpperCase()}.`;
}

function Delta({ value, reliable, pointsDelta }) {
  const rank = reliable ? value : null;
  const shown = rank != null && rank !== 0 ? rank : null;
  if (shown == null && (pointsDelta == null || pointsDelta === 0)) {
    return <span className="text-xs font-bold text-neutral-400">—</span>;
  }
  const up = (shown ?? pointsDelta) > 0;
  const text = shown != null
    ? `${up ? "+" : ""}${shown}`
    : `${pointsDelta > 0 ? "+" : ""}${formatRankingNumber(pointsDelta)}`;
  return (
    <span className={`inline-flex items-center text-xs font-black ${up ? "text-emerald-600" : "text-[#FB2C39]"}`}>
      {up ? "▲" : "▼"} {text}
    </span>
  );
}

function Avatar({ name, mine, size = "md" }) {
  const cls = size === "lg" ? "w-16 h-16 text-base" : size === "sm" ? "w-8 h-8 text-[11px]" : "w-11 h-11 text-sm";
  return (
    <div className={`relative ${cls} rounded-full bg-neutral-900 text-white font-black flex items-center justify-center ring-2 ring-white/80`}>
      {initials(name)}
      {mine && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-black bg-[#FB2C39] text-white px-1.5 rounded-full leading-4">
          Tú
        </span>
      )}
    </div>
  );
}

function PodiumSlot({ player, rank, reliable }) {
  const heights = { 1: "h-36 sm:h-44", 2: "h-24 sm:h-28", 3: "h-20 sm:h-24" };
  const podium = {
    1: "bg-gradient-to-t from-[#6d0010] via-[#c8102e] to-[#FB2C39]",
    2: "bg-gradient-to-t from-[#141414] to-[#3a3a3a]",
    3: "bg-gradient-to-t from-[#2a0d12] to-[#6a2430]",
  };
  if (!player) {
    return (
      <div className="flex flex-col items-center justify-end text-white/40">
        <div className="w-14 h-14 rounded-full border border-dashed border-white/25 mb-3" />
        <p className="text-[11px] mb-2">Plaza libre</p>
        <div className={`w-full ${heights[rank]} ${podium[rank]} rounded-t-2xl opacity-40`} />
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-end text-white min-w-0">
      {rank === 1 ? <Crown size={22} className="text-white mb-1" /> : <span className="h-[26px]" />}
      <Avatar name={player.name} mine={player.mine} size={rank === 1 ? "lg" : "md"} />
      <p className="mt-3 text-sm font-black truncate max-w-full px-1">{shortName(player.name)}</p>
      <p className="text-xs font-bold text-white/80">{formatRankingNumber(player.points)} pts</p>
      <div className="h-4 mb-2">
        <Delta value={player.rankDelta} reliable={reliable} pointsDelta={player.pointsDelta} />
      </div>
      <div className={`w-full ${heights[rank]} ${podium[rank]} rounded-t-2xl flex items-start justify-center pt-3 shadow-inner`}>
        <span className="text-2xl font-black">{rank}</span>
      </div>
    </div>
  );
}

export function RankingPodium({ ranked, reliable }) {
  const byRank = [ranked[1] || null, ranked[0] || null, ranked[2] || null];
  const ranks = [2, 1, 3];
  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#111] px-3 sm:px-6 pt-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(251,44,57,0.45),transparent_58%)]" />
      <div className="relative grid grid-cols-3 gap-2 sm:gap-4 items-end">
        {byRank.map((player, index) => (
          <PodiumSlot key={ranks[index]} player={player} rank={ranks[index]} reliable={reliable} />
        ))}
      </div>
    </div>
  );
}

export function PositionCard({ entry, total, hint, reliable, periodCaption }) {
  return (
    <section className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-card">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#FB2C39] text-white font-black flex items-center justify-center flex-shrink-0">
          {entry ? initials(entry.name).slice(0, 1) : "—"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">Tu posición</p>
          <p className="text-lg font-black text-[#111] leading-tight">
            {entry ? `#${entry.rank} de ${total}` : "Sin datos"}
          </p>
          <p className="text-sm font-bold text-neutral-700">
            {entry ? `${formatRankingNumber(entry.points)} pts` : "0 pts"}
          </p>
        </div>
        <div className="text-right">
          <Delta value={entry?.rankDelta} reliable={reliable} pointsDelta={entry?.pointsDelta} />
          <p className="text-[10px] text-neutral-400 mt-0.5">{periodCaption}</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-neutral-600">{hint}</p>
    </section>
  );
}

const MEDAL_TONE = {
  1: { ring: "#b45309", bg: "#fff7ed", icon: "#9a3412" },
  2: { ring: "#9ca3af", bg: "#f5f5f5", icon: "#404040" },
  4: { ring: "#d4a017", bg: "#fffbeb", icon: "#a16207" },
  8: { ring: RED, bg: "#fff1f2", icon: RED },
};

export function StreakMedals({ medals, streak }) {
  return (
    <section className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-black text-[#111] flex items-center gap-2">
          <Flame size={16} color={RED} /> Rachas
        </h2>
        <span className="text-xs font-bold text-neutral-500">
          {streak === 1 ? "1 semana seguida" : `${streak} semanas seguidas`}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {medals.map((medal) => {
          const tone = MEDAL_TONE[medal.weeks];
          return (
            <div key={medal.weeks} className="text-center">
              <div
                className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center border"
                style={{
                  background: medal.unlocked ? tone.bg : "#fafafa",
                  borderColor: medal.unlocked ? tone.ring : "#e5e5e5",
                  color: medal.unlocked ? tone.icon : "#a3a3a3",
                }}
              >
                {medal.unlocked ? <Shield size={18} /> : <Lock size={16} />}
              </div>
              <p className="mt-1.5 text-[10px] font-bold text-neutral-600 leading-tight">{medal.label}</p>
              {medal.unlocked && <Check size={12} className="mx-auto mt-0.5 text-[#FB2C39]" />}
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-neutral-500 mt-3">
        Se desbloquean al completar todas las sesiones programadas durante 1, 2, 4 y 8 semanas seguidas.
      </p>
    </section>
  );
}

const RECORD_META = [
  { key: "fuerza", title: "Fuerza", glyph: Dumbbell },
  { key: "velocidad", title: "Velocidad", glyph: Zap },
  { key: "resistencia", title: "Resistencia", glyph: Heart },
];

export function RecordCards({ records }) {
  return (
    <section className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-card">
      <h2 className="font-black text-[#111] flex items-center gap-2 mb-3">
        <Dumbbell size={16} color={INK} /> Récords personales
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {RECORD_META.map((item) => {
          const rec = records?.[item.key];
          const Glyph = item.glyph;
          return (
            <div key={item.key} className="rounded-xl border border-neutral-200 p-2.5 min-w-0">
              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-neutral-500">
                <Glyph size={12} color={RED} /> {item.title}
              </div>
              <p className="mt-1 font-black text-[#111] text-sm truncate">{rec?.value || "—"}</p>
              <p className="text-[10px] text-neutral-500 truncate">{rec?.label || "Sin registro"}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function ChallengeList({ challenges }) {
  return (
    <section className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-card">
      <h2 className="font-black text-[#111] flex items-center gap-2 mb-3">
        <Target size={16} color={RED} /> Retos y logros
      </h2>
      <div className="space-y-3">
        {challenges.map((item) => (
          <div key={item.id} className="rounded-xl border border-neutral-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-black text-[#111]">{item.title}</p>
                <p className="text-xs text-neutral-500">{item.detail}</p>
              </div>
              <span className={`text-xs font-black flex-shrink-0 ${item.done ? "text-[#FB2C39]" : "text-neutral-700"}`}>
                {item.reward}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-neutral-100 overflow-hidden">
                <div className="h-full rounded-full bg-[#FB2C39]" style={{ width: `${Math.max(0, Math.min(100, item.pct || 0))}%` }} />
              </div>
              <span className="text-[11px] font-black text-[#111] w-12 text-right">{item.pct || 0}%</span>
            </div>
            {item.total > 0 && item.id !== "record" && (
              <p className="text-[11px] text-neutral-500 mt-1">{item.current}/{item.total}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export function ClassificationTable({ ranked, title, reliable }) {
  return (
    <section className="bg-white border border-neutral-200 rounded-2xl shadow-card overflow-hidden">
      <div className="px-4 py-3 border-b border-neutral-100 flex items-center gap-2">
        <Trophy size={15} color={RED} />
        <h2 className="font-black text-[#111] text-sm">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-wide text-neutral-400">
              <th className="text-left font-bold px-4 py-2 w-10">#</th>
              <th className="text-left font-bold px-2 py-2">Jugador</th>
              <th className="text-right font-bold px-2 py-2">Puntos</th>
              <th className="text-right font-bold px-2 py-2">Sesiones</th>
              <th className="text-right font-bold px-4 py-2">Evolución</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((player) => (
              <tr key={player.id} className={player.mine ? "bg-[#fff1f2]" : "border-t border-neutral-100"}>
                <td className="px-4 py-3 font-black text-[#111]">
                  {player.rank <= 3 ? (
                    <span className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs text-white ${player.rank === 1 ? "bg-[#FB2C39]" : "bg-[#111]"}`}>
                      {player.rank}
                    </span>
                  ) : player.rank}
                </td>
                <td className="px-2 py-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-8 h-8 rounded-full bg-[#111] text-white text-[11px] font-black flex items-center justify-center flex-shrink-0">
                      {initials(player.name)}
                    </span>
                    <span className="font-bold text-[#111] truncate">
                      {player.name}
                      {player.mine && <span className="ml-1 text-[10px] font-black text-white bg-[#FB2C39] px-1.5 py-0.5 rounded-full align-middle">Tú</span>}
                    </span>
                  </div>
                </td>
                <td className="px-2 py-3 text-right font-black text-[#111]">{formatRankingNumber(player.points)}</td>
                <td className="px-2 py-3 text-right text-neutral-600">
                  <span className="inline-flex items-center gap-1 justify-end">
                    <Calendar size={12} /> {player.sessionsLabel}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Delta value={player.rankDelta} reliable={reliable} pointsDelta={player.pointsDelta} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
