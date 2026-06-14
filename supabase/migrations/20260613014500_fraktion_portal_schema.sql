create extension if not exists pgcrypto;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  all_day boolean not null default false,
  location text,
  description text,
  category text default 'Sonstiges',
  source text default 'manual',
  source_uid text,
  owner text,
  relevance text default 'offen',
  status text default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  assignee text,
  due_date date,
  status text not null default 'offen',
  priority text not null default 'normal',
  event_id uuid references public.events(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  email text,
  phone text,
  committees text,
  avatar_url text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  url text,
  description text,
  owner text,
  document_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.calendar_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'apple_ics',
  url text,
  owner text,
  enabled boolean not null default true,
  last_synced_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.sync_logs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.calendar_sources(id) on delete set null,
  status text not null default 'ok',
  message text,
  imported_count integer not null default 0,
  created_at timestamptz not null default now()
);

create unique index if not exists events_source_uid_unique on public.events(source, source_uid) where source_uid is not null;
create index if not exists events_starts_at_idx on public.events(starts_at);
create index if not exists tasks_status_idx on public.tasks(status);
create index if not exists tasks_due_date_idx on public.tasks(due_date);

alter table public.events enable row level security;
alter table public.tasks enable row level security;
alter table public.members enable row level security;
alter table public.documents enable row level security;
alter table public.calendar_sources enable row level security;
alter table public.sync_logs enable row level security;

drop policy if exists "prototype_read_events" on public.events;
create policy "prototype_read_events" on public.events for select using (true);
drop policy if exists "prototype_write_events" on public.events;
create policy "prototype_write_events" on public.events for all using (true) with check (true);

drop policy if exists "prototype_read_tasks" on public.tasks;
create policy "prototype_read_tasks" on public.tasks for select using (true);
drop policy if exists "prototype_write_tasks" on public.tasks;
create policy "prototype_write_tasks" on public.tasks for all using (true) with check (true);

drop policy if exists "prototype_read_members" on public.members;
create policy "prototype_read_members" on public.members for select using (true);
drop policy if exists "prototype_write_members" on public.members;
create policy "prototype_write_members" on public.members for all using (true) with check (true);

drop policy if exists "prototype_read_documents" on public.documents;
create policy "prototype_read_documents" on public.documents for select using (true);
drop policy if exists "prototype_write_documents" on public.documents;
create policy "prototype_write_documents" on public.documents for all using (true) with check (true);

drop policy if exists "prototype_read_sources" on public.calendar_sources;
create policy "prototype_read_sources" on public.calendar_sources for select using (true);
drop policy if exists "prototype_write_sources" on public.calendar_sources;
create policy "prototype_write_sources" on public.calendar_sources for all using (true) with check (true);

drop policy if exists "prototype_read_logs" on public.sync_logs;
create policy "prototype_read_logs" on public.sync_logs for select using (true);
drop policy if exists "prototype_write_logs" on public.sync_logs;
create policy "prototype_write_logs" on public.sync_logs for all using (true) with check (true);

insert into public.members (name, role) values
  ('Patrick Schäfer', 'Fraktionsvorsitzender'),
  ('Luca Hoffmann', 'Organisation / Fraktionsarbeit'),
  ('Janina Eispert', 'Stellvertretende Vorsitzende')
on conflict do nothing;

insert into public.events (title, starts_at, ends_at, location, category, source, owner, relevance, description) values
  ('Stadtrat', '2026-06-15 15:00+02', '2026-06-15 16:30+02', 'Großer Ratssaal, Rathaus Kaiserslautern', 'Stadtrat', 'seed', 'Patrick', 'beide', 'Seed-Termin aus dem alten Fraktionsportal'),
  ('Ferienkommission', '2026-07-27 15:00+02', '2026-07-27 16:00+02', 'Rathaus Kaiserslautern', 'Ausschuss', 'seed', 'Patrick', 'offen', 'Seed-Termin')
on conflict do nothing;
