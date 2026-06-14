import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
};

function marker(description: string | null, name: string) {
  const match = description?.match(new RegExp(`\\[${name}:([^\\]]+)\\]`, "i"));
  return match?.[1] ?? null;
}

function completedAt(description: string | null) {
  const raw = marker(description, "completed_at");
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function shouldDelete(task: TaskRow, now = Date.now()) {
  if (task.status !== "erledigt") return false;
  const retention = marker(task.description, "retention") ?? "keep";
  if (retention === "delete") return true;
  if (!retention.startsWith("days:")) return false;
  const days = Number(retention.replace("days:", ""));
  const done = completedAt(task.description);
  if (!Number.isFinite(days) || !done) return false;
  return now - done.getTime() > days * 24 * 60 * 60 * 1000;
}

function shouldArchive(task: TaskRow) {
  return task.status === "erledigt" && marker(task.description, "retention") === "archive";
}

export async function POST() {
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ ok: false, error: "Supabase ist nicht konfiguriert." }, { status: 503 });

  const { data, error } = await supabase.from("tasks").select("id,title,description,status");
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  const tasks = (data ?? []) as TaskRow[];
  const toDelete = tasks.filter(task => shouldDelete(task));
  const toArchive = tasks.filter(task => shouldArchive(task));

  for (const task of toDelete) {
    await supabase.from("tasks").delete().eq("id", task.id);
  }

  for (const task of toArchive) {
    await supabase.from("tasks").update({ status: "verworfen" }).eq("id", task.id);
  }

  return NextResponse.json({
    ok: true,
    checked: tasks.length,
    deleted: toDelete.length,
    archived: toArchive.length
  });
}
