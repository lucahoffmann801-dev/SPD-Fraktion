import { NextResponse } from "next/server";
import { getProfiles } from "@/lib/supabase";

export async function GET() {
  const profiles = await getProfiles();
  return NextResponse.json({ profiles });
}
