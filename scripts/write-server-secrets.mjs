/**
 * Embebe STRIPE_SECRET_KEY en build para Vercel (runtime no recibe env vars).
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function clean(value) {
  return String(value || "").trim().replace(/^["']|["']$/g, "");
}

let fromFile = "";
try {
  fromFile = clean(
    JSON.parse(readFileSync(resolve(root, "config/stripe.secrets.test.json"), "utf8")).testSecretKey,
  );
} catch { /* ignore */ }

const secret = clean(process.env.STRIPE_SECRET_KEY || process.env.STRIPE_TEST_SECRET_KEY || fromFile);
const outPath = resolve(root, "api/_stripeSecret.embedded.js");

writeFileSync(outPath, `export default ${JSON.stringify(secret)};\n`);

if (secret) {
  console.log("✅ Stripe secret embebido en api/_stripeSecret.embedded.js");
} else {
  console.warn("⚠️  Sin STRIPE_SECRET_KEY — anade sk_test_... en Vercel o config/stripe.secrets.test.json");
}
