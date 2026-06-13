import { NextResponse } from "next/server";
import { demoData } from "@/lib/demo-data";
import { mergeCalendarEvents } from "@/lib/sitzungskalender-2026";
import { getPortalData } from "@/lib/supabase";
import type { PortalData } from "@/lib/types";

function withCalendarFallback(data: PortalData): PortalData {
  return {
    ...data,
    events: mergeCalendarEvents(data.events ?? [])
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
