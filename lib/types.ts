export type EventStatus = "scheduled" | "changed" | "cancelled" | "tentative";
export type TaskStatus = "offen" | "in_bearbeitung" | "wartend" | "pruefung" | "erledigt" | "verworfen";
export type TaskPriority = "niedrig" | "normal" | "hoch" | "kritisch";
export type Relevance = "offen" | "relevant" | "nicht_relevant" | "patrick" | "luca" | "beide";
export type PortalRole = "fraktionsvorsitz" | "stellvertretung" | "ratsmitglied" | "fraktionssekretariat" | "admin";
export type PreparationStatus = "offen" | "unterlagen_fehlen" | "vorbereiten" | "rueckfrage" | "vorbereitet" | "erledigt";
export type CaseStatus = "offen" | "in_bearbeitung" | "wartet" | "entschieden" | "erledigt" | "archiv";
export type CommitteeRole = "member" | "substitute";

export type FraktionProfile = {
  id: string;
  slug: string;
  full_name: string;
  display_name: string;
  role: string;
  board_role: string | null;
  portal_role: PortalRole;
  is_council_member: boolean;
  is_staff: boolean;
  email: string | null;
  phone: string | null;
  committees: string | null;
  bio: string | null;
  permissions: string[] | null;
  avatar_initials: string;
  accent: string | null;
  sort_order: number;
  login_enabled: boolean;
  created_at?: string;
  updated_at?: string;
};

export type FraktionCase = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: CaseStatus | string;
  priority: TaskPriority | string;
  owner: string | null;
  next_step: string | null;
  due_date: string | null;
  tags: string[] | null;
  created_at?: string;
  updated_at?: string;
};

export type FraktionCommittee = {
  id: string;
  slug: string;
  title: string;
  short_ref: string | null;
  source: string | null;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
};

export type CommitteeMembership = {
  id: string;
  committee_slug: string;
  person_name: string;
  role: CommitteeRole;
  sort_order: number;
  source_file: string | null;
  created_at?: string;
};

export type FraktionEvent = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  all_day: boolean;
  location: string | null;
  description: string | null;
  category: string | null;
  source: string | null;
  source_uid: string | null;
  owner: string | null;
  relevance: Relevance | null;
  status: EventStatus | null;
  meeting_body?: string | null;
  ris_url?: string | null;
  preparation_status?: PreparationStatus | string | null;
  requires_preparation?: boolean;
  decision_needed?: boolean;
  case_id?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type FraktionTask = {
  id: string;
  title: string;
  description: string | null;
  assignee: string | null;
  due_date: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  event_id: string | null;
  case_id?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type FraktionMember = {
  id: string;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  committees: string | null;
  avatar_url: string | null;
  notes: string | null;
};

export type FraktionDocument = {
  id: string;
  title: string;
  category: string | null;
  url: string | null;
  description: string | null;
  owner: string | null;
  document_date: string | null;
  case_id?: string | null;
  status?: string | null;
  kind?: string | null;
  created_at?: string;
};

export type CalendarSource = {
  id: string;
  name: string;
  type: "apple_ics" | "ics" | "manual" | "caldav_planned";
  url: string | null;
  owner: string | null;
  enabled: boolean;
  last_synced_at: string | null;
  notes: string | null;
  created_at?: string;
};

export type SyncLog = {
  id: string;
  source_id: string | null;
  status: "ok" | "warning" | "error";
  message: string | null;
  imported_count: number;
  created_at: string;
};

export type PortalData = {
  profiles: FraktionProfile[];
  events: FraktionEvent[];
  tasks: FraktionTask[];
  members: FraktionMember[];
  documents: FraktionDocument[];
  calendar_sources: CalendarSource[];
  sync_logs: SyncLog[];
  cases: FraktionCase[];
  committees: FraktionCommittee[];
  committee_memberships: CommitteeMembership[];
  supabaseConfigured: boolean;
  error?: string;
};

export type CrudTable = "events" | "tasks" | "members" | "documents" | "calendar_sources" | "profiles" | "cases" | "committees" | "committee_memberships";
