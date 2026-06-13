import { NextResponse } from "next/server";
import { demoData } from "@/lib/demo-data";
import { sitzungskalender2026 } from "@/lib/sitzungskalender-2026";
import { getPortalData } from "@/lib/supabase";
import type { FraktionEvent, FraktionTask, PortalData } from "@/lib/types";

function normalizeTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function eventDedupeKey(event: FraktionEvent) {
  const start = new Date(event.starts_at);
  const isoMinute = Number.isNaN(start.getTime()) ? event.starts_at.slice(0, 16) : start.toISOString().slice(0, 16);
  return `${isoMinute}:${normalizeTitle(event.title)}`;
}

function taskDedupeKey(task: FraktionTask) {
  return `${normalizeTitle(task.title)}:${(task.assignee ?? "").toLowerCase()}`;
}

function parseProgress(description: string | null | undefined) {
  const match = description?.match(/\[progress:(\d{1,3})\]/i);
  if (!match) return null;
  return Math.max(0, Math.min(100, Number(match[1])));
}

function normalizeTask(task: FraktionTask): FraktionTask {
  const existingProgress = typeof task.progress === "number" ? task.progress : null;
  return {
    ...task,
    progress: existingProgress ?? parseProgress(task.description) ?? 0
  };
}

function mergeVisibleEvents(events: FraktionEvent[]) {
  const byVisibleIdentity = new Map<string, FraktionEvent>();
  [...sitzungskalender2026, ...events].forEach(event => {
    byVisibleIdentity.set(eventDedupeKey(event), event);
  });
  return Array.from(byVisibleIdentity.values()).sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
}

function mergeVisibleTasks(tasks: FraktionTask[]) {
  const patrickLucaFallbacks = demoData.tasks.filter(task =>
    task.assignee === "Luca Hoffmann" &&
    (task.description ?? "").includes("[Patrick→Luca]")
  );
  const byVisibleIdentity = new Map<string, FraktionTask>();

  // Fallback zuerst, echte Daten danach. Wenn Supabase den Auftrag kennt,
  // gewinnt der dort gepflegte Status und Fortschritt.
  [...patrickLucaFallbacks, ...tasks].forEach(task => {
    byVisibleIdentity.set(taskDedupeKey(task), normalizeTask(task));
  });

  return Array.from(byVisibleIdentity.values()).sort((a, b) => {
    const aTime = a.due_date ? new Date(a.due_date).getTime() : Number.MAX_SAFE_INTEGER;
    const bTime = b.due_date ? new Date(b.due_date).getTime() : Number.MAX_SAFE_INTEGER;
    return aTime - bTime;
  });
}

function withFallbacks(data: PortalData): PortalData {
  return {
    ...data,
    events: mergeVisibleEvents(data.events ?? []),
    tasks: mergeVisibleTasks(data.tasks ?? [])
  };
}

export async function GET() {
  try {
    const data = await getPortalData();
    if (!data.supabaseConfigured) {
      return NextResponse.json(withFallbacks({ ...demoData, supabaseConfigured: false }));
    }
    return NextResponse.json(withFallbacks(data));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    return NextResponse.json(withFallbacks({ ...demoData, supabaseConfigured: false, error: message }), { status: 200 });
  }
}
