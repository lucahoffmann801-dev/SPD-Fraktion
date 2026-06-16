import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/server/supabase";

const ALLOWED_TABLES = new Set(["events", "tasks", "members", "documents", "calendar_sources", "profiles", "cases", "committees", "committee_memberships"]);

// Only real columns of public.tasks. Anything else in a payload is dropped so a
// stray field can never trigger a Postgres "column does not exist" error.
const TASK_COLUMNS = new Set(["title", "description", "assignee", "due_date", "status", "priority", "event_id", "case_id", "progress", "assignees", "visibility", "visible_to", "retention_days", "completed_at", "is_work_order", "created_by"]);

function validTable(table: unknown): table is string {
  return typeof table === "string" && ALLOWED_TABLES.has(table);
}

function splitList(value: string | null | undefined) {
  return (value ?? "").split(",").map((item: string) => item.trim()).filter(Boolean);
}

function clampProgress(value: unknown) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(100, Math.round(number)));
}

function stripMarkers(description: string) {
  return description
    .replace(/\s*\[progress:\d{1,3}\]/gi, "")
    .replace(/\s*\[visible:(all|private:[^\]]+)\]/gi, "")
    .replace(/\s*\[assignees:[^\]]+\]/gi, "")
    .replace(/\s*\[retention:[^\]]+\]/gi, "")
    .replace(/\s*\[completed_at:[^\]]+\]/gi, "")
    .replace(/\s*\[Patrick→Luca\]/g, "")
    .replace(/\s*\[Luca→Patrick\]/g, "")
    .replace(/\s*\[Patrick-Luca\]/g, "")
    .trim();
}

// Non-destructive normalisation: only columns that are actually provided (or
// safely derivable from a provided field) are written. A partial update such as
// { status } never touches description, assignees, visibility or is_work_order.
function normalizeTaskPayload(payload: Record<string, unknown>) {
  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (TASK_COLUMNS.has(key)) next[key] = value;
  }

  if (typeof next.description === "string") {
    const description = next.description;
    const assigneesMarker = description.match(/\[assignees:([^\]]+)\]/i);
    const privateVisibility = description.match(/\[visible:private:([^\]]+)\]/i);
    const progressMarker = description.match(/\[progress:(\d{1,3})\]/i);
    if (assigneesMarker && next.assignees === undefined) next.assignees = splitList(assigneesMarker[1]);
    if (privateVisibility) { next.visibility = "private"; next.visible_to = splitList(privateVisibility[1]); }
    if (progressMarker && next.progress === undefined) next.progress = clampProgress(progressMarker[1]);
    if (description.includes("[Patrick→Luca]") || description.includes("[Luca→Patrick]") || description.includes("[Patrick-Luca]")) {
      next.is_work_order = true;
    }
    next.description = stripMarkers(description);
  }

  if (next.assignees === undefined && typeof next.assignee === "string" && next.assignee.trim()) {
    next.assignees = splitList(next.assignee);
  }
  if (payload.is_work_order === true) next.is_work_order = true;
  if (next.is_work_order === true) {
    if (next.visibility === undefined) next.visibility = "private";
    if (next.visible_to === undefined) next.visible_to = ["patrick-schaefer", "luca-hoffmann"];
  }
  if (next.progress !== undefined) next.progress = clampProgress(next.progress);

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
    const normalized = normalizePayload(table, payload);
    if (Object.keys(normalized).length === 0) return NextResponse.json({ error: "Keine gültigen Felder zum Aktualisieren." }, { status: 400 });
    const { data, error } = await supabase.from(table).update(normalized).eq("id", id).select();
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
