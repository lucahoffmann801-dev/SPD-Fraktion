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

function parseVisibleTo(description: string | null | undefined) {
  const privateMatch = description?.match(/\[visible:private:([^\]]+)\]/i);
  if (!privateMatch) return [];
  return privateMatch[1].split(",").map(item => item.trim()).filter(Boolean);
}

function parseAssignees(task: FraktionTask) {
  if (Array.isArray(task.assignees) && task.assignees.length > 0) return task.assignees;
  const marker = task.description?.match(/\[assignees:([^\]]+)\]/i);
  if (marker) return marker[1].split(",").map(item => item.trim()).filter(Boolean);
  if (task.assignee) return task.assignee.split(",").map(item => item.trim()).filter(Boolean);
  return [];
}

function cleanTaskDescription(value: string | null | undefined) {
  const cleaned = (value ?? "")
    .replace(/\s*\[progress:\d{1,3}\]/gi, "")
    .replace(/\s*\[visible:(all|private:[^\]]+)\]/gi, "")
    .replace(/\s*\[assignees:[^\]]+\]/gi, "")
    .replace(/\s*\[retention:[^\]]+\]/gi, "")
    .replace(/\s*\[completed_at:[^\]]+\]/gi, "")
    .replace(/\s*\[Patrick→Luca\]/g, "")
    .replace(/\s*\[Patrick-Luca\]/g, "")
    .trim();
  return cleaned || null;
}

function normalizeTask(task: FraktionTask): FraktionTask {
  const description = task.description ?? null;
  const markerProgress = parseProgress(description);
  const isWorkOrder = Boolean(task.is_work_order) || description?.includes("[Patrick→Luca]") || description?.includes("[Patrick-Luca]") || false;
  const visibleTo = Array.isArray(task.visible_to) && task.visible_to.length > 0 ? task.visible_to : parseVisibleTo(description);
  const visibility = task.visibility ?? (visibleTo.length > 0 ? "private" : "all");

  return {
    ...task,
    description: cleanTaskDescription(description),
    progress: typeof task.progress === "number" ? task.progress : markerProgress ?? 0,
    assignees: parseAssignees(task),
    visibility,
    visible_to: visibleTo,
    is_work_order: isWorkOrder
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
    ((task.description ?? "").includes("[Patrick→Luca]") || Boolean(task.is_work_order))
  );
  const byVisibleIdentity = new Map<string, FraktionTask>();

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
