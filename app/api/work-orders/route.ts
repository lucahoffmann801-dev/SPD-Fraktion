import { NextRequest, NextResponse } from "next/server";
import { demoData } from "@/lib/demo-data";
import { getSupabase } from "@/lib/supabase";

function clampProgress(value: unknown) {
  const number = Number(value);
  if (!Number.isFinite(number)) return undefined;
  return Math.max(0, Math.min(100, Math.round(number)));
}

function stripProgress(description: string | null | undefined) {
  return (description ?? "")
    .replace(/\n?\[progress:\d{1,3}\]/gi, "")
    .trim();
}

function withProgress(description: string | null | undefined, progress: number | undefined) {
  const cleaned = stripProgress(description);
  if (progress === undefined) return cleaned;
  return `${cleaned}\n[progress:${progress}]`.trim();
}

function fallbackTask(title: string, assignee: string) {
  return demoData.tasks.find(task => task.title === title && (task.assignee ?? "") === assignee);
}

async function updateWithOptionalProgress(supabase: NonNullable<ReturnType<typeof getSupabase>>, id: string, payload: Record<string, unknown>) {
  const { data, error } = await supabase.from("tasks").update(payload).eq("id", id).select();
  if (!error) return data ?? [];

  if ("progress" in payload) {
    const { progress: _progress, ...withoutProgress } = payload;
    const retry = await supabase.from("tasks").update(withoutProgress).eq("id", id).select();
    if (!retry.error) return retry.data ?? [];
    throw new Error(retry.error.message);
  }

  throw new Error(error.message);
}

async function insertWithOptionalProgress(supabase: NonNullable<ReturnType<typeof getSupabase>>, payload: Record<string, unknown>) {
  const { data, error } = await supabase.from("tasks").insert(payload).select();
  if (!error) return data ?? [];

  if ("progress" in payload) {
    const { progress: _progress, ...withoutProgress } = payload;
    const retry = await supabase.from("tasks").insert(withoutProgress).select();
    if (!retry.error) return retry.data ?? [];
    throw new Error(retry.error.message);
  }

  throw new Error(error.message);
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title : "";
    const assignee = typeof body.assignee === "string" && body.assignee.trim() ? body.assignee : "Luca Hoffmann";
    const status = typeof body.status === "string" ? body.status : undefined;
    const progress = clampProgress(body.progress);

    if (!title) {
      return NextResponse.json({ error: "Titel fehlt" }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ ok: true, localOnly: true });
    }

    const existing = await supabase
      .from("tasks")
      .select("*")
      .eq("title", title)
      .eq("assignee", assignee)
      .maybeSingle();

    if (existing.error) throw new Error(existing.error.message);

    const base = existing.data ?? fallbackTask(title, assignee) ?? {
      title,
      description: "[Patrick→Luca]",
      assignee,
      due_date: null,
      priority: "normal",
      event_id: null,
      case_id: null
    };

    const payload: Record<string, unknown> = {
      description: withProgress(base.description, progress)
    };
    if (status) payload.status = status;
    if (progress !== undefined) payload.progress = progress;

    const result = existing.data
      ? await updateWithOptionalProgress(supabase, existing.data.id, payload)
      : await insertWithOptionalProgress(supabase, {
          title: base.title ?? title,
          description: payload.description,
          assignee: base.assignee ?? assignee,
          due_date: base.due_date ?? null,
          status: status ?? base.status ?? "offen",
          priority: base.priority ?? "normal",
          progress: progress ?? base.progress ?? 0,
          event_id: base.event_id ?? null,
          case_id: base.case_id ?? null
        });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Arbeitsauftrag konnte nicht aktualisiert werden";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
