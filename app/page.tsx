"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { CalendarSource, FraktionDocument, FraktionEvent, FraktionMember, FraktionProfile, FraktionTask, PortalData } from "@/lib/types";

type View = "dashboard" | "termine" | "aufgaben" | "profile" | "mitglieder" | "dokumente" | "sync";

const nav: Array<{ id: View; icon: string; label: string }> = [
  { id: "dashboard", icon: "􀎟", label: "Cockpit" },
  { id: "termine", icon: "􀉉", label: "Termine" },
  { id: "aufgaben", icon: "􀷾", label: "Aufgaben" },
  { id: "profile", icon: "􀉭", label: "Profile" },
  { id: "mitglieder", icon: "􀉫", label: "Fraktion" },
  { id: "dokumente", icon: "􀈷", label: "Dokumente" },
  { id: "sync", icon: "􀅈", label: "Kalender" }
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

function classNames(...items: Array<string | false | null | undefined>) {
  return items.filter(Boolean).join(" ");
}

function Stat({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return <div className="glass stat"><div className="muted small">{label}</div><div className="metric">{value}</div><div className="small muted">{hint}</div></div>;
}

function Badge({ children, tone = "" }: { children: React.ReactNode; tone?: "" | "red" | "green" | "blue" | "gold" }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export default function Home() {
  const [view, setView] = useState<View>("dashboard");
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [currentProfile, setCurrentProfile] = useState<FraktionProfile | null>(null);

  async function load() {
    setLoading(true);
    const response = await fetch("/api/data", { cache: "no-store" });
    const json = await response.json();
    setData(json);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!data) return;
    const saved = window.localStorage.getItem("fraktion-profile-slug");
    if (!saved) return;
    const profile = data.profiles.find(item => item.slug === saved);
    if (profile) setCurrentProfile(profile);
  }, [data]);

  const profiles = data?.profiles ?? [];
  const upcoming = useMemo(() => (data?.events ?? []).filter(e => new Date(e.starts_at).getTime() >= Date.now() - 86400000).slice(0, 8), [data]);
  const openTasks = useMemo(() => (data?.tasks ?? []).filter(t => t.status !== "erledigt" && t.status !== "verworfen"), [data]);
  const myTasks = useMemo(() => openTasks.filter(t => !currentProfile || !t.assignee || t.assignee.includes(currentProfile.display_name) || t.assignee.includes(currentProfile.full_name)), [openTasks, currentProfile]);
  const nextSeven = useMemo(() => upcoming.filter(e => new Date(e.starts_at).getTime() < Date.now() + 7 * 86400000), [upcoming]);

  async function handleLogin(profileSlug: string, code: string) {
    const response = await fetch("/api/auth/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profileSlug, code }) });
    const json = await response.json();
    if (!response.ok) {
      setMessage(json.error || "Login fehlgeschlagen.");
      return;
    }
    setCurrentProfile(json.profile);
    window.localStorage.setItem("fraktion-profile-slug", json.profile.slug);
    setMessage(json.prototypeMode ? "Profil aktiv. Hinweis: Der Login läuft im Prototyp-Modus, bis PORTAL_SHARED_CODE gesetzt ist." : "Login erfolgreich.");
  }

  function logout() {
    window.localStorage.removeItem("fraktion-profile-slug");
    setCurrentProfile(null);
  }

  async function handleEventSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const starts = String(form.get("date")) + "T" + String(form.get("time") || "15:00") + ":00+02:00";
    await postRecord("events", {
      title: form.get("title"), starts_at: starts, ends_at: null, all_day: false,
      location: form.get("location"), description: form.get("description"), category: form.get("category"),
      source: "manual", owner: currentProfile?.full_name ?? "Fraktion", relevance: form.get("relevance") || "offen", status: "scheduled"
    });
    event.currentTarget.reset();
    setMessage("Termin gespeichert.");
    await load();
  }

  async function handleTaskSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await postRecord("tasks", {
      title: form.get("title"), description: form.get("description"), assignee: form.get("assignee") || currentProfile?.full_name, due_date: form.get("due_date") || null,
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
      name: form.get("name"), type: "apple_ics", url: form.get("url"), owner: form.get("owner") || currentProfile?.full_name || "Patrick", enabled: true, notes: form.get("notes")
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

  if (!data || loading) {
    return <main className="login-shell"><div className="login-card glass"><Brand /><div className="pulse" /><p className="muted">Fraktionscockpit wird geladen…</p></div></main>;
  }

  if (!currentProfile) {
    return <LoginScreen profiles={profiles} message={message} onLogin={handleLogin} />;
  }

  return (
    <main className="app-shell">
      <aside className="sidebar glass">
        <Brand />
        <div className="active-profile compact-profile">
          <Avatar profile={currentProfile} />
          <div><strong>{currentProfile.full_name}</strong><span>{currentProfile.role}</span></div>
        </div>
        <nav className="nav">
          {nav.map(item => <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)}><span>{item.icon}</span>{item.label}</button>)}
        </nav>
        <button className="logout" onClick={logout}>Profil wechseln</button>
      </aside>

      <section className="main">
        <div className="hero glass">
          <div>
            <div className="eyebrow">SPD-Fraktion Kaiserslautern · Intern</div>
            <h1>Guten Abend, {currentProfile.display_name}.</h1>
            <p>Liquid-Glass-Cockpit für Termine, Aufgaben, Fraktionsprofile, Dokumente und Kalender-Sync.</p>
          </div>
          <div className="hero-profile"><Avatar profile={currentProfile} large /><div><strong>{currentProfile.role}</strong><span>{currentProfile.portal_role.replace("_", " ")}</span></div></div>
        </div>

        {message && <div className="notice glass">{message}</div>}
        {data.error && <div className="notice glass">Supabase-Hinweis: {data.error}</div>}

        <section className={classNames("section", view === "dashboard" && "active")}>
          <div className="grid cols-4">
            <Stat label="Profile" value={profiles.length} hint="12 Ratsmitglieder + Sekretariat" />
            <Stat label="Termine" value={upcoming.length} hint={`${nextSeven.length} in den nächsten 7 Tagen`} />
            <Stat label="Meine Aufgaben" value={myTasks.length} hint="gefiltert nach Profil" />
            <Stat label="Kalenderquellen" value={sources.length} hint="Apple/ICS vorbereitet" />
          </div>
          <div className="grid cols-2 spacious">
            <div className="glass card"><SectionTitle title="Nächste Termine" subtitle="Fraktion, Rat und Ausschüsse" /><EventList events={upcoming.slice(0, 5)} /></div>
            <div className="glass card"><SectionTitle title="Meine Aufgaben" subtitle="Status direkt umschalten" /><TaskList tasks={myTasks.slice(0, 6)} onStatus={updateTaskStatus} /></div>
          </div>
        </section>

        <section className={classNames("section", view === "termine" && "active")}>
          <div className="grid cols-2">
            <div className="glass card"><SectionTitle title="Neuen Termin anlegen" subtitle="Schnelle Erfassung für Fraktion und Kalender" /><form className="form-grid" onSubmit={handleEventSubmit}>
              <input className="input wide" name="title" placeholder="Titel, z. B. Stadtrat" required />
              <input className="input" name="date" type="date" required /><input className="input" name="time" type="time" defaultValue="15:00" />
              <select className="select" name="category">{categories.map(c => <option key={c}>{c}</option>)}</select><select className="select" name="relevance"><option value="offen">Relevanz offen</option><option value="beide">für beide</option><option value="patrick">Patrick</option><option value="luca">Luca</option><option value="nicht_relevant">nicht relevant</option></select>
              <input className="input wide" name="location" placeholder="Ort" /><textarea className="textarea wide" name="description" placeholder="Beschreibung / Notiz" />
              <button className="btn red wide">Termin speichern</button>
            </form></div>
            <div className="glass card"><SectionTitle title="Terminliste" subtitle="Chronologisch aus Supabase" /><EventList events={events} /></div>
          </div>
        </section>

        <section className={classNames("section", view === "aufgaben" && "active")}>
          <div className="grid cols-2">
            <div className="glass card"><SectionTitle title="Neue Aufgabe" subtitle="Zuständigkeit und Priorität setzen" /><form className="form-grid" onSubmit={handleTaskSubmit}>
              <input className="input wide" name="title" placeholder="Aufgabe" required />
              <input className="input" name="assignee" placeholder="Zuständig" defaultValue={currentProfile.full_name} /><input className="input" name="due_date" type="date" />
              <select className="select wide" name="priority">{priorities.map(p => <option key={p}>{p}</option>)}</select>
              <textarea className="textarea wide" name="description" placeholder="Beschreibung" />
              <button className="btn red wide">Aufgabe erstellen</button>
            </form></div>
            <div className="glass card"><SectionTitle title="Aufgaben-Board" subtitle="Alle offenen Arbeitsstände" /><TaskList tasks={tasks} onStatus={updateTaskStatus} /></div>
          </div>
        </section>

        <section className={classNames("section", view === "profile" && "active")}>
          <SectionTitle title="Nutzerprofile" subtitle="Alle Zugänge der Fraktion plus Fraktionssekretariat" />
          <div className="profile-grid">{profiles.map(profile => <ProfileCard key={profile.slug} profile={profile} active={profile.slug === currentProfile.slug} />)}</div>
        </section>

        <section className={classNames("section", view === "mitglieder" && "active")}>
          <SectionTitle title="Fraktionsmitglieder" subtitle="12 Ratsmitglieder laut Fraktionsseite" />
          <div className="profile-grid">{members.map(member => <MemberCard key={member.id} member={member} />)}</div>
        </section>

        <section className={classNames("section", view === "dokumente" && "active")}><div className="glass card"><SectionTitle title="Dokumente" subtitle="Vorlagen, Anträge, Arbeitsstände" /><DocumentList documents={documents} /></div></section>

        <section className={classNames("section", view === "sync" && "active")}>
          <div className="grid cols-2">
            <div className="glass card"><SectionTitle title="Apple-Kalender anbinden" subtitle="Start über geteilten ICS-Link" /><p className="muted">Kein normales Apple-ID-Passwort speichern. CalDAV kann später als zweite Stufe ergänzt werden.</p><form className="form-grid" onSubmit={handleSourceSubmit}>
              <input className="input" name="name" placeholder="Name der Quelle" defaultValue="Patrick Apple Kalender" required />
              <input className="input" name="owner" placeholder="Eigentümer" defaultValue="Patrick Schäfer" />
              <input className="input wide" name="url" placeholder="https://...ics" required />
              <textarea className="textarea wide" name="notes" placeholder="Notiz, z. B. nur Fraktionskalender" />
              <button className="btn red wide">Kalenderquelle speichern</button>
            </form><div className="footer-actions"><a className="btn light" href="/api/calendar/ics">Fraktionskalender abonnieren</a><a className="btn ghost" href="/api/data">API prüfen</a></div></div>
            <div className="glass card"><SectionTitle title="Quellen" subtitle="Synchronisationsstatus" /><SourceList sources={sources} /></div>
          </div>
        </section>
      </section>
    </main>
  );
}

function Brand() {
  return <div className="brand"><img src="/fraktionslogo.svg" alt="SPD-Fraktion Kaiserslautern" /><div><strong>Fraktion KL</strong><span>Internes Cockpit</span></div></div>;
}

function LoginScreen({ profiles, message, onLogin }: { profiles: FraktionProfile[]; message: string | null; onLogin: (profileSlug: string, code: string) => Promise<void> }) {
  const [selected, setSelected] = useState(profiles[0]?.slug ?? "luca-hoffmann");
  const [code, setCode] = useState("");
  const active = profiles.find(profile => profile.slug === selected) ?? profiles[0];
  return <main className="login-shell"><div className="login-card glass"><Brand /><div className="login-hero"><div><div className="eyebrow">Sicherer Profilzugang</div><h1>SPD-Fraktionscockpit</h1><p>Wähle dein Profil und melde dich für Termine, Aufgaben und Dokumente an.</p></div>{active && <Avatar profile={active} large />}</div>{message && <div className="notice">{message}</div>}<div className="profile-picker">{profiles.map(profile => <button key={profile.slug} className={selected === profile.slug ? "selected" : ""} onClick={() => setSelected(profile.slug)}><Avatar profile={profile} /><span>{profile.full_name}</span><small>{profile.role}</small></button>)}</div><form className="login-form" onSubmit={(event) => { event.preventDefault(); onLogin(selected, code); }}><input className="input" type="password" value={code} onChange={event => setCode(event.target.value)} placeholder="Zugangscode, falls aktiviert" /><button className="btn red">Einloggen</button></form><p className="muted small">Prototyp: Ohne gesetzten PORTAL_SHARED_CODE reicht die Profilauswahl. Für produktive Nutzung bitte Supabase Auth/Magic Links aktivieren.</p></div></main>;
}

function Avatar({ profile, large = false }: { profile: FraktionProfile; large?: boolean }) {
  return <div className={classNames("avatar", large && "large", profile.accent ?? "")}>{profile.avatar_initials}</div>;
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return <div className="section-title"><div><h2>{title}</h2><p>{subtitle}</p></div></div>;
}

function ProfileCard({ profile, active }: { profile: FraktionProfile; active?: boolean }) {
  return <div className={classNames("glass", "profile-card", active && "is-active")}><div className="profile-top"><Avatar profile={profile} large /><div><h3>{profile.full_name}</h3><p>{profile.role}</p></div></div><div className="badges"><Badge tone={profile.is_staff ? "gold" : "red"}>{profile.is_staff ? "Sekretariat" : "Ratsmitglied"}</Badge>{profile.board_role && <Badge tone="blue">{profile.board_role}</Badge>}</div>{profile.bio && <p className="muted">{profile.bio}</p>}<div className="permission-row">{(profile.permissions ?? []).map(permission => <span key={permission}>{permission}</span>)}</div></div>;
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
  const initials = member.name.split(" ").map(part => part[0]).join("").slice(0, 2);
  return <div className="glass profile-card"><div className="profile-top"><div className="avatar">{initials}</div><div><h3>{member.name}</h3><p>{member.role ?? "Fraktionsmitglied"}</p></div></div><p className="muted small">{member.committees ?? "Ausschüsse / Zuständigkeiten können ergänzt werden"}</p>{member.email && <p className="small">{member.email}</p>}</div>;
}

function DocumentList({ documents }: { documents: FraktionDocument[] }) {
  if (!documents.length) return <p className="muted">Noch keine Dokumente.</p>;
  return <div className="list">{documents.map(d => <div className="item" key={d.id}><div className="item-head"><h3>{d.title}</h3><Badge>{d.category ?? "Dokument"}</Badge></div>{d.description && <div className="small">{d.description}</div>}{d.url && <a className="btn light" href={d.url} target="_blank">Öffnen</a>}</div>)}</div>;
}

function SourceList({ sources }: { sources: CalendarSource[] }) {
  if (!sources.length) return <p className="muted">Noch keine Kalenderquellen.</p>;
  return <div className="list">{sources.map(s => <div className="item" key={s.id}><div className="item-head"><h3>{s.name}</h3><Badge tone={s.enabled ? "green" : ""}>{s.enabled ? "aktiv" : "inaktiv"}</Badge></div><div className="muted small">{s.owner} · {s.type} · letzter Sync: {s.last_synced_at ? dateTime(s.last_synced_at) : "noch nie"}</div>{s.notes && <div className="small">{s.notes}</div>}</div>)}</div>;
}
