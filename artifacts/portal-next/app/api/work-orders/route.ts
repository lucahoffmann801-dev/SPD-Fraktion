import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/server/supabase";

function clampProgress(value: unknown) {
  const number = Number(value);
  if (!Number.isFinite(number)) return undefined;
  return Math.max(0, Math.min(100, Math.round(number)));
}

// Robust, id-based partial update for work orders. Updates only status/progress/
// completed_at by primary key, so description, assignees, visibility and the
// is_work_order flag are always preserved. A tolerant title+assignee lookup
// (first match, never crashes on duplicates) remains as a legacy fallback.
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>;
    let id = typeof body["id"] === "string" ? body["id"] : "";
    const status = typeof body["status"] === "string" ? body["status"] : undefined;
    const progress = clampProgress(body["progress"]);

    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ ok: true, localOnly: true });

    if (!id) {
      const title = typeof body["title"] === "string" ? body["title"].trim() : "";
      const assignee = typeof body["assignee"] === "string" && body["assignee"].trim() ? body["assignee"].trim() : "Luca Hoffmann";
      if (!title) return NextResponse.json({ error: "Auftrag nicht identifizierbar" }, { status: 400 });
      const found = await supabase.from("tasks").select("id").eq("title", title).eq("assignee", assignee).order("created_at", { ascending: true }).limit(1);
      if (found.error) throw new Error(found.error.message);
      if (!found.data || found.data.length === 0) return NextResponse.json({ error: "Auftrag nicht gefunden" }, { status: 404 });
      id = found.data[0].id as string;
    }

    const payload: Record<string, unknown> = {};
    if (status) {
      payload["status"] = status;
      payload["completed_at"] = status === "erledigt" ? new Date().toISOString() : null;
    }
    if (progress !== undefined) payload["progress"] = progress;
    if (Object.keys(payload).length === 0) return NextResponse.json({ error: "Keine Änderung übergeben" }, { status: 400 });

    const result = await supabase.from("tasks").update(payload).eq("id", id).select();
    if (result.error) throw new Error(result.error.message);
    return NextResponse.json({ ok: true, result: result.data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Arbeitsauftrag konnte nicht aktualisiert werden";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
