import { NextRequest, NextResponse } from "next/server";
import { getProfiles } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const profiles = await getProfiles();
  const profile = profiles.find(item => item.slug === body.profileSlug && item.login_enabled);

  if (!profile) {
    return NextResponse.json({ error: "Profil nicht gefunden oder deaktiviert." }, { status: 404 });
  }

  const sharedCode = process.env.PORTAL_SHARED_CODE;
  if (sharedCode && body.code !== sharedCode) {
    return NextResponse.json({ error: "Zugangscode stimmt nicht." }, { status: 403 });
  }

  return NextResponse.json({ ok: true, profile, prototypeMode: !sharedCode });
}
