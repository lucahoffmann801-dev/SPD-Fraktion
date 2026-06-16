import type { Metadata } from "next";
import "../src/globals.css";
import "../src/termine-filter.css";
import "../src/work-orders.css";
import "../src/mobile-monday.css";
import "../src/visual-tuning.css";
import "../src/progress-slider.css";
import "../src/task-assignment.css";
import "../src/interface-polish.css";

export const metadata: Metadata = {
  title: "SPD-Fraktion Kaiserslautern",
  description: "Internes Fraktionsportal der SPD-Stadtratsfraktion Kaiserslautern",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "SPD Fraktion",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <meta name="theme-color" content="#C0392B" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>{children}</body>
    </html>
  );
}
