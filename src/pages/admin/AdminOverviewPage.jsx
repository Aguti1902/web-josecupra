import { Link } from "react-router-dom";
import {
  Users,
  TrendingUp,
  MessageSquare,
  Video,
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  Star,
} from "lucide-react";
import { useAdmin } from "../../context/AdminContext";

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div
      className="rounded-2xl p-5 border"
      style={{ borderColor: color + "20", background: color + "08" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: color + "20" }}
        >
          <Icon size={20} style={{ color }} />
        </div>
        <TrendingUp size={14} className="text-pitch-400 mt-1" />
      </div>
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-sm text-gray-400 mt-0.5">{label}</div>
      {sub && <div className="text-xs mt-1" style={{ color }}>{sub}</div>}
    </div>
  );
}

export default function AdminOverviewPage() {
  const { clients, clientFeedback, clientContent } = useAdmin();

  const totalVideos = Object.values(clientContent).reduce(
    (acc, c) => acc + (c.videos?.length || 0),
    0
  );
  const totalPdfs = Object.values(clientContent).reduce(
    (acc, c) => acc + (c.pdfs?.length || 0),
    0
  );
  const totalFeedbacks = Object.values(clientFeedback).reduce(
    (acc, f) => acc + f.length,
    0
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-white mb-1">Overview</h1>
        <p className="text-gray-400 text-sm">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active clients" value={clients.length} icon={Users} color="#a855f7" sub="All active" />
        <StatCard label="Videos uploaded" value={totalVideos} icon={Video} color="#0ea5e9" sub="Across all clients" />
        <StatCard label="PDFs shared" value={totalPdfs} icon={Calendar} color="#f59e0b" sub="Documents sent" />
        <StatCard label="Feedback notes" value={totalFeedbacks} icon={MessageSquare} color="#22c55e" sub="Weekly reviews" />
      </div>

      {/* Client list */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Your Clients</h2>
          <Link
            to="/admin/clients"
            className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
          >
            Manage all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map((client) => {
            const accent = client.club?.primaryColor || "#a855f7";
            const lastFb = clientFeedback[client.id]?.[0];
            const videos = clientContent[client.id]?.videos?.length || 0;
            const pdfs = clientContent[client.id]?.pdfs?.length || 0;

            return (
              <Link
                key={client.id}
                to={`/admin/clients/${client.id}`}
                className="block rounded-2xl border border-white/10 hover:border-white/20 bg-gray-900/50 hover:bg-gray-900 transition-all group"
              >
                {/* Club color bar */}
                <div
                  className="h-1.5 rounded-t-2xl"
                  style={{ backgroundColor: accent }}
                />
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black flex-shrink-0"
                      style={{ backgroundColor: accent + "20", color: accent }}
                    >
                      {client.club?.logo || "⚽"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-white truncate">{client.name}</div>
                      <div className="text-xs text-gray-400 truncate">{client.club?.name}</div>
                      <div
                        className="text-xs font-semibold mt-0.5"
                        style={{ color: accent }}
                      >
                        {client.plan}
                      </div>
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-gray-600 group-hover:text-purple-400 transition-colors mt-1 flex-shrink-0"
                    />
                  </div>

                  {/* Info row */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { label: "Videos", value: videos, icon: Video },
                      { label: "PDFs", value: pdfs, icon: Calendar },
                      { label: "Reviews", value: clientFeedback[client.id]?.length || 0, icon: MessageSquare },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="bg-gray-800/60 rounded-xl p-2 text-center"
                      >
                        <div className="text-lg font-black text-white">{s.value}</div>
                        <div className="text-xs text-gray-500">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Last feedback */}
                  {lastFb && (
                    <div className="border-t border-white/5 pt-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Clock size={11} className="text-gray-500" />
                        <span className="text-xs text-gray-500">Last review: {lastFb.date}</span>
                        <div className="ml-auto flex items-center gap-0.5">
                          {Array(5).fill(0).map((_, i) => (
                            <Star
                              key={i}
                              size={10}
                              className={
                                i < Math.round(lastFb.rating / 2)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-700"
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-2">{lastFb.message}</p>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-bold text-white mb-5">Quick Actions</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: "📅",
              label: "Edit a weekly plan",
              desc: "Modify sessions, exercises and objectives for any client",
              to: "/admin/clients",
              color: "#0ea5e9",
            },
            {
              icon: "📹",
              label: "Upload content",
              desc: "Add videos and PDFs to a client's private library",
              to: "/admin/clients",
              color: "#a855f7",
            },
            {
              icon: "💬",
              label: "Send feedback",
              desc: "Write weekly review notes for a client",
              to: "/admin/clients",
              color: "#22c55e",
            },
          ].map((a) => (
            <Link
              key={a.label}
              to={a.to}
              className="rounded-2xl border border-white/10 hover:border-white/20 bg-gray-900/50 hover:bg-gray-900 p-5 transition-all group flex items-start gap-4"
            >
              <span className="text-2xl">{a.icon}</span>
              <div>
                <div className="font-semibold text-white text-sm mb-1 group-hover:text-purple-300 transition-colors">
                  {a.label}
                </div>
                <div className="text-xs text-gray-500 leading-relaxed">{a.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
