import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        depro: {
          blue: "#0A36F7",
          "blue-dark": "#0828C4",
          "blue-light": "#EEF1FF",
          red: "#FB2C39",
          dark: "#333333",
          gray: "#6B7280",
          "gray-light": "#F5F5F5",
          border: "#E5E7EB",
          green: "#3BC21D",
          "green-light": "#EAF9E6",
        },
        palmeiras: {
          green: "#006437",
          gold: "#FDB913",
          "green-light": "#E6F4ED",
        },
      },
      boxShadow: {
        depro: "0 4px 24px rgba(10, 54, 247, 0.12)",
        card: "0 2px 16px rgba(51, 51, 51, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
