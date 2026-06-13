import { createClient } from "@supabase/supabase-js";
import type { CrudTable, PortalData } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);

export function getSupabase() {
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

export async function getPortalData(): Promise<PortalData> {
  const supabase = getSupabase();
  if (!supabase) {
    return { events: [], tasks: [], members: [], documents: [], calendar_sources: [], sync_logs: [], supabaseConfigured: false };
  }

  const [events, tasks, members, documents, calendarSources, syncLogs] = await Promise.all([
    supabase.from("events").select("*").order("starts_at", { ascending: true }),
    supabase.from("tasks").select("*").order("due_date", { ascending: true, nullsFirst: false }),
    supabase.from("members").select("*").order("name", { ascending: true }),
    supabase.from("documents").select("*").order("created_at", { ascending: false }),
    supabase.from("calendar_sources").select("*").order("created_at", { ascending: false }),
    supabase.from("sync_logs").select("*").order("created_at", { ascending: false }).limit(20)
  ]);

  const error = events.error || tasks.error || members.error || documents.error || calendarSources.error || syncLogs.error;
  if (error) throw new Error(error.message);

  return {
    events: events.data ?? [],
    tasks: tasks.data ?? [],
    members: members.data ?? [],
    documents: documents.data ?? [],
    calendar_sources: calendarSources.data ?? [],
    sync_logs: syncLogs.data ?? [],
    supabaseConfigured: true
  } as PortalData;
}

export async function insertRecord<T>(table: CrudTable, payload: Record<string, unknown>): Promise<T[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase ist nicht konfiguriert.");
  const { data, error } = await supabase.from(table).insert(payload).select();
  if (error) throw new Error(error.message);
  return (data ?? []) as T[];
}

export async function updateRecord<T>(table: CrudTable, id: string, payload: Record<string, unknown>): Promise<T[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase ist nicht konfiguriert.");
  const { data, error } = await supabase.from(table).update(payload).eq("id", id).select();
  if (error) throw new Error(error.message);
  return (data ?? []) as T[];
}

export async function deleteRecord(table: CrudTable, id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase ist nicht konfiguriert.");
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw new Error(error.message);
}
