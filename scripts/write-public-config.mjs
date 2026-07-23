/**
 * Escribe public/runtime-config.json en build (Vercel inyecta env en npm run build).
 * Fallback estático si /api/stripe-config no tiene la clave.
 */
import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = resolve(root, "public");

function clean(value) {
  return String(value || "").trim().replace(/^["']|["']$/g, "");
}

const publishableKey = clean(
  process.env.VITE_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY,
);
const forced = clean(process.env.VITE_STRIPE_MODE || process.env.STRIPE_MODE).toLowerCase();
const testMode =
  forced === "test" ||
  (forced !== "live" && publishableKey.includes("_test_"));

mkdirSync(publicDir, { recursive: true });
writeFileSync(
  resolve(publicDir, "runtime-config.json"),
  `${JSON.stringify({ publishableKey, testMode }, null, 2)}\n`,
);

if (publishableKey) {
  console.log("✅ runtime-config.json generado (Stripe publishable key presente)");
} else {
  console.warn("⚠️  Sin VITE_STRIPE_PUBLISHABLE_KEY en build — configura Vercel env y redeploy");
}
