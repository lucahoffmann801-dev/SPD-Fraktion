import { Router } from "express";
import { getSupabase } from "../lib/supabase";

function clampProgress(value: unknown) {
  const number = Number(value);
  if (!Number.isFinite(number)) return undefined;
  return Math.max(0, Math.min(100, Math.round(number)));
}

function cleanDescription(description: string | null | undefined) {
  return (description ?? "")
    .replace(/\s*\[progress:\d{1,3}\]/gi, "")
    .replace(/\s*\[visible:(all|private:[^\]]+)\]/gi, "")
    .replace(/\s*\[assignees:[^\]]+\]/gi, "")
    .replace(/\s*\[retention:[^\]]+\]/gi, "")
    .replace(/\s*\[completed_at:[^\]]+\]/gi, "")
    .replace(/\s*\[Patrick→Luca\]/g, "")
    .replace(/\s*\[Patrick-Luca\]/g, "")
    .trim();
}

const router = Router();

router.patch("/work-orders", async (req, res) => {
  try {
    const body = req.body as Record<string, unknown>;
    const title = typeof body["title"] === "string" ? body["title"].trim() : "";
    const assignee = typeof body["assignee"] === "string" && body["assignee"].trim() ? body["assignee"].trim() : "Luca Hoffmann";
    const status = typeof body["status"] === "string" ? body["status"] : undefined;
    const progress = clampProgress(body["progress"]);

    if (!title) return res.status(400).json({ error: "Titel fehlt" });

    const supabase = getSupabase();
    if (!supabase) return res.json({ ok: true, localOnly: true });

    const existing = await supabase.from("tasks").select("*").eq("title", title).eq("assignee", assignee).maybeSingle();
    if (existing.error) throw new Error(existing.error.message);

    const base = existing.data ?? { title, description: "", assignee, due_date: null, priority: "normal", event_id: null, case_id: null, status: "offen", progress: 0 };

    const payload: Record<string, unknown> = {
      assignee,
      assignees: [assignee],
      description: cleanDescription(base.description as string),
      is_work_order: true,
      visibility: "private",
      visible_to: ["patrick-schaefer", "luca-hoffmann"]
    };

    if (status) {
      payload["status"] = status;
      if (status === "erledigt") payload["completed_at"] = new Date().toISOString();
      if (status !== "erledigt") payload["completed_at"] = null;
    }
    if (progress !== undefined) payload["progress"] = progress;

    const result = existing.data
      ? await supabase.from("tasks").update(payload).eq("id", existing.data.id).select()
      : await supabase.from("tasks").insert({
          title: (base as Record<string, unknown>)["title"] ?? title,
          description: payload["description"],
          assignee: (base as Record<string, unknown>)["assignee"] ?? assignee,
          assignees: [assignee],
          due_date: (base as Record<string, unknown>)["due_date"] ?? null,
          status: status ?? (base as Record<string, unknown>)["status"] ?? "offen",
          priority: (base as Record<string, unknown>)["priority"] ?? "normal",
          progress: progress ?? (base as Record<string, unknown>)["progress"] ?? 0,
          event_id: (base as Record<string, unknown>)["event_id"] ?? null,
          case_id: (base as Record<string, unknown>)["case_id"] ?? null,
          is_work_order: true,
          visibility: "private",
          visible_to: ["patrick-schaefer", "luca-hoffmann"]
        }).select();

    if (result.error) throw new Error(result.error.message);
    return res.json({ ok: true, result: result.data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Arbeitsauftrag konnte nicht aktualisiert werden";
    return res.status(500).json({ error: message });
  }
});

export default router;
