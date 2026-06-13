import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./termine-filter.css";
import "./menu-icons.css";
import "./work-orders.css";
import "./luca-assets.css";

export const metadata: Metadata = {
  title: "SPD-Fraktion KL · Internes Portal",
  description: "Fraktionscockpit für Termine, Aufgaben, Dokumente und Kalender-Sync",
  icons: {
    icon: "/app-icon.png.PNG",
    shortcut: "/app-icon.png.PNG",
    apple: "/app-icon.png.PNG"
  },
  appleWebApp: {
    capable: true,
    title: "SPD-Fraktion"
  }
};

export const viewport: Viewport = {
  themeColor: "#e3000f"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
