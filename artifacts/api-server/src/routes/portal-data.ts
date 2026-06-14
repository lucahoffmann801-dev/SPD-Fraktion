import { Router } from "express";
import { getSupabase, supabaseConfigured } from "../lib/supabase";

// Inline demo data to avoid cross-artifact imports
const demoProfiles = [
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
  { id: "p-12", slug: "marcel-schulz", full_name: "Marcel Schulz", display_name: "Marcel", role: "Fraktionsmitglied", board_role: null, portal_role: "ratsmitglied", is_council_member: true, is_staff: false, email: null, phone: null, committees: null, bio: "Ratsmitglied der SPD-Fraktion Kaiserslautern.", permissions: ["termine", "aufgaben", "dokumente"], avatar_initials: "MS", accent: "cyan", sort_order: 120, login_enabled: true },
];

const router = Router();

function normalizeTitle(title: string) {
  return title.toLowerCase().replace(/\(.*?\)/g, "").replace(/ß/g, "ss").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function eventDedupeKey(event: { starts_at: string; title: string }) {
  const start = new Date(event.starts_at);
  const isoMinute = Number.isNaN(start.getTime()) ? event.starts_at.slice(0, 16) : start.toISOString().slice(0, 16);
  return `${isoMinute}:${normalizeTitle(event.title)}`;
}

function sk(id: string, title: string, date: string, time: string, cat: string, body: string) {
  return { id: `sk-${id}`, title, starts_at: `${date}T${time}:00+02:00`, ends_at: null, all_day: false, location: "Rathaus Kaiserslautern", description: null, category: cat, source: "sitzungskalender_2026", source_uid: `sk-${id}`, owner: "Fraktion", relevance: "offen", status: "scheduled", meeting_body: body, preparation_status: "offen", requires_preparation: true, decision_needed: true };
}
const sitzungskalender2026 = [
  sk("2026-01-12-stadtrat",       "Stadtrat",                  "2026-01-12","15:00","Stadtrat",  "Stadtrat"),
  sk("2026-01-19-hufa",           "Haupt- und Finanzausschuss","2026-01-19","15:00","Ausschuss", "Haupt- und Finanzausschuss"),
  sk("2026-01-22-schultraeger",   "Schulträgerausschuss",      "2026-01-22","15:00","Ausschuss", "Schulträgerausschuss"),
  sk("2026-02-02-stadtrat",       "Stadtrat",                  "2026-02-02","15:00","Stadtrat",  "Stadtrat"),
  sk("2026-02-09-bauausschuss",   "Bauausschuss",              "2026-02-09","15:00","Ausschuss", "Bauausschuss"),
  sk("2026-02-16-hufa",           "Haupt- und Finanzausschuss","2026-02-16","15:00","Ausschuss", "Haupt- und Finanzausschuss"),
  sk("2026-02-23-jugendhilfe",    "Jugendhilfeausschuss",      "2026-02-23","15:00","Ausschuss", "Jugendhilfeausschuss"),
  sk("2026-03-02-stadtrat",       "Stadtrat",                  "2026-03-02","15:00","Stadtrat",  "Stadtrat"),
  sk("2026-03-09-digitalaus",     "Digitalisierungsausschuss", "2026-03-09","15:00","Ausschuss", "Digitalisierungsausschuss"),
  sk("2026-03-16-bauausschuss",   "Bauausschuss",              "2026-03-16","15:00","Ausschuss", "Bauausschuss"),
  sk("2026-03-19-sozialaus",      "Sozialausschuss",           "2026-03-19","15:00","Ausschuss", "Sozialausschuss"),
  sk("2026-03-23-hufa",           "Haupt- und Finanzausschuss","2026-03-23","15:00","Ausschuss", "Haupt- und Finanzausschuss"),
  sk("2026-03-26-sportaus",       "Sportausschuss",            "2026-03-26","15:00","Ausschuss", "Sportausschuss"),
  sk("2026-03-30-stadtrat",       "Stadtrat",                  "2026-03-30","15:00","Stadtrat",  "Stadtrat"),
  sk("2026-04-06-personalaus",    "Personalausschuss",         "2026-04-06","15:00","Ausschuss", "Personalausschuss"),
  sk("2026-04-13-kulturaus",      "Kulturausschuss",           "2026-04-13","15:00","Ausschuss", "Kulturausschuss"),
  sk("2026-04-20-umweltaus",      "Umweltausschuss",           "2026-04-20","15:00","Ausschuss", "Umweltausschuss"),
  sk("2026-04-23-hufa",           "Haupt- und Finanzausschuss","2026-04-23","15:00","Ausschuss", "Haupt- und Finanzausschuss"),
  sk("2026-04-27-stadtrat",       "Stadtrat",                  "2026-04-27","15:00","Stadtrat",  "Stadtrat"),
  sk("2026-05-04-bauausschuss",   "Bauausschuss",              "2026-05-04","15:00","Ausschuss", "Bauausschuss"),
  sk("2026-05-11-jugendhilfe",    "Jugendhilfeausschuss",      "2026-05-11","15:00","Ausschuss", "Jugendhilfeausschuss"),
  sk("2026-05-18-hufa",           "Haupt- und Finanzausschuss","2026-05-18","15:00","Ausschuss", "Haupt- und Finanzausschuss"),
  sk("2026-05-25-stadtrat",       "Stadtrat",                  "2026-05-25","15:00","Stadtrat",  "Stadtrat"),
  sk("2026-06-01-digitalaus",     "Digitalisierungsausschuss", "2026-06-01","15:00","Ausschuss", "Digitalisierungsausschuss"),
  sk("2026-06-08-bauausschuss",   "Bauausschuss",              "2026-06-08","15:00","Ausschuss", "Bauausschuss"),
  sk("2026-06-15-stadtrat",       "Stadtrat",                  "2026-06-15","15:00","Stadtrat",  "Stadtrat"),
  sk("2026-06-18-hufa",           "Haupt- und Finanzausschuss","2026-06-18","15:00","Ausschuss", "Haupt- und Finanzausschuss"),
  sk("2026-06-22-sozialaus",      "Sozialausschuss",           "2026-06-22","15:00","Ausschuss", "Sozialausschuss"),
  sk("2026-06-25-personalaus",    "Personalausschuss",         "2026-06-25","15:00","Ausschuss", "Personalausschuss"),
  sk("2026-06-29-stadtrat",       "Stadtrat",                  "2026-06-29","15:00","Stadtrat",  "Stadtrat"),
  sk("2026-07-06-bauausschuss",   "Bauausschuss",              "2026-07-06","15:00","Ausschuss", "Bauausschuss"),
  sk("2026-07-13-hufa",           "Haupt- und Finanzausschuss","2026-07-13","15:00","Ausschuss", "Haupt- und Finanzausschuss"),
  sk("2026-07-20-stadtrat",       "Stadtrat",                  "2026-07-20","15:00","Stadtrat",  "Stadtrat"),
  sk("2026-08-31-stadtrat",       "Stadtrat",                  "2026-08-31","15:00","Stadtrat",  "Stadtrat"),
  sk("2026-09-07-bauausschuss",   "Bauausschuss",              "2026-09-07","15:00","Ausschuss", "Bauausschuss"),
  sk("2026-09-14-hufa",           "Haupt- und Finanzausschuss","2026-09-14","15:00","Ausschuss", "Haupt- und Finanzausschuss"),
  sk("2026-09-21-jugendhilfe",    "Jugendhilfeausschuss",      "2026-09-21","15:00","Ausschuss", "Jugendhilfeausschuss"),
  sk("2026-09-24-digitalaus",     "Digitalisierungsausschuss", "2026-09-24","15:00","Ausschuss", "Digitalisierungsausschuss"),
  sk("2026-09-28-stadtrat",       "Stadtrat",                  "2026-09-28","15:00","Stadtrat",  "Stadtrat"),
  sk("2026-10-05-kulturaus",      "Kulturausschuss",           "2026-10-05","15:00","Ausschuss", "Kulturausschuss"),
  sk("2026-10-08-sozialaus",      "Sozialausschuss",           "2026-10-08","15:00","Ausschuss", "Sozialausschuss"),
  sk("2026-10-12-bauausschuss",   "Bauausschuss",              "2026-10-12","15:00","Ausschuss", "Bauausschuss"),
  sk("2026-10-15-hufa",           "Haupt- und Finanzausschuss","2026-10-15","15:00","Ausschuss", "Haupt- und Finanzausschuss"),
  sk("2026-10-19-umweltaus",      "Umweltausschuss",           "2026-10-19","15:00","Ausschuss", "Umweltausschuss"),
  sk("2026-10-26-stadtrat",       "Stadtrat",                  "2026-10-26","15:00","Stadtrat",  "Stadtrat"),
  sk("2026-11-02-sportaus",       "Sportausschuss",            "2026-11-02","15:00","Ausschuss", "Sportausschuss"),
  sk("2026-11-05-personalaus",    "Personalausschuss",         "2026-11-05","15:00","Ausschuss", "Personalausschuss"),
  sk("2026-11-09-bauausschuss",   "Bauausschuss",              "2026-11-09","15:00","Ausschuss", "Bauausschuss"),
  sk("2026-11-12-schultraeger",   "Schulträgerausschuss",      "2026-11-12","15:00","Ausschuss", "Schulträgerausschuss"),
  sk("2026-11-16-hufa",           "Haupt- und Finanzausschuss","2026-11-16","15:00","Ausschuss", "Haupt- und Finanzausschuss"),
  sk("2026-11-19-jugendhilfe",    "Jugendhilfeausschuss",      "2026-11-19","15:00","Ausschuss", "Jugendhilfeausschuss"),
  sk("2026-11-23-stadtrat",       "Stadtrat",                  "2026-11-23","15:00","Stadtrat",  "Stadtrat"),
  sk("2026-11-26-digitalaus",     "Digitalisierungsausschuss", "2026-11-26","15:00","Ausschuss", "Digitalisierungsausschuss"),
  sk("2026-11-30-sozialaus",      "Sozialausschuss",           "2026-11-30","15:00","Ausschuss", "Sozialausschuss"),
  sk("2026-12-03-kulturaus",      "Kulturausschuss",           "2026-12-03","15:00","Ausschuss", "Kulturausschuss"),
  sk("2026-12-07-bauausschuss",   "Bauausschuss",              "2026-12-07","15:00","Ausschuss", "Bauausschuss"),
  sk("2026-12-10-hufa",           "Haupt- und Finanzausschuss","2026-12-10","15:00","Ausschuss", "Haupt- und Finanzausschuss"),
  sk("2026-12-14-stadtrat",       "Stadtrat",                  "2026-12-14","15:00","Stadtrat",  "Stadtrat"),
];

const demoEvents: typeof sitzungskalender2026 = [];

const demoCommittees = [
  { id: "c-ba",   slug: "bauausschuss",                   title: "Bauausschuss",                 short_ref: "BA",   source: "attendance_list", notes: null },
  { id: "c-da",   slug: "digitalisierungsausschuss",      title: "Digitalisierungsausschuss",    short_ref: "DA",   source: "attendance_list", notes: null },
  { id: "c-hufa", slug: "haupt-und-finanzausschuss",      title: "Haupt- und Finanzausschuss",   short_ref: "HuFa", source: "attendance_list", notes: null },
  { id: "c-pa",   slug: "personalausschuss",              title: "Personalausschuss",            short_ref: "PA",   source: "attendance_list", notes: null },
  { id: "c-hoa",  slug: "hospitalausschuss",              title: "Hospitalausschuss",            short_ref: "HoA",  source: "attendance_list", notes: null },
  { id: "c-jha",  slug: "jugendhilfeausschuss",           title: "Jugendhilfeausschuss",         short_ref: "JHA",  source: "attendance_list", notes: null },
  { id: "c-ka",   slug: "kulturausschuss",                title: "Kulturausschuss",              short_ref: "KA",   source: "attendance_list", notes: null },
  { id: "c-ma",   slug: "marktausschuss",                 title: "Marktausschuss",               short_ref: "MA",   source: "attendance_list", notes: null },
  { id: "c-rpa",  slug: "rechnungspruefungsausschuss",    title: "Rechnungsprüfungsausschuss",   short_ref: "RPA",  source: "attendance_list", notes: null },
  { id: "c-sta",  slug: "schultraegerausschuss",          title: "Schulträgerausschuss",         short_ref: "STA",  source: "attendance_list", notes: null },
  { id: "c-soa",  slug: "sozialausschuss",                title: "Sozialausschuss",              short_ref: "SoA",  source: "attendance_list", notes: null },
  { id: "c-spa",  slug: "sportausschuss",                 title: "Sportausschuss",               short_ref: "SpA",  source: "attendance_list", notes: null },
  { id: "c-ua",   slug: "umweltausschuss",                title: "Umweltausschuss",              short_ref: "UA",   source: "attendance_list", notes: null },
  { id: "c-vr",   slug: "vr-stadtentwaesserung",          title: "VR Stadtentwässerung",         short_ref: "VR",   source: "attendance_list", notes: null },
  { id: "c-wa",   slug: "werkausschuss-stadtbildpflege",  title: "Werkausschuss Stadtbildpflege",short_ref: "WA",   source: "attendance_list", notes: null },
  { id: "c-ra",   slug: "regionalausschuss",              title: "Regionalausschuss",            short_ref: "RA",   source: "attendance_list", notes: null },
];

function cm(id: string, slug: string, name: string, role: "member" | "substitute", order: number) {
  return { id: `cm-${id}`, committee_slug: slug, person_name: name, role, sort_order: order, source_file: null };
}
const demoMemberships = [
  cm("ba-01","bauausschuss","Harald Brandstädter","member",10), cm("ba-02","bauausschuss","Marcel Schulz","member",20), cm("ba-03","bauausschuss","Michael Loos","member",30), cm("ba-04","bauausschuss","Reiner Kiefhaber","member",40), cm("ba-05","bauausschuss","Anette Diederich","substitute",10), cm("ba-06","bauausschuss","Kevin Kneip","substitute",20), cm("ba-07","bauausschuss","Robert Gorris","substitute",30), cm("ba-08","bauausschuss","Thorsten Peermann","substitute",40),
  cm("da-01","digitalisierungsausschuss","Patrick Schäfer","member",10), cm("da-02","digitalisierungsausschuss","Raymond Germany","member",20), cm("da-03","digitalisierungsausschuss","Anna Raab","member",30), cm("da-04","digitalisierungsausschuss","Robin Brandstädter","member",40), cm("da-05","digitalisierungsausschuss","Moritz Behncke","substitute",10), cm("da-06","digitalisierungsausschuss","Thomas Kneller","substitute",20), cm("da-07","digitalisierungsausschuss","René Neyer","substitute",30), cm("da-08","digitalisierungsausschuss","Constantin Rubel","substitute",40),
  cm("hufa-01","haupt-und-finanzausschuss","Patrick Schäfer","member",10), cm("hufa-02","haupt-und-finanzausschuss","Janina Eispert","member",20), cm("hufa-03","haupt-und-finanzausschuss","Raymond Germany","member",30), cm("hufa-04","haupt-und-finanzausschuss","Michael Krauß","member",40), cm("hufa-05","haupt-und-finanzausschuss","Moritz Behncke","substitute",10), cm("hufa-06","haupt-und-finanzausschuss","Petra Janson-Peermann","substitute",20), cm("hufa-07","haupt-und-finanzausschuss","Jörg Harz","substitute",30), cm("hufa-08","haupt-und-finanzausschuss","Harald Brandstädter","substitute",40),
  cm("pa-01","personalausschuss","Patrick Schäfer","member",10), cm("pa-02","personalausschuss","Janina Eispert","member",20), cm("pa-03","personalausschuss","Michael Krauß","member",30), cm("pa-04","personalausschuss","Moritz Behncke","member",40), cm("pa-05","personalausschuss","Anna Raab","substitute",10), cm("pa-06","personalausschuss","Harald Brandstädter","substitute",20), cm("pa-07","personalausschuss","Raymond Germany","substitute",30), cm("pa-08","personalausschuss","Jörg Harz","substitute",40),
  cm("hoa-01","hospitalausschuss","Patrick Schäfer","member",10), cm("hoa-02","hospitalausschuss","Petra Janson-Peermann","member",20), cm("hoa-03","hospitalausschuss","Michael Krauß","member",30), cm("hoa-04","hospitalausschuss","Harald Ledig","substitute",10), cm("hoa-05","hospitalausschuss","Thorsten Peermann","substitute",20), cm("hoa-06","hospitalausschuss","Marcel Schulz","substitute",30),
  cm("jha-01","jugendhilfeausschuss","Moritz Behncke","member",10), cm("jha-02","jugendhilfeausschuss","Janina Eispert","member",20), cm("jha-03","jugendhilfeausschuss","Anna Raab","member",30), cm("jha-04","jugendhilfeausschuss","Christine Kiefaber","member",40), cm("jha-05","jugendhilfeausschuss","Jaqueline Schröder","substitute",10), cm("jha-06","jugendhilfeausschuss","Marcel Schulz","substitute",20), cm("jha-07","jugendhilfeausschuss","Luca Ganter","substitute",30), cm("jha-08","jugendhilfeausschuss","Michael Flesch","substitute",40),
  cm("ka-01","kulturausschuss","Moritz Behncke","member",10), cm("ka-02","kulturausschuss","Michael Krauß","member",20), cm("ka-03","kulturausschuss","Ella Schulz","member",30), cm("ka-04","kulturausschuss","Heike Spies","member",40), cm("ka-05","kulturausschuss","Ulrike Müller-Ressel","substitute",10), cm("ka-06","kulturausschuss","Brigitte Seidler","substitute",20), cm("ka-07","kulturausschuss","Anna Raab","substitute",30), cm("ka-08","kulturausschuss","Gerda Hoppe","substitute",40),
  cm("ma-01","marktausschuss","Andreas Rahm","member",10), cm("ma-02","marktausschuss","Petra Janson-Peermann","member",20), cm("ma-03","marktausschuss","Heike Spies","member",30), cm("ma-04","marktausschuss","Reiner Becker","member",40), cm("ma-05","marktausschuss","Reiner Kiefhaber","substitute",10), cm("ma-06","marktausschuss","Moritz Behncke","substitute",20), cm("ma-07","marktausschuss","Anita Anspach-Olfers","substitute",30), cm("ma-08","marktausschuss","Marcel Schulz","substitute",40),
  cm("rpa-01","rechnungspruefungsausschuss","Harald Brandstädter","member",10), cm("rpa-02","rechnungspruefungsausschuss","Raymond Germany","member",20), cm("rpa-03","rechnungspruefungsausschuss","Michael Krauß","member",30), cm("rpa-04","rechnungspruefungsausschuss","Petra Janson-Peermann","member",40), cm("rpa-05","rechnungspruefungsausschuss","Heike Spies","substitute",10), cm("rpa-06","rechnungspruefungsausschuss","Patrick Schäfer","substitute",20), cm("rpa-07","rechnungspruefungsausschuss","Janina Eispert","substitute",30), cm("rpa-08","rechnungspruefungsausschuss","Moritz Behncke","substitute",40),
  cm("sta-01","schultraegerausschuss","Moritz Behncke","member",10), cm("sta-02","schultraegerausschuss","Petra Janson-Peermann","member",20), cm("sta-03","schultraegerausschuss","Anna Raab","member",30), cm("sta-04","schultraegerausschuss","Marcel Schulz","member",40), cm("sta-05","schultraegerausschuss","Thorsten Peermann","substitute",10), cm("sta-06","schultraegerausschuss","Karin Fürst-Steiner","substitute",20), cm("sta-07","schultraegerausschuss","Janina Eispert","substitute",30), cm("sta-08","schultraegerausschuss","Alexander Lenz","substitute",40),
  cm("soa-01","sozialausschuss","Moritz Behncke","member",10), cm("soa-02","sozialausschuss","Jörg Harz","member",20), cm("soa-03","sozialausschuss","Anna Raab","member",30), cm("soa-04","sozialausschuss","Brigitte Seidler","member",40), cm("soa-05","sozialausschuss","Luca Ganter","substitute",10), cm("soa-06","sozialausschuss","Christine Kiefaber","substitute",20), cm("soa-07","sozialausschuss","Jaqueline Schröder","substitute",30), cm("soa-08","sozialausschuss","Janina Eispert","substitute",40),
  cm("spa-01","sportausschuss","Jörg Harz","member",10), cm("spa-02","sportausschuss","Alexander Lenz","member",20), cm("spa-03","sportausschuss","Patrick Schäfer","member",30), cm("spa-04","sportausschuss","Michael Schmitt","member",40), cm("spa-05","sportausschuss","Michael Flesch","substitute",10), cm("spa-06","sportausschuss","Luca Ganter","substitute",20), cm("spa-07","sportausschuss","Andreas Eichhorn","substitute",30), cm("spa-08","sportausschuss","Constantin Rubel","substitute",40),
  cm("ua-01","umweltausschuss","Jens van Boekel","member",10), cm("ua-02","umweltausschuss","Marcel Schulz","member",20), cm("ua-03","umweltausschuss","Petra Janson-Peermann","member",30), cm("ua-04","umweltausschuss","Heike Spies","member",40), cm("ua-05","umweltausschuss","Luca Ganter","substitute",10), cm("ua-06","umweltausschuss","Michael Loos","substitute",20), cm("ua-07","umweltausschuss","Michael Flesch","substitute",30), cm("ua-08","umweltausschuss","Moritz Behncke","substitute",40),
  cm("vr-01","vr-stadtentwaesserung","Petra Janson-Peermann","member",10), cm("vr-02","vr-stadtentwaesserung","Michael Krauß","member",20), cm("vr-03","vr-stadtentwaesserung","Raymond Germany","member",30), cm("vr-04","vr-stadtentwaesserung","Harald Brandstädter","substitute",10), cm("vr-05","vr-stadtentwaesserung","Janina Eispert","substitute",20), cm("vr-06","vr-stadtentwaesserung","Marcel Schulz","substitute",30),
  cm("wa-01","werkausschuss-stadtbildpflege","Marcel Schulz","member",10), cm("wa-02","werkausschuss-stadtbildpflege","Petra Janson-Peermann","member",20), cm("wa-03","werkausschuss-stadtbildpflege","Raymond Germany","member",30), cm("wa-04","werkausschuss-stadtbildpflege","Michael Krauß","member",40), cm("wa-05","werkausschuss-stadtbildpflege","Moritz Behncke","substitute",10), cm("wa-06","werkausschuss-stadtbildpflege","Harald Brandstädter","substitute",20), cm("wa-07","werkausschuss-stadtbildpflege","Jörg Harz","substitute",30), cm("wa-08","werkausschuss-stadtbildpflege","Janina Eispert","substitute",40),
  cm("ra-01","regionalausschuss","Patrick Schäfer","member",10), cm("ra-02","regionalausschuss","Moritz Behncke","member",20), cm("ra-03","regionalausschuss","Janina Eispert","member",30), cm("ra-04","regionalausschuss","Harald Brandstädter","substitute",10), cm("ra-05","regionalausschuss","Anna Raab","substitute",20), cm("ra-06","regionalausschuss","Jaqueline Schröder","substitute",30),
];

const demoTasks = [
  { id: "task-patrick-luca-zukunftsforum-schulgebaeude", title: "Planung nächstes Zukunftsforum - Zukunft unserer Schulgebäude", description: "[Patrick→Luca] Planung des nächsten Zukunftsforums zum Thema Zukunft unserer Schulgebäude.", assignee: "Luca Hoffmann", due_date: null, status: "offen", priority: "hoch", event_id: null, case_id: null }
];

function mergeVisibleEvents(events: typeof demoEvents) {
  const byKey = new Map<string, (typeof demoEvents)[0]>();
  [...sitzungskalender2026, ...events].forEach(event => {
    byKey.set(eventDedupeKey(event), event as (typeof demoEvents)[0]);
  });
  return Array.from(byKey.values()).sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
}

router.get("/data", async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.json({
        profiles: demoProfiles,
        events: mergeVisibleEvents(demoEvents),
        tasks: demoTasks,
        members: [],
        documents: [{ id: "d-1", title: "Anträge und Vorlagen", category: "Arbeitsordner", url: null, description: "Arbeitsstände, Vorlagen und Entwürfe der Fraktion.", owner: "Luca Hoffmann", document_date: null, status: "arbeitsstand", kind: "Arbeitsordner" }],
        calendar_sources: [{ id: "s-1", name: "RIS Kaiserslautern", type: "ics", url: "https://ris.kaiserslautern.de", owner: "Fraktion", enabled: true, last_synced_at: null, notes: null }],
        sync_logs: [],
        cases: [],
        committees: demoCommittees,
        committee_memberships: demoMemberships,
        supabaseConfigured: false
      });
    }

    const [profiles, events, tasks, members, documents, calendarSources, syncLogs, cases, committees, memberships] = await Promise.all([
      supabase.from("profiles").select("*").order("sort_order", { ascending: true }),
      supabase.from("events").select("*").order("starts_at", { ascending: true }),
      supabase.from("tasks").select("*").order("due_date", { ascending: true, nullsFirst: false }),
      supabase.from("members").select("*").order("name", { ascending: true }),
      supabase.from("documents").select("*").order("created_at", { ascending: false }),
      supabase.from("calendar_sources").select("*").order("created_at", { ascending: false }),
      supabase.from("sync_logs").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("cases").select("*").order("updated_at", { ascending: false }),
      supabase.from("committees").select("*").order("title", { ascending: true }),
      supabase.from("committee_memberships").select("*").order("sort_order", { ascending: true })
    ]);

    const error = profiles.error || events.error || tasks.error || members.error || documents.error || calendarSources.error || syncLogs.error || cases.error || committees.error || memberships.error;
    if (error) throw new Error(error.message);

    return res.json({
      profiles: profiles.data ?? demoProfiles,
      events: mergeVisibleEvents(events.data ?? demoEvents),
      tasks: tasks.data ?? demoTasks,
      members: members.data ?? [],
      documents: documents.data ?? [],
      calendar_sources: calendarSources.data ?? [],
      sync_logs: syncLogs.data ?? [],
      cases: cases.data ?? [],
      committees: committees.data ?? [],
      committee_memberships: memberships.data ?? [],
      supabaseConfigured: true
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    req.log.error({ err: error }, "Error in /data");
    return res.json({
      profiles: demoProfiles, events: mergeVisibleEvents(demoEvents), tasks: demoTasks, members: [], documents: [], calendar_sources: [], sync_logs: [], cases: [],
      committees: demoCommittees, committee_memberships: demoMemberships,
      supabaseConfigured: false, error: message
    });
  }
});

export default router;
