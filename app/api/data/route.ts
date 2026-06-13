import { NextResponse } from "next/server";
import { demoData } from "@/lib/demo-data";
import { getPortalData } from "@/lib/supabase";

export async function GET() {
  try {
    const data = await getPortalData();
    if (!data.supabaseConfigured) {
      return NextResponse.json({ ...demoData, supabaseConfigured: false });
    }
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    return NextResponse.json({ ...demoData, supabaseConfigured: false, error: message }, { status: 200 });
  }
}
