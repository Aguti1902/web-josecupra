import { useState } from "react";
import { Link2, Share2, UserPlus, Users, Copy, Check, Trash2, X } from "lucide-react";
import {
  getFriends,
  getInviteLink,
  removeFriend,
  acceptInvite,
  registerSocialProfile,
} from "../../lib/playerFriends";

export default function FriendsPanel({ user, onFriendsChange }) {
  const [friends, setFriends] = useState(() => getFriends(user?.id));
  const [inviteInput, setInviteInput] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const inviteLink = getInviteLink(user?.id);

  const refresh = (next) => {
    setFriends(next);
    onFriendsChange?.(next);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("No se pudo copiar el enlace");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Únete a mi ranking DEPRO",
          text: "Entrena conmigo y compite en el ranking de amigos.",
          url: inviteLink,
        });
        return;
      } catch { /* fallback copy */ }
    }
    handleCopy();
  };

  const handleJoin = async () => {
    setError("");
    setMessage("");
    const code = inviteInput.trim().replace(/^.*invite=/i, "").split("&")[0];
    if (!code) {
      setError("Pega un enlace o código de invitación");
      return;
    }
    setLoading(true);
    const result = await acceptInvite(user, code.toUpperCase());
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setInviteInput("");
    setMessage(`${result.friend.name} añadido a tus amigos`);
    refresh(getFriends(user?.id));
  };

  const handleRemove = (friendId) => {
    refresh(removeFriend(user?.id, friendId));
  };

  const handleRegister = async () => {
    setLoading(true);
    await registerSocialProfile(user);
    setLoading(false);
    setMessage("Tu perfil está listo para compartir");
  };

  return (
    <div className="bg-white border border-depro-border rounded-2xl p-5 shadow-card space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-depro-dark flex items-center gap-2">
            <Users size={16} className="text-depro-blue" /> Amigos
          </h2>
          <p className="text-xs text-depro-gray mt-1">
            Comparte tu enlace con otros jugadores DEPRO para unirse y comparar progreso.
          </p>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-depro-blue/10 text-depro-blue flex-shrink-0">
          {friends.length} amigo{friends.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="rounded-xl border border-depro-border bg-depro-gray-light/40 p-4 space-y-3">
        <p className="text-xs font-bold text-depro-dark uppercase tracking-wide">Tu enlace de invitación</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            readOnly
            value={inviteLink}
            className="admin-input flex-1 text-xs bg-white"
            onFocus={(e) => e.target.select()}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full border border-depro-border text-xs font-bold text-depro-dark hover:border-depro-blue transition-colors"
            >
              {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
              {copied ? "Copiado" : "Copiar"}
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold text-white bg-depro-blue hover:opacity-90 transition-colors"
            >
              <Share2 size={14} /> Compartir
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleRegister}
          disabled={loading}
          className="text-[11px] font-semibold text-depro-blue hover:underline inline-flex items-center gap-1"
        >
          <Link2 size={12} /> Activar mi perfil público para amigos
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold text-depro-dark uppercase tracking-wide">Unirse con enlace o código</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={inviteInput}
            onChange={(e) => setInviteInput(e.target.value)}
            placeholder="Pega el enlace o código DP123456"
            className="admin-input flex-1 text-sm"
          />
          <button
            type="button"
            onClick={handleJoin}
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-bold text-white bg-depro-blue hover:opacity-90 disabled:opacity-50"
          >
            <UserPlus size={15} /> Unirme
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2 flex items-center gap-2">
          <X size={14} /> {error}
        </p>
      )}
      {message && (
        <p className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">{message}</p>
      )}

      {friends.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-depro-dark uppercase tracking-wide">Tus amigos</p>
          {friends.map((friend) => (
            <div key={friend.id} className="flex items-center gap-3 p-3 rounded-xl border border-depro-border">
              <div className="w-9 h-9 rounded-xl bg-depro-blue/10 text-depro-blue flex items-center justify-center text-xs font-black flex-shrink-0">
                {(friend.name || "?").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-depro-dark truncate">{friend.name}</p>
                <p className="text-[10px] text-depro-gray">{friend.plan || "Jugador DEPRO"}</p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(friend.id)}
                className="p-2 rounded-lg text-depro-gray hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Eliminar amigo"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export async function processInviteFromUrl(user, inviteCode, onFriendsChange) {
  if (!user?.id || !inviteCode) return null;
  const existing = getFriends(user.id);
  const result = await acceptInvite(user, inviteCode);
  if (result.ok && existing.length !== getFriends(user.id).length) {
    onFriendsChange?.(getFriends(user.id));
    return result.friend?.name;
  }
  return null;
}
