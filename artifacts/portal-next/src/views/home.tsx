"use client";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactElement, ReactNode } from "react";
import type { CalendarSource, CommitteeMembership, FraktionCase, FraktionCommittee, FraktionDocument, FraktionEvent, FraktionMember, FraktionProfile, FraktionTask, PortalData } from "@/lib/types";

type View = "dashboard" | "termine" | "aufgaben" | "vorgaenge" | "ausschuesse" | "profile" | "dokumente" | "sync";
type NavItem = { id: View; icon: string; label: string };
type UnifiedPerson = { name: string; profile: FraktionProfile | null; member: FraktionMember | null; personType: "Sekretariat" | "Ratsmitglied" | "Fraktionsmitglied" };
type StructuredTask = FraktionTask & { assignees?: string[] | null; visibility?: string | null; visible_to?: string[] | null; is_work_order?: boolean | null; retention_days?: number | null; completed_at?: string | null; created_by?: string | null };

const nav: NavItem[] = [
  { id: "dashboard", icon: "Ü", label: "Home" },
  { id: "termine", icon: "T", label: "Termine" },
  { id: "aufgaben", icon: "A", label: "Aufgaben" },
  { id: "vorgaenge", icon: "V", label: "Vorgänge" },
  { id: "ausschuesse", icon: "G", label: "Ausschüsse" },
  { id: "profile", icon: "P", label: "Personen" },
  { id: "dokumente", icon: "D", label: "Dokumente" },
  { id: "sync", icon: "K", label: "Kalender" }
];

const bottomNav: View[] = ["dashboard", "termine", "aufgaben", "vorgaenge"];
const categories = ["Stadtrat", "Ausschuss", "Ortsbeirat", "Fraktionssitzung", "Partei", "Veranstaltung", "Sonstiges"];
const taskStatus = ["offen", "in_bearbeitung", "rueckfrage", "wartend", "pruefung", "erledigt", "verworfen"];
const boardStatus = ["offen", "in_bearbeitung", "rueckfrage", "wartend", "pruefung", "erledigt"];
const priorities = ["niedrig", "normal", "hoch", "kritisch"];
const isDevelopment = process.env.NODE_ENV !== "production";

