"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import type { CalendarSource, CommitteeMembership, FraktionCase, FraktionCommittee, FraktionDocument, FraktionEvent, FraktionMember, FraktionProfile, FraktionTask, PortalData } from "@/lib/types";

type View = "dashboard" | "termine" | "aufgaben" | "vorgaenge" | "ausschuesse" | "profile" | "mitglieder" | "dokumente" | "sync";
type NavItem = { id: View; icon: string; label: string };
type StructuredTask = FraktionTask & { assignees?: string[] | null; visibility?: string | null; visible_to?: string[] | null; is_work_order?: boolean | null; retention_days?: number | null; completed_at?: string | null; created_by?: string | null };

const nav: NavItem[] = [
  { id: "dashboard", icon: "Ü", label: "Heute" },
  { id: "termine", icon: "T", label: "Termine" },
  { id: "aufgaben", icon: "A", label: "Aufgaben" },
  { id: "vorgaenge", icon: "V", label: "Vorgänge" },
  { id: "ausschuesse", icon: "G", label: "Ausschüsse" },
  { id: "profile", icon: "P", label: "Profile" },
  { id: "mitglieder", icon: "F", label: "Fraktion" },
  { id: "dokumente", icon: "D", label: "Dokumente" },
  { id: "sync", icon: "K", label: "Kalender" }
];

const bottomNav: View[] = ["dashboard", "termine", "aufgaben", "vorgaenge"];
const categories = ["Stadtrat", "Ausschuss", "Ortsbeirat", "Fraktionssitzung", "Partei", "Veranstaltung", "Sonstiges"];
const taskStatus = ["offen", "in_bearbeitung", "rueckfrage", "wartend", "pruefung", "erledigt", "verworfen"];
const boardStatus = ["offen", "in_bearbeitung", "rueckfrage", "wartend", "pruefung", "erledigt"];
const priorities = ["niedrig", "normal", "hoch", "kritisch"];
const prepStatus = ["offen", "unterlagen_fehlen", "vorbereiten", "rueckfrage", "vorbereitet", "erledigt"];
const isDevelopment = process.env.NODE_ENV === "development";

const profileImageBySlug: Record<string, string> = {
  "luca-hoffmann": "/profile-images/luca-hoffmann.jpeg.PNG",
  "patrick-schaefer": "/profile-images/IMG_0078.jpeg",
  "janina-eispert": "/profile-images/IMG_0079.jpeg",
  "harald-brandstaedter": "/profile-images/IMG_0080.jpeg",
  "andreas-rahm": "/profile-images/IMG_0081.jpeg",
  "raymond-germany": "/profile-images/IMG_0082.jpeg",
  "michael-krauss": "/profile-images/IMG_0083.jpeg",
  "anna-raab": "/profile-images/IMG_0084.jpeg",
  "heike-spies": "/profile-images/IMG_0085.jpeg",
  "petra-janson-peermann": "/profile-images/IMG_0086.jpeg",
  "moritz-behncke": "/profile-images/IMG_0087.jpeg",
  "joerg-harz": "/profile-images/IMG_0088.jpeg",
  "marcel-schulz": "/profile-images/IMG_0090.jpeg"
};

