# Nächste Schritte: Bridge-Entfernung

Die aktuelle Stabilisierung hat Datenmodell, API und Layout verbessert. Der nächste große Schritt ist die Entfernung der DOM-Bridges. Da `app/page.tsx` noch eine monolithische Datei ist, sollte dies nicht als globaler Einmal-Patch erfolgen, sondern über eine kontrollierte Komponenten-Aufteilung.

## Reihenfolge

1. `components/work-orders/WorkOrderBoard.tsx` anlegen.
2. `components/work-orders/WorkOrderProgress.tsx` anlegen.
3. `WorkOrderProgressControls` aus `layout.tsx` entfernen.
4. `TaskAssignmentBridgeStable` durch `AssigneePicker` in `TaskForm` ersetzen.
5. `MobileStatusBridge` durch React-State im Work-Order-Board ersetzen.
6. Danach Bridge-Dateien löschen.

## Warum nicht sofort löschen?

Die Live-App würde sonst kurzfristig Interaktionen verlieren, weil die aktuelle `page.tsx` noch direkt alte Markups rendert. Erst wenn die neuen React-Komponenten im Baum hängen, können die Bridges sicher entfernt werden.
