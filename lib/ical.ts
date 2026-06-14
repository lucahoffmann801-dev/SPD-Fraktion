import type { FraktionEvent } from "./types";

function esc(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function stamp(value: string) {
  return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function toIcs(events: FraktionEvent[]) {
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SPD-Fraktion Kaiserslautern//Fraktionscockpit//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:SPD-Fraktion Kaiserslautern",
    "X-WR-TIMEZONE:Europe/Berlin"
  ];

  for (const event of events) {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${event.source_uid || event.id}@spd-fraktion-kl`);
    lines.push(`DTSTAMP:${now}`);
    lines.push(`DTSTART:${stamp(event.starts_at)}`);
    if (event.ends_at) lines.push(`DTEND:${stamp(event.ends_at)}`);
    lines.push(`SUMMARY:${esc(event.title)}`);
    if (event.location) lines.push(`LOCATION:${esc(event.location)}`);
    const description = [event.description, event.category ? `Kategorie: ${event.category}` : null, event.relevance ? `Relevanz: ${event.relevance}` : null].filter(Boolean).join("\n");
    if (description) lines.push(`DESCRIPTION:${esc(description)}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}
