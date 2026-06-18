import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NexGent — Plataforma IA para clubes de élite",
  description: "Demo comercial NexGent para clubes de fútbol profesional",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
