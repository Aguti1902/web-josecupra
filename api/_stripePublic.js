/** Clave publicable Stripe. Fallback test si Vercel no inyecta env. */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

function clean(value) {
  return String(value || "").trim().replace(/^["']|["']$/g, "");
}

export const STRIPE_TEST_PUBLISHABLE_KEY =
  "pk_test_51TVzAWL0FQK1XtUnkAE6it45JKwnJnF2fDTrUYYcNDzmey00viN4Iaji4yM753tQVB1wvuURdKhDPF5xv2DGtpJf00HrLOieCX";

function readPublicConfig() {
  try {
    const path = resolve(dirname(fileURLToPath(import.meta.url)), "../config/stripe.public.json");
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return {};
  }
}

export function resolveStripePublishableKey() {
  const fromEnv = clean(
    process.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    process.env.STRIPE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    "",
  );
  if (fromEnv) return fromEnv;

  const forced = clean(process.env.VITE_STRIPE_MODE || process.env.STRIPE_MODE).toLowerCase();
  const cfg = readPublicConfig();
  if (forced === "live") {
    return clean(cfg.livePublishableKey || "");
  }
  return clean(cfg.testPublishableKey || STRIPE_TEST_PUBLISHABLE_KEY);
}

export function resolveStripeMode(publishableKey = resolveStripePublishableKey()) {
  const forced = clean(process.env.VITE_STRIPE_MODE || process.env.STRIPE_MODE).toLowerCase();
  if (forced === "test") return true;
  if (forced === "live") return false;
  return publishableKey.includes("_test_");
}
