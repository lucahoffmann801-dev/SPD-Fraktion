import type { FraktionMember, FraktionProfile, PortalData } from "./types";

export const profiles: FraktionProfile[] = [
  { id: "p-01", slug: "patrick-schaefer", full_name: "Patrick Schäfer", display_name: "Patrick", role: "Fraktionsvorsitzender", board_role: "Vorsitzender", portal_role: "fraktionsvorsitz", is_council_member: true, is_staff: false, email: null, phone: null, committees: null, bio: "Fraktionsvorsitzender der SPD-Stadtratsfraktion Kaiserslautern.", permissions: ["termine", "aufgaben", "dokumente", "kalender", "admin-lite"], avatar_initials: "PS", accent: "red", sort_order: 10, login_enabled: true },
  { id: "p-02", slug: "janina-eispert", full_name: "Janina Eispert", display_name: "Janina", role: "Stellvertretende Vorsitzende", board_role: "Stellvertretende Vorsitzende", portal_role: "stellvertretung", is_council_member: true, is_staff: false, email: null, phone: null, committees: null, bio: "Mitglied des Fraktionsvorstands und Ratsmitglied.", permissions: ["termine", "aufgaben", "dokumente", "kalender"], avatar_initials: "JE", accent: "pink", sort_order: 20, login_enabled: true },
  { id: "p-03", slug: "harald-brandstaedter", full_name: "Harald Brandstädter", display_name: "Harald", role: "Stellvertretender Vorsitzender", board_role: "Stellvertretender Vorsitzender", portal_role: "stellvertretung", is_council_member: true, is_staff: false, email: null, phone: null, committees: null, bio: "Mitglied des Fraktionsvorstands und Ratsmitglied.", permissions: ["termine", "aufgaben", "dokumente", "kalender"], avatar_initials: "HB", accent: "blue", sort_order: 30, login_enabled: true },
  { id: "p-04", slug: "andreas-rahm", full_name: "Andreas Rahm", display_name: "Andreas", role: "Fraktionsmitglied", board_role: null, portal_role: "ratsmitglied", is_council_member: true, is_staff: false, email: null, phone: null, committees: null, bio: "Ratsmitglied der SPD-Fraktion Kaiserslautern.", permissions: ["termine", "aufgaben", "dokumente"], avatar_initials: "AR", accent: "slate", sort_order: 40, login_enabled: true },
  { id: "p-05", slug: "raymond-germany", full_name: "Raymond Germany", display_name: "Raymond", role: "Fraktionsmitglied", board_role: null, portal_role: "ratsmitglied", is_council_member: true, is_staff: false, email: null, phone: null, committees: null, bio: "Ratsmitglied der SPD-Fraktion Kaiserslautern.", permissions: ["termine", "aufgaben", "dokumente"], avatar_initials: "RG", accent: "violet", sort_order: 50, login_enabled: true },
  { id: "p-06", slug: "michael-krauss", full_name: "Michael Krauß", display_name: "Michael", role: "Fraktionsmitglied", board_role: null, portal_role: "ratsmitglied", is_council_member: true, is_staff: false, email: null, phone: null, committees: null, bio: "Ratsmitglied der SPD-Fraktion Kaiserslautern.", permissions: ["termine", "aufgaben", "dokumente"], avatar_initials: "MK", accent: "orange", sort_order: 60, login_enabled: true },
  { id: "p-07", slug: "anna-raab", full_name: "Anna Raab", display_name: "Anna", role: "Fraktionsmitglied", board_role: null, portal_role: "ratsmitglied", is_council_member: true, is_staff: false, email: null, phone: null, committees: null, bio: "Ratsmitglied der SPD-Fraktion Kaiserslautern.", permissions: ["termine", "aufgaben", "dokumente"], avatar_initials: "AR", accent: "rose", sort_order: 70, login_enabled: true },
  { id: "p-08", slug: "heike-spies", full_name: "Heike Spies", display_name: "Heike", role: "Fraktionsmitglied", board_role: null, portal_role: "ratsmitglied", is_council_member: true, is_staff: false, email: null, phone: null, committees: null, bio: "Ratsmitglied der SPD-Fraktion Kaiserslautern.", permissions: ["termine", "aufgaben", "dokumente"], avatar_initials: "HS", accent: "green", sort_order: 80, login_enabled: true },
  { id: "p-09", slug: "petra-janson-peermann", full_name: "Petra Janson-Peermann", display_name: "Petra", role: "Fraktionsmitglied", board_role: null, portal_role: "ratsmitglied", is_council_member: true, is_staff: false, email: null, phone: null, committees: null, bio: "Ratsmitglied der SPD-Fraktion Kaiserslautern.", permissions: ["termine", "aufgaben", "dokumente"], avatar_initials: "PJ", accent: "teal", sort_order: 90, login_enabled: true },
  { id: "p-10", slug: "moritz-behncke", full_name: "Moritz Behncke", display_name: "Moritz", role: "Fraktionsmitglied", board_role: null, portal_role: "ratsmitglied", is_council_member: true, is_staff: false, email: null, phone: null, committees: null, bio: "Ratsmitglied der SPD-Fraktion Kaiserslautern.", permissions: ["termine", "aufgaben", "dokumente"], avatar_initials: "MB", accent: "indigo", sort_order: 100, login_enabled: true },
  { id: "p-11", slug: "joerg-harz", full_name: "Jörg Harz", display_name: "Jörg", role: "Fraktionsmitglied", board_role: null, portal_role: "ratsmitglied", is_council_member: true, is_staff: false, email: null, phone: null, committees: null, bio: "Ratsmitglied der SPD-Fraktion Kaiserslautern.", permissions: ["termine", "aufgaben", "dokumente"], avatar_initials: "JH", accent: "amber", sort_order: 110, login_enabled: true },
  { id: "p-12", slug: "marcel-schulz", full_name: "Marcel Schulz", display_name: "Marcel", role: "Fraktionsmitglied", board_role: null, portal_role: "ratsmitglied", is_council_member: true, is_staff: false, email: null, phone: null, committees: null, bio: "Ratsmitglied der SPD-Fraktion Kaiserslautern.", permissions: ["termine", "aufgaben", "dokumente"], avatar_initials: "MS", accent: "cyan", sort_order: 120, login_enabled: true },
  { id: "p-13", slug: "luca-hoffmann", full_name: "Luca Hoffmann", display_name: "Luca", role: "Fraktionssekretär", board_role: null, portal_role: "fraktionssekretariat", is_council_member: false, is_staff: true, email: "luca.hoffmann801@gmail.com", phone: null, committees: null, bio: "Fraktionssekretär / Organisation, Termine, Anträge, Social Media und interne Koordination.", permissions: ["termine", "aufgaben", "dokumente", "kalender", "profile", "admin"], avatar_initials: "LH", accent: "red", sort_order: 5, login_enabled: true }
];

