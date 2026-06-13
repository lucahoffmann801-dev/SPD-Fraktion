"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { CalendarSource, FraktionDocument, FraktionEvent, FraktionMember, FraktionTask, PortalData } from "@/lib/types";

type View = "dashboard" | "termine" | "aufgaben" | "mitglieder" | "dokumente" | "sync";

const nav: Array<{ id: View; icon: string; label: string }> = [
  { id: "dashboard", icon: "⌂", label: "Dashboard" },
  { id: "termine", icon: "◷", label: "Termine" },
  { id: "aufgaben", icon: "✓", label: "Aufgaben" },
  { id: "mitglieder", icon: "●", label: "Mitglieder" },
  { id: "dokumente", icon: "▣", label: "Dokumente" },
  { id: "sync", icon: "↻", label: "Kalender-Sync" }
];

const categories = ["Stadtrat", "Ausschuss", "Ortsbeirat", "Fraktionssitzung", "Partei", "Veranstaltung", "Sonstiges"];
const taskStatus = ["offen", "in_bearbeitung", "wartend", "pruefung", "erledigt", "verworfen"];
const priorities = ["niedrig", "normal", "hoch", "kritisch"];

function dateTime(value: string | null | undefined) {
  if (!value) return "ohne Datum";
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function dateOnly(value: string | null | undefined) {
  if (!value) return "ohne Datum";
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(new Date(value));
}

async function postRecord(table: string, payload: Record<string, unknown>) {
  const response = await fetch("/api/records", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ table, payload }) });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || "Speichern fehlgeschlagen");
  return json;
}

async function patchRecord(table: string, id: string, payload: Record<string, unknown>) {
  const response = await fetch("/api/records", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ table, id, payload }) });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || "Aktualisieren fehlgeschlagen");
  return json;
}