const profileImageBySlug: Record<string, string> = {
  "luca-hoffmann": "/profile-images/luca-hoffmann.jpeg",
  "patrick-schaefer": "/profile-images/patrick-schaefer.jpeg",
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
const taskLabel: Record<string, string> = { offen: "offen", in_bearbeitung: "in Arbeit", rueckfrage: "Rückfrage", wartend: "wartet", pruefung: "zur Prüfung", erledigt: "erledigt", verworfen: "verworfen" };

function slugifyName(input: string) { return input.toLowerCase().replace(/ß/g, "ss").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function dateTime(value: string | null | undefined) { if (!value) return "ohne Datum"; return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
function dateOnly(value: string | null | undefined) { if (!value) return "ohne Datum"; return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(new Date(value)); }
function classNames(...items: Array<string | false | null | undefined>) { return items.filter(Boolean).join(" "); }
function toggleValue(values: string[], value: string) { return values.includes(value) ? values.filter(item => item !== value) : [...values, value]; }
function clampProgress(value: unknown) { const number = Number(value); if (!Number.isFinite(number)) return 0; return Math.max(0, Math.min(100, Math.round(number))); }
function canSeeWorkOrders(profile: FraktionProfile | null) { return profile?.slug === "patrick-schaefer" || profile?.slug === "luca-hoffmann"; }
function canUploadDocuments(profile: FraktionProfile | null) { return canSeeWorkOrders(profile) && (profile?.permissions ?? []).includes("dokumente"); }
function structuredTask(task: FraktionTask) { return task as StructuredTask; }
function isPatrickLucaTask(task: FraktionTask) { const t = structuredTask(task); return Boolean(t.is_work_order) || (task.description ?? "").includes("[Patrick→Luca]") || (task.description ?? "").includes("[Luca→Patrick]") || (task.description ?? "").includes("[Patrick-Luca]"); }
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
async function deleteRecord(table: string, id: string) {
  const response = await fetch("/api/records", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ table, id }) });
  if (!response.ok) { const json = await response.json().catch(() => ({})); throw new Error(json.error || "Löschen fehlgeschlagen"); }
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
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<FraktionEvent | null>(null);
  const [retentionTask, setRetentionTask] = useState<FraktionTask | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadToken, setUploadToken] = useState<string | null>(() => window.localStorage.getItem("fraktion-upload-token"));
  const [eventQuery, setEventQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBodies, setSelectedBodies] = useState<string[]>([]);
  const [personQuery, setPersonQuery] = useState("");
  const [personTypes, setPersonTypes] = useState<string[]>([]);
  const [personCommittee, setPersonCommittee] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const response = await fetch("/api/data", { cache: "no-store" });
    const json = await response.json();
    setData(json);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);
  useEffect(() => { if (!message) return; const t = setTimeout(() => setMessage(null), 3800); return () => clearTimeout(t); }, [message]);
  useEffect(() => {
    function onSub(e: Event) {
      const f = e.target as HTMLElement;
      if (!f || f.tagName !== "FORM") return;
      f.querySelectorAll<HTMLButtonElement>("button:not([type=\"button\"])").forEach(b => { b.disabled = true; b.setAttribute("data-busy", "1"); });
      window.setTimeout(() => { document.querySelectorAll<HTMLButtonElement>("button[data-busy]").forEach(b => { b.disabled = false; b.removeAttribute("data-busy"); }); }, 6000);
    }
    document.addEventListener("submit", onSub, true);
    return () => document.removeEventListener("submit", onSub, true);
  }, []);
  useEffect(() => { if (!loading) document.querySelectorAll<HTMLButtonElement>("button[data-busy]").forEach(b => { b.disabled = false; b.removeAttribute("data-busy"); }); }, [loading]);
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
  const openTasks = useMemo(() => generalTasks.filter(t => t.status !== "erledigt" && t.status !== "verworfen"), [generalTasks]);
  const myTasks = useMemo(() => openTasks.filter(t => !currentProfile || taskAssignees(t).length === 0 || taskAssignees(t).includes(currentProfile.full_name) || taskAssignees(t).includes(currentProfile.display_name)), [openTasks, currentProfile]);
  const activeCases = useMemo(() => cases.filter(c => c.status !== "erledigt" && c.status !== "archiv"), [cases]);
  const eventCategories = useMemo(() => Array.from(new Set(events.map(e => e.category || "Termin"))).sort(), [events]);
  const eventBodies = useMemo(() => Array.from(new Set(events.map(e => e.meeting_body || e.title).filter(Boolean))).sort(), [events]);
  const allPersons = useMemo<UnifiedPerson[]>(() => {
    const profileByName = new Map(profiles.map(p => [p.full_name, p]));
    const memberByName = new Map(members.map(m => [m.name, m]));
    const names = Array.from(new Set([...profiles.map(p => p.full_name), ...members.map(m => m.name)]));
    return names.map(name => {
      const p = profileByName.get(name) ?? null;
      const personType: UnifiedPerson["personType"] = p?.is_staff ? "Sekretariat" : p ? "Ratsmitglied" : "Fraktionsmitglied";
      return { name, profile: p, member: memberByName.get(name) ?? null, personType };
    });
  }, [profiles, members]);
  const filteredPersons = useMemo(() => {
    const q = personQuery.trim().toLowerCase();
    return allPersons.filter(person => {
      if (q && !person.name.toLowerCase().includes(q) && !(person.profile?.role ?? person.member?.role ?? "").toLowerCase().includes(q)) return false;
      if (personTypes.length > 0 && !personTypes.includes(person.personType)) return false;
      if (personCommittee && !memberships.some(m => m.person_name === person.name && m.committee_slug === personCommittee)) return false;
      return true;
    });
  }, [allPersons, personQuery, personTypes, personCommittee, memberships]);
  const filteredEvents = useMemo(() => {
    const q = eventQuery.trim().toLowerCase();
    return events.filter(event => {
      const category = event.category || "Termin";
      const body = event.meeting_body || event.title;
      const haystack = `${event.title} ${event.meeting_body || ""} ${event.location || ""}`.toLowerCase();
      return (selectedCategories.length === 0 || selectedCategories.includes(category)) && (selectedBodies.length === 0 || selectedBodies.includes(body)) && (!q || haystack.includes(q));
    });
  }, [events, eventQuery, selectedBodies, selectedCategories]);

  function resetEventFilters() { setEventQuery(""); setSelectedCategories([]); setSelectedBodies([]); }
  function resetPersonFilters() { setPersonQuery(""); setPersonTypes([]); setPersonCommittee(null); }
  function activateView(nextView: View) { setView(nextView); setMoreOpen(false); }
  async function handleLogin(profileSlug: string, code: string) {
    const response = await fetch("/api/auth/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profileSlug, code }) });
    const json = await response.json();
    if (!response.ok) { setMessage(json.error || "Login fehlgeschlagen."); return; }
    setCurrentProfile(json.profile);
    window.localStorage.setItem("fraktion-profile-slug", json.profile.slug);
    if (json.uploadToken) { setUploadToken(json.uploadToken); window.localStorage.setItem("fraktion-upload-token", json.uploadToken); }
    setMessage("Profil aktiv.");
  }
  function logout() { window.localStorage.removeItem("fraktion-profile-slug"); window.localStorage.removeItem("fraktion-upload-token"); setCurrentProfile(null); setUploadToken(null); setMoreOpen(false); setLogoutOpen(false); }
  async function handleEventUpdate(e: FormEvent<HTMLFormElement>) { e.preventDefault(); if (!editEvent) return; const form = new FormData(e.currentTarget); const starts = String(form.get("date")) + "T" + String(form.get("time") || "15:00") + ":00+02:00"; await patchRecord("events", editEvent.id, { title: form.get("title"), starts_at: starts, location: form.get("location"), description: form.get("description"), category: form.get("category"), meeting_body: form.get("meeting_body"), relevance: form.get("relevance") }); setEditEvent(null); setMessage("Termin aktualisiert."); await load(); }
  async function handleEventDelete(id: string) { if (!window.confirm("Termin wirklich löschen?")) return; await deleteRecord("events", id); setMessage("Termin gelöscht."); await load(); }

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
    const direction = currentProfile?.slug === "patrick-schaefer" ? "Patrick→Luca" : "Luca→Patrick";
    const assignee = currentProfile?.slug === "patrick-schaefer" ? "Luca Hoffmann" : "Patrick Schäfer";
    const desc = `[${direction}] ${String(form.get("description") || "")}`.trim();
    await postRecord("tasks", { title: form.get("title"), description: desc, assignee, assignees: [assignee], due_date: form.get("due_date") || null, status: "offen", priority: form.get("priority") || "normal", progress: 0, event_id: null, case_id: form.get("case_id") || null, is_work_order: true, visibility: "private", visible_to: ["patrick-schaefer", "luca-hoffmann"], created_by: currentProfile?.slug ?? null });
    event.currentTarget.reset();
    setMessage(`Arbeitsauftrag (${direction}) erstellt.`);
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
    if (isPatrickLucaTask(task)) {
      try { await patchRecord("tasks", task.id, { status, progress: status === "erledigt" ? 100 : taskProgress(task), completed_at: status === "erledigt" ? new Date().toISOString() : null }); setMessage("Status aktualisiert."); }
      catch (err) { setMessage(err instanceof Error ? err.message : "Status konnte nicht geändert werden."); }
      await load();
    }
    else if (status === "erledigt") { setRetentionTask(task); }
    else {
      try { await patchRecord("tasks", task.id, { status, completed_at: null }); setMessage("Status aktualisiert."); }
      catch (err) { setMessage(err instanceof Error ? err.message : "Status konnte nicht geändert werden."); }
      await load();
    }
  }
  async function updateWorkOrderProgress(task: FraktionTask, progress: number) {
    try { await patchRecord("tasks", task.id, { progress: clampProgress(progress) }); } catch (err) { setMessage(err instanceof Error ? err.message : "Fortschritt konnte nicht gespeichert werden."); }
    await load();
  }
  async function deleteWorkOrder(task: FraktionTask) {
    if (!canSeeWorkOrders(currentProfile)) return;
    if (typeof window !== "undefined" && !window.confirm(`Auftrag „${task.title}“ wirklich löschen?`)) return;
    try { await deleteRecord("tasks", task.id); setMessage("Auftrag gelöscht."); await load(); }
    catch (err) { setMessage(err instanceof Error ? err.message : "Löschen fehlgeschlagen."); }
  }
  async function handleRetentionChoice(task: FraktionTask, policy: string) { setRetentionTask(null); if (policy === "delete") { await deleteRecord("tasks", task.id); setMessage("Aufgabe gelöscht."); } else if (policy === "archive") { await patchRecord("tasks", task.id, { status: "erledigt", retention_days: null, completed_at: new Date().toISOString() }); setMessage("Aufgabe archiviert."); } else { const days = policy === "30days" ? 30 : policy === "60days" ? 60 : null; await patchRecord("tasks", task.id, { status: "erledigt", retention_days: days, completed_at: new Date().toISOString() }); setMessage(days ? `Aufgabe erledigt – wird in ${days} Tagen gelöscht.` : "Aufgabe als erledigt markiert."); } await load(); }
  async function handleDocumentUpload(file: File, title: string, category: string, date: string | null, caseId: string | null) {
    setUploading(true);
    try {
      const urlRes = await fetch("/api/storage/uploads/request-url", { method: "POST", headers: { "Content-Type": "application/json", "X-Portal-Upload-Token": uploadToken ?? "" }, body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type || "application/octet-stream" }) });
      const urlJson = await urlRes.json();
      if (!urlRes.ok) throw new Error(urlJson.error || "Upload-URL konnte nicht erstellt werden.");
      const { uploadURL, objectPath } = urlJson as { uploadURL: string; objectPath: string };
      const gcsRes = await fetch(uploadURL, { method: "PUT", headers: { "Content-Type": file.type || "application/octet-stream" }, body: file });
      if (!gcsRes.ok) throw new Error("Datei-Upload fehlgeschlagen.");
      await postRecord("documents", { title, category, kind: category, document_date: date || null, case_id: caseId || null, url: `/api/storage${objectPath}`, owner: currentProfile?.full_name ?? "Fraktion", status: "freigegeben", description: null });
      setMessage(`Dokument „${title}" hochgeladen.`);
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload fehlgeschlagen.");
    } finally {
      setUploading(false);
    }
  }

  if (!data || loading) return <main className="login-shell"><div className="login-card"><Brand /><p className="muted">Wird geladen…</p></div></main>;
  if (!currentProfile) return <LoginScreen profiles={profiles} message={message} onLogin={handleLogin} />;

  return <main className="app-shell"><aside className="sidebar"><div style={{cursor:"pointer"}} onClick={() => setLogoutOpen(o => !o)}><Brand /></div><div className="compact-profile" style={{cursor:"pointer"}} onClick={() => setLogoutOpen(o => !o)}><Avatar profile={currentProfile} /><div><strong>{currentProfile.full_name}</strong><span>{currentProfile.role}</span></div></div><nav className="nav" aria-label="Hauptnavigation">{nav.map(item => <NavButton key={item.id} item={item} view={view} onClick={() => activateView(item.id)} />)}</nav></aside>{logoutOpen && <><div className="logout-overlay" onClick={() => setLogoutOpen(false)} /><div className="sidebar-logout-fixed"><button className="logout" onClick={logout}>Abmelden</button></div></>}<MobileTop profile={currentProfile} onLogout={logout} />{moreOpen && <MoreSheet view={view} onSelect={activateView} onClose={() => setMoreOpen(false)} onLogout={logout} />}<section className="main">{view === "dashboard" && <div className="hero"><div><div className="eyebrow">Hallo</div><h1>{currentProfile.display_name}</h1></div></div>}{retentionTask && <RetentionDialog task={retentionTask} onChoose={handleRetentionChoice} onCancel={() => setRetentionTask(null)} />}{message && <div className={classNames("toast", /(fehlgeschlagen|Fehler|konnte nicht|ungültig|nicht möglich)/i.test(message) ? "toast-error" : "toast-success")} role="status">{message}</div>}{loading && data && <div className="sync-bar" aria-hidden="true" />}{isDevelopment && data.error && <div className="notice">{data.error}</div>}<section className={classNames("section", view === "dashboard" && "active")}><div className="stats-row">{allowWorkOrders ? <Stat label="Aufträge" value={patrickLucaTasks.filter(t => t.status !== "erledigt").length} hint="Patrick ↔ Luca" /> : <Stat label="Vorgänge" value={activeCases.length} hint="aktiv" />}<Stat label="Aufgaben" value={myTasks.length} hint="für dich" /></div><div className="content-grid">{allowWorkOrders ? <Panel title="Patrick ↔ Luca" subtitle="Aktive Aufträge"><KanbanBoard tasks={patrickLucaTasks} profile={currentProfile} onStatus={updateTaskStatus} onProgress={updateWorkOrderProgress} onDelete={deleteWorkOrder} compact /></Panel> : <Panel title="Vorgänge" subtitle="Nächste Schritte"><CaseList cases={activeCases.slice(0, 6)} /></Panel>}</div></section><section className={classNames("section", view === "termine" && "active")}><div className="content-grid"><Panel title="Neuer Termin" subtitle="Gremium, Status und Ort"><EventForm onSubmit={handleEventSubmit} /></Panel><Panel title="Termine" subtitle={`${filteredEvents.length} von ${events.length} Terminen`}><EventFilters query={eventQuery} selectedCategories={selectedCategories} selectedBodies={selectedBodies} categories={eventCategories} bodies={eventBodies} onQuery={setEventQuery} onCategories={setSelectedCategories} onBodies={setSelectedBodies} onReset={resetEventFilters} />{editEvent && <div className="event-edit-panel"><div className="event-edit-title">Termin bearbeiten</div><EventEditForm event={editEvent} onSubmit={handleEventUpdate} onCancel={() => setEditEvent(null)} /></div>}<EventList events={filteredEvents} onEdit={setEditEvent} onDelete={handleEventDelete} /></Panel></div></section><section className={classNames("section", view === "aufgaben" && "active")}>{allowWorkOrders && <Panel title="Patrick ↔ Luca" subtitle="Kanban · Gemeinsame Aufträge"><PatrickLucaIntro profile={currentProfile} /><PatrickLucaForm profile={currentProfile} onSubmit={handlePatrickLucaSubmit} /><KanbanBoard tasks={patrickLucaTasks} profile={currentProfile} onStatus={updateTaskStatus} onProgress={updateWorkOrderProgress} onDelete={deleteWorkOrder} /></Panel>}<div className="content-grid"><Panel title={allowWorkOrders ? "Allgemeine Aufgaben" : "Aufgaben"} subtitle="Offene Arbeitsstände"><TaskForm profile={currentProfile} profiles={profiles} onSubmit={handleTaskSubmit} /><TaskList tasks={generalTasks} onStatus={updateTaskStatus} /></Panel></div></section><section className={classNames("section", view === "vorgaenge" && "active")}><div className="content-grid"><Panel title="Neuer Vorgang" subtitle="Themenakte anlegen"><CaseForm profile={currentProfile} onSubmit={handleCaseSubmit} /></Panel><Panel title="Vorgänge" subtitle="Status und nächster Schritt"><CaseList cases={cases} /></Panel></div></section><section className={classNames("section", view === "ausschuesse" && "active")}><SectionTitle title="Ausschüsse" subtitle="Mitglieder und Vertretungen" /><CommitteeList committees={committees} memberships={memberships} /></section><section className={classNames("section", view === "profile" && "active")}><SectionTitle title="Personen" subtitle={`${filteredPersons.length} von ${allPersons.length}`} /><PersonFilters query={personQuery} types={personTypes} committee={personCommittee} committees={committees} onQuery={setPersonQuery} onTypes={setPersonTypes} onCommittee={setPersonCommittee} onReset={resetPersonFilters} /><div className="profile-grid">{filteredPersons.map(person => <PersonCard key={person.name} person={person} memberships={memberships} committees={committees} isActive={person.profile?.slug === currentProfile.slug} activeCommittee={personCommittee} onCommitteeFilter={slug => setPersonCommittee(prev => prev === slug ? null : slug)} />)}{filteredPersons.length === 0 && <p className="muted">Keine Personen gefunden.</p>}</div></section><section className={classNames("section", view === "dokumente" && "active")}>{canUploadDocuments(currentProfile) && <Panel title="Dokument hochladen" subtitle="PDF, Word, Excel · max. 20 MB">{!data.supabaseConfigured ? <p className="muted small">Nur mit aktiver Datenbankverbindung verfügbar.</p> : <DocumentUploadForm cases={cases} onUpload={handleDocumentUpload} uploading={uploading} />}</Panel>}<Panel title="Dokumente" subtitle={`${documents.length} Dokument${documents.length !== 1 ? "e" : ""}`}><DocumentList documents={documents} cases={cases} /></Panel></section><section className={classNames("section", view === "sync" && "active")}><div className="content-grid"><Panel title="Kalenderquelle" subtitle="Apple oder ICS"><SourceForm profile={currentProfile} onSubmit={handleSourceSubmit} /></Panel><Panel title="Quellen" subtitle="Aktive Kalender"><SourceList sources={sources} /></Panel></div></section></section><BottomNav view={view} onSelect={activateView} onMore={() => setMoreOpen(true)} /></main>;
}

