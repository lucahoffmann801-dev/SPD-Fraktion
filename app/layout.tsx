import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SPD-Fraktion KL · Internes Portal",
  description: "Fraktionscockpit für Termine, Aufgaben, Dokumente und Kalender-Sync"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
