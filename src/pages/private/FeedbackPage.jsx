import { MessageSquare, Target, Star, CheckCircle, ArrowRight, Clock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { coachFeedback } from "../../data/mockData";

function RatingBar({ value, max = 10, color }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${(value / max) * 100}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-sm font-bold text-white w-8 text-right">{value}/{max}</span>
    </div>
  );
}

export default function FeedbackPage() {
  const { user } = useAuth();
  const accent = user?.club?.primaryColor || "#0ea5e9";

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: accent + "20" }}
          >
            <MessageSquare size={20} style={{ color: accent }} />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Coach Feedback</h1>
        </div>
        <p className="text-gray-400 text-sm">Weekly reviews, adjustments and progress notes from your coach</p>
      </div>

      {/* Latest feedback highlight */}
      {coachFeedback.length > 0 && (
        <div
          className="rounded-3xl p-6 border mb-8"
          style={{ backgroundColor: accent + "08", borderColor: accent + "25" }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg"
              style={{ backgroundColor: accent + "20", color: accent }}
            >
              C
            </div>
            <div>
              <div className="text-white font-bold">{coachFeedback[0].coach}</div>
              <div className="text-xs text-gray-400">{coachFeedback[0].week} · {coachFeedback[0].date}</div>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              {Array(5).fill(0).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < Math.round(coachFeedback[0].rating / 2) ? "fill-yellow-400 text-yellow-400" : "text-gray-700"}
                />
              ))}
            </div>
          </div>

          <p className="text-gray-200 leading-relaxed mb-6">{coachFeedback[0].message}</p>

          {/* Rating */}
          <div className="mb-6">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Performance Rating
            </div>
            <RatingBar value={coachFeedback[0].rating} color={accent} />
          </div>

          {/* Adjustments */}
          <div className="mb-5">
            <div className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Target size={15} style={{ color: accent }} />
              Adjustments made this week
            </div>
            <div className="space-y-2">
              {coachFeedback[0].adjustments.map((adj, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle size={14} style={{ color: accent }} className="flex-shrink-0" />
                  {adj}
                </div>
              ))}
            </div>
          </div>

          {/* Next focus */}
          <div
            className="flex items-center gap-3 p-4 rounded-2xl"
            style={{ backgroundColor: accent + "15" }}
          >
            <ArrowRight size={18} style={{ color: accent }} className="flex-shrink-0" />
            <div>
              <div className="text-xs text-gray-400 font-medium mb-0.5">Next week's focus</div>
              <div className="text-sm font-bold text-white">{coachFeedback[0].nextFocus}</div>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Previous Reviews</h2>
        <div className="space-y-4">
          {coachFeedback.slice(1).map((fb) => (
            <div key={fb.id} className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center">
                  <Clock size={16} className="text-gray-500" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{fb.week}</div>
                  <div className="text-xs text-gray-500">{fb.date}</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-xs text-gray-500 mb-1">Rating</div>
                  <div className="text-sm font-bold text-white">{fb.rating}/10</div>
                </div>
              </div>

              <p className="text-sm text-gray-400 leading-relaxed mb-4">{fb.message}</p>

              <div className="border-t border-white/5 pt-4">
                <div className="text-xs text-gray-500 mb-2">Adjustments</div>
                <div className="space-y-1.5">
                  {fb.adjustments.map((adj, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                      <CheckCircle size={12} className="text-pitch-400 flex-shrink-0" />
                      {adj}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message coach */}
      <div className="mt-8 card">
        <h3 className="font-bold text-white mb-4">Send a message to your coach</h3>
        <textarea
          rows={4}
          className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors text-sm resize-none mb-4"
          placeholder="How's training going? Any concerns, questions or feedback for your coach..."
        />
        <button
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
          style={{ backgroundColor: accent }}
        >
          <MessageSquare size={15} />
          Send Message
        </button>
      </div>
    </div>
  );
}