function Brand() { return <div className="brand"><img src="/FraktionslogoNeu.svg" alt="SPD-Fraktion Kaiserslautern" /></div>; }
function NavButton({ item, view, onClick }: { item: NavItem; view: View; onClick: () => void }) { return <button className={view === item.id ? "active" : ""} onClick={onClick}><span><NavSvg id={item.id} /></span>{item.label}</button>; }
function MobileTop({ profile, onLogout }: { profile: FraktionProfile; onLogout: () => void }) { return <header className="mobile-top"><Brand /><div className="mobile-top-right"><div className="mobile-profile"><Avatar profile={profile} /><span>{profile.display_name}</span></div><button className="mobile-logout-btn" onClick={onLogout} title="Abmelden">↩</button></div></header>; }
function BottomNav({ view, onSelect, onMore }: { view: View; onSelect: (view: View) => void; onMore: () => void }) { return <nav className="tabbar" aria-label="Mobile Navigation">{bottomNav.map(id => { const item = nav.find(n => n.id === id)!; return <button key={id} className={view === id ? "active" : ""} onClick={() => onSelect(id)}><span><NavSvg id={id} /></span>{item.label}</button>; })}<button onClick={onMore}><span><NavSvg id="more" /></span>Mehr</button></nav>; }
function MoreSheet({ view, onSelect, onClose, onLogout }: { view: View; onSelect: (view: View) => void; onClose: () => void; onLogout: () => void }) { return <div className="sheet-wrap"><button className="sheet-scrim" onClick={onClose} aria-label="Schließen" /><div className="sheet"><strong>Mehr</strong>{nav.filter(n => !bottomNav.includes(n.id)).map(item => <NavButton key={item.id} item={item} view={view} onClick={() => onSelect(item.id)} />)}<button className="logout sheet-logout" onClick={onLogout}>Abmelden</button></div></div>; }
function LoginScreen({ profiles, message, onLogin }: { profiles: FraktionProfile[]; message: string | null; onLogin: (profileSlug: string, code: string) => Promise<void> }) { const [selected, setSelected] = useState(profiles[0]?.slug ?? "luca-hoffmann"); const [code, setCode] = useState(""); return <main className="login-shell"><div className="login-card"><Brand /><SectionTitle title="Anmelden" subtitle="Profil auswählen" />{message && <div className={classNames("toast", /(fehlgeschlagen|Fehler|konnte nicht|ungültig|nicht möglich)/i.test(message) ? "toast-error" : "toast-success")} role="status">{message}</div>}<div className="profile-picker">{profiles.map(profile => <button key={profile.slug} className={selected === profile.slug ? "selected" : ""} onClick={() => setSelected(profile.slug)}><Avatar profile={profile} /><span>{profile.full_name}</span><small>{profile.role}</small></button>)}</div><form className="login-form" onSubmit={(event) => { event.preventDefault(); onLogin(selected, code); }}><input className="input" type="password" value={code} onChange={event => setCode(event.target.value)} placeholder="Zugangscode" /><button className="btn red">Einloggen</button></form></div></main>; }
function Avatar({ profile, large = false }: { profile: FraktionProfile; large?: boolean }) { const image = profileImageBySlug[profile.slug]; return <div className={classNames("avatar", large && "large", profile.accent ?? "")}>{image ? <img src={image} alt={profile.full_name} style={avatarImgStyle} /> : profile.avatar_initials}</div>; }
function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) { return <div className="section-title"><div><h2>{title}</h2><p>{subtitle}</p></div></div>; }
function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) { return <div className="panel"><SectionTitle title={title} subtitle={subtitle} />{children}</div>; }
function Stat({ label, value, hint }: { label: string; value: string | number; hint: string }) { return <div className="stat"><div className="muted small">{label}</div><div className="metric">{value}</div><div className="small muted">{hint}</div></div>; }
function Badge({ children, tone = "", cat = "" }: { children: ReactNode; tone?: "" | "red" | "green" | "blue" | "gold" | "violet" | "orange"; cat?: string }) { return <span className={["badge", tone, cat ? `cat-${cat.toLowerCase().replace(/[\s/]+/g, "-")}` : ""].filter(Boolean).join(" ")}>{children}</span>; }
function FilterGroup({ title, values, selected, onChange, labelFor, catFor }: { title: string; values: string[]; selected: string[]; onChange: (values: string[]) => void; labelFor?: (value: string) => string; catFor?: (value: string) => string }) { return <details className="filter-group"><summary>{title}{selected.length > 0 ? ` · ${selected.length}` : ""}</summary><div className="filter-chips">{values.map(value => { const cat = catFor ? catFor(value) : ""; return <button type="button" key={value} className={classNames("filter-chip", selected.includes(value) && "active", selected.includes(value) && cat && `cat-${cat}`)} onClick={() => onChange(toggleValue(selected, value))}>{labelFor ? labelFor(value) : value}</button>; })}</div></details>; }
function EventFilters({ query, selectedCategories, selectedBodies, categories: eventCategories, bodies, onQuery, onCategories, onBodies, onReset }: { query: string; selectedCategories: string[]; selectedBodies: string[]; categories: string[]; bodies: string[]; onQuery: (value: string) => void; onCategories: (values: string[]) => void; onBodies: (values: string[]) => void; onReset: () => void }) { return <div className="event-filters"><div className="event-filter-search"><input className="input" value={query} onChange={event => onQuery(event.target.value)} placeholder="Suchen" /><button type="button" className="clear-filters" onClick={onReset}>Zurücksetzen</button></div><div className="filter-groups"><FilterGroup title="Kategorien" values={eventCategories} selected={selectedCategories} onChange={onCategories} catFor={value => value.toLowerCase().replace(/[\s/]+/g, "-")} /><FilterGroup title="Ausschüsse / Gremien" values={bodies} selected={selectedBodies} onChange={onBodies} /></div></div>; }
function PatrickLucaIntro({ profile }: { profile: FraktionProfile }) { return <div className="work-intro"><strong>{profile.slug === "patrick-schaefer" ? "Aufträge an Luca" : "Aufträge von Patrick"}</strong><p className="muted small">Patrick kann hier Arbeitsaufträge setzen. Luca aktualisiert den Stand direkt im Board.</p></div>; }
function PatrickLucaForm({ profile, onSubmit }: { profile: FraktionProfile; onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void> }) { const isPatrick = profile.slug === "patrick-schaefer"; return <form className="form-grid work-order-form" onSubmit={onSubmit}><input className="input wide" name="title" placeholder={isPatrick ? "Arbeitsauftrag an Luca" : "Aufgabe für Patrick"} required /><select className="select" name="priority">{priorities.map(p => <option key={p}>{p}</option>)}</select><input className="input" name="due_date" type="date" /><textarea className="textarea wide" name="description" placeholder="Beschreibung / Erwartung / Materialhinweis" /><button className="btn red wide">{isPatrick ? "Auftrag an Luca" : "Aufgabe für Patrick"}</button></form>; }
function PatrickLucaBoard({ tasks, onStatus, onProgress, compact = false }: { tasks: FraktionTask[]; onStatus: (task: FraktionTask, status: string) => Promise<void>; onProgress: (task: FraktionTask, progress: number) => Promise<void>; compact?: boolean }) { const visibleTasks = compact ? tasks.filter(t => t.status !== "erledigt").slice(0, 4) : tasks; if (!visibleTasks.length) return <p className="muted">Noch keine Patrick-Luca-Aufträge.</p>; return <div className={classNames("monday-board", compact && "compact")}><div className="monday-group-title"><span>{compact ? "Aktive Aufträge" : "Gemeinsame Aufträge"}</span><span>{visibleTasks.length}</span></div><div className="monday-header"><span>Auftrag</span><span>Person</span><span>Status</span><span>Fortschritt</span><span>Fälligkeit</span><span>Priorität</span></div>{visibleTasks.map(task => <WorkOrderRow key={task.id} task={task} onStatus={onStatus} onProgress={onProgress} />)}</div>; }
function WorkOrderRow({ task, onStatus, onProgress }: { task: FraktionTask; onStatus: (task: FraktionTask, status: string) => Promise<void>; onProgress: (task: FraktionTask, progress: number) => Promise<void> }) { const current = task.status || "offen"; return <div className="monday-row"><div className="monday-task"><strong>{task.title}</strong>{readable(task.description) && <small>{readable(task.description)}</small>}</div><div className="monday-person"><span className="person-dot">LH</span><span>Luca</span></div><details className="status-dropdown"><summary className={`status-cell status-${current}`}>{taskLabel[current] ?? current}</summary><div className="status-menu">{boardStatus.map(status => <button key={status} onClick={() => onStatus(task, status)}>{taskLabel[status]}</button>)}</div></details><div className="progress-cell controlled-progress-cell"><WorkOrderProgress value={taskProgress(task)} onCommit={value => onProgress(task, value)} /></div><div className="due-cell">{dateOnly(task.due_date)}</div><div className="priority-stars" title={task.priority}>{priorityStars(task.priority)}</div></div>; }
function WorkOrderProgress({ value, onCommit }: { value: number; onCommit: (value: number) => Promise<void> }) { const [progress, setProgress] = useState(clampProgress(value)); const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle"); useEffect(() => setProgress(clampProgress(value)), [value]); async function commit(next: number) { const clamped = clampProgress(next); setProgress(clamped); setState("saving"); try { await onCommit(clamped); setState("saved"); } catch { setState("error"); } } const color = progress < 34 ? "#ef4444" : progress < 67 ? "#f59e0b" : "#22c55e"; return <div className="progress-box" data-save-state={state}><div className="progress-header"><span>Fortschritt</span><strong>{progress}%</strong></div><div className="progress-slider-wrap"><div className="progress-track" aria-hidden="true"><div className="progress-fill" style={{ width: `${progress}%`, backgroundColor: color }} /></div><input className="progress-range" type="range" min="0" max="100" step="1" value={progress} onChange={event => setProgress(clampProgress(event.target.value))} onPointerUp={event => commit(Number((event.target as HTMLInputElement).value))} onTouchEnd={event => commit(Number((event.target as HTMLInputElement).value))} onMouseUp={event => commit(Number((event.target as HTMLInputElement).value))} aria-label="Fortschritt" /></div><div className="progress-save-state">{state === "saving" ? "speichert…" : state === "saved" ? "gespeichert" : state === "error" ? "nicht gespeichert" : ""}</div></div>; }
function EventForm({ onSubmit }: { onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void> }) { return <form className="form-grid" onSubmit={onSubmit}><input className="input wide" name="title" placeholder="Titel" required /><input className="input" name="date" type="date" required /><input className="input" name="time" type="time" defaultValue="15:00" /><select className="select" name="category">{categories.map(c => <option key={c}>{c}</option>)}</select><select className="select" name="relevance"><option value="offen">Relevanz offen</option><option value="beide">für beide</option><option value="patrick">Patrick</option><option value="luca">Luca</option><option value="nicht_relevant">nicht relevant</option></select><input className="input wide" name="meeting_body" placeholder="Gremium" /><input className="input wide" name="location" placeholder="Ort" /><textarea className="textarea wide" name="description" placeholder="Notiz" /><button className="btn red wide">Speichern</button></form>; }
function TaskForm({ profile, profiles, onSubmit }: { profile: FraktionProfile; profiles: FraktionProfile[]; onSubmit: (payload: Record<string, unknown>) => Promise<void> }) { const [selected, setSelected] = useState<string[]>([profile.slug]); function toggle(slug: string) { setSelected(current => current.includes(slug) ? current.filter(item => item !== slug) : [...current, slug]); } function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); const selectedProfiles = profiles.filter(item => selected.includes(item.slug)); const names = selectedProfiles.map(item => item.full_name); const visibility = String(form.get("visibility") || "all"); onSubmit({ title: form.get("title"), description: form.get("description"), assignee: names.join(", ") || profile.full_name, assignees: names.length ? names : [profile.full_name], due_date: form.get("due_date") || null, status: "offen", priority: form.get("priority") || "normal", event_id: null, case_id: null, visibility, visible_to: visibility === "private" ? selected : [], created_by: profile.slug }).then(() => event.currentTarget.reset()); } return <form className="form-grid task-form" onSubmit={submit}><input className="input wide" name="title" placeholder="Aufgabe" required /><div className="assignment-panel wide"><div className="assignment-title">Verantwortlich</div><div className="assignment-grid">{profiles.map(item => <button type="button" key={item.slug} className={classNames("assign-person", selected.includes(item.slug) && "selected")} onClick={() => toggle(item.slug)}><Avatar profile={item} /><span>{item.display_name}</span></button>)}</div><button type="button" className="assign-all" onClick={() => setSelected(profiles.map(item => item.slug))}>Alle auswählen</button></div><input className="input" name="due_date" type="date" /><select className="select" name="priority">{priorities.map(p => <option key={p}>{p}</option>)}</select><div className="visibility-panel wide"><label><input type="radio" name="visibility" value="all" defaultChecked /> alle Profile</label><label><input type="radio" name="visibility" value="private" /> nur ausgewählte Profile</label></div><textarea className="textarea wide" name="description" placeholder="Beschreibung" /><button className="btn light wide">Allgemeine Aufgabe speichern</button></form>; }
function CaseForm({ profile, onSubmit }: { profile: FraktionProfile; onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void> }) { return <form className="form-grid" onSubmit={onSubmit}><input className="input wide" name="title" placeholder="Titel" required /><input className="input" name="owner" placeholder="Zuständig" defaultValue={profile.full_name} /><select className="select" name="priority">{priorities.map(p => <option key={p}>{p}</option>)}</select><input className="input wide" name="next_step" placeholder="Nächster Schritt" /><textarea className="textarea wide" name="description" placeholder="Kurzbeschreibung" /><button className="btn red wide">Speichern</button></form>; }
function SourceForm({ profile, onSubmit }: { profile: FraktionProfile; onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void> }) { return <form className="form-grid" onSubmit={onSubmit}><input className="input" name="name" placeholder="Name" defaultValue="Kalender" required /><input className="input" name="owner" placeholder="Eigentümer" defaultValue={profile.full_name} /><input className="input wide" name="url" placeholder="https://...ics" required /><textarea className="textarea wide" name="notes" placeholder="Notiz" /><button className="btn red wide">Speichern</button><a className="btn light wide" href="/api/calendar/ics">Fraktionskalender abonnieren</a></form>; }
function CaseList({ cases }: { cases: FraktionCase[] }) { if (!cases.length) return <p className="muted">Noch keine Vorgänge.</p>; return <div className="list">{cases.map(c => <div className="item" key={c.id}><div className="item-head"><h3>{c.title}</h3><div className="badges"><Badge tone={c.priority === "hoch" || c.priority === "kritisch" ? "red" : "blue"}>{c.priority}</Badge><Badge>{c.status}</Badge></div></div>{readable(c.description) && <div className="small">{readable(c.description)}</div>}<div className="muted small">{c.owner || "offen"} · {c.next_step || "kein nächster Schritt"}</div></div>)}</div>; }
function CommitteeList({ committees, memberships }: { committees: FraktionCommittee[]; memberships: CommitteeMembership[] }) { if (!committees.length) return <p className="muted">Noch keine Ausschüsse.</p>; return <div className="committee-grid">{committees.map(c => { const rows = memberships.filter(mx => mx.committee_slug === c.slug); const ord = rows.filter(r => r.role === "member"); const stv = rows.filter(r => r.role === "substitute"); return <div className="committee-card" key={c.slug}><div className="committee-card-head"><h3>{c.title}</h3></div><div className="committee-members"><div className="committee-members-col"><strong>Ordentlich</strong>{ord.map(r => <span key={r.id}>{r.person_name}</span>)}{ord.length === 0 && <span className="muted">—</span>}</div><div className="committee-members-col"><strong>Stellvertretend</strong>{stv.map(r => <span key={r.id}>{r.person_name}</span>)}{stv.length === 0 && <span className="muted">—</span>}</div></div></div>; })}</div>; }
function PersonCard({ person, memberships, committees, isActive, activeCommittee, onCommitteeFilter }: { person: UnifiedPerson; memberships: CommitteeMembership[]; committees: FraktionCommittee[]; isActive?: boolean; activeCommittee?: string | null; onCommitteeFilter?: (slug: string) => void }) {
  const { name, profile, member, personType } = person;
  const slug = profile?.slug ?? slugifyName(name);
  const image = profileImageBySlug[slug];
  const initials = profile?.avatar_initials ?? name.split(" ").map(part => part[0]).join("").slice(0, 2);
  const role = profile?.role ?? member?.role ?? "Fraktionsmitglied";
  const email = member?.email ?? null;
  const accentClass = profile?.accent ?? "";
  const personMemberships = memberships.filter(m => m.person_name === name);
  const committeeItems = personMemberships.map(m => { const committee = committees.find(c => c.slug === m.committee_slug); return { label: committee?.title ?? committee?.short_ref ?? m.committee_slug, slug: m.committee_slug, isStv: m.role === "substitute" }; });
  return <div className={classNames("profile-card", "person-card", isActive && "is-active")}>
    <div className="profile-top"><div className={classNames("avatar", "large", accentClass)}>{image ? <img src={image} alt={name} style={avatarImgStyle} /> : initials}</div><div><h3>{name}</h3><p>{role}</p></div></div>
    <div className="badges"><Badge tone={personType === "Sekretariat" ? "gold" : personType === "Ratsmitglied" ? "red" : ""}>{personType}</Badge>{profile?.board_role && <Badge tone="blue">{profile.board_role}</Badge>}</div>
    {committeeItems.length > 0 && <div className="person-committees">{committeeItems.map(c => <button type="button" key={c.slug} className={classNames("committee-pill", c.isStv && "stv", activeCommittee === c.slug && "active")} onClick={() => onCommitteeFilter?.(c.slug)} title={`Nach ${c.label} filtern`}>{c.label}{c.isStv ? " stv." : ""}</button>)}</div>}
    {email && <div className="muted small person-email">✉ {email}</div>}
    {profile?.is_staff && (profile.permissions ?? []).length > 0 && <div className="permission-row">{(profile.permissions ?? []).slice(0, 4).map(perm => <span key={perm}>{perm}</span>)}</div>}
  </div>;
}
function PersonFilters({ query, types, committee, committees, onQuery, onTypes, onCommittee, onReset }: { query: string; types: string[]; committee: string | null; committees: FraktionCommittee[]; onQuery: (v: string) => void; onTypes: (v: string[]) => void; onCommittee: (v: string | null) => void; onReset: () => void }) {
  const typeOptions = ["Ratsmitglied", "Sekretariat"];
  return <div className="person-filters"><div className="person-search-row"><input className="input" value={query} onChange={e => onQuery(e.target.value)} placeholder="Name oder Rolle suchen…" /><button type="button" className="clear-filters" onClick={onReset}>Zurücksetzen</button></div><div className="person-chip-row">{typeOptions.map(t => <button type="button" key={t} className={classNames("filter-chip", types.includes(t) && "active")} onClick={() => onTypes(toggleValue(types, t))}>{t}</button>)}</div>{committees.length > 0 && <div className="person-chip-row">{committees.map(c => <button type="button" key={c.slug} className={classNames("filter-chip", committee === c.slug && "active")} onClick={() => onCommittee(committee === c.slug ? null : c.slug)}>{c.title ?? c.short_ref}</button>)}</div>}</div>;
}
function EventEditForm({ event, onSubmit, onCancel }: { event: FraktionEvent; onSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>; onCancel: () => void }) { const d = event.starts_at ? new Date(event.starts_at) : new Date(); const dateStr = d.toISOString().slice(0, 10); const timeStr = d.toISOString().slice(11, 16); return <form className="form-grid" onSubmit={onSubmit}><input className="input wide" name="title" defaultValue={event.title} placeholder="Titel" required /><input className="input" name="date" type="date" defaultValue={dateStr} required /><input className="input" name="time" type="time" defaultValue={timeStr} /><select className="select" name="category" defaultValue={event.category ?? ""}>{categories.map(c => <option key={c}>{c}</option>)}</select><select className="select" name="relevance" defaultValue={event.relevance ?? "offen"}><option value="offen">Relevanz offen</option><option value="beide">für beide</option><option value="patrick">Patrick</option><option value="luca">Luca</option><option value="nicht_relevant">nicht relevant</option></select><input className="input wide" name="meeting_body" defaultValue={event.meeting_body ?? ""} placeholder="Gremium" /><input className="input wide" name="location" defaultValue={event.location ?? ""} placeholder="Ort" /><textarea className="textarea wide" name="description" defaultValue={event.description ?? ""} placeholder="Notiz" /><div className="wide" style={{display:"flex",gap:8}}><button className="btn red" style={{flex:1}}>Speichern</button><button type="button" className="btn light" style={{flex:1}} onClick={onCancel}>Abbrechen</button></div></form>; }
function EventList({ events, onEdit, onDelete }: { events: FraktionEvent[]; onEdit: (e: FraktionEvent) => void; onDelete: (id: string) => void }) { if (!events.length) return <p className="muted">Keine passenden Termine.</p>; return <div className="list">{events.map(e => { const catSlug = (e.category ?? "sonstiges").toLowerCase().replace(/[\s/]+/g, "-"); return <div className={classNames("item", "event-item", `event-cat-${catSlug}`)} key={e.id}><div className="item-head"><h3>{e.title}</h3><div className="badges"><Badge cat={e.category ?? ""}>{e.category ?? "Termin"}</Badge><button type="button" className="icon-btn" title="Bearbeiten" onClick={() => onEdit(e)}>✏️</button><button type="button" className="icon-btn icon-btn-danger" title="Löschen" onClick={() => onDelete(e.id)}>🗑️</button></div></div><div className="muted small">{dateTime(e.starts_at)}{e.location ? ` · ${e.location}` : ""}</div><div className="small">{e.meeting_body || e.title}</div>{readable(e.description) && <div className="small">{readable(e.description)}</div>}</div>; })}</div>; }
function TaskList({ tasks, onStatus }: { tasks: FraktionTask[]; onStatus: (task: FraktionTask, status: string) => Promise<void> }) { if (!tasks.length) return <p className="muted">Keine Aufgaben vorhanden.</p>; return <div className="list">{tasks.map(t => <div className="item" key={t.id}><div className="item-head"><h3>{t.title}</h3><Badge tone={t.priority === "hoch" || t.priority === "kritisch" ? "red" : ""}>{t.priority}</Badge></div><div className="muted small">{assigneeText(t)} · {dateOnly(t.due_date)}</div>{readable(t.description) && <div className="small">{readable(t.description)}</div>}<div className="toolbar">{taskStatus.map(s => <button className={t.status === s ? "btn red" : "btn light"} key={s} onClick={() => onStatus(t, s)}>{taskLabel[s] ?? s}</button>)}</div></div>)}</div>; }
function DocumentList({ documents, cases }: { documents: FraktionDocument[]; cases: FraktionCase[] }) { if (!documents.length) return <p className="muted">Noch keine Dokumente.</p>; return <div className="list">{documents.map(d => <div className="item" key={d.id}><div className="item-head"><h3>{d.title}</h3><Badge>{d.kind ?? d.category ?? "Dokument"}</Badge></div>{readable(d.description) && <div className="small">{readable(d.description)}</div>}<div className="muted small">{d.status ?? "offen"} · {cases.find(c => c.id === d.case_id)?.title ?? "ohne Vorgang"}</div>{d.url && <a className="btn light" href={d.url} target="_blank" rel="noreferrer">Öffnen</a>}</div>)}</div>; }
function DocumentUploadForm({ cases, onUpload, uploading }: { cases: FraktionCase[]; onUpload: (file: File, title: string, category: string, date: string | null, caseId: string | null) => Promise<void>; uploading: boolean }) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const MAX_SIZE = 20 * 1024 * 1024;
  const ALLOWED = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
  const docCategories = ["Antrag", "Vorlage", "Protokoll", "Sonstiges"];
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return;
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    await onUpload(file, String(form.get("title")), String(form.get("category") || "Sonstiges"), String(form.get("date") || "") || null, String(form.get("case_id") || "") || null);
    setFile(null);
    setFileError(null);
    formEl.reset();
  }
  function onFileChange(e: { target: HTMLInputElement & { files: FileList | null } }) {
    const f = e.target.files?.[0] ?? null;
    if (!f) { setFile(null); setFileError(null); return; }
    if (f.size > MAX_SIZE) { setFile(null); setFileError("Datei zu groß – maximal 20 MB erlaubt."); e.target.value = ""; return; }
    if (!ALLOWED.includes(f.type)) { setFile(null); setFileError("Nur PDF, Word (.docx) oder Excel (.xlsx) sind erlaubt."); e.target.value = ""; return; }
    setFileError(null);
    setFile(f);
  }
  return <form onSubmit={handleSubmit} className="form-grid">
    <div className="wide"><label className="small muted" style={{display:"block",marginBottom:6}}>Datei (PDF, Word, Excel)</label><input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={onFileChange} className="input" required />{fileError && <p style={{color:"var(--red)",fontSize:".8rem",margin:"4px 0 0"}}>{fileError}</p>}{file && <p className="small muted" style={{margin:"4px 0 0"}}>{file.name} ({(file.size/1024/1024).toFixed(1)} MB)</p>}</div>
    <input name="title" placeholder="Titel *" className="input wide" required />
    <select name="category" className="select">{docCategories.map(c => <option key={c} value={c}>{c}</option>)}</select>
    <input name="date" type="date" className="input" title="Datum (optional)" />
    <select name="case_id" className="select wide"><option value="">Kein Vorgang</option>{cases.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select>
    <button type="submit" className="btn red wide" disabled={!file || uploading}>{uploading ? "Wird hochgeladen…" : "Dokument hochladen"}</button>
  </form>;
}
function SourceList({ sources }: { sources: CalendarSource[] }) { if (!sources.length) return <p className="muted">Noch keine Kalenderquellen.</p>; return <div className="list">{sources.map(s => <div className="item" key={s.id}><div className="item-head"><h3>{s.name}</h3><Badge tone={s.enabled ? "green" : ""}>{s.enabled ? "aktiv" : "inaktiv"}</Badge></div><div className="muted small">{s.owner} · {s.type} · {s.last_synced_at ? dateTime(s.last_synced_at) : "noch nicht synchronisiert"}</div></div>)}</div>; }