const members: FraktionMember[] = profiles
  .filter(profile => profile.is_council_member)
  .map(profile => ({ id: `m-${profile.slug}`, name: profile.full_name, role: profile.role, email: profile.email, phone: profile.phone, committees: profile.committees, avatar_url: null, notes: profile.bio }));

export const demoData: PortalData = {
  supabaseConfigured: false,
  profiles,
  events: [
    { id: "demo-1", title: "Stadtrat", starts_at: "2026-06-15T15:00:00+02:00", ends_at: "2026-06-15T16:30:00+02:00", all_day: false, location: "Großer Ratssaal, Rathaus Kaiserslautern", description: "Beispieltermin aus dem bisherigen RIS-/Fraktionskonzept.", category: "Stadtrat", source: "demo", source_uid: "demo-1", owner: "Patrick", relevance: "beide", status: "scheduled" },
    { id: "demo-2", title: "Ferienkommission", starts_at: "2026-07-27T15:00:00+02:00", ends_at: "2026-07-27T16:00:00+02:00", all_day: false, location: "Rathaus Kaiserslautern", description: "Beispiel für Ausschuss-/Kommissionstermine.", category: "Ausschuss", source: "demo", source_uid: "demo-2", owner: "Patrick", relevance: "offen", status: "scheduled" }
  ],
  tasks: [
    { id: "task-1", title: "Patrick-Kalender als ICS-Quelle anbinden", description: "Patrick gibt einen Apple-Kalender frei; der Link wird als Kalenderquelle hinterlegt.", assignee: "Luca Hoffmann", due_date: "2026-06-20", status: "offen", priority: "hoch", event_id: null },
    { id: "task-2", title: "RLS/Auth härten", description: "Nach dem Prototypen echte Supabase Auth/Magic Links aktivieren und offene Policies ersetzen.", assignee: "Luca Hoffmann", due_date: null, status: "in_bearbeitung", priority: "kritisch", event_id: null }
  ],
  members,
  documents: [
    { id: "d-1", title: "Anträge und Vorlagen", category: "Arbeitsordner", url: null, description: "Platzhalter für Fraktionsdokumente.", owner: "Luca Hoffmann", document_date: null }
  ],
  calendar_sources: [
    { id: "s-1", name: "Patrick Apple Kalender", type: "apple_ics", url: null, owner: "Patrick Schäfer", enabled: false, last_synced_at: null, notes: "ICS-Link hier hinterlegen, nicht das Apple-ID-Passwort." }
  ],
  sync_logs: []
};
