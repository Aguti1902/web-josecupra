import { useState, useEffect } from "react";
import { Star, TrendingUp, MessageSquare, Calendar, Target, ChevronDown, ChevronUp, Send } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import FeatureGate from "../../components/private/FeatureGate";
import { coachFeedback } from "../../data/mockData";
import { getChatMessages, sendChatMessage } from "../../lib/internalChat";
import { canPersistInTrial } from "../../lib/trialPersistence";
import { hasFeatureAccess } from "../../lib/subscription";

function FeedbackCard({ fb }) {
  const [open, setOpen] = useState(false);
  const stars = Math.round(fb.rating / 2);
  return (
    <div className="card hover:shadow-card-hover transition-all">
      <button onClick={() => setOpen(!open)} className="w-full text-left">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-depro-blue-light rounded-xl flex items-center justify-center flex-shrink-0">
              <MessageSquare size={18} className="text-depro-blue" />
            </div>
            <div>
              <div className="font-bold text-depro-dark">{fb.week}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Calendar size={12} className="text-depro-gray" />
                <span className="text-xs text-depro-gray">{fb.date}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <div className="flex gap-0.5">
              {Array(5).fill(0).map((_, i) => (
                <Star key={i} size={13} className={i < stars ? "fill-depro-yellow text-depro-yellow" : "text-depro-border"} />
              ))}
            </div>
            <span className="text-xs text-depro-gray">{fb.rating}/10</span>
          </div>
        </div>
        <p className="text-depro-gray text-sm leading-relaxed line-clamp-2">{fb.message}</p>
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-2 flex-wrap">
            <span className="tag-blue">{fb.nextFocus}</span>
          </div>
          <span className="text-xs text-depro-gray flex items-center gap-1">
            {open ? <><ChevronUp size={12} />Menos</> : <><ChevronDown size={12} />Más</>}
          </span>
        </div>
      </button>

      {open && (
        <div className="mt-4 pt-4 border-t border-depro-border space-y-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-depro-gray mb-2">Mensaje completo</div>
            <p className="text-depro-gray text-sm leading-relaxed">{fb.message}</p>
          </div>
          {fb.adjustments?.length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-depro-gray mb-2">Ajustes de carga</div>
              <div className="space-y-1.5">
                {fb.adjustments.map((adj, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <TrendingUp size={13} className="text-depro-blue mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-depro-gray">{adj}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-depro-gray mb-2">Próximo foco</div>
            <div className="flex items-center gap-2">
              <Target size={14} className="text-depro-blue" />
              <span className="text-sm font-semibold text-depro-dark">{fb.nextFocus}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function lum(hex) {
  try {
    const h = (hex || "#000").replace("#", "");
    return (0.299 * parseInt(h.slice(0,2),16) + 0.587 * parseInt(h.slice(2,4),16) + 0.114 * parseInt(h.slice(4,6),16)) / 255;
  } catch { return 0; }
}

function InternalChatPanel({ user }) {
  const [messages, setMessages] = useState(() => getChatMessages(user?.id));
  const [text, setText] = useState("");
  const canSave = canPersistInTrial(user, "save_stats");

  const handleSend = () => {
    if (!text.trim()) return;
    if (!canSave) {
      setMessages((prev) => [...prev, { id: `tmp_${Date.now()}`, text, from: "player" }]);
      setText("");
      return;
    }
    sendChatMessage(user?.id, { text, from: "player", authorName: user?.name });
    setMessages(getChatMessages(user?.id));
    setText("");
  };

  return (
    <div className="card mb-8">
      <h3 className="font-bold text-depro-dark mb-3 flex items-center gap-2">
        <MessageSquare size={18} className="text-depro-blue" /> Chat con tu preparador
      </h3>
      {!canSave && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-2 mb-3">
          Modo demo: puedes probar el chat, pero los mensajes no se guardan permanentemente.
        </p>
      )}
      <div className="max-h-56 overflow-y-auto space-y-2 mb-3 bg-depro-gray-light rounded-xl p-3 border border-depro-border">
        {messages.length === 0 && <p className="text-xs text-depro-gray text-center py-4">Sin mensajes aún.</p>}
        {messages.map((m) => (
          <div key={m.id} className={`text-sm rounded-lg px-3 py-2 max-w-[85%] ${
            m.from === "player" ? "ml-auto bg-depro-blue text-white" : "bg-white border border-depro-border text-depro-dark"
          }`}>
            {m.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="admin-input flex-1 text-sm"
          placeholder="Escribe tu mensaje…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button type="button" onClick={handleSend} className="btn-primary px-4 flex items-center gap-1">
          <Send size={14} /> Enviar
        </button>
      </div>
    </div>
  );
}

export default function FeedbackPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const raw    = user?.club?.primaryColor || "#0A36F7";
  const accent = lum(raw) > 0.75 ? "#0A36F7" : raw;
  const avg = (coachFeedback.reduce((a, f) => a + f.rating, 0) / coachFeedback.length).toFixed(1);

  return (
    <FeatureGate user={user} feature="feedback">
    <div className="dash-page space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-depro-dark mb-1">{t("feedback.title")}</h1>
        <p className="text-depro-gray text-sm">{t("feedback.subtitle")}</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: t("feedback.notes"),     value: coachFeedback.length, icon: MessageSquare },
          { label: t("feedback.technique"), value: `${avg}/10`, icon: Star },
          { label: t("feedback.adjustment"),value: coachFeedback[0]?.nextFocus || "—", icon: Target, small: true },
        ].map((s) => (
          <div key={s.label} className="card text-center">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: accent + "15" }}>
              <s.icon size={16} style={{ color: accent }} />
            </div>
            <div className={`font-black text-depro-dark mb-0.5 ${s.small ? "text-sm" : "text-xl"}`}>{s.value}</div>
            <div className="text-xs text-depro-gray">{s.label}</div>
          </div>
        ))}
      </div>

      {hasFeatureAccess(user, "coach_contact") && <InternalChatPanel user={user} />}

      {/* Cards */}
      <div className="space-y-4">
        {coachFeedback.map((fb) => <FeedbackCard key={fb.week} fb={fb} />)}
      </div>
    </div>
    </FeatureGate>
  );
}
