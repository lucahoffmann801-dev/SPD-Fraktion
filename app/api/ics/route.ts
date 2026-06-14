import { getPortalData } from "@/lib/supabase";
import { toIcs } from "@/lib/ical";

export async function GET() {
  const data = await getPortalData();
  return new Response(toIcs(data.events ?? []));
}
