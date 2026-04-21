import { Link } from "react-router-dom";
import {
  Calendar,
  TrendingUp,
  Zap,
  CheckCircle,
  Clock,
  ArrowRight,
  Activity,
  Target,
  Flame,
  Trophy,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { weeklyPlan, coachFeedback } from "../../data/mockData";

function StatCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div className="card group hover:scale-[1.02] transition-transform cursor-default">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: color + "20" }}
        >
          <Icon size={20} style={{ color }} />
        </div>
        <TrendingUp size={14} className="text-pitch-400" />
      </div>
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-sm text-gray-400 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-gray-600 mt-1">{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const club = user?.club;
  const accent = club?.primaryColor || "#0ea5e9";

  const today = weeklyPlan.find((d) => d.sessions.some((s) => s.status === "today"));
  const todaySession = today?.sessions[0];
  const completedDays = weeklyPlan.filter((d) => d.sessions.some((s) => s.status === "completed")).length;
  const lastFeedback = coachFeedback[0];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome */}
      <div
        className="rounded-3xl p-8 border"
        style={{
          background: `linear-gradient(135deg, ${accent}15 0%, transparent 100%)`,
          borderColor: accent + "30",
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-xl flex-shrink-0"
            style={{ backgroundColor: accent + "20", color: accent }}
          >
            {user?.avatar}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold mb-1" style={{ color: accent }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-1">
              Welcome back, {user?.name?.split(" ")[0]}.
            </h2>
            <p className="text-gray-400">
              {user?.role === "club"
                ? `${user.players} players on the program · ${user.category}`
                : `${user.trainingDays} training days this week · ${user.level}`}
            </p>
          </div>
          {todaySession && (
            <Link
              to="/dashboard/plan"
              className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105"
              style={{ backgroundColor: accent, color: "#fff" }}
            >
              <Flame size={16} />
              Today's Session
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Sessions completed"
          value={completedDays}
          sub="this week"
          icon={CheckCircle}
          color="#22c55e"
        />
        <StatCard
          label="Training days"
          value={user?.trainingDays || 5}
          sub="per week"
          icon={Calendar}
          color={accent}
        />
        <StatCard
          label="Coach rating"
          value={`${lastFeedback.rating}/10`}
          sub="last review"
          icon={Trophy}
          color="#f59e0b"
        />
        <StatCard
          label="Current plan"
          value={user?.plan}
          sub="active"
          icon={Zap}
          color="#a855f7"
        />
      </div>

      {/* Main content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's session */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white">Today's Session</h3>
            <Link to="/dashboard/plan" className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
              Full plan <ArrowRight size={14} />
            </Link>
          </div>
          {todaySession ? (
            <div className="card">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: accent + "20", color: accent }}
                    >
                      {todaySession.type}
                    </span>
                    <span className="text-xs text-gray-500">{todaySession.intensity} intensity</span>
                  </div>
                  <h4 className="text-lg font-bold text-white">{todaySession.title}</h4>
                  <p className="text-sm text-gray-400 mt-1">{todaySession.objective}</p>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400 text-sm flex-shrink-0">
                  <Clock size={14} />
                  {todaySession.duration}
                </div>
              </div>
              <div className="space-y-2">
                {todaySession.exercises.slice(0, 3).map((ex, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 px-3 bg-gray-800/50 rounded-xl">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: accent + "20", color: accent }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white">{ex.name}</div>
                      <div className="text-xs text-gray-500">{ex.duration} · {ex.sets} sets · {ex.reps}</div>
                    </div>
                  </div>
                ))}
                {todaySession.exercises.length > 3 && (
                  <p className="text-xs text-gray-600 text-center pt-1">
                    + {todaySession.exercises.length - 3} more exercises
                  </p>
                )}
              </div>
              <Link
                to="/dashboard/plan"
                className="mt-5 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
                style={{ backgroundColor: accent + "20", color: accent }}
              >
                Start Session <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="card text-center py-12">
              <Trophy size={32} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">Rest day — recovery is training too.</p>
            </div>
          )}
        </div>

        {/* Sidebar cards */}
        <div className="space-y-4">
          {/* Week progress */}
          <div>
            <h3 className="font-bold text-white mb-4">Week Progress</h3>
            <div className="card">
              <div className="grid grid-cols-7 gap-1.5 mb-4">
                {weeklyPlan.map((day) => {
                  const s = day.sessions[0];
                  const status = s?.status;
                  return (
                    <div key={day.shortDay} className="flex flex-col items-center gap-1.5">
                      <div className="text-xs text-gray-600 font-medium">{day.shortDay}</div>
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                          status === "completed"
                            ? "bg-pitch-500 text-white"
                            : status === "today"
                            ? "text-white animate-pulse-slow"
                            : day.sessions.length === 0
                            ? "bg-gray-800/50 text-gray-700"
                            : "bg-gray-800 text-gray-500"
                        }`}
                        style={status === "today" ? { backgroundColor: accent } : {}}
                      >
                        {status === "completed" ? "✓" : status === "today" ? "▶" : day.sessions.length === 0 ? "–" : "○"}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-pitch-500 rounded-full transition-all"
                    style={{ width: `${(completedDays / 5) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 font-medium">{completedDays}/5</span>
              </div>
            </div>
          </div>

          {/* Coach feedback */}
          <div>
            <h3 className="font-bold text-white mb-4">Latest Feedback</h3>
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center">
                  <Target size={14} className="text-brand-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{lastFeedback.coach}</div>
                  <div className="text-xs text-gray-500">{lastFeedback.week} · {lastFeedback.date}</div>
                </div>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed line-clamp-4">
                {lastFeedback.message}
              </p>
              <div className="mt-3 pt-3 border-t border-white/5">
                <div className="text-xs text-gray-500 mb-1.5">Next focus:</div>
                <div className="text-xs font-semibold text-white">{lastFeedback.nextFocus}</div>
              </div>
              <Link
                to="/dashboard/feedback"
                className="mt-4 text-xs font-semibold flex items-center gap-1 transition-colors"
                style={{ color: accent }}
              >
                View all feedback <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Quick nav */}
          <div>
            <h3 className="font-bold text-white mb-4">Quick Access</h3>
            <div className="space-y-2">
              {[
                { to: "/dashboard/technique", label: "Technique Library", icon: Zap },
                { to: "/dashboard/physical", label: "Physical Training", icon: Activity },
                { to: "/dashboard/library", label: "Session Library", icon: Calendar },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-3 p-3 bg-gray-900 border border-white/5 hover:border-white/15 rounded-xl text-sm text-gray-400 hover:text-white transition-all group"
                >
                  <item.icon size={16} />
                  {item.label}
                  <ArrowRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