function Stat({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return <div className="card"><div className="muted small">{label}</div><div className="metric">{value}</div><div className="small muted">{hint}</div></div>;
}

function Badge({ children, tone = "" }: { children: React.ReactNode; tone?: "" | "red" | "green" | "blue" }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export default function Home() {
  const [view, setView] = useState<View>("dashboard");
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const response = await fetch("/api/data", { cache: "no-store" });
    const json = await response.json();
    setData(json);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const upcoming = useMemo(() => (data?.events ?? []).filter(e => new Date(e.starts_at).getTime() >= Date.now() - 86400000).slice(0, 8), [data]);
  const openTasks = useMemo(() => (data?.tasks ?? []).filter(t => t.status !== "erledigt" && t.status !== "verworfen"), [data]);
  const nextSeven = useMemo(() => upcoming.filter(e => new Date(e.starts_at).getTime() < Date.now() + 7 * 86400000), [upcoming]);

  async function handleEventSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const starts = String(form.get("date")) + "T" + String(form.get("time") || "15:00") + ":00+02:00";
    await postRecord("events", {
      title: form.get("title"), starts_at: starts, ends_at: null, all_day: false,
      location: form.get("location"), description: form.get("description"), category: form.get("category"),
      source: "manual", owner: form.get("owner") || "Patrick", relevance: form.get("relevance") || "offen", status: "scheduled"
    });
    event.currentTarget.reset();
    setMessage("Termin gespeichert.");
    await load();
  }

  async function handleTaskSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await postRecord("tasks", {
      title: form.get("title"), description: form.get("description"), assignee: form.get("assignee"), due_date: form.get("due_date") || null,
      status: "offen", priority: form.get("priority") || "normal", event_id: null
    });
    event.currentTarget.reset();
    setMessage("Aufgabe erstellt.");
    await load();
  }

  async function handleSourceSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await postRecord("calendar_sources", {
      name: form.get("name"), type: "apple_ics", url: form.get("url"), owner: form.get("owner") || "Patrick", enabled: true, notes: form.get("notes")
    });
    event.currentTarget.reset();
    setMessage("Kalenderquelle hinterlegt. Der Sync-Endpunkt ist vorbereitet.");
    await load();
  }

  async function updateTaskStatus(task: FraktionTask, status: string) {
    await patchRecord("tasks", task.id, { status });
    await load();
  }

  const events = data?.events ?? [];
  const tasks = data?.tasks ?? [];
  const members = data?.members ?? [];
  const documents = data?.documents ?? [];
  const sources = data?.calendar_sources ?? [];

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">SPD</div>
          <div><h1>Fraktion KL</h1><p>Internes Termin- und Arbeitscockpit</p></div>
        </div>
        <nav className="nav">
          {nav.map(item => <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)}><span>{item.icon}</span>{item.label}</button>)}
        </nav>
        <div className="sidebar-note">
          <strong>Ausbauziel:</strong><br />Patrick-Kalender einlesen, Fraktionstermine bündeln, Aufgaben ableiten, Dokumente sammeln und alles als abonnierbaren Kalender ausgeben.
        </div>
      </aside>

      <section className="main">
        <div className="topbar">
          <div>
            <div className="eyebrow">SPD-Fraktion Kaiserslautern</div>
            <h1 className="title">Fraktionscockpit</h1>
            <p className="subtitle">Massiv ausgebauter Vercel/Supabase-Neustart des alten Portals: Termine, Aufgaben, Mitglieder, Dokumente, Kalenderquellen und ein später erweiterbarer Apple-Kalender-Sync.</p>
          </div>
          <div className="status-pill"><span className={`dot ${data?.supabaseConfigured ? "" : "off"}`} />{loading ? "lädt..." : data?.supabaseConfigured ? "Supabase verbunden" : "Demo/Fallback aktiv"}</div>
        </div>

        {message && <div className="notice">{message}</div>}
        {data?.error && <div className="notice">Supabase-Hinweis: {data.error}</div>}
        {!data?.supabaseConfigured && <div className="notice">Die Oberfläche läuft bereits mit Demo-Daten. Für echte Speicherung müssen die Supabase-Tabellen aus <code>supabase/schema.sql</code> angelegt und die Vercel Environment Variables gesetzt werden.</div>}

        <section className={`section ${view === "dashboard" ? "active" : ""}`}>
          <div className="grid cols-4">
            <Stat label="Bevorstehende Termine" value={upcoming.length} hint={`${nextSeven.length} in den nächsten 7 Tagen`} />
            <Stat label="Offene Aufgaben" value={openTasks.length} hint="ohne erledigt/verworfen" />
            <Stat label="Mitglieder" value={members.length} hint="Fraktion / Organisation" />
            <Stat label="Kalenderquellen" value={sources.length} hint="Apple-ICS / manuell" />
          </div>
          <div className="grid cols-2" style={{ marginTop: 16 }}>
            <div className="card"><h2>Nächste Termine</h2><EventList events={upcoming.slice(0, 5)} /></div>
            <div className="card"><h2>Dringende Aufgaben</h2><TaskList tasks={openTasks.slice(0, 6)} onStatus={updateTaskStatus} /></div>
          </div>
        </section>

        <section className={`section ${view === "termine" ? "active" : ""}`}>
          <div className="grid cols-2">
            <div className="card"><h2>Neuen Termin anlegen</h2><form className="form-grid" onSubmit={handleEventSubmit}>
              <input className="input wide" name="title" placeholder="Titel, z. B. Stadtrat" required />
              <input className="input" name="date" type="date" required /><input className="input" name="time" type="time" defaultValue="15:00" />
              <select className="select" name="category">{categories.map(c => <option key={c}>{c}</option>)}</select><select className="select" name="relevance"><option value="offen">Relevanz offen</option><option value="beide">für beide</option><option value="patrick">Patrick</option><option value="luca">Luca</option><option value="nicht_relevant">nicht relevant</option></select>
              <input className="input wide" name="location" placeholder="Ort" /><textarea className="textarea wide" name="description" placeholder="Beschreibung / Notiz" />
              <button className="btn red wide">Termin speichern</button>
            </form></div>
            <div className="card"><h2>Terminliste</h2><EventList events={events} /></div>
          </div>
        </section>

        <section className={`section ${view === "aufgaben" ? "active" : ""}`}>
          <div className="grid cols-2">
            <div className="card"><h2>Neue Aufgabe</h2><form className="form-grid" onSubmit={handleTaskSubmit}>
              <input className="input wide" name="title" placeholder="Aufgabe" required />
              <input className="input" name="assignee" placeholder="Zuständig" /><input className="input" name="due_date" type="date" />
              <select className="select wide" name="priority">{priorities.map(p => <option key={p}>{p}</option>)}</select>
              <textarea className="textarea wide" name="description" placeholder="Beschreibung" />
              <button className="btn red wide">Aufgabe erstellen</button>
            </form></div>
            <div className="card"><h2>Aufgaben-Board</h2><TaskList tasks={tasks} onStatus={updateTaskStatus} /></div>
          </div>
        </section>

        <section className={`section ${view === "mitglieder" ? "active" : ""}`}><div className="grid cols-3">{members.map(m => <MemberCard key={m.id} member={m} />)}</div></section>
        <section className={`section ${view === "dokumente" ? "active" : ""}`}><div className="card"><h2>Dokumente</h2><DocumentList documents={documents} /></div></section>

        <section className={`section ${view === "sync" ? "active" : ""}`}>
          <div className="grid cols-2">
            <div className="card"><h2>Patricks Apple-Kalender anbinden</h2><p className="muted">Sicherster Start: Patrick teilt einen Kalender als ICS-Link. Kein normales Apple-ID-Passwort speichern. CalDAV kann später ergänzt werden.</p><form className="form-grid" onSubmit={handleSourceSubmit}>
              <input className="input" name="name" placeholder="Name der Quelle" defaultValue="Patrick Apple Kalender" required />
              <input className="input" name="owner" placeholder="Eigentümer" defaultValue="Patrick" />
              <input className="input wide" name="url" placeholder="https://...ics" required />
              <textarea className="textarea wide" name="notes" placeholder="Notiz, z. B. nur Fraktionskalender" />
              <button className="btn red wide">Kalenderquelle speichern</button>
            </form><div className="footer-actions"><a className="btn light" href="/api/calendar/ics">Fraktionskalender abonnieren</a><a className="btn ghost" href="/api/data">API prüfen</a></div></div>
            <div className="card"><h2>Quellen & Logs</h2><SourceList sources={sources} /><div className="list" style={{ marginTop: 12 }}>{(data?.sync_logs ?? []).slice(0, 5).map(log => <div className="item" key={log.id}><strong>{log.status}</strong><span className="muted small">{log.message} · {dateTime(log.created_at)}</span></div>)}</div></div>
          </div>
        </section>
      </section>
    </main>
  );
}

