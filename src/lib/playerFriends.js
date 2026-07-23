/** Amigos del jugador — invitaciones por enlace y ranking social. */
import { buildPublicStats } from "./loadAnalytics";

const FRIENDS_KEY = (userId) => `depro_friends_${userId}`;
const INVITE_KEY = (userId) => `depro_invite_code_${userId}`;

function hashInviteCode(userId) {
  let h = 2166136261;
  for (let i = 0; i < userId.length; i++) {
    h ^= userId.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `DP${String(Math.abs(h) % 900000 + 100000)}`;
}

export function getOrCreateInviteCode(userId) {
  if (!userId) return null;
  let code = localStorage.getItem(INVITE_KEY(userId));
  if (!code) {
    code = hashInviteCode(userId);
    localStorage.setItem(INVITE_KEY(userId), code);
  }
  return code;
}

export function getInviteLink(userId) {
  const code = getOrCreateInviteCode(userId);
  if (!code) return "";
  const base = typeof window !== "undefined" ? window.location.origin : "";
  return `${base}/dashboard/ranking?invite=${code}`;
}

export function getFriends(userId) {
  if (!userId) return [];
  try {
    return JSON.parse(localStorage.getItem(FRIENDS_KEY(userId)) || "[]");
  } catch {
    return [];
  }
}

export function saveFriends(userId, friends) {
  if (!userId) return;
  localStorage.setItem(FRIENDS_KEY(userId), JSON.stringify(friends.slice(0, 50)));
}

export function addFriend(userId, friend) {
  if (!userId || !friend?.id || friend.id === userId) return getFriends(userId);
  const friends = getFriends(userId).filter((f) => f.id !== friend.id);
  friends.unshift({
    id: friend.id,
    name: friend.name || "Jugador",
    avatar: friend.avatar || null,
    plan: friend.plan || null,
    inviteCode: friend.inviteCode || null,
    addedAt: new Date().toISOString(),
  });
  saveFriends(userId, friends);
  return friends;
}

export function removeFriend(userId, friendId) {
  const next = getFriends(userId).filter((f) => f.id !== friendId);
  saveFriends(userId, next);
  return next;
}

export function isPlayerPlanUser(user) {
  return user?.role === "player" || String(user?.plan || "").startsWith("player");
}

export async function registerSocialProfile(user, extraStats = {}) {
  if (!user?.id || !isPlayerPlanUser(user)) return null;
  const inviteCode = getOrCreateInviteCode(user.id);
  const stats = { ...buildPublicStats(user.id), ...extraStats };
  try {
    const res = await fetch("/api/player-social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "register",
        userId: user.id,
        name: user.name || user.email?.split("@")[0] || "Jugador",
        plan: user.plan || null,
        inviteCode,
        stats,
      }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function syncSocialStats(userId, stats) {
  if (!userId) return null;
  try {
    const res = await fetch("/api/player-social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "sync", userId, stats }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function lookupInviteCode(code) {
  if (!code) return null;
  try {
    const res = await fetch(`/api/player-social?code=${encodeURIComponent(String(code).toUpperCase())}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchFriendProfiles(friendIds) {
  if (!friendIds?.length) return [];
  try {
    const res = await fetch(`/api/player-social?ids=${encodeURIComponent(friendIds.join(","))}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.profiles || [];
  } catch {
    return [];
  }
}

export async function acceptInvite(currentUser, inviteCode) {
  if (!currentUser?.id || !inviteCode) return { ok: false, error: "Código no válido" };
  const profile = await lookupInviteCode(inviteCode);
  if (!profile?.userId) return { ok: false, error: "Enlace no encontrado o expirado" };
  if (profile.userId === currentUser.id) return { ok: false, error: "No puedes añadirte a ti mismo" };
  addFriend(currentUser.id, {
    id: profile.userId,
    name: profile.name,
    plan: profile.plan,
    inviteCode: profile.inviteCode,
  });
  await registerSocialProfile(currentUser);
  return { ok: true, friend: profile };
}
