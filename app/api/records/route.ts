import { NextRequest, NextResponse } from "next/server";
import { deleteRecord, insertRecord, updateRecord } from "@/lib/supabase";
import type { CrudTable } from "@/lib/types";

const allowed = new Set(["events", "tasks", "members", "documents", "calendar_sources", "profiles", "cases", "committees", "committee_memberships"]);

function validTable(table: unknown): table is CrudTable {
  return typeof table === "string" && allowed.has(table);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!validTable(body.table)) return NextResponse.json({ error: "Ungültige Tabelle" }, { status: 400 });
    const result = await insertRecord(body.table, body.payload ?? {});
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
    const result = await updateRecord(body.table, body.id, body.payload ?? {});
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
