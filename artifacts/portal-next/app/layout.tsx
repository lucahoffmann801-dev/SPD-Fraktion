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
  description: "Internes Fraktionsportal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
