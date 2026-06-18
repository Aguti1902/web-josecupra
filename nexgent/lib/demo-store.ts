/**
 * DEMO vs PRODUCCIÓN
 * ------------------
 * DEMO: fallback localStorage cuando Supabase no está configurado.
 * PRODUCCIÓN: eliminar este módulo; todo va a Postgres.
 */

const PREFIX = "nexgent_demo_";

export function demoGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function demoSet<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}
