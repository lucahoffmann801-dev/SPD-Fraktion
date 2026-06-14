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
  { id: "c-ba",  slug: "bauausschuss",                   title: "Bauausschuss",                    short_ref: "BA",   source: "attendance_list", notes: null },
  { id: "c-da",  slug: "digitalisierungsausschuss",      title: "Digitalisierungsausschuss",        short_ref: "DA",   source: "attendance_list", notes: null },
  { id: "c-hufa",slug: "haupt-und-finanzausschuss",      title: "Haupt- und Finanzausschuss",       short_ref: "HuFa", source: "attendance_list", notes: null },
  { id: "c-pa",  slug: "personalausschuss",              title: "Personalausschuss",                short_ref: "PA",   source: "attendance_list", notes: null },
  { id: "c-hoa", slug: "hospitalausschuss",              title: "Hospitalausschuss",                short_ref: "HoA",  source: "attendance_list", notes: null },
  { id: "c-jha", slug: "jugendhilfeausschuss",           title: "Jugendhilfeausschuss",             short_ref: "JHA",  source: "attendance_list", notes: null },
  { id: "c-ka",  slug: "kulturausschuss",                title: "Kulturausschuss",                  short_ref: "KA",   source: "attendance_list", notes: null },
  { id: "c-ma",  slug: "marktausschuss",                 title: "Marktausschuss",                   short_ref: "MA",   source: "attendance_list", notes: null },
  { id: "c-rpa", slug: "rechnungspruefungsausschuss",    title: "Rechnungsprüfungsausschuss",       short_ref: "RPA",  source: "attendance_list", notes: null },
  { id: "c-sta", slug: "schultraegerausschuss",          title: "Schulträgerausschuss",             short_ref: "STA",  source: "attendance_list", notes: null },
  { id: "c-soa", slug: "sozialausschuss",                title: "Sozialausschuss",                  short_ref: "SoA",  source: "attendance_list", notes: null },
  { id: "c-spa", slug: "sportausschuss",                 title: "Sportausschuss",                   short_ref: "SpA",  source: "attendance_list", notes: null },
  { id: "c-ua",  slug: "umweltausschuss",                title: "Umweltausschuss",                  short_ref: "UA",   source: "attendance_list", notes: null },
  { id: "c-vr",  slug: "vr-stadtentwaesserung",         title: "VR Stadtentwässerung",             short_ref: "VR",   source: "attendance_list", notes: null },
  { id: "c-wa",  slug: "werkausschuss-stadtbildpflege", title: "Werkausschuss Stadtbildpflege",    short_ref: "WA",   source: "attendance_list", notes: null },
  { id: "c-ra",  slug: "regionalausschuss",              title: "Regionalausschuss",                short_ref: "RA",   source: "attendance_list", notes: null },
];

function m(id: string, slug: string, name: string, role: "member" | "substitute", order: number): CommitteeMembership {
  return { id: `cm-${id}`, committee_slug: slug, person_name: name, role, sort_order: order, source_file: null };
}

