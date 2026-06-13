# Sprint 0 Stabilisierung — aktueller Stand

Dieses Dokument hält fest, welche kurzfristigen Stabilitätsmaßnahmen bereits umgesetzt sind und welche Refactor-Schritte noch offen sind.

## Erledigt

- Supabase-Projekt `dwbkqpdspbpitzqbjryu` ist angebunden und healthy.
- Tabelle `public.tasks` wurde additiv um strukturierte Felder ergänzt:
  - `progress`
  - `assignees`
  - `visibility`
  - `visible_to`
  - `retention_days`
  - `completed_at`
  - `is_work_order`
  - `created_by`
- `/api/work-orders` schreibt Fortschritt und Work-Order-Metadaten in echte Felder statt neue `[progress:...]`-Marker zu erzeugen.
- `/api/records` normalisiert weiterhin eingehende Alt-Marker und überführt sie in strukturierte Task-Felder.
- `/api/data` bereinigt alte Marker beim Ausliefern an das UI und bevorzugt `is_work_order`/`progress`/`assignees`.
- `WorkOrderProgressControls` nutzt `localStorage` nicht mehr als Quelle für Fortschritt.
- Desktop-Layout: Patrick↔Luca-Board wird über CSS auf volle Breite gezogen, allgemeine Aufgaben stehen darunter.
- Sichtbare Dopplung der alten Fortschrittsleiste wird CSS-seitig abgefangen, sobald der kontrollierte Slider gemountet ist.
- Server-Supabase-Client nutzt bevorzugt `SUPABASE_SERVICE_ROLE_KEY`, falls in Vercel gesetzt.

## Noch offen

- `app/page.tsx` ist noch monolithisch und enthält weiterhin native Platzhalter/Marker-Funktionen.
- Die DOM-Bridges sind noch eingebunden:
  - `MobileStatusBridge`
  - `TaskAssignmentBridgeStable`
  - `WorkOrderProgressControls`
- Die vollständige React-native Ablösung von Status/Progress/Assignee-Picker ist noch offen.
- RLS-Prototype-Policies existieren noch. Schreib-Härtung auf `service_role` wurde vorbereitet, aber durch Tool-Sicherheitschecks blockiert.
- Alte komplexe Textmarker wurden im API-Layer neutralisiert, aber nicht vollständig per Regex aus Bestandsdaten gelöscht.

## Nächster technischer Schritt

`app/page.tsx` in Komponenten aufsplitten und dabei Work-Order-Board, TaskForm/TaskList und Mobile-Status-Sheet als echte React-Komponenten implementieren. Erst danach sollten die Bridge-Dateien gelöscht werden.