function NavSvg({ id }: { id: string }) {
  const icons: Record<string, ReactElement> = {
    dashboard: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>,
    termine: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>,
    aufgaben: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>,
    vorgaenge: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
    ausschuesse: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    profile: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
    dokumente: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
    sync: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><polyline points="23 20 23 14 17 14" /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" /></svg>,
    more: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>,
  };
  return icons[id] ?? <span style={{ fontSize: 10, fontWeight: 800 }}>{id[0]?.toUpperCase()}</span>;
}

const kanbanCols = [
  { id: "offen",          label: "Offen",          color: "#9ca3af" },
  { id: "in_bearbeitung", label: "In Bearbeitung", color: "#f59e0b" },
  { id: "rueckfrage",     label: "Rückfrage",      color: "#a855f7" },
  { id: "wartend",        label: "Wartet",         color: "#64748b" },
  { id: "pruefung",       label: "Prüfung",        color: "#3b82f6" },
  { id: "erledigt",       label: "Erledigt",       color: "#10b981" },
];
const kanbanColIds = new Set(kanbanCols.map(c => c.id));
function statusColumnId(status: string | null | undefined) { const s = status || "offen"; return kanbanColIds.has(s) ? s : "offen"; }
const statusColor: Record<string, string> = { offen: "#9ca3af", in_bearbeitung: "#f59e0b", rueckfrage: "#a855f7", wartend: "#64748b", pruefung: "#3b82f6", erledigt: "#10b981", verworfen: "#ef4444" };

