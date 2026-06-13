import type { CommitteeMembership, FraktionCase, FraktionCommittee, FraktionMember, FraktionProfile, PortalData } from "./types";

export const profiles: FraktionProfile[] = [
  { id: "p-13", slug: "luca-hoffmann", full_name: "Luca Hoffmann", display_name: "Luca", role: "Fraktionssekretär", board_role: null, portal_role: "fraktionssekretariat", is_council_member: false, is_staff: true, email: "luca.hoffmann801@gmail.com", phone: null, committees: null, bio: "Fraktionssekretär / Organisation, Termine, Anträge, Social Media und interne Koordination.", permissions: ["termine", "aufgaben", "dokumente", "kalender", "profile", "admin"], avatar_initials: "LH", accent: "red", sort_order: 5, login_enabled: true },
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
  { id: "p-12", slug: "marcel-schulz", full_name: "Marcel Schulz", display_name: "Marcel", role: "Fraktionsmitglied", board_role: null, portal_role: "ratsmitglied", is_council_member: true, is_staff: false, email: null, phone: null, committees: null, bio: "Ratsmitglied der SPD-Fraktion Kaiserslautern.", permissions: ["termine", "aufgaben", "dokumente"], avatar_initials: "MS", accent: "cyan", sort_order: 120, login_enabled: true }
];

export const cases: FraktionCase[] = [
  { id: "case-1", slug: "vernetzung-oeffentlicher-parkplaetze", title: "Vernetzung öffentlicher Parkplätze", description: "Vorlage 0506/2023 und Smart-City-Prüfansatz nachhalten.", status: "in_bearbeitung", priority: "hoch", owner: "Luca Hoffmann", next_step: "Sachstand der Verwaltung prüfen.", due_date: null, tags: ["Parken", "Smart City"] },
  { id: "case-2", slug: "leerstandserfassung-lean", title: "Leerstandserfassung und LeAn", description: "Digitale Leerstandserfassungs- und Ansiedlungsplattform.", status: "in_bearbeitung", priority: "hoch", owner: "Luca Hoffmann", next_step: "Antwort auswerten und Folgeantrag prüfen.", due_date: null, tags: ["Innenstadt", "Wirtschaft"] },
  { id: "case-3", slug: "hitzeschutz", title: "Hitzeschutz", description: "Berichtsantrag und kommunale Maßnahmen rund um Hitzevorsorge.", status: "offen", priority: "hoch", owner: "Anna Raab", next_step: "Berichtstermin und Ausschuss zuordnen.", due_date: null, tags: ["Klima", "Soziales"] }
];

export const committees: FraktionCommittee[] = [
  { id: "c-digital", slug: "digitalausschuss", title: "Digitalausschuss", short_ref: "DA", source: "attendance_list", notes: "Anwesenheitsliste liegt vor." },
  { id: "c-schule", slug: "schultraegerausschuss", title: "Schulträgerausschuss", short_ref: "STA", source: "attendance_list", notes: "Anwesenheitsliste liegt vor." },
  { id: "c-vr", slug: "verwaltungsrat-stadtentwaesserung", title: "Verwaltungsrat Stadtentwässerung", short_ref: "VR", source: "attendance_list", notes: "Anwesenheitsliste liegt vor." },
  { id: "c-rpa", slug: "rechnungspruefungsausschuss", title: "Rechnungsprüfungsausschuss", short_ref: "RPA", source: "attendance_list", notes: "Anwesenheitsliste liegt vor." },
  { id: "c-soz", slug: "sozialausschuss", title: "Sozialausschuss", short_ref: "SoA", source: "attendance_list", notes: "Anwesenheitsliste liegt vor." },
  { id: "c-hos", slug: "hospitalausschuss", title: "Hospitalausschuss", short_ref: "HoA", source: "attendance_list", notes: "Anwesenheitsliste liegt vor." },
  { id: "c-bau", slug: "bauausschuss", title: "Bauausschuss", short_ref: "BA", source: "attendance_list", notes: "Anwesenheitsliste liegt vor." },
  { id: "c-sra", slug: "stadtrechtsausschuss", title: "Stadtrechtsausschuss", short_ref: "SRA", source: "attendance_list", notes: "Anwesenheitsliste liegt vor." },
  { id: "c-sp", slug: "sportausschuss", title: "Sportausschuss", short_ref: "SpA", source: "attendance_list", notes: "Anwesenheitsliste liegt vor." },
  { id: "c-wa", slug: "werkausschuss-stadtbildpflege", title: "Werkausschuss Stadtbildpflege", short_ref: "WA", source: "attendance_list", notes: "Anwesenheitsliste liegt vor." }
];