const avatarImgStyle = { width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit", display: "block" } as const;
const prepLabel: Record<string, string> = { offen: "offen", unterlagen_fehlen: "Unterlagen fehlen", vorbereiten: "vorbereiten", rueckfrage: "Rückfrage", vorbereitet: "vorbereitet", erledigt: "erledigt" };
const taskLabel: Record<string, string> = { offen: "offen", in_bearbeitung: "in Arbeit", rueckfrage: "Rückfrage", wartend: "wartet", pruefung: "zur Prüfung", erledigt: "erledigt", verworfen: "verworfen" };

function slugifyName(input: string) { return input.toLowerCase().replace(/ß/g, "ss").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function dateTime(value: string | null | undefined) { if (!value) return "ohne Datum"; return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
function dateOnly(value: string | null | undefined) { if (!value) return "ohne Datum"; return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(new Date(value)); }
function classNames(...items: Array<string | false | null | undefined>) { return items.filter(Boolean).join(" "); }
function toggleValue(values: string[], value: string) { return values.includes(value) ? values.filter(item => item !== value) : [...values, value]; }
function clampProgress(value: unknown) { const number = Number(value); if (!Number.isFinite(number)) return 0; return Math.max(0, Math.min(100, Math.round(number))); }
function canSeeWorkOrders(profile: FraktionProfile | null) { return profile?.slug === "patrick-schaefer" || profile?.slug === "luca-hoffmann"; }
function structuredTask(task: FraktionTask) { return task as StructuredTask; }
function isPatrickLucaTask(task: FraktionTask) { const t = structuredTask(task); return Boolean(t.is_work_order) || (task.description ?? "").includes("[Patrick→Luca]") || (task.description ?? "").includes("[Patrick-Luca]"); }
function taskAssignees(task: FraktionTask) { const t = structuredTask(task); if (Array.isArray(t.assignees) && t.assignees.length) return t.assignees; if (task.assignee) return task.assignee.split(",").map(item => item.trim()).filter(Boolean); return []; }
function assigneeText(task: FraktionTask) { const list = taskAssignees(task); return list.length ? list.join(", ") : task.assignee || "nicht zugewiesen"; }
function canSeeTask(task: FraktionTask, profile: FraktionProfile | null) { if (!profile) return true; const t = structuredTask(task); if (isPatrickLucaTask(task)) return canSeeWorkOrders(profile); if (t.visibility === "private") return (t.visible_to ?? []).includes(profile.slug); return true; }
function priorityStars(priority: string | null | undefined) { const count = priority === "kritisch" ? 5 : priority === "hoch" ? 4 : priority === "normal" ? 3 : 2; return "★★★★★".slice(0, count) + "☆☆☆☆☆".slice(0, 5 - count); }
function progressPercent(status: string | null | undefined) { const index = boardStatus.indexOf(status || "offen"); return index < 0 ? 0 : Math.round((index / (boardStatus.length - 1)) * 100); }
function taskProgress(task: FraktionTask) { const t = structuredTask(task); return clampProgress(typeof t.progress === "number" ? t.progress : progressPercent(task.status)); }
function readable(value: string | null | undefined) {
  if (!value) return null;
  const cleaned = value
    .split(/\n+/)
    .map(line => line.trim())
    .filter(line => line && !/^(quelle|stand|seed|automatisch)\b/i.test(line))
    .join("\n")
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
async function patchWorkOrder(task: FraktionTask, payload: Record<string, unknown>) {
  const response = await fetch("/api/work-orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: task.title, assignee: task.assignee || "Luca Hoffmann", ...payload }) });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || "Arbeitsauftrag konnte nicht gespeichert werden");
  return json;
}

export default function Home() {
  const [view, setView] = useState<View>("dashboard");
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [currentProfile, setCurrentProfile] = useState<FraktionProfile | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [eventQuery, setEventQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBodies, setSelectedBodies] = useState<string[]>([]);
  const [selectedPrep, setSelectedPrep] = useState<string[]>([]);

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
  const cases = data?.cases ?? [];
  const committees = data?.committees ?? [];
  const memberships = data?.committee_memberships ?? [];
  const events = data?.events ?? [];
  const visibleTasks = useMemo(() => (data?.tasks ?? []).filter(task => canSeeTask(task, currentProfile)), [data?.tasks, currentProfile]);
  const members = data?.members ?? [];
  const documents = data?.documents ?? [];
  const sources = data?.calendar_sources ?? [];
  const allowWorkOrders = canSeeWorkOrders(currentProfile);

  const generalTasks = useMemo(() => visibleTasks.filter(task => !isPatrickLucaTask(task)), [visibleTasks]);
  const patrickLucaTasks = useMemo(() => allowWorkOrders ? visibleTasks.filter(isPatrickLucaTask) : [], [visibleTasks, allowWorkOrders]);
  const upcoming = useMemo(() => events.filter(e => new Date(e.starts_at).getTime() >= Date.now() - 86400000).slice(0, 10), [events]);
  const prepEvents = useMemo(() => upcoming.filter(e => e.requires_preparation !== false && (e.preparation_status ?? "offen") !== "erledigt"), [upcoming]);
  const openTasks = useMemo(() => generalTasks.filter(t => t.status !== "erledigt" && t.status !== "verworfen"), [generalTasks]);
  const myTasks = useMemo(() => openTasks.filter(t => !currentProfile || taskAssignees(t).length === 0 || taskAssignees(t).includes(currentProfile.full_name) || taskAssignees(t).includes(currentProfile.display_name)), [openTasks, currentProfile]);
  const activeCases = useMemo(() => cases.filter(c => c.status !== "erledigt" && c.status !== "archiv"), [cases]);
  const eventCategories = useMemo(() => Array.from(new Set(events.map(e => e.category || "Termin"))).sort(), [events]);
  const eventBodies = useMemo(() => Array.from(new Set(events.map(e => e.meeting_body || e.title).filter(Boolean))).sort(), [events]);
  const filteredEvents = useMemo(() => {
    const q = eventQuery.trim().toLowerCase();
    return events.filter(event => {
      const status = event.preparation_status || "offen";
      const category = event.category || "Termin";
      const body = event.meeting_body || event.title;
      const haystack = `${event.title} ${event.meeting_body || ""} ${event.location || ""}`.toLowerCase();
      return (selectedCategories.length === 0 || selectedCategories.includes(category)) && (selectedBodies.length === 0 || selectedBodies.includes(body)) && (selectedPrep.length === 0 || selectedPrep.includes(status)) && (!q || haystack.includes(q));
    });
  }, [events, eventQuery, selectedBodies, selectedCategories, selectedPrep]);

  function resetEventFilters() { setEventQuery(""); setSelectedCategories([]); setSelectedBodies([]); setSelectedPrep([]); }
  function activateView(nextView: View) { setView(nextView); setMoreOpen(false); }
  async function handleLogin(profileSlug: string, code: string) {
    const response = await fetch("/api/auth/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profileSlug, code }) });
    const json = await response.json();
    if (!response.ok) { setMessage(json.error || "Login fehlgeschlagen."); return; }
    setCurrentProfile(json.profile);
    window.localStorage.setItem("fraktion-profile-slug", json.profile.slug);
    setMessage("Profil aktiv.");
  }
  function logout() { window.localStorage.removeItem("fraktion-profile-slug"); setCurrentProfile(null); setMoreOpen(false); }

  async function handleEventSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const starts = String(form.get("date")) + "T" + String(form.get("time") || "15:00") + ":00+02:00";
    await postRecord("events", { title: form.get("title"), starts_at: starts, ends_at: null, all_day: false, location: form.get("location"), description: form.get("description"), category: form.get("category"), meeting_body: form.get("meeting_body"), preparation_status: form.get("preparation_status") || "offen", requires_preparation: true, source: "manual", owner: currentProfile?.full_name ?? "Fraktion", relevance: form.get("relevance") || "offen", status: "scheduled" });
    event.currentTarget.reset();
    setMessage("Termin gespeichert.");
    await load();
  }
  async function handleTaskSubmit(payload: Record<string, unknown>) {
    await postRecord("tasks", payload);
    setMessage("Aufgabe erstellt.");
    await load();
  }
  async function handlePatrickLucaSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await postRecord("tasks", { title: form.get("title"), description: form.get("description") || "", assignee: "Luca Hoffmann", assignees: ["Luca Hoffmann"], due_date: form.get("due_date") || null, status: "offen", priority: form.get("priority") || "normal", progress: 0, event_id: null, case_id: form.get("case_id") || null, is_work_order: true, visibility: "private", visible_to: ["patrick-schaefer", "luca-hoffmann"], created_by: currentProfile?.slug ?? null });
    event.currentTarget.reset();
    setMessage("Arbeitsauftrag an Luca erstellt.");
    await load();
  }
  async function handleCaseSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title"));
    await postRecord("cases", { title, slug: slugifyName(title), description: form.get("description"), owner: form.get("owner") || currentProfile?.full_name, status: "offen", priority: form.get("priority") || "normal", next_step: form.get("next_step"), tags: [] });
    event.currentTarget.reset();
    setMessage("Vorgang angelegt.");
    await load();
  }
  async function handleSourceSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await postRecord("calendar_sources", { name: form.get("name"), type: "apple_ics", url: form.get("url"), owner: form.get("owner") || currentProfile?.full_name || "Patrick", enabled: true, notes: form.get("notes") });
    event.currentTarget.reset();
    setMessage("Kalenderquelle gespeichert.");
    await load();
  }
  async function updateTaskStatus(task: FraktionTask, status: string) {
    if (isPatrickLucaTask(task)) await patchWorkOrder(task, { status, progress: status === "erledigt" ? 100 : taskProgress(task) });
    else await patchRecord("tasks", task.id, { status, completed_at: status === "erledigt" ? new Date().toISOString() : null });
    await load();
  }
  async function updateWorkOrderProgress(task: FraktionTask, progress: number) {
    await patchWorkOrder(task, { progress: clampProgress(progress) });
    await load();
  }
  async function updateEventPrep(event: FraktionEvent, preparation_status: string) { await patchRecord("events", event.id, { preparation_status }); await load(); }

  if (!data || loading) return <main className="login-shell"><div className="login-card"><Brand /><p className="muted">Wird geladen…</p></div></main>;
  if (!currentProfile) return <LoginScreen profiles={profiles} message={message} onLogin={handleLogin} />;

  return <main className="app-shell"><aside className="sidebar"><Brand /><div className="compact-profile"><Avatar profile={currentProfile} /><div><strong>{currentProfile.full_name}</strong><span>{currentProfile.role}</span></div></div><nav className="nav" aria-label="Hauptnavigation">{nav.map(item => <NavButton key={item.id} item={item} view={view} onClick={() => activateView(item.id)} />)}</nav><button className="logout" onClick={logout}>Profil wechseln</button></aside><MobileTop profile={currentProfile} />{moreOpen && <MoreSheet view={view} onSelect={activateView} onClose={() => setMoreOpen(false)} onLogout={logout} />}<section className="main"><div className="hero"><div><div className="eyebrow">Heute</div><h1>{currentProfile.display_name}</h1></div><div className="hero-profile"><Avatar profile={currentProfile} /><span>{currentProfile.role}</span></div></div>{message && <div className="notice">{message}</div>}{isDevelopment && data.error && <div className="notice">{data.error}</div>}<section className={classNames("section", view === "dashboard" && "active")}><div className="stats-row"><Stat label="Vorbereitung" value={prepEvents.length} hint="offen" />{allowWorkOrders ? <Stat label="Aufträge" value={patrickLucaTasks.filter(t => t.status !== "erledigt").length} hint="Patrick ↔ Luca" /> : <Stat label="Vorgänge" value={activeCases.length} hint="aktiv" />}<Stat label="Aufgaben" value={myTasks.length} hint="für dich" /></div><div className="content-grid"><Panel title="Vorbereitung" subtitle="Termine mit offenem Status"><EventList events={prepEvents.slice(0, 5)} onPrep={updateEventPrep} /></Panel>{allowWorkOrders ? <Panel title="Patrick ↔ Luca" subtitle="Aktive Arbeitsaufträge"><PatrickLucaBoard tasks={patrickLucaTasks} onStatus={updateTaskStatus} onProgress={updateWorkOrderProgress} compact /></Panel> : <Panel title="Vorgänge" subtitle="Nächste Schritte"><CaseList cases={activeCases.slice(0, 6)} /></Panel>}</div></section><section className={classNames("section", view === "termine" && "active")}><div className="content-grid"><Panel title="Neuer Termin" subtitle="Gremium, Status und Ort"><EventForm onSubmit={handleEventSubmit} /></Panel><Panel title="Termine" subtitle={`${filteredEvents.length} von ${events.length} Terminen`}><EventFilters query={eventQuery} selectedCategories={selectedCategories} selectedBodies={selectedBodies} selectedPrep={selectedPrep} categories={eventCategories} bodies={eventBodies} onQuery={setEventQuery} onCategories={setSelectedCategories} onBodies={setSelectedBodies} onPrep={setSelectedPrep} onReset={resetEventFilters} /><EventList events={filteredEvents} onPrep={updateEventPrep} /></Panel></div></section><section className={classNames("section", view === "aufgaben" && "active")}>{allowWorkOrders && <Panel title="Patrick ↔ Luca" subtitle="Arbeitsaufträge und Statusboard"><PatrickLucaIntro profile={currentProfile} />{currentProfile.slug === "patrick-schaefer" && <PatrickLucaForm cases={cases} onSubmit={handlePatrickLucaSubmit} />}<PatrickLucaBoard tasks={patrickLucaTasks} onStatus={updateTaskStatus} onProgress={updateWorkOrderProgress} /></Panel>}<div className="content-grid"><Panel title={allowWorkOrders ? "Allgemeine Aufgaben" : "Aufgaben"} subtitle="Offene Arbeitsstände"><TaskForm profile={currentProfile} profiles={profiles} onSubmit={handleTaskSubmit} /><TaskList tasks={generalTasks} onStatus={updateTaskStatus} /></Panel></div></section><section className={classNames("section", view === "vorgaenge" && "active")}><div className="content-grid"><Panel title="Neuer Vorgang" subtitle="Themenakte anlegen"><CaseForm profile={currentProfile} onSubmit={handleCaseSubmit} /></Panel><Panel title="Vorgänge" subtitle="Status und nächster Schritt"><CaseList cases={cases} /></Panel></div></section><section className={classNames("section", view === "ausschuesse" && "active")}><SectionTitle title="Ausschüsse" subtitle="Mitglieder und Vertretungen" /><CommitteeList committees={committees} memberships={memberships} /></section><section className={classNames("section", view === "profile" && "active")}><SectionTitle title="Profile" subtitle="Rollen und Zuständigkeiten" /><div className="profile-grid">{profiles.map(profile => <ProfileCard key={profile.slug} profile={profile} active={profile.slug === currentProfile.slug} memberships={memberships} committees={committees} />)}</div></section><section className={classNames("section", view === "mitglieder" && "active")}><SectionTitle title="Fraktion" subtitle="Mit Ausschusszuordnung" /><div className="profile-grid">{members.map(member => <MemberCard key={member.id} member={member} memberships={memberships} committees={committees} />)}</div></section><section className={classNames("section", view === "dokumente" && "active")}><Panel title="Dokumente" subtitle="Vorlagen, Anträge und Arbeitsstände"><DocumentList documents={documents} cases={cases} /></Panel></section><section className={classNames("section", view === "sync" && "active")}><div className="content-grid"><Panel title="Kalenderquelle" subtitle="Apple oder ICS"><SourceForm profile={currentProfile} onSubmit={handleSourceSubmit} /></Panel><Panel title="Quellen" subtitle="Aktive Kalender"><SourceList sources={sources} /></Panel></div></section></section><BottomNav view={view} onSelect={activateView} onMore={() => setMoreOpen(true)} /></main>;
}

function Brand() { return <div className="brand"><img src="/FraktionslogoNeu.svg" alt="SPD-Fraktion Kaiserslautern" /></div>; }
function NavButton({ item, view, onClick }: { item: NavItem; view: View; onClick: () => void }) { return <button className={view === item.id ? "active" : ""} onClick={onClick}><span>{item.icon}</span>{item.label}</button>; }
function MobileTop({ profile }: { profile: FraktionProfile }) { return <header className="mobile-top"><Brand /><div className="mobile-profile"><Avatar profile={profile} /><span>{profile.display_name}</span></div></header>; }
function BottomNav({ view, onSelect, onMore }: { view: View; onSelect: (view: View) => void; onMore: () => void }) { return <nav className="tabbar" aria-label="Mobile Navigation">{bottomNav.map(id => { const item = nav.find(n => n.id === id)!; return <button key={id} className={view === id ? "active" : ""} onClick={() => onSelect(id)}><span>{item.icon}</span>{item.label}</button>; })}<button onClick={onMore}><span>•••</span>Mehr</button></nav>; }
function MoreSheet({ view, onSelect, onClose, onLogout }: { view: View; onSelect: (view: View) => void; onClose: () => void; onLogout: () => void }) { return <div className="sheet-wrap"><button className="sheet-scrim" onClick={onClose} aria-label="Schließen" /><div className="sheet"><strong>Mehr</strong>{nav.filter(n => !bottomNav.includes(n.id)).map(item => <NavButton key={item.id} item={item} view={view} onClick={() => onSelect(item.id)} />)}<button className="logout sheet-logout" onClick={onLogout}>Profil wechseln</button></div></div>; }
function LoginScreen({ profiles, message, onLogin }: { profiles: FraktionProfile[]; message: string | null; onLogin: (profileSlug: string, code: string) => Promise<void> }) { const [selected, setSelected] = useState(profiles[0]?.slug ?? "luca-hoffmann"); const [code, setCode] = useState(""); return <main className="login-shell"><div className="login-card"><Brand /><SectionTitle title="Anmelden" subtitle="Profil auswählen" />{message && <div className="notice">{message}</div>}<div className="profile-picker">{profiles.map(profile => <button key={profile.slug} className={selected === profile.slug ? "selected" : ""} onClick={() => setSelected(profile.slug)}><Avatar profile={profile} /><span>{profile.full_name}</span><small>{profile.role}</small></button>)}</div><form className="login-form" onSubmit={(event) => { event.preventDefault(); onLogin(selected, code); }}><input className="input" type="password" value={code} onChange={event => setCode(event.target.value)} placeholder="Zugangscode" /><button className="btn red">Einloggen</button></form></div></main>; }
function Avatar({ profile, large = false }: { profile: FraktionProfile; large?: boolean }) { const image = profileImageBySlug[profile.slug]; return <div className={classNames("avatar", large && "large", profile.accent ?? "")}>{image ? <img src={image} alt={profile.full_name} style={avatarImgStyle} /> : profile.avatar_initials}</div>; }
function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) { return <div className="section-title"><div><h2>{title}</h2><p>{subtitle}</p></div></div>; }
function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) { return <div className="panel"><SectionTitle title={title} subtitle={subtitle} />{children}</div>; }
function Stat({ label, value, hint }: { label: string; value: string | number; hint: string }) { return <div className="stat"><div className="muted small">{label}</div><div className="metric">{value}</div><div className="small muted">{hint}</div></div>; }
function Badge({ children, tone = "" }: { children: ReactNode; tone?: "" | "red" | "green" | "blue" | "gold" }) { return <span className={`badge ${tone}`}>{children}</span>; }
function FilterGroup({ title, values, selected, onChange, labelFor }: { title: string; values: string[]; selected: string[]; onChange: (values: string[]) => void; labelFor?: (value: string) => string }) { return <details className="filter-group"><summary>{title}{selected.length > 0 ? ` · ${selected.length}` : ""}</summary><div className="filter-chips">{values.map(value => <button type="button" key={value} className={classNames("filter-chip", selected.includes(value) && "active")} onClick={() => onChange(toggleValue(selected, value))}>{labelFor ? labelFor(value) : value}</button>)}</div></details>; }
function EventFilters({ query, selectedCategories, selectedBodies, selectedPrep, categories: eventCategories, bodies, onQuery, onCategories, onBodies, onPrep, onReset }: { query: string; selectedCategories: string[]; selectedBodies: string[]; selectedPrep: string[]; categories: string[]; bodies: string[]; onQuery: (value: string) => void; onCategories: (values: string[]) => void; onBodies: (values: string[]) => void; onPrep: (values: string[]) => void; onReset: () => void }) { return <div className="event-filters"><div className="event-filter-search"><input className="input" value={query} onChange={event => onQuery(event.target.value)} placeholder="Suchen" /><button type="button" className="clear-filters" onClick={onReset}>Zurücksetzen</button></div><div className="filter-groups"><FilterGroup title="Kategorien" values={eventCategories} selected={selectedCategories} onChange={onCategories} /><FilterGroup title="Ausschüsse / Gremien" values={bodies} selected={selectedBodies} onChange={onBodies} /><FilterGroup title="Status" values={prepStatus} selected={selectedPrep} onChange={onPrep} labelFor={value => prepLabel[value] ?? value} /></div></div>; }
function PatrickLucaIntro({ profile }: { profile: FraktionProfile }) { return <div className="work-intro"><strong>{profile.slug === "patrick-schaefer" ? "Aufträge an Luca" : "Aufträge von Patrick"}</strong><p className="muted small">Patrick kann hier Arbeitsaufträge setzen. Luca aktualisiert den Stand direkt im Board.</p></div>; }
function PatrickLucaForm({ cases, onSubmit }: { cases: FraktionCase[]; onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void> }) { return <form className="form-grid work-order-form" onSubmit={onSubmit}><input className="input wide" name="title" placeholder="Arbeitsauftrag an Luca" required /><select className="select" name="priority">{priorities.map(p => <option key={p}>{p}</option>)}</select><input className="input" name="due_date" type="date" /><select className="select wide" name="case_id"><option value="">kein Vorgang</option>{cases.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select><textarea className="textarea wide" name="description" placeholder="Beschreibung / Erwartung / Materialhinweis" /><button className="btn red wide">Auftrag an Luca geben</button></form>; }
function PatrickLucaBoard({ tasks, onStatus, onProgress, compact = false }: { tasks: FraktionTask[]; onStatus: (task: FraktionTask, status: string) => Promise<void>; onProgress: (task: FraktionTask, progress: number) => Promise<void>; compact?: boolean }) { const visibleTasks = compact ? tasks.filter(t => t.status !== "erledigt").slice(0, 4) : tasks; if (!visibleTasks.length) return <p className="muted">Noch keine Patrick-Luca-Aufträge.</p>; return <div className={classNames("monday-board", compact && "compact")}><div className="monday-group-title"><span>{compact ? "Aktive Aufträge" : "Gemeinsame Aufträge"}</span><span>{visibleTasks.length}</span></div><div className="monday-header"><span>Auftrag</span><span>Person</span><span>Status</span><span>Fortschritt</span><span>Fälligkeit</span><span>Priorität</span></div>{visibleTasks.map(task => <WorkOrderRow key={task.id} task={task} onStatus={onStatus} onProgress={onProgress} />)}</div>; }
function WorkOrderRow({ task, onStatus, onProgress }: { task: FraktionTask; onStatus: (task: FraktionTask, status: string) => Promise<void>; onProgress: (task: FraktionTask, progress: number) => Promise<void> }) { const current = task.status || "offen"; return <div className="monday-row"><div className="monday-task"><strong>{task.title}</strong>{readable(task.description) && <small>{readable(task.description)}</small>}</div><div className="monday-person"><span className="person-dot">LH</span><span>Luca</span></div><details className="status-dropdown"><summary className={`status-cell status-${current}`}>{taskLabel[current] ?? current}</summary><div className="status-menu">{boardStatus.map(status => <button key={status} onClick={() => onStatus(task, status)}>{taskLabel[status]}</button>)}</div></details><div className="progress-cell controlled-progress-cell"><WorkOrderProgress value={taskProgress(task)} onCommit={value => onProgress(task, value)} /></div><div className="due-cell">{dateOnly(task.due_date)}</div><div className="priority-stars" title={task.priority}>{priorityStars(task.priority)}</div></div>; }
function WorkOrderProgress({ value, onCommit }: { value: number; onCommit: (value: number) => Promise<void> }) { const [progress, setProgress] = useState(clampProgress(value)); const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle"); useEffect(() => setProgress(clampProgress(value)), [value]); async function commit(next: number) { const clamped = clampProgress(next); setProgress(clamped); setState("saving"); try { await onCommit(clamped); setState("saved"); } catch { setState("error"); } } const color = progress < 34 ? "#ef4444" : progress < 67 ? "#f59e0b" : "#22c55e"; return <div className="progress-box" data-save-state={state}><div className="progress-header"><span>Fortschritt</span><strong>{progress}%</strong></div><div className="progress-slider-wrap"><div className="progress-track" aria-hidden="true"><div className="progress-fill" style={{ width: `${progress}%`, backgroundColor: color }} /></div><input className="progress-range" type="range" min="0" max="100" step="1" value={progress} onChange={event => setProgress(clampProgress(event.target.value))} onPointerUp={event => commit(Number((event.target as HTMLInputElement).value))} onTouchEnd={event => commit(Number((event.target as HTMLInputElement).value))} onMouseUp={event => commit(Number((event.target as HTMLInputElement).value))} aria-label="Fortschritt" /></div><div className="progress-save-state">{state === "saving" ? "speichert…" : state === "saved" ? "gespeichert" : state === "error" ? "nicht gespeichert" : ""}</div></div>; }
function EventForm({ onSubmit }: { onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void> }) { return <form className="form-grid" onSubmit={onSubmit}><input className="input wide" name="title" placeholder="Titel" required /><input className="input" name="date" type="date" required /><input className="input" name="time" type="time" defaultValue="15:00" /><select className="select" name="category">{categories.map(c => <option key={c}>{c}</option>)}</select><select className="select" name="relevance"><option value="offen">Relevanz offen</option><option value="beide">für beide</option><option value="patrick">Patrick</option><option value="luca">Luca</option><option value="nicht_relevant">nicht relevant</option></select><input className="input wide" name="meeting_body" placeholder="Gremium" /><select className="select wide" name="preparation_status">{prepStatus.map(s => <option key={s} value={s}>{prepLabel[s]}</option>)}</select><input className="input wide" name="location" placeholder="Ort" /><textarea className="textarea wide" name="description" placeholder="Notiz" /><button className="btn red wide">Speichern</button></form>; }
function TaskForm({ profile, profiles, onSubmit }: { profile: FraktionProfile; profiles: FraktionProfile[]; onSubmit: (payload: Record<string, unknown>) => Promise<void> }) { const [selected, setSelected] = useState<string[]>([profile.slug]); function toggle(slug: string) { setSelected(current => current.includes(slug) ? current.filter(item => item !== slug) : [...current, slug]); } function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); const selectedProfiles = profiles.filter(item => selected.includes(item.slug)); const names = selectedProfiles.map(item => item.full_name); const visibility = String(form.get("visibility") || "all"); onSubmit({ title: form.get("title"), description: form.get("description"), assignee: names.join(", ") || profile.full_name, assignees: names.length ? names : [profile.full_name], due_date: form.get("due_date") || null, status: "offen", priority: form.get("priority") || "normal", event_id: null, case_id: null, visibility, visible_to: visibility === "private" ? selected : [], created_by: profile.slug }).then(() => event.currentTarget.reset()); } return <form className="form-grid task-form" onSubmit={submit}><input className="input wide" name="title" placeholder="Aufgabe" required /><div className="assignment-panel wide"><div className="assignment-title">Verantwortlich</div><div className="assignment-grid">{profiles.map(item => <button type="button" key={item.slug} className={classNames("assign-person", selected.includes(item.slug) && "selected")} onClick={() => toggle(item.slug)}><Avatar profile={item} /><span>{item.display_name}</span></button>)}</div><button type="button" className="assign-all" onClick={() => setSelected(profiles.map(item => item.slug))}>Alle auswählen</button></div><input className="input" name="due_date" type="date" /><select className="select" name="priority">{priorities.map(p => <option key={p}>{p}</option>)}</select><div className="visibility-panel wide"><label><input type="radio" name="visibility" value="all" defaultChecked /> alle Profile</label><label><input type="radio" name="visibility" value="private" /> nur ausgewählte Profile</label></div><textarea className="textarea wide" name="description" placeholder="Beschreibung" /><button className="btn light wide">Allgemeine Aufgabe speichern</button></form>; }
function CaseForm({ profile, onSubmit }: { profile: FraktionProfile; onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void> }) { return <form className="form-grid" onSubmit={onSubmit}><input className="input wide" name="title" placeholder="Titel" required /><input className="input" name="owner" placeholder="Zuständig" defaultValue={profile.full_name} /><select className="select" name="priority">{priorities.map(p => <option key={p}>{p}</option>)}</select><input className="input wide" name="next_step" placeholder="Nächster Schritt" /><textarea className="textarea wide" name="description" placeholder="Kurzbeschreibung" /><button className="btn red wide">Speichern</button></form>; }
function SourceForm({ profile, onSubmit }: { profile: FraktionProfile; onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void> }) { return <form className="form-grid" onSubmit={onSubmit}><input className="input" name="name" placeholder="Name" defaultValue="Kalender" required /><input className="input" name="owner" placeholder="Eigentümer" defaultValue={profile.full_name} /><input className="input wide" name="url" placeholder="https://...ics" required /><textarea className="textarea wide" name="notes" placeholder="Notiz" /><button className="btn red wide">Speichern</button><a className="btn light wide" href="/api/calendar/ics">Fraktionskalender abonnieren</a></form>; }
function CaseList({ cases }: { cases: FraktionCase[] }) { if (!cases.length) return <p className="muted">Noch keine Vorgänge.</p>; return <div className="list">{cases.map(c => <div className="item" key={c.id}><div className="item-head"><h3>{c.title}</h3><div className="badges"><Badge tone={c.priority === "hoch" || c.priority === "kritisch" ? "red" : "blue"}>{c.priority}</Badge><Badge>{c.status}</Badge></div></div>{readable(c.description) && <div className="small">{readable(c.description)}</div>}<div className="muted small">{c.owner || "offen"} · {c.next_step || "kein nächster Schritt"}</div></div>)}</div>; }
function CommitteeList({ committees, memberships }: { committees: FraktionCommittee[]; memberships: CommitteeMembership[] }) { if (!committees.length) return <p className="muted">Noch keine Ausschüsse.</p>; return <div className="profile-grid">{committees.map(c => { const rows = memberships.filter(m => m.committee_slug === c.slug); return <div className="profile-card" key={c.slug}><div className="item-head"><h3>{c.title}</h3><Badge tone="red">{c.short_ref}</Badge></div><strong>Ordentlich</strong>{rows.filter(r => r.role === "member").map(r => <div className="small" key={r.id}>• {r.person_name}</div>)}<strong>Stellvertretend</strong>{rows.filter(r => r.role === "substitute").map(r => <div className="small" key={r.id}>• {r.person_name}</div>)}</div>; })}</div>; }
function committeeLabels(name: string, memberships: CommitteeMembership[], committees: FraktionCommittee[]) { return memberships.filter(m => m.person_name === name).map(m => `${committees.find(c => c.slug === m.committee_slug)?.short_ref ?? m.committee_slug} ${m.role === "substitute" ? "stv." : "ord."}`); }
function ProfileCard({ profile, active, memberships, committees }: { profile: FraktionProfile; active?: boolean; memberships: CommitteeMembership[]; committees: FraktionCommittee[] }) { const labels = committeeLabels(profile.full_name, memberships, committees); return <div className={classNames("profile-card", active && "is-active")}><div className="profile-top"><Avatar profile={profile} large /><div><h3>{profile.full_name}</h3><p>{profile.role}</p></div></div><div className="badges"><Badge tone={profile.is_staff ? "gold" : "red"}>{profile.is_staff ? "Sekretariat" : "Ratsmitglied"}</Badge>{profile.board_role && <Badge tone="blue">{profile.board_role}</Badge>}</div><div className="permission-row">{labels.length ? labels.map(label => <span key={label}>{label}</span>) : (profile.permissions ?? []).slice(0, 4).map(permission => <span key={permission}>{permission}</span>)}</div></div>; }
function EventList({ events, onPrep }: { events: FraktionEvent[]; onPrep?: (event: FraktionEvent, status: string) => Promise<void> }) { if (!events.length) return <p className="muted">Keine passenden Termine.</p>; return <div className="list">{events.map(e => { const current = e.preparation_status || "offen"; return <div className="item" key={e.id}><div className="item-head"><h3>{e.title}</h3><div className="badges"><Badge tone="red">{e.category ?? "Termin"}</Badge><Badge tone={current === "erledigt" || current === "vorbereitet" ? "green" : "blue"}>{prepLabel[current] ?? current}</Badge></div></div><div className="muted small">{dateTime(e.starts_at)}{e.location ? ` · ${e.location}` : ""}</div><div className="small">{e.meeting_body || e.title}</div>{readable(e.description) && <div className="small">{readable(e.description)}</div>}{onPrep && <details className="event-actions"><summary>Status ändern</summary><div className="toolbar">{prepStatus.map(s => <button className={current === s ? "btn red" : "btn light"} key={s} onClick={() => onPrep(e, s)}>{prepLabel[s]}</button>)}</div></details>}</div>; })}</div>; }
function TaskList({ tasks, onStatus }: { tasks: FraktionTask[]; onStatus: (task: FraktionTask, status: string) => Promise<void> }) { if (!tasks.length) return <p className="muted">Keine Aufgaben vorhanden.</p>; return <div className="list">{tasks.map(t => <div className="item" key={t.id}><div className="item-head"><h3>{t.title}</h3><Badge tone={t.priority === "hoch" || t.priority === "kritisch" ? "red" : ""}>{t.priority}</Badge></div><div className="muted small">{assigneeText(t)} · {dateOnly(t.due_date)}</div>{readable(t.description) && <div className="small">{readable(t.description)}</div>}<div className="toolbar">{taskStatus.map(s => <button className={t.status === s ? "btn red" : "btn light"} key={s} onClick={() => onStatus(t, s)}>{taskLabel[s] ?? s}</button>)}</div></div>)}</div>; }
function MemberCard({ member, memberships, committees }: { member: FraktionMember; memberships: CommitteeMembership[]; committees: FraktionCommittee[] }) { const initials = member.name.split(" ").map(part => part[0]).join("").slice(0, 2); const labels = committeeLabels(member.name, memberships, committees); const image = profileImageBySlug[slugifyName(member.name)]; return <div className="profile-card"><div className="profile-top"><div className="avatar">{image ? <img src={image} alt={member.name} style={avatarImgStyle} /> : initials}</div><div><h3>{member.name}</h3><p>{member.role ?? "Fraktionsmitglied"}</p></div></div><p className="muted small">{labels.length ? labels.join(" · ") : member.committees ?? "Ausschüsse ergänzen"}</p></div>; }
function DocumentList({ documents, cases }: { documents: FraktionDocument[]; cases: FraktionCase[] }) { if (!documents.length) return <p className="muted">Noch keine Dokumente.</p>; return <div className="list">{documents.map(d => <div className="item" key={d.id}><div className="item-head"><h3>{d.title}</h3><Badge>{d.kind ?? d.category ?? "Dokument"}</Badge></div>{readable(d.description) && <div className="small">{readable(d.description)}</div>}<div className="muted small">{d.status ?? "offen"} · {cases.find(c => c.id === d.case_id)?.title ?? "ohne Vorgang"}</div>{d.url && <a className="btn light" href={d.url} target="_blank">Öffnen</a>}</div>)}</div>; }
function SourceList({ sources }: { sources: CalendarSource[] }) { if (!sources.length) return <p className="muted">Noch keine Kalenderquellen.</p>; return <div className="list">{sources.map(s => <div className="item" key={s.id}><div className="item-head"><h3>{s.name}</h3><Badge tone={s.enabled ? "green" : ""}>{s.enabled ? "aktiv" : "inaktiv"}</Badge></div><div className="muted small">{s.owner} · {s.type} · {s.last_synced_at ? dateTime(s.last_synced_at) : "noch nicht synchronisiert"}</div></div>)}</div>; }