function KanbanBoard({ tasks, profile, onStatus, onProgress, onDelete, compact = false }: { tasks: FraktionTask[]; profile: FraktionProfile; onStatus: (task: FraktionTask, status: string) => Promise<void>; onProgress: (task: FraktionTask, progress: number) => Promise<void>; onDelete?: (task: FraktionTask) => void; compact?: boolean }) {
  const visibleTasks = compact ? tasks.filter(t => t.status !== "erledigt").slice(0, 8) : tasks;
  if (!tasks.length) return <p className="muted small">Noch keine Aufträge vorhanden.</p>;
  return <div className="kanban-board">{kanbanCols.map(col => { const colTasks = visibleTasks.filter(t => statusColumnId(t.status) === col.id); return <div className="kanban-col" key={col.id}><div className="kanban-col-header" style={{ borderColor: col.color }}><span className="kanban-col-label">{col.label}</span><span className="kanban-col-count">{colTasks.length}</span></div><div className="kanban-col-cards">{colTasks.length === 0 && <div className="kanban-empty">Leer</div>}{colTasks.map(task => <KanbanCard key={task.id} task={task} profile={profile} onStatus={onStatus} onProgress={onProgress} onDelete={onDelete} />)}</div></div>; })}</div>;
}

function KanbanCard({ task, onStatus, onDelete }: { task: FraktionTask; profile: FraktionProfile; onStatus: (task: FraktionTask, status: string) => Promise<void>; onProgress: (task: FraktionTask, progress: number) => Promise<void>; onDelete?: (task: FraktionTask) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const current = task.status || "offen";
  const prog = taskProgress(task);
  const dirMatch = task.description?.match(/^\[(.+?)\]/);
  const dir = dirMatch ? dirMatch[1] : null;
  const progColor = prog < 34 ? "#ef4444" : prog < 67 ? "#f59e0b" : "#22c55e";
  return <div className="kanban-card">{onDelete && <button type="button" className="kanban-card-delete" title="Auftrag löschen" aria-label="Auftrag löschen" onClick={() => onDelete(task)}>🗑️</button>}<div className="kanban-card-title">{task.title}</div><div className="kanban-card-meta">{dir && <span className="kanban-dir">{dir}</span>}<span className={`kanban-pri ${task.priority || "normal"}`}>{task.priority || "normal"}</span>{task.due_date && <span className="kanban-due">{dateOnly(task.due_date)}</span>}</div>{prog > 0 && <div className="kanban-progress-bar"><div className="kanban-progress-fill" style={{ width: `${prog}%`, background: progColor }} /></div>}<div className="kanban-status-wrap"><button className="kanban-status-btn" style={{ background: statusColor[current] ?? "#9ca3af" }} onClick={() => setMenuOpen(o => !o)}>{taskLabel[current] ?? current} ▾</button>{menuOpen && <div className="kanban-status-menu">{boardStatus.map(s => <button key={s} className="kanban-status-option" style={{ background: statusColor[s] ?? "#9ca3af" }} onClick={() => { onStatus(task, s); setMenuOpen(false); }}>{taskLabel[s] ?? s}</button>)}</div>}</div></div>;
}

function RetentionDialog({ task, onChoose, onCancel }: { task: FraktionTask; onChoose: (task: FraktionTask, policy: string) => Promise<void>; onCancel: () => void }) {
  return <div className="modal-overlay" onClick={onCancel}><div className="modal-card" onClick={e => e.stopPropagation()}><h3>Aufgabe abschließen</h3><p className="muted small">Was soll mit „{task.title}" passieren?</p><div className="retention-options"><button className="retention-option" onClick={() => onChoose(task, "30days")}><span className="ret-icon">🗓️</span><div className="ret-body"><strong>30 Tage aufbewahren</strong><small>Nach 30 Tagen automatisch löschen</small></div></button><button className="retention-option" onClick={() => onChoose(task, "60days")}><span className="ret-icon">📅</span><div className="ret-body"><strong>60 Tage aufbewahren</strong><small>Nach 60 Tagen automatisch löschen</small></div></button><button className="retention-option" onClick={() => onChoose(task, "archive")}><span className="ret-icon">📂</span><div className="ret-body"><strong>Archivieren</strong><small>Dauerhaft archiviert, aus aktiver Ansicht ausgeblendet</small></div></button><button className="retention-option danger" onClick={() => onChoose(task, "delete")}><span className="ret-icon">🗑️</span><div className="ret-body"><strong>Sofort löschen</strong><small>Wird sofort entfernt</small></div></button></div><button className="modal-cancel" onClick={onCancel}>Abbrechen</button></div></div>;
}
