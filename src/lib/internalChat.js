/** Mensajería interna jugador ↔ preparador (localStorage). */

export function chatKey(userId) {
  return `depro_chat_${userId}`;
}

export function getChatMessages(userId) {
  if (!userId) return [];
  try {
    return JSON.parse(localStorage.getItem(chatKey(userId)) || "[]");
  } catch {
    return [];
  }
}

export function sendChatMessage(userId, { text, from = "player", authorName = "" }) {
  if (!userId || !text?.trim()) return null;
  const msg = {
    id: `msg_${Date.now()}`,
    text: text.trim(),
    from,
    authorName,
    createdAt: new Date().toISOString(),
  };
  const next = [...getChatMessages(userId), msg];
  localStorage.setItem(chatKey(userId), JSON.stringify(next.slice(-200)));
  return msg;
}

export function listAdminChatClients() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith("depro_chat_")) keys.push(k.replace("depro_chat_", ""));
  }
  return keys;
}
