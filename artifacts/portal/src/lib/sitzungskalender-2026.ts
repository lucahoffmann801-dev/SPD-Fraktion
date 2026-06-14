import type { FraktionEvent } from "./types";

function sk(id: string, title: string, date: string, time: string, tz: string, category: string, body: string, prep: boolean, decision: boolean): FraktionEvent {
  return { id: `sk-${id}`, title, starts_at: `${date}T${time}:00${tz}`, ends_at: null, all_day: false, location: null, description: null, category, source: "sitzungskalender_2026", source_uid: `sk-${id}`, owner: "Fraktion", relevance: "offen", status: "scheduled", meeting_body: body, preparation_status: "offen", requires_preparation: prep, decision_needed: decision };
}

export const sitzungskalender2026: FraktionEvent[] = [
  sk("2026-05-27-jugendhilfeausschuss", "Jugendhilfeausschuss", "2026-05-27", "15:00", "+02:00", "Ausschuss", "Jugendhilfeausschuss", true, false),
  sk("2026-05-28-kulturausschuss", "Kulturausschuss", "2026-05-28", "16:00", "+02:00", "Ausschuss", "Kulturausschuss", true, false),
  sk("2026-06-01-hufa", "Haupt- und Finanzausschuss", "2026-06-01", "15:00", "+02:00", "Ausschuss", "Haupt- und Finanzausschuss", true, true),
  sk("2026-06-01-personalausschuss", "Personalausschuss", "2026-06-01", "16:00", "+02:00", "Ausschuss", "Personalausschuss", true, false),
  sk("2026-06-01-digitalisierungsausschuss", "Digitalisierungsausschuss", "2026-06-01", "16:30", "+02:00", "Ausschuss", "Digitalisierungsausschuss", true, false),
  sk("2026-06-03-bauausschuss", "Bauausschuss", "2026-06-03", "15:00", "+02:00", "Ausschuss", "Bauausschuss", true, true),
  sk("2026-06-03-fraktionsvorsitzendenrunde", "Fraktionsvorsitzendenrunde", "2026-06-03", "18:00", "+02:00", "Fraktionsvorsitzendenrunde", "Fraktionsvorsitzendenrunde", true, false),
  sk("2026-06-10-ortsbeirat-siegelbach", "Ortsbeirat Siegelbach", "2026-06-10", "18:30", "+02:00", "Ortsbeirat", "Ortsbeirat Siegelbach", false, false),
  sk("2026-06-10-ortsbeirat-morlautern", "Ortsbeirat Morlautern", "2026-06-10", "19:00", "+02:00", "Ortsbeirat", "Ortsbeirat Morlautern", false, false),
  sk("2026-06-11-werkausschuss-stadtbildpflege", "Werkausschuss Stadtbildpflege", "2026-06-11", "14:30", "+02:00", "Ausschuss", "Werkausschuss Stadtbildpflege", true, false),
  sk("2026-06-11-vr-stadtentwaesserung", "VR Stadtentwässerung", "2026-06-11", "15:30", "+02:00", "Ausschuss", "VR Stadtentwässerung", true, false),
  sk("2026-06-15-stadtrat", "Stadtrat", "2026-06-15", "15:00", "+02:00", "Stadtrat", "Stadtrat", true, true),
  sk("2026-06-16-hospitalausschuss", "Hospitalausschuss", "2026-06-16", "16:30", "+02:00", "Ausschuss", "Hospitalausschuss", true, true),
  sk("2026-06-16-ortsbeirat-erlenbach", "Ortsbeirat Erlenbach", "2026-06-16", "19:00", "+02:00", "Ortsbeirat", "Ortsbeirat Erlenbach", false, false),
  sk("2026-06-18-seniorenbeirat", "Seniorenbeirat", "2026-06-18", "14:00", "+02:00", "Beirat", "Seniorenbeirat", false, false),
  sk("2026-06-18-bauausschuss", "Bauausschuss", "2026-06-18", "15:00", "+02:00", "Ausschuss", "Bauausschuss", true, true),
  sk("2026-06-25-marktausschuss", "Marktausschuss", "2026-06-25", "16:00", "+02:00", "Ausschuss", "Marktausschuss", true, true),
  sk("2026-06-25-inklusionsbeirat", "Inklusionsbeirat", "2026-06-25", "17:00", "+02:00", "Beirat", "Inklusionsbeirat", false, false),
  sk("2026-07-21-migration-integration", "Beirat für Migration und Integration", "2026-07-21", "17:00", "+02:00", "Beirat", "Beirat für Migration und Integration", false, false),
  sk("2026-07-27-ferienkommission", "Ferienkommission", "2026-07-27", "16:00", "+02:00", "Sonstiges", "Ferienkommission", false, false),
  sk("2026-08-12-arbeitskreis-haushalt", "Arbeitskreis Haushalt", "2026-08-12", "16:00", "+02:00", "Arbeitskreis", "Arbeitskreis Haushalt", true, true),
  sk("2026-08-17-hufa", "Haupt- und Finanzausschuss", "2026-08-17", "15:00", "+02:00", "Ausschuss", "Haupt- und Finanzausschuss", true, true),
  sk("2026-08-17-personalausschuss", "Personalausschuss", "2026-08-17", "16:00", "+02:00", "Ausschuss", "Personalausschuss", true, false),
  sk("2026-08-17-digitalisierungsausschuss", "Digitalisierungsausschuss", "2026-08-17", "16:30", "+02:00", "Ausschuss", "Digitalisierungsausschuss", true, false),
  sk("2026-08-20-fraktionsvorsitzendenrunde", "Fraktionsvorsitzendenrunde", "2026-08-20", "18:00", "+02:00", "Fraktionsvorsitzendenrunde", "Fraktionsvorsitzendenrunde", true, false),
  sk("2026-08-27-inklusionsbeirat", "Inklusionsbeirat", "2026-08-27", "17:00", "+02:00", "Beirat", "Inklusionsbeirat", false, false),
  sk("2026-08-31-stadtrat", "Stadtrat", "2026-08-31", "15:00", "+02:00", "Stadtrat", "Stadtrat", true, true),
  sk("2026-09-01-migration-integration", "Beirat für Migration und Integration", "2026-09-01", "17:00", "+02:00", "Beirat", "Beirat für Migration und Integration", false, false),
  sk("2026-09-02-jugendhilfeausschuss", "Jugendhilfeausschuss", "2026-09-02", "15:00", "+02:00", "Ausschuss", "Jugendhilfeausschuss", true, false),
  sk("2026-09-02-ortsbeirat-erfenbach", "Ortsbeirat Erfenbach", "2026-09-02", "19:00", "+02:00", "Ortsbeirat", "Ortsbeirat Erfenbach", false, false),
  sk("2026-09-08-personalausschuss", "Personalausschuss", "2026-09-08", "16:00", "+02:00", "Ausschuss", "Personalausschuss", true, false),
  sk("2026-09-08-hufa-haushalt", "Haupt- und Finanzausschuss (Haushalt)", "2026-09-08", "15:00", "+02:00", "Ausschuss", "Haupt- und Finanzausschuss", true, true),
  sk("2026-09-09-hufa-haushalt", "Haupt- und Finanzausschuss (Haushalt)", "2026-09-09", "15:00", "+02:00", "Ausschuss", "Haupt- und Finanzausschuss", true, true),
  sk("2026-09-14-umweltausschuss", "Umweltausschuss", "2026-09-14", "15:00", "+02:00", "Ausschuss", "Umweltausschuss", true, true),
  sk("2026-09-16-sportausschuss", "Sportausschuss", "2026-09-16", "16:00", "+02:00", "Ausschuss", "Sportausschuss", true, false),
  sk("2026-09-17-fraktionsvorsitzendenrunde", "Fraktionsvorsitzendenrunde", "2026-09-17", "18:00", "+02:00", "Fraktionsvorsitzendenrunde", "Fraktionsvorsitzendenrunde", true, false),
  sk("2026-09-21-bauausschuss", "Bauausschuss", "2026-09-21", "15:00", "+02:00", "Ausschuss", "Bauausschuss", true, true),
  sk("2026-09-24-werkausschuss-stadtbildpflege", "Werkausschuss Stadtbildpflege", "2026-09-24", "14:30", "+02:00", "Ausschuss", "Werkausschuss Stadtbildpflege", true, false),
  sk("2026-09-24-vr-stadtentwaesserung", "VR Stadtentwässerung", "2026-09-24", "15:30", "+02:00", "Ausschuss", "VR Stadtentwässerung", true, false),
  sk("2026-09-28-stadtrat", "Stadtrat", "2026-09-28", "15:00", "+02:00", "Stadtrat", "Stadtrat", true, true),
  sk("2026-10-19-hufa", "Haupt- und Finanzausschuss", "2026-10-19", "15:00", "+02:00", "Ausschuss", "Haupt- und Finanzausschuss", true, true),
  sk("2026-10-19-personalausschuss", "Personalausschuss", "2026-10-19", "16:00", "+02:00", "Ausschuss", "Personalausschuss", true, false),
  sk("2026-10-19-digitalisierungsausschuss", "Digitalisierungsausschuss", "2026-10-19", "16:30", "+02:00", "Ausschuss", "Digitalisierungsausschuss", true, false),
  sk("2026-10-20-hospitalausschuss", "Hospitalausschuss", "2026-10-20", "16:30", "+02:00", "Ausschuss", "Hospitalausschuss", true, true),
  sk("2026-10-21-kulturausschuss", "Kulturausschuss", "2026-10-21", "16:00", "+02:00", "Ausschuss", "Kulturausschuss", true, false),
  sk("2026-10-28-schultraegerausschuss", "Schulträgerausschuss", "2026-10-28", "15:00", "+02:00", "Ausschuss", "Schulträgerausschuss", true, false),
  sk("2026-10-29-inklusionsbeirat", "Inklusionsbeirat", "2026-10-29", "17:00", "+02:00", "Beirat", "Inklusionsbeirat", false, false),
  sk("2026-10-29-fraktionsvorsitzendenrunde", "Fraktionsvorsitzendenrunde (vorsorglich)", "2026-10-29", "18:00", "+02:00", "Fraktionsvorsitzendenrunde", "Fraktionsvorsitzendenrunde", true, false),
  sk("2026-11-02-bauausschuss", "Bauausschuss", "2026-11-02", "15:00", "+01:00", "Ausschuss", "Bauausschuss", true, true),
  sk("2026-11-05-sozialausschuss", "Sozialausschuss", "2026-11-05", "15:00", "+01:00", "Ausschuss", "Sozialausschuss", true, false),
  sk("2026-11-05-arbeitskreis-haushalt", "Arbeitskreis Haushalt", "2026-11-05", "16:00", "+01:00", "Arbeitskreis", "Arbeitskreis Haushalt", true, true),
  sk("2026-11-09-stadtrat", "Stadtrat (vorsorglich)", "2026-11-09", "15:00", "+01:00", "Stadtrat", "Stadtrat", true, true),
  sk("2026-11-10-migration-integration", "Beirat für Migration und Integration", "2026-11-10", "17:00", "+01:00", "Beirat", "Beirat für Migration und Integration", false, false),
  sk("2026-11-12-werkausschuss-stadtbildpflege", "Werkausschuss Stadtbildpflege", "2026-11-12", "14:30", "+01:00", "Ausschuss", "Werkausschuss Stadtbildpflege", true, false),
  sk("2026-11-12-fraktionsvorsitzendenrunde", "Fraktionsvorsitzendenrunde", "2026-11-12", "18:00", "+01:00", "Fraktionsvorsitzendenrunde", "Fraktionsvorsitzendenrunde", true, false),
  sk("2026-11-18-jugendhilfeausschuss", "Jugendhilfeausschuss", "2026-11-18", "15:00", "+01:00", "Ausschuss", "Jugendhilfeausschuss", true, false),
  sk("2026-11-23-stadtrat-haushalt", "Stadtrat (Haushalt)", "2026-11-23", "15:00", "+01:00", "Stadtrat", "Stadtrat", true, true),
  sk("2026-11-25-sportausschuss", "Sportausschuss", "2026-11-25", "16:00", "+01:00", "Ausschuss", "Sportausschuss", true, false),
  sk("2026-11-26-vr-stadtentwaesserung", "VR Stadtentwässerung", "2026-11-26", "14:30", "+01:00", "Ausschuss", "VR Stadtentwässerung", true, false),
  sk("2026-11-30-hufa", "Haupt- und Finanzausschuss", "2026-11-30", "15:00", "+01:00", "Ausschuss", "Haupt- und Finanzausschuss", true, true),
  sk("2026-11-30-personalausschuss", "Personalausschuss", "2026-11-30", "16:00", "+01:00", "Ausschuss", "Personalausschuss", true, false),
  sk("2026-11-30-digitalisierungsausschuss", "Digitalisierungsausschuss", "2026-11-30", "16:30", "+01:00", "Ausschuss", "Digitalisierungsausschuss", true, false),
  sk("2026-12-01-marktausschuss", "Marktausschuss", "2026-12-01", "16:00", "+01:00", "Ausschuss", "Marktausschuss", true, false),
  sk("2026-12-03-fraktionsvorsitzendenrunde", "Fraktionsvorsitzendenrunde", "2026-12-03", "18:00", "+01:00", "Fraktionsvorsitzendenrunde", "Fraktionsvorsitzendenrunde", true, false),
  sk("2026-12-07-umweltausschuss", "Umweltausschuss", "2026-12-07", "15:00", "+01:00", "Ausschuss", "Umweltausschuss", true, true),
  sk("2026-12-10-inklusionsbeirat", "Inklusionsbeirat", "2026-12-10", "17:00", "+01:00", "Beirat", "Inklusionsbeirat", false, false),
  sk("2026-12-14-stadtrat", "Stadtrat", "2026-12-14", "15:00", "+01:00", "Stadtrat", "Stadtrat", true, true),
];

export function mergeCalendarEvents(events: FraktionEvent[]) {
  const map = new Map<string, FraktionEvent>();
  [...sitzungskalender2026, ...events].forEach(event => {
    const key = event.source_uid || `${event.title}-${event.starts_at}`;
    map.set(key, event);
  });
  return Array.from(map.values()).sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
}
