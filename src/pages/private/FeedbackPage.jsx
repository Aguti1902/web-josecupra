import { useState, useEffect, useCallback } from "react";
import {
  Star, TrendingUp, MessageSquare, Calendar, Target, ChevronDown, ChevronUp,
  Send, Archive, ArchiveRestore, Inbox,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import FeatureGate from "../../components/private/FeatureGate";
import {
  getActivePlayerFeedback,
  getArchivedPlayerFeedback,
  archivePlayerFeedback,
  unarchivePlayerFeedback,
} from "../../lib/playerFeedback";
import { getChatMessages, sendChatMessage } from "../../lib/internalChat";
import { canPersistInTrial, TRIAL_LIMITED_MESSAGE } from "../../lib/trialPersistence";
import { hasFeatureAccess } from "../../lib/subscription";

function FeedbackCard({ fb, onArchive, onUnarchive, archived }) {
  const [open, setOpen] = useState(false);
  const stars = fb.rating != null ? Math.round(fb.rating / 2) : 0;
  return (
    <div className="card hover:shadow-card-hover transition-all">
      <button type="button" onClick={() => setOpen(!open)} className="w-full text-left">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-depro-blue-light rounded-xl flex items-center justify-center flex-shrink-0">
              <MessageSquare size={18} className="text-depro-blue" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-depro-dark truncate">
                {fb.week || "Revisión del preparador"}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <Calendar size={12} className="text-depro-gray" />
                <span className="text-xs text-depro-gray">{fb.date}</span>
                {fb.coach && (
                  <span className="text-xs text-depro-gray">· {fb.coach}</span>
                )}
              </div>
            </div>
          </div>
          {fb.rating != null && (
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <div className="flex gap-0.5">
                {Array(5).fill(0).map((_, i) => (
                  <Star key={i} size={13} className={i < stars ? "fill-depro-yellow text-depro-yellow" : "text-depro-border"} />
                ))}
              </div>
              <span className="text-xs text-depro-gray">{fb.rating}/10</span>
            </div>
          )}
        </div>
        <p className="text-depro-gray text-sm leading-relaxed line-clamp-2">{fb.message}</p>
        <div className="flex items-center justify-between mt-3 gap-2">
          <div className="flex gap-2 flex-wrap min-w-0">
            {fb.nextFocus && <span className="tag-blue truncate max-w-full">{fb.nextFocus}</span>}
          </div>
          <span className="text-xs text-depro-gray flex items-center gap-1 shrink-0">
            {open ? <><ChevronUp size={12} />Menos</> : <><ChevronDown size={12} />Más</>}
          </span>
        </div>
      </button>

      {open && (
        <div className="mt-4 pt-4 border-t border-depro-border space-y-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-depro-gray mb-2">Mensaje</div>
            <p className="text-depro-gray text-sm leading-relaxed">{fb.message}</p>
          </div>
          {fb.adjustments?.length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-depro-gray mb-2">
                Ajustes de carga física
              </div>
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
          {fb.nextFocus && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-depro-gray mb-2">
                Foco físico próximo
              </div>
              <div className="flex items-center gap-2">
                <Target size={14} className="text-depro-blue" />
                <span className="text-sm font-semibold text-depro-dark">{fb.nextFocus}</span>
              </div>
            </div>
          )}
          <div className="pt-1">
            {archived ? (
              <button
                type="button"
                onClick={() => onUnarchive?.(fb.id)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-depro-blue hover:underline"
              >
                <ArchiveRestore size={13} /> Restaurar a activos
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onArchive?.(fb.id)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-depro-gray hover:text-depro-dark"
              >
                <Archive size={13} /> Archivar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
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
    <div className="card mb-2">
      <h3 className="font-bold text-depro-dark mb-3 flex items-center gap-2">
        <MessageSquare size={18} className="text-depro-blue" /> Chat con tu preparador
      </h3>
      {!canSave && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-2 mb-3">
          {TRIAL_LIMITED_MESSAGE}
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
  const [tab, setTab] = useState("active");
  const [active, setActive] = useState([]);
  const [archived, setArchived] = useState([]);

  const reload = useCallback(() => {
    if (!user?.id) {
      setActive([]);
      setArchived([]);
      return;
    }
    setActive(getActivePlayerFeedback(user.id));
    setArchived(getArchivedPlayerFeedback(user.id));
  }, [user?.id]);

  useEffect(() => { reload(); }, [reload]);

  const handleArchive = (id) => {
    archivePlayerFeedback(user.id, id);
    reload();
  };
  const handleUnarchive = (id) => {
    unarchivePlayerFeedback(user.id, id);
    reload();
  };

  const list = tab === "active" ? active : archived;
  const rated = active.filter((f) => f.rating != null);
  const avg = rated.length
    ? (rated.reduce((a, f) => a + f.rating, 0) / rated.length).toFixed(1)
    : "—";

  return (
    <FeatureGate user={user} feature="feedback">
    <div className="dash-page space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl md:text-3xl font-black text-depro-dark mb-1">{t("feedback.title")}</h1>
        <p className="text-depro-gray text-sm">
          Mensajes reales de tu preparador físico sobre tu plan y cargas. Sin plantillas ni notas tácticas.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Activos", value: active.length, icon: Inbox },
          { label: t("feedback.notes"), value: `${avg}${avg !== "—" ? "/10" : ""}`, icon: Star },
          { label: "Archivados", value: archived.length, icon: Archive },
        ].map((s) => (
          <div key={s.label} className="card text-center">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2 bg-depro-blue-light">
              <s.icon size={16} className="text-depro-blue" />
            </div>
            <div className="font-black text-depro-dark mb-0.5 text-xl">{s.value}</div>
            <div className="text-xs text-depro-gray">{s.label}</div>
          </div>
        ))}
      </div>

      {hasFeatureAccess(user, "coach_contact") && <InternalChatPanel user={user} />}

      <div className="flex gap-2">
        {[
          { id: "active", label: "Activos", count: active.length },
          { id: "archived", label: "Archivados", count: archived.length },
        ].map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => setTab(x.id)}
            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
              tab === x.id
                ? "bg-depro-blue border-depro-blue text-white"
                : "border-depro-border text-depro-gray hover:border-depro-blue"
            }`}
          >
            {x.label} ({x.count})
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {list.length === 0 ? (
          <div className="card text-center py-12">
            <MessageSquare size={28} className="mx-auto mb-3 text-depro-gray" />
            <p className="font-bold text-depro-dark mb-1">
              {tab === "active" ? t("feedback.no_feedback") : "No hay feedback archivado"}
            </p>
            <p className="text-sm text-depro-gray max-w-md mx-auto">
              {tab === "active"
                ? "Cuando tu preparador envíe una revisión de preparación física, aparecerá aquí. Puedes archivarla cuando la hayas leído."
                : "Los mensajes que archives se guardan aquí para consultarlos más tarde."}
            </p>
          </div>
        ) : (
          list.map((fb) => (
            <FeedbackCard
              key={fb.id}
              fb={fb}
              archived={tab === "archived"}
              onArchive={handleArchive}
              onUnarchive={handleUnarchive}
            />
          ))
        )}
      </div>
    </div>
    </FeatureGate>
  );
}
