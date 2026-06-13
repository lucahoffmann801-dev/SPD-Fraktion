import { NextResponse } from "next/server";
import { demoData } from "@/lib/demo-data";
import { sitzungskalender2026 } from "@/lib/sitzungskalender-2026";
import { getPortalData } from "@/lib/supabase";
import type { FraktionEvent, PortalData } from "@/lib/types";

function normalizeTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function eventDedupeKey(event: FraktionEvent) {
  const start = new Date(event.starts_at);
  const isoMinute = Number.isNaN(start.getTime()) ? event.starts_at.slice(0, 16) : start.toISOString().slice(0, 16);
  return `${isoMinute}:${normalizeTitle(event.title)}`;
}

function mergeVisibleEvents(events: FraktionEvent[]) {
  const byVisibleIdentity = new Map<string, FraktionEvent>();

  // Fallback zuerst, echte Supabase-/manuelle Daten danach. Wenn beides denselben
  // Termin beschreibt, gewinnt der Datenbankeintrag mit ggf. gepflegtem Status.
  [...sitzungskalender2026, ...events].forEach(event => {
    byVisibleIdentity.set(eventDedupeKey(event), event);
  });

  return Array.from(byVisibleIdentity.values()).sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
}

function withCalendarFallback(data: PortalData): PortalData {
  return {
    ...data,
    events: mergeVisibleEvents(data.events ?? [])
  };
}

export async function GET() {
  try {
    const data = await getPortalData();
    if (!data.supabaseConfigured) {
      return NextResponse.json(withCalendarFallback({ ...demoData, supabaseConfigured: false }));
    }
    return NextResponse.json(withCalendarFallback(data));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    return NextResponse.json(withCalendarFallback({ ...demoData, supabaseConfigured: false, error: message }), { status: 200 });
  }
}
