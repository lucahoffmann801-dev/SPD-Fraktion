import type { Metadata, Viewport } from "next";
import MobileStatusBridge from "./MobileStatusBridge";
import TaskAssignmentBridge from "./TaskAssignmentBridge";
import WorkOrderStateBridge from "./WorkOrderStateBridge";
import "./globals.css";
import "./termine-filter.css";
import "./menu-icons.css";
import "./work-orders.css";
import "./luca-assets.css";
import "./mobile-monday.css";
import "./visual-tuning.css";
import "./progress-slider.css";
import "./task-assignment.css";
import "./interface-polish.css";

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
  themeColor: "#e3000f",
  viewportFit: "cover"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body>
        <MobileStatusBridge />
        <TaskAssignmentBridge />
        <WorkOrderStateBridge />
        {children}
      </body>
    </html>
  );
}
