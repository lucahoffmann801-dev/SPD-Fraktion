import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/server/supabase";

const ALLOWED_TABLES = new Set(["events", "tasks", "members", "documents", "calendar_sources", "profiles", "cases", "committees", "committee_memberships"]);

function validTable(table: unknown): table is string {
  return typeof table === "string" && ALLOWED_TABLES.has(table);
}

function splitList(value: string | null | undefined) {
  return (value ?? "").split(",").map((item: string) => item.trim()).filter(Boolean);
}

function normalizeTaskPayload(payload: Record<string, unknown>) {
  const next: Record<string, unknown> = { ...payload };
  const description = typeof next.description === "string" ? next.description : "";
  const assignee = typeof next.assignee === "string" ? next.assignee : "";
  const assigneesMarker = description.match(/\[assignees:([^\]]+)\]/i);
  const privateVisibility = description.match(/\[visible:private:([^\]]+)\]/i);
  const progressMarker = description.match(/\[progress:(\d{1,3})\]/i);
  const isWorkOrder = description.includes("[Patrick→Luca]") || description.includes("[Patrick-Luca]") || next.is_work_order === true;

  if (!Array.isArray(next.assignees)) {
    next.assignees = assigneesMarker ? splitList(assigneesMarker[1]) : splitList(assignee);
  }
  if (privateVisibility) {
    next.visibility = "private";
    next.visible_to = splitList(privateVisibility[1]);
  }
  if (progressMarker && next.progress === undefined) {
    next.progress = Math.max(0, Math.min(100, Number(progressMarker[1])));
  }
  if (isWorkOrder) {
    next.is_work_order = true;
    next.visibility = next.visibility ?? "private";
    next.visible_to = Array.isArray(next.visible_to) && (next.visible_to as unknown[]).length > 0 ? next.visible_to : ["patrick-schaefer", "luca-hoffmann"];
  }
  next.description = description
    .replace(/\s*\[progress:\d{1,3}\]/gi, "")
    .replace(/\s*\[visible:(all|private:[^\]]+)\]/gi, "")
    .replace(/\s*\[assignees:[^\]]+\]/gi, "")
    .replace(/\s*\[retention:[^\]]+\]/gi, "")
    .replace(/\s*\[completed_at:[^\]]+\]/gi, "")
    .replace(/\s*\[Patrick→Luca\]/g, "")
    .replace(/\s*\[Patrick-Luca\]/g, "")
    .trim();
  return next;
}

function normalizePayload(table: string, payload: unknown) {
  const safePayload = typeof payload === "object" && payload !== null ? payload as Record<string, unknown> : {};
  return table === "tasks" ? normalizeTaskPayload(safePayload) : safePayload;
}

export async function POST(request: NextRequest) {
  try {
    const { table, payload } = await request.json() as { table?: unknown; payload?: unknown };
    if (!validTable(table)) return NextResponse.json({ error: "Ungültige Tabelle" }, { status: 400 });
    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ error: "Supabase ist nicht konfiguriert." }, { status: 503 });
    const { data, error } = await supabase.from(table).insert(normalizePayload(table, payload)).select();
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, result: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Speichern fehlgeschlagen";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { table, id, payload } = await request.json() as { table?: unknown; id?: unknown; payload?: unknown };
    if (!validTable(table) || typeof id !== "string") return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ error: "Supabase ist nicht konfiguriert." }, { status: 503 });
    const { data, error } = await supabase.from(table).update(normalizePayload(table, payload)).eq("id", id).select();
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, result: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Aktualisieren fehlgeschlagen";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { table, id } = await request.json() as { table?: unknown; id?: unknown };
    if (!validTable(table) || typeof id !== "string") return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ error: "Supabase ist nicht konfiguriert." }, { status: 503 });
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Löschen fehlgeschlagen";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
