import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NexGent × DEPRO — Plataforma para clubes profesionales",
  description: "Alianza NexGent y DEPRO: el software más completo para clubes de fútbol profesional. Demo Palmeiras.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
