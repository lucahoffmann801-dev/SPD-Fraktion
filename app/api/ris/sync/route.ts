import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

const RIS_INFO_URL = "https://ris.kaiserslautern.de/buergerinfo/info.asp";

function toIsoDate(date: string, time: string) {
  const [day, month, year] = date.split(".");
  return `${year}-${month}-${day}T${time}:00+02:00`;
}

function slug(input: string) {
  return input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function parseRisInfo(html: string) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const matches = [...text.matchAll(/(\d{2}\.\d{2}\.\d{4})\s+([^\d]{4,80}?)\s+(\d{2}:\d{2})(?:-\d{2}:\d{2})?\s*Uhr\s+(.{10,180}?)(?=\s+(?:Mo|Di|Mi|Do|Fr|Sa|So)\s+\d{2}\.\d{2}\.\d{4}|\s+Software:|$)/g)];

  return matches.map(match => {
    const date = match[1];
    const title = match[2].trim().replace(/\s+/g, " ");
    const time = match[3];
    const location = match[4].trim().replace(/\s+/g, " ").replace(/\s+B\s.*$/g, "");
    return {
      title,
      starts_at: toIsoDate(date, time),
      ends_at: null,
      all_day: false,
      location,
      description: "Automatisch aus dem öffentlichen RIS Kaiserslautern erkannt. Bitte intern Relevanz und Vorbereitung prüfen.",
      category: title.includes("Ortsbeirat") ? "Ortsbeirat" : title.includes("Stadtrat") ? "Stadtrat" : "Ausschuss",
      source: "ris",
      source_uid: `${date}-${time}-${slug(title)}`,
      owner: "Fraktion",
      relevance: "offen",
      status: "scheduled",
      meeting_body: title,
      preparation_status: "offen",
      requires_preparation: true,
      decision_needed: false,
      ris_url: RIS_INFO_URL
    };
  });
}

export async function POST() {
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Supabase ist nicht konfiguriert." }, { status: 500 });

  const response = await fetch(RIS_INFO_URL, { cache: "no-store" });
  if (!response.ok) return NextResponse.json({ error: `RIS konnte nicht geladen werden: ${response.status}` }, { status: 502 });

  const html = await response.text();
  const events = parseRisInfo(html);
  if (!events.length) return NextResponse.json({ ok: true, imported: 0, message: "Keine Termine erkannt." });

  const { data, error } = await supabase.from("events").upsert(events, { onConflict: "source,source_uid" }).select();
  if (error) return NextResponse.json({ error: error.message, parsed: events.length }, { status: 500 });

  await supabase.from("sync_logs").insert({ status: "ok", message: `RIS-Sync: ${data?.length ?? events.length} Termine verarbeitet`, imported_count: data?.length ?? events.length });
  return NextResponse.json({ ok: true, imported: data?.length ?? events.length, events });
}

export async function GET() {
  return POST();
}