function EventList({ events }: { events: FraktionEvent[] }) {
  if (!events.length) return <p className="muted">Noch keine Termine.</p>;
  return <div className="list">{events.map(e => <div className="item" key={e.id}><div className="item-head"><h3>{e.title}</h3><div className="badges"><Badge tone="red">{e.category ?? "Termin"}</Badge><Badge tone="blue">{e.relevance ?? "offen"}</Badge></div></div><div className="muted small">{dateTime(e.starts_at)}{e.location ? ` · ${e.location}` : ""}</div>{e.description && <div className="small">{e.description}</div>}</div>)}</div>;
}

function TaskList({ tasks, onStatus }: { tasks: FraktionTask[]; onStatus: (task: FraktionTask, status: string) => Promise<void> }) {
  if (!tasks.length) return <p className="muted">Keine Aufgaben vorhanden.</p>;
  return <div className="list">{tasks.map(t => <div className="item" key={t.id}><div className="item-head"><h3>{t.title}</h3><Badge tone={t.priority === "hoch" || t.priority === "kritisch" ? "red" : ""}>{t.priority}</Badge></div><div className="muted small">{t.assignee || "nicht zugewiesen"} · fällig: {dateOnly(t.due_date)}</div>{t.description && <div className="small">{t.description}</div>}<div className="toolbar">{taskStatus.map(s => <button className={t.status === s ? "btn red" : "btn light"} key={s} onClick={() => onStatus(t, s)}>{s.replace("_", " ")}</button>)}</div></div>)}</div>;
}

function MemberCard({ member }: { member: FraktionMember }) {
  return <div className="card"><div className="item-head"><h3>{member.name}</h3><Badge tone="red">{member.role ?? "Mitglied"}</Badge></div><p className="muted small">{member.committees ?? "Ausschüsse / Zuständigkeiten noch ergänzen"}</p>{member.email && <p className="small">{member.email}</p>}</div>;
}

function DocumentList({ documents }: { documents: FraktionDocument[] }) {
  if (!documents.length) return <p className="muted">Noch keine Dokumente.</p>;
  return <div className="list">{documents.map(d => <div className="item" key={d.id}><div className="item-head"><h3>{d.title}</h3><Badge>{d.category ?? "Dokument"}</Badge></div>{d.description && <div className="small">{d.description}</div>}{d.url && <a className="btn light" href={d.url} target="_blank">Öffnen</a>}</div>)}</div>;
}

function SourceList({ sources }: { sources: CalendarSource[] }) {
  if (!sources.length) return <p className="muted">Noch keine Kalenderquellen.</p>;
  return <div className="list">{sources.map(s => <div className="item" key={s.id}><div className="item-head"><h3>{s.name}</h3><Badge tone={s.enabled ? "green" : ""}>{s.enabled ? "aktiv" : "inaktiv"}</Badge></div><div className="muted small">{s.owner} · {s.type} · letzter Sync: {s.last_synced_at ? dateTime(s.last_synced_at) : "noch nie"}</div>{s.notes && <div className="small">{s.notes}</div>}</div>)}</div>;
}
