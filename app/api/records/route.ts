import { NextRequest, NextResponse } from "next/server";
import { demoData } from "@/lib/demo-data";
import { deleteRecord, insertRecord, updateRecord } from "@/lib/supabase";
import type { CrudTable } from "@/lib/types";

const allowed = new Set(["events", "tasks", "members", "documents", "calendar_sources", "profiles", "cases", "committees", "committee_memberships"]);

function validTable(table: unknown): table is CrudTable {
  return typeof table === "string" && allowed.has(table);
}

function fallbackTaskById(id: string) {
  return demoData.tasks.find(task => task.id === id && (task.description ?? "").includes("[Patrick→Luca]"));
}

function splitList(value: string | null | undefined) {
  return (value ?? "").split(",").map(item => item.trim()).filter(Boolean);
}

function normalizeTaskPayload(payload: Record<string, unknown>) {
  const next: Record<string, unknown> = { ...payload };
  const description = typeof next.description === "string" ? next.description : "";
  const assignee = typeof next.assignee === "string" ? next.assignee : "";
  const assigneesMarker = description.match(/\[assignees:([^\]]+)\]/i);
  const privateVisibility = description.match(/\[visible:private:([^\]]+)\]/i);
  const progressMarker = description.match(/\[progress:(\d{1,3})\]/i);
  const retentionMarker = description.match(/\[retention:(\d+)\]/i);
  const completedMarker = description.match(/\[completed_at:([^\]]+)\]/i);
  const isWorkOrder = description.includes("[Patrick→Luca]") || description.includes("[Patrick-Luca]") || next.is_work_order === true;

  if (!Array.isArray(next.assignees)) {
    next.assignees = assigneesMarker ? splitList(assigneesMarker[1]) : splitList(assignee);
  }

  if (privateVisibility) {
    next.visibility = "private";
    next.visible_to = splitList(privateVisibility[1]);
  } else if (description.includes("[visible:all]") && !next.visibility) {
    next.visibility = "all";
    next.visible_to = [];
  }

  if (progressMarker && next.progress === undefined) {
    next.progress = Math.max(0, Math.min(100, Number(progressMarker[1])));
  }
  if (retentionMarker && next.retention_days === undefined) {
    next.retention_days = Math.max(0, Number(retentionMarker[1]));
  }
  if (completedMarker && next.completed_at === undefined) {
    next.completed_at = completedMarker[1];
  }
  if (isWorkOrder) {
    next.is_work_order = true;
    next.visibility = next.visibility ?? "private";
    next.visible_to = Array.isArray(next.visible_to) && next.visible_to.length > 0 ? next.visible_to : ["patrick-schaefer", "luca-hoffmann"];
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

function normalizePayload(table: CrudTable, payload: unknown) {
  const safePayload = typeof payload === "object" && payload !== null ? payload as Record<string, unknown> : {};
  return table === "tasks" ? normalizeTaskPayload(safePayload) : safePayload;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!validTable(body.table)) return NextResponse.json({ error: "Ungültige Tabelle" }, { status: 400 });
    const result = await insertRecord(body.table, normalizePayload(body.table, body.payload));
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Speichern fehlgeschlagen";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    if (!validTable(body.table) || typeof body.id !== "string") return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
    const result = await updateRecord(body.table, body.id, normalizePayload(body.table, body.payload));

    if (body.table === "tasks" && Array.isArray(result) && result.length === 0) {
      const fallback = fallbackTaskById(body.id);
      if (fallback) {
        const [{ id: _id, ...payload }] = [{ ...fallback, ...normalizePayload("tasks", body.payload) }];
        const inserted = await insertRecord("tasks", normalizeTaskPayload(payload));
        return NextResponse.json({ ok: true, result: inserted, createdFromFallback: true });
      }
    }

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Aktualisieren fehlgeschlagen";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const table = request.nextUrl.searchParams.get("table");
    const id = request.nextUrl.searchParams.get("id");
    if (!validTable(table) || !id) return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
    await deleteRecord(table, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Löschen fehlgeschlagen";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
