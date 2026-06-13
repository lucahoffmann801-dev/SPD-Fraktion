import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const configuredSecret = process.env.CRON_SECRET;
  const provided = request.nextUrl.searchParams.get("secret");
  if (configuredSecret && provided !== configuredSecret) {
    return NextResponse.json({ ok: false, error: "Nicht autorisiert" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    message: "Cron-Endpunkt ist aktiv. Nächster Ausbau: ICS-Quellen aus calendar_sources abrufen und Events per source_uid upserten."
  });
}