export const committee_memberships: CommitteeMembership[] = [
  { id: "cm-1", committee_slug: "digitalausschuss", person_name: "Patrick Schäfer", role: "member", sort_order: 10, source_file: "Anwesenheitsliste Digitalausschuss.pdf" },
  { id: "cm-2", committee_slug: "digitalausschuss", person_name: "Raymond Germany", role: "member", sort_order: 20, source_file: "Anwesenheitsliste Digitalausschuss.pdf" },
  { id: "cm-3", committee_slug: "digitalausschuss", person_name: "Anna Raab", role: "member", sort_order: 30, source_file: "Anwesenheitsliste Digitalausschuss.pdf" },
  { id: "cm-4", committee_slug: "digitalausschuss", person_name: "Robin Brandstädter", role: "member", sort_order: 40, source_file: "Anwesenheitsliste Digitalausschuss.pdf" },
  { id: "cm-5", committee_slug: "schultraegerausschuss", person_name: "Moritz Behncke", role: "member", sort_order: 10, source_file: "Anwesenheitsliste Schultraegerausschuss.pdf" },
  { id: "cm-6", committee_slug: "schultraegerausschuss", person_name: "Petra Janson-Peermann", role: "member", sort_order: 20, source_file: "Anwesenheitsliste Schultraegerausschuss.pdf" },
  { id: "cm-7", committee_slug: "bauausschuss", person_name: "Harald Brandstädter", role: "member", sort_order: 10, source_file: "Anwesenheitsliste Bauausschuss.pdf" },
  { id: "cm-8", committee_slug: "werkausschuss-stadtbildpflege", person_name: "Marcel Schulz", role: "member", sort_order: 10, source_file: "Anwesenheitsliste Werkausschuss Stadtbildpflege.pdf" }
];

const memberCommitteeSummary = (name: string) => committee_memberships.filter(item => item.person_name === name).map(item => committees.find(c => c.slug === item.committee_slug)?.title).filter(Boolean).join(", ") || null;
const members: FraktionMember[] = profiles.filter(profile => profile.is_council_member).map(profile => ({ id: `m-${profile.slug}`, name: profile.full_name, role: profile.role, email: profile.email, phone: profile.phone, committees: memberCommitteeSummary(profile.full_name), avatar_url: null, notes: profile.bio }));

export const demoData: PortalData = {
  supabaseConfigured: false,
  profiles,
  cases,
  committees,
  committee_memberships,
  events: [
    { id: "demo-1", title: "Stadtrat", starts_at: "2026-06-15T15:00:00+02:00", ends_at: "2026-06-15T16:30:00+02:00", all_day: false, location: "Großer Ratssaal, Rathaus Kaiserslautern", description: "Vorbereitung der nächsten Ratssitzung.", category: "Stadtrat", source: "demo", source_uid: "demo-1", owner: "Patrick", relevance: "beide", status: "scheduled", meeting_body: "Stadtrat", preparation_status: "vorbereiten", requires_preparation: true, decision_needed: true },
    { id: "demo-2", title: "Bauausschuss", starts_at: "2026-06-21T15:00:00+02:00", ends_at: "2026-06-21T16:45:00+02:00", all_day: false, location: "Großer Ratssaal, Rathaus Kaiserslautern", description: "Vorbereitung und Sichtung der anstehenden Bau-Themen.", category: "Ausschuss", source: "demo", source_uid: "demo-2", owner: "Fraktion", relevance: "offen", status: "scheduled", meeting_body: "Bauausschuss", preparation_status: "offen", requires_preparation: true, decision_needed: false }
  ],
  tasks: [
    { id: "task-patrick-luca-zukunftsforum-schulgebaeude", title: "Planung nächstes Zukunftsforum - Zukunft unserer Schulgebäude", description: "[Patrick→Luca] Planung des nächsten Zukunftsforums zum Thema Zukunft unserer Schulgebäude.", assignee: "Luca Hoffmann", due_date: null, status: "offen", priority: "hoch", event_id: null, case_id: null }
  ],
  members,
  documents: [
    { id: "d-1", title: "Anträge und Vorlagen", category: "Arbeitsordner", url: null, description: "Arbeitsstände, Vorlagen und Entwürfe der Fraktion.", owner: "Luca Hoffmann", document_date: null, status: "arbeitsstand", kind: "Arbeitsordner" }
  ],
  calendar_sources: [
    { id: "s-1", name: "Patrick Apple Kalender", type: "apple_ics", url: null, owner: "Patrick Schäfer", enabled: false, last_synced_at: null, notes: "Kalenderfreigabe kann hier hinterlegt werden." },
    { id: "s-2", name: "RIS Kaiserslautern", type: "ics", url: "https://ris.kaiserslautern.de/buergerinfo/si0040.asp", owner: "Fraktion", enabled: true, last_synced_at: null, notes: "Öffentlicher Sitzungskalender der Stadt Kaiserslautern." }
  ],
  sync_logs: []
};
