/**
 * Escribe public/runtime-config.json en build (Vercel inyecta env en npm run build).
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function clean(value) {
  return String(value || "").trim().replace(/^["']|["']$/g, "");
}

const stripePublic = JSON.parse(
  readFileSync(resolve(root, "config/stripe.public.json"), "utf8"),
);

const publishableKey = clean(
  process.env.VITE_STRIPE_PUBLISHABLE_KEY ||
  process.env.STRIPE_PUBLISHABLE_KEY ||
  stripePublic.testPublishableKey,
);
const forced = clean(process.env.VITE_STRIPE_MODE || process.env.STRIPE_MODE).toLowerCase();
const testMode =
  forced === "test" ||
  (forced !== "live" && publishableKey.includes("_test_"));

const publicDir = resolve(root, "public");
mkdirSync(publicDir, { recursive: true });
writeFileSync(
  resolve(publicDir, "runtime-config.json"),
  `${JSON.stringify({ publishableKey, testMode }, null, 2)}\n`,
);

if (process.env.VITE_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY) {
  console.log("✅ runtime-config.json generado desde env de Vercel");
} else {
  console.warn("⚠️  Usando pk_test de config/stripe.public.json (fallback)");
}
