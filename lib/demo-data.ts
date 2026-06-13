import type { PortalData } from "./types";

export const demoData: PortalData = {
  supabaseConfigured: false,
  events: [
    {
      id: "demo-1",
      title: "Stadtrat",
      starts_at: "2026-06-15T15:00:00+02:00",
      ends_at: "2026-06-15T16:30:00+02:00",
      all_day: false,
      location: "Großer Ratssaal, Rathaus Kaiserslautern",
      description: "Beispieltermin aus dem bisherigen RIS-/Fraktionskonzept.",
      category: "Stadtrat",
      source: "demo",
      source_uid: "demo-1",
      owner: "Patrick",
      relevance: "beide",
      status: "scheduled"
    },
    {
      id: "demo-2",
      title: "Ferienkommission",
      starts_at: "2026-07-27T15:00:00+02:00",
      ends_at: "2026-07-27T16:00:00+02:00",
      all_day: false,
      location: "Rathaus Kaiserslautern",
      description: "Beispiel für Ausschuss-/Kommissionstermine.",
      category: "Ausschuss",
      source: "demo",
      source_uid: "demo-2",
      owner: "Patrick",
      relevance: "offen",
      status: "scheduled"
    }
  ],
  tasks: [
    {
      id: "task-1",
      title: "Patrick-Kalender als ICS-Quelle anbinden",
      description: "Patrick gibt einen Apple-Kalender frei; der Link wird als Kalenderquelle hinterlegt.",
      assignee: "Luca",
      due_date: "2026-06-20",
      status: "offen",
      priority: "hoch",
      event_id: null
    },
    {
      id: "task-2",
      title: "RIS-Termine 2026 prüfen",
      description: "Seed-Daten mit echten aktuellen RIS-Daten abgleichen.",
      assignee: "Luca",
      due_date: null,
      status: "in_bearbeitung",
      priority: "normal",
      event_id: null
    }
  ],
  members: [
    { id: "m-1", name: "Patrick Schäfer", role: "Fraktionsvorsitzender", email: null, phone: null, committees: null, avatar_url: null, notes: null },
    { id: "m-2", name: "Luca Hoffmann", role: "Organisation / Fraktionsarbeit", email: null, phone: null, committees: null, avatar_url: null, notes: null },
    { id: "m-3", name: "Janina Eispert", role: "Stellvertretende Vorsitzende", email: null, phone: null, committees: null, avatar_url: null, notes: null }
  ],
  documents: [
    { id: "d-1", title: "Anträge und Vorlagen", category: "Arbeitsordner", url: null, description: "Platzhalter für Fraktionsdokumente.", owner: "Luca", document_date: null }
  ],
  calendar_sources: [
    { id: "s-1", name: "Patrick Apple Kalender", type: "apple_ics", url: null, owner: "Patrick", enabled: false, last_synced_at: null, notes: "ICS-Link hier hinterlegen, nicht das Apple-ID-Passwort." }
  ],
  sync_logs: []
};