export const committee_memberships: CommitteeMembership[] = [
  m("ba-01", "bauausschuss", "Harald Brandstädter",   "member",    10),
  m("ba-02", "bauausschuss", "Marcel Schulz",          "member",    20),
  m("ba-03", "bauausschuss", "Michael Loos",           "member",    30),
  m("ba-04", "bauausschuss", "Reiner Kiefhaber",       "member",    40),
  m("ba-05", "bauausschuss", "Anette Diederich",       "substitute",10),
  m("ba-06", "bauausschuss", "Kevin Kneip",            "substitute",20),
  m("ba-07", "bauausschuss", "Robert Gorris",          "substitute",30),
  m("ba-08", "bauausschuss", "Thorsten Peermann",      "substitute",40),

  m("da-01", "digitalisierungsausschuss", "Patrick Schäfer",    "member",    10),
  m("da-02", "digitalisierungsausschuss", "Raymond Germany",    "member",    20),
  m("da-03", "digitalisierungsausschuss", "Anna Raab",          "member",    30),
  m("da-04", "digitalisierungsausschuss", "Robin Brandstädter", "member",    40),
  m("da-05", "digitalisierungsausschuss", "Moritz Behncke",     "substitute",10),
  m("da-06", "digitalisierungsausschuss", "Thomas Kneller",     "substitute",20),
  m("da-07", "digitalisierungsausschuss", "René Neyer",         "substitute",30),
  m("da-08", "digitalisierungsausschuss", "Constantin Rubel",   "substitute",40),

  m("hufa-01", "haupt-und-finanzausschuss", "Patrick Schäfer",       "member",    10),
  m("hufa-02", "haupt-und-finanzausschuss", "Janina Eispert",        "member",    20),
  m("hufa-03", "haupt-und-finanzausschuss", "Raymond Germany",       "member",    30),
  m("hufa-04", "haupt-und-finanzausschuss", "Michael Krauß",         "member",    40),
  m("hufa-05", "haupt-und-finanzausschuss", "Moritz Behncke",        "substitute",10),
  m("hufa-06", "haupt-und-finanzausschuss", "Petra Janson-Peermann", "substitute",20),
  m("hufa-07", "haupt-und-finanzausschuss", "Jörg Harz",             "substitute",30),
  m("hufa-08", "haupt-und-finanzausschuss", "Harald Brandstädter",   "substitute",40),

  m("pa-01", "personalausschuss", "Patrick Schäfer",       "member",    10),
  m("pa-02", "personalausschuss", "Janina Eispert",        "member",    20),
  m("pa-03", "personalausschuss", "Michael Krauß",         "member",    30),
  m("pa-04", "personalausschuss", "Moritz Behncke",        "member",    40),
  m("pa-05", "personalausschuss", "Anna Raab",             "substitute",10),
  m("pa-06", "personalausschuss", "Harald Brandstädter",   "substitute",20),
  m("pa-07", "personalausschuss", "Raymond Germany",       "substitute",30),
  m("pa-08", "personalausschuss", "Jörg Harz",             "substitute",40),

  m("hoa-01", "hospitalausschuss", "Patrick Schäfer",       "member",    10),
  m("hoa-02", "hospitalausschuss", "Petra Janson-Peermann", "member",    20),
  m("hoa-03", "hospitalausschuss", "Michael Krauß",         "member",    30),
  m("hoa-04", "hospitalausschuss", "Harald Ledig",          "substitute",10),
  m("hoa-05", "hospitalausschuss", "Thorsten Peermann",     "substitute",20),
  m("hoa-06", "hospitalausschuss", "Marcel Schulz",         "substitute",30),

  m("jha-01", "jugendhilfeausschuss", "Moritz Behncke",     "member",    10),
  m("jha-02", "jugendhilfeausschuss", "Janina Eispert",     "member",    20),
  m("jha-03", "jugendhilfeausschuss", "Anna Raab",          "member",    30),
  m("jha-04", "jugendhilfeausschuss", "Christine Kiefaber", "member",    40),
  m("jha-05", "jugendhilfeausschuss", "Jaqueline Schröder", "substitute",10),
  m("jha-06", "jugendhilfeausschuss", "Marcel Schulz",      "substitute",20),
  m("jha-07", "jugendhilfeausschuss", "Luca Ganter",        "substitute",30),
  m("jha-08", "jugendhilfeausschuss", "Michael Flesch",     "substitute",40),

  m("ka-01", "kulturausschuss", "Moritz Behncke",     "member",    10),
  m("ka-02", "kulturausschuss", "Michael Krauß",      "member",    20),
  m("ka-03", "kulturausschuss", "Ella Schulz",        "member",    30),
  m("ka-04", "kulturausschuss", "Heike Spies",        "member",    40),
  m("ka-05", "kulturausschuss", "Ulrike Müller-Ressel","substitute",10),
  m("ka-06", "kulturausschuss", "Brigitte Seidler",   "substitute",20),
  m("ka-07", "kulturausschuss", "Anna Raab",          "substitute",30),
  m("ka-08", "kulturausschuss", "Gerda Hoppe",        "substitute",40),

  m("ma-01", "marktausschuss", "Andreas Rahm",           "member",    10),
  m("ma-02", "marktausschuss", "Petra Janson-Peermann",  "member",    20),
  m("ma-03", "marktausschuss", "Heike Spies",            "member",    30),
  m("ma-04", "marktausschuss", "Reiner Becker",          "member",    40),
  m("ma-05", "marktausschuss", "Reiner Kiefhaber",       "substitute",10),
  m("ma-06", "marktausschuss", "Moritz Behncke",         "substitute",20),
  m("ma-07", "marktausschuss", "Anita Anspach-Olfers",   "substitute",30),
  m("ma-08", "marktausschuss", "Marcel Schulz",          "substitute",40),

  m("rpa-01", "rechnungspruefungsausschuss", "Harald Brandstädter",   "member",    10),
  m("rpa-02", "rechnungspruefungsausschuss", "Raymond Germany",        "member",    20),
  m("rpa-03", "rechnungspruefungsausschuss", "Michael Krauß",          "member",    30),
  m("rpa-04", "rechnungspruefungsausschuss", "Petra Janson-Peermann",  "member",    40),
  m("rpa-05", "rechnungspruefungsausschuss", "Heike Spies",            "substitute",10),
  m("rpa-06", "rechnungspruefungsausschuss", "Patrick Schäfer",        "substitute",20),
  m("rpa-07", "rechnungspruefungsausschuss", "Janina Eispert",         "substitute",30),
  m("rpa-08", "rechnungspruefungsausschuss", "Moritz Behncke",         "substitute",40),

  m("sta-01", "schultraegerausschuss", "Moritz Behncke",       "member",    10),
  m("sta-02", "schultraegerausschuss", "Petra Janson-Peermann","member",    20),
  m("sta-03", "schultraegerausschuss", "Anna Raab",            "member",    30),
  m("sta-04", "schultraegerausschuss", "Marcel Schulz",        "member",    40),
  m("sta-05", "schultraegerausschuss", "Thorsten Peermann",    "substitute",10),
  m("sta-06", "schultraegerausschuss", "Karin Fürst-Steiner",  "substitute",20),
  m("sta-07", "schultraegerausschuss", "Janina Eispert",       "substitute",30),
  m("sta-08", "schultraegerausschuss", "Alexander Lenz",       "substitute",40),

  m("soa-01", "sozialausschuss", "Moritz Behncke",     "member",    10),
  m("soa-02", "sozialausschuss", "Jörg Harz",          "member",    20),
  m("soa-03", "sozialausschuss", "Anna Raab",          "member",    30),
  m("soa-04", "sozialausschuss", "Brigitte Seidler",   "member",    40),
  m("soa-05", "sozialausschuss", "Luca Ganter",        "substitute",10),
  m("soa-06", "sozialausschuss", "Christine Kiefaber", "substitute",20),
  m("soa-07", "sozialausschuss", "Jaqueline Schröder", "substitute",30),
  m("soa-08", "sozialausschuss", "Janina Eispert",     "substitute",40),

  m("spa-01", "sportausschuss", "Jörg Harz",        "member",    10),
  m("spa-02", "sportausschuss", "Alexander Lenz",   "member",    20),
  m("spa-03", "sportausschuss", "Patrick Schäfer",  "member",    30),
  m("spa-04", "sportausschuss", "Michael Schmitt",  "member",    40),
  m("spa-05", "sportausschuss", "Michael Flesch",   "substitute",10),
  m("spa-06", "sportausschuss", "Luca Ganter",      "substitute",20),
  m("spa-07", "sportausschuss", "Andreas Eichhorn", "substitute",30),
  m("spa-08", "sportausschuss", "Constantin Rubel", "substitute",40),

  m("ua-01", "umweltausschuss", "Jens van Boekel",      "member",    10),
  m("ua-02", "umweltausschuss", "Marcel Schulz",         "member",    20),
  m("ua-03", "umweltausschuss", "Petra Janson-Peermann", "member",    30),
  m("ua-04", "umweltausschuss", "Heike Spies",           "member",    40),
  m("ua-05", "umweltausschuss", "Luca Ganter",           "substitute",10),
  m("ua-06", "umweltausschuss", "Michael Loos",          "substitute",20),
  m("ua-07", "umweltausschuss", "Michael Flesch",        "substitute",30),
  m("ua-08", "umweltausschuss", "Moritz Behncke",        "substitute",40),

  m("vr-01", "vr-stadtentwaesserung", "Petra Janson-Peermann", "member",    10),
  m("vr-02", "vr-stadtentwaesserung", "Michael Krauß",         "member",    20),
  m("vr-03", "vr-stadtentwaesserung", "Raymond Germany",       "member",    30),
  m("vr-04", "vr-stadtentwaesserung", "Harald Brandstädter",   "substitute",10),
  m("vr-05", "vr-stadtentwaesserung", "Janina Eispert",        "substitute",20),
  m("vr-06", "vr-stadtentwaesserung", "Marcel Schulz",         "substitute",30),

  m("wa-01", "werkausschuss-stadtbildpflege", "Marcel Schulz",         "member",    10),
  m("wa-02", "werkausschuss-stadtbildpflege", "Petra Janson-Peermann", "member",    20),
  m("wa-03", "werkausschuss-stadtbildpflege", "Raymond Germany",       "member",    30),
  m("wa-04", "werkausschuss-stadtbildpflege", "Michael Krauß",         "member",    40),
  m("wa-05", "werkausschuss-stadtbildpflege", "Moritz Behncke",        "substitute",10),
  m("wa-06", "werkausschuss-stadtbildpflege", "Harald Brandstädter",   "substitute",20),
  m("wa-07", "werkausschuss-stadtbildpflege", "Jörg Harz",             "substitute",30),
  m("wa-08", "werkausschuss-stadtbildpflege", "Janina Eispert",        "substitute",40),

  m("ra-01", "regionalausschuss", "Patrick Schäfer",     "member",    10),
  m("ra-02", "regionalausschuss", "Moritz Behncke",      "member",    20),
  m("ra-03", "regionalausschuss", "Janina Eispert",      "member",    30),
  m("ra-04", "regionalausschuss", "Harald Brandstädter", "substitute",10),
  m("ra-05", "regionalausschuss", "Anna Raab",           "substitute",20),
  m("ra-06", "regionalausschuss", "Jaqueline Schröder",  "substitute",30),
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
    { id: "task-patrick-luca-zukunftsforum-schulgebaeude", title: "Planung nächstes Zukunftsforum – Zukunft unserer Schulgebäude", description: "[Patrick→Luca] Planung des nächsten Zukunftsforums zum Thema Schulgebäude.", assignee: "Luca Hoffmann", due_date: null, status: "offen", priority: "hoch", event_id: null, case_id: null },
    { id: "task-patrick-luca-antrag-parken", title: "Anfrage zur Parksituation Innenstadt ausarbeiten", description: "[Patrick→Luca] Kleine Anfrage für die Stadtratssitzung vorbereiten.", assignee: "Luca Hoffmann", due_date: "2026-06-30", status: "in_bearbeitung", priority: "normal", event_id: null, case_id: "case-1" }
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
