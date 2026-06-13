create extension if not exists pgcrypto;

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

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  all_day boolean not null default false,
  location text,
  description text,
  category text not null default 'Sonstiges',
  source text not null default 'manual',
  external_uid text,
  owner text default 'Patrick',
  relevance text default 'offen',
  status text not null default 'scheduled',
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

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  url text,
  description text,
  uploaded_by text,
  event_id uuid references public.events(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.calendar_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'apple_ics',
  url text,
  owner text not null default 'Patrick',
  enabled boolean not null default true,
  last_synced_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.sync_logs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.calendar_sources(id) on delete set null,
  status text not null,
  message text,
  imported_count integer not null default 0,
  created_at timestamptz not null default now()
);
