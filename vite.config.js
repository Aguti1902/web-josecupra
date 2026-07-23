import { readFileSync } from "fs";
import { resolve } from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

function clean(value) {
  return String(value || "").trim().replace(/^["']|["']$/g, "");
}

const stripePublic = JSON.parse(
  readFileSync(resolve(import.meta.dirname, "config/stripe.public.json"), "utf8"),
);

export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, process.cwd(), "");
  const env = { ...fileEnv, ...process.env };

  const publishableKey = clean(
    env.VITE_STRIPE_PUBLISHABLE_KEY ||
    env.STRIPE_PUBLISHABLE_KEY ||
    stripePublic.testPublishableKey,
  );
  const stripeMode = clean(env.VITE_STRIPE_MODE || env.STRIPE_MODE || "test");

  return {
    plugins: [react()],
    envPrefix: ["VITE_", "STRIPE_"],
    define: {
      "import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY": JSON.stringify(publishableKey),
      "import.meta.env.STRIPE_PUBLISHABLE_KEY": JSON.stringify(publishableKey),
      "import.meta.env.VITE_STRIPE_MODE": JSON.stringify(stripeMode),
      "import.meta.env.STRIPE_MODE": JSON.stringify(stripeMode),
    },
  };
});
