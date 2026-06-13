alter table public.events add column if not exists meeting_body text;
alter table public.events add column if not exists ris_url text;
alter table public.events add column if not exists preparation_status text not null default 'offen';
alter table public.events add column if not exists requires_preparation boolean not null default true;
alter table public.events add column if not exists decision_needed boolean not null default false;

alter table public.tasks add column if not exists case_id uuid;
alter table public.documents add column if not exists case_id uuid;
alter table public.documents add column if not exists status text not null default 'arbeitsstand';
alter table public.documents add column if not exists kind text default 'Dokument';

create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  status text not null default 'offen',
  priority text not null default 'normal',
  owner text,
  next_step text,
  due_date date,
  tags text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.committees (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  short_ref text,
  source text default 'attendance_list',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.committee_memberships (
  id uuid primary key default gen_random_uuid(),
  committee_slug text not null,
  person_name text not null,
  role text not null check (role in ('member','substitute')),
  sort_order integer not null default 100,
  source_file text,
  created_at timestamptz not null default now(),
  unique (committee_slug, person_name, role)
);

create index if not exists cases_status_idx on public.cases(status);
create index if not exists cases_owner_idx on public.cases(owner);
create index if not exists committee_memberships_committee_idx on public.committee_memberships(committee_slug);
create index if not exists committee_memberships_person_idx on public.committee_memberships(person_name);
create index if not exists events_meeting_body_idx on public.events(meeting_body);
create index if not exists events_preparation_status_idx on public.events(preparation_status);

alter table public.cases enable row level security;
alter table public.committees enable row level security;
alter table public.committee_memberships enable row level security;

drop policy if exists "prototype_read_cases" on public.cases;
create policy "prototype_read_cases" on public.cases for select using (true);
drop policy if exists "prototype_write_cases" on public.cases;
create policy "prototype_write_cases" on public.cases for all using (true) with check (true);

drop policy if exists "prototype_read_committees" on public.committees;
create policy "prototype_read_committees" on public.committees for select using (true);
drop policy if exists "prototype_write_committees" on public.committees;
create policy "prototype_write_committees" on public.committees for all using (true) with check (true);

drop policy if exists "prototype_read_committee_memberships" on public.committee_memberships;
create policy "prototype_read_committee_memberships" on public.committee_memberships for select using (true);
drop policy if exists "prototype_write_committee_memberships" on public.committee_memberships;
create policy "prototype_write_committee_memberships" on public.committee_memberships for all using (true) with check (true);

insert into public.cases (slug, title, description, status, priority, owner, next_step, tags) values
  ('vernetzung-oeffentlicher-parkplaetze', 'Vernetzung öffentlicher Parkplätze', 'Vorgang zur Vorlage 0506/2023 und zum Smart-City-Prüfansatz für öffentliche Parkplätze.', 'in_bearbeitung', 'hoch', 'Luca Hoffmann', 'Sachstand der Verwaltung nachhalten und Ergebnis dokumentieren.', array['Parken','Smart City','Sachstand']),
  ('leerstandserfassung-lean', 'Leerstandserfassung und LeAn', 'Vorgang zur digitalen Leerstandserfassungs- und Ansiedlungsplattform.', 'in_bearbeitung', 'hoch', 'Luca Hoffmann', 'Antwort der Verwaltung auswerten und weitere Schritte vorbereiten.', array['Innenstadt','Wirtschaft','Digitalisierung']),
  ('ferienkommission', 'Ferienkommission', 'Fraktionsinterne Besetzung, Anwesenheit und Rückmeldungen zur Ferienkommission.', 'offen', 'normal', 'Luca Hoffmann', 'Fehlende Rückmeldungen und finale Besetzung prüfen.', array['Gremien','Organisation']),
  ('hitzeschutz', 'Hitzeschutz in Kaiserslautern', 'Berichtsantrag und Folgeaufgaben rund um kommunalen Hitzeschutz.', 'offen', 'hoch', 'Anna Raab', 'Berichtsstand und zuständige Ausschüsse prüfen.', array['Klima','Soziales','Gesundheit']),
  ('wohnraum-einzelhandel', 'Wohnraum über eingeschossigem Einzelhandel', 'Prüfauftrag zu Potenzialen von Wohnraum über eingeschossigen Einzelhandelsmärkten.', 'offen', 'normal', 'Luca Hoffmann', 'Nächsten Beratungstermin und zuständigen Ausschuss zuordnen.', array['Wohnen','Bauen']),
  ('unesco-creative-city', 'UNESCO Creative City of Architecture', 'Prüfauftrag zur möglichen Bewerbung Kaiserslauterns als Creative City of Architecture.', 'offen', 'normal', 'Luca Hoffmann', 'Material und Vergleichsstädte sammeln.', array['Kultur','Architektur','Stadtentwicklung'])
on conflict (slug) do update set title = excluded.title, description = excluded.description, status = excluded.status, priority = excluded.priority, owner = excluded.owner, next_step = excluded.next_step, tags = excluded.tags, updated_at = now();

insert into public.committees (slug, title, short_ref, notes) values
  ('digitalausschuss', 'Digitalausschuss', 'DA', 'Seed aus Anwesenheitsliste Digitalausschuss'),
  ('schultraegerausschuss', 'Schulträgerausschuss', 'STA', 'Seed aus Anwesenheitsliste Schulträgerausschuss'),
  ('verwaltungsrat-stadtentwaesserung', 'Verwaltungsrat Stadtentwässerung', 'VR', 'Seed aus Anwesenheitsliste Verwaltungsrat Stadtentwässerung'),
  ('rechnungspruefungsausschuss', 'Rechnungsprüfungsausschuss', 'RPA', 'Seed aus Anwesenheitsliste Rechnungsprüfungsausschuss'),
  ('sozialausschuss', 'Sozialausschuss', 'SoA', 'Seed aus Anwesenheitsliste Sozialausschuss'),
  ('hospitalausschuss', 'Hospitalausschuss', 'HoA', 'Seed aus Anwesenheitsliste Hospitalausschuss'),
  ('bauausschuss', 'Bauausschuss', 'BA', 'Seed aus Anwesenheitsliste Bauausschuss'),
  ('stadtrechtsausschuss', 'Stadtrechtsausschuss', 'SRA', 'Seed aus Anwesenheitsliste Stadtrechtsausschuss'),
  ('sportausschuss', 'Sportausschuss', 'SpA', 'Seed aus Anwesenheitsliste Sportausschuss'),
  ('werkausschuss-stadtbildpflege', 'Werkausschuss Stadtbildpflege', 'WA', 'Seed aus Anwesenheitsliste Werkausschuss Stadtbildpflege')
on conflict (slug) do update set title = excluded.title, short_ref = excluded.short_ref, notes = excluded.notes, updated_at = now();

insert into public.committee_memberships (committee_slug, person_name, role, sort_order, source_file) values
  ('digitalausschuss','Patrick Schäfer','member',10,'Anwesenheitsliste Digitalausschuss.pdf'),('digitalausschuss','Raymond Germany','member',20,'Anwesenheitsliste Digitalausschuss.pdf'),('digitalausschuss','Anna Raab','member',30,'Anwesenheitsliste Digitalausschuss.pdf'),('digitalausschuss','Robin Brandstädter','member',40,'Anwesenheitsliste Digitalausschuss.pdf'),('digitalausschuss','Moritz Behncke','substitute',110,'Anwesenheitsliste Digitalausschuss.pdf'),('digitalausschuss','Thomas Kneller','substitute',120,'Anwesenheitsliste Digitalausschuss.pdf'),('digitalausschuss','René Neyer','substitute',130,'Anwesenheitsliste Digitalausschuss.pdf'),('digitalausschuss','Constantin Rubel','substitute',140,'Anwesenheitsliste Digitalausschuss.pdf'),
  ('schultraegerausschuss','Moritz Behncke','member',10,'Anwesenheitsliste Schultraegerausschuss.pdf'),('schultraegerausschuss','Petra Janson-Peermann','member',20,'Anwesenheitsliste Schultraegerausschuss.pdf'),('schultraegerausschuss','Anna Raab','member',30,'Anwesenheitsliste Schultraegerausschuss.pdf'),('schultraegerausschuss','Marcel Schulz','member',40,'Anwesenheitsliste Schultraegerausschuss.pdf'),('schultraegerausschuss','Thorsten Peermann','substitute',110,'Anwesenheitsliste Schultraegerausschuss.pdf'),('schultraegerausschuss','Karin Fürst-Steiner','substitute',120,'Anwesenheitsliste Schultraegerausschuss.pdf'),('schultraegerausschuss','Janina Eispert','substitute',130,'Anwesenheitsliste Schultraegerausschuss.pdf'),('schultraegerausschuss','Alexander Lenz','substitute',140,'Anwesenheitsliste Schultraegerausschuss.pdf'),
  ('verwaltungsrat-stadtentwaesserung','Petra Janson-Peermann','member',10,'Anwesenheitsliste Verwaltungsrat Stadtentwaesserung.pdf'),('verwaltungsrat-stadtentwaesserung','Michael Krauss','member',20,'Anwesenheitsliste Verwaltungsrat Stadtentwaesserung.pdf'),('verwaltungsrat-stadtentwaesserung','Raymond Germany','member',30,'Anwesenheitsliste Verwaltungsrat Stadtentwaesserung.pdf'),('verwaltungsrat-stadtentwaesserung','Harald Brandstädter','substitute',110,'Anwesenheitsliste Verwaltungsrat Stadtentwaesserung.pdf'),('verwaltungsrat-stadtentwaesserung','Janina Eispert','substitute',120,'Anwesenheitsliste Verwaltungsrat Stadtentwaesserung.pdf'),('verwaltungsrat-stadtentwaesserung','Marcel Schulz','substitute',130,'Anwesenheitsliste Verwaltungsrat Stadtentwaesserung.pdf'),
  ('rechnungspruefungsausschuss','Harald Brandstädter','member',10,'Anwesenheitsliste Rechnungspruefungsausschuss.pdf'),('rechnungspruefungsausschuss','Raymond Germany','member',20,'Anwesenheitsliste Rechnungspruefungsausschuss.pdf'),('rechnungspruefungsausschuss','Michael Krauss','member',30,'Anwesenheitsliste Rechnungspruefungsausschuss.pdf'),('rechnungspruefungsausschuss','Petra Janson-Peermann','member',40,'Anwesenheitsliste Rechnungspruefungsausschuss.pdf'),('rechnungspruefungsausschuss','Heike Spies','substitute',110,'Anwesenheitsliste Rechnungspruefungsausschuss.pdf'),('rechnungspruefungsausschuss','Patrick Schäfer','substitute',120,'Anwesenheitsliste Rechnungspruefungsausschuss.pdf'),('rechnungspruefungsausschuss','Janina Eispert','substitute',130,'Anwesenheitsliste Rechnungspruefungsausschuss.pdf'),('rechnungspruefungsausschuss','Moritz Behncke','substitute',140,'Anwesenheitsliste Rechnungspruefungsausschuss.pdf'),
  ('sozialausschuss','Moritz Behncke','member',10,'Anwesenheitsliste Sozialausschuss.pdf'),('sozialausschuss','Jörg Harz','member',20,'Anwesenheitsliste Sozialausschuss.pdf'),('sozialausschuss','Anna Raab','member',30,'Anwesenheitsliste Sozialausschuss.pdf'),('sozialausschuss','Brigitte Seidler','member',40,'Anwesenheitsliste Sozialausschuss.pdf'),('sozialausschuss','Luca Ganter','substitute',110,'Anwesenheitsliste Sozialausschuss.pdf'),('sozialausschuss','Christine Kiefaber','substitute',120,'Anwesenheitsliste Sozialausschuss.pdf'),('sozialausschuss','Jaqueline Schröder','substitute',130,'Anwesenheitsliste Sozialausschuss.pdf'),('sozialausschuss','Janina Eispert','substitute',140,'Anwesenheitsliste Sozialausschuss.pdf'),
  ('hospitalausschuss','Patrick Schäfer','member',10,'Anwesenheitsliste Hospitalausschuss.pdf'),('hospitalausschuss','Petra Janson-Peermann','member',20,'Anwesenheitsliste Hospitalausschuss.pdf'),('hospitalausschuss','Michael Krauss','member',30,'Anwesenheitsliste Hospitalausschuss.pdf'),('hospitalausschuss','Harald Ledig','substitute',110,'Anwesenheitsliste Hospitalausschuss.pdf'),('hospitalausschuss','Thorsten Peermann','substitute',120,'Anwesenheitsliste Hospitalausschuss.pdf'),('hospitalausschuss','Marcel Schulz','substitute',130,'Anwesenheitsliste Hospitalausschuss.pdf'),
  ('bauausschuss','Harald Brandstädter','member',10,'Anwesenheitsliste Bauausschuss.pdf'),('bauausschuss','Marcel Schulz','member',20,'Anwesenheitsliste Bauausschuss.pdf'),('bauausschuss','Michael Loos','member',30,'Anwesenheitsliste Bauausschuss.pdf'),('bauausschuss','Reiner Kiefhaber','member',40,'Anwesenheitsliste Bauausschuss.pdf'),('bauausschuss','Anette Diederich','substitute',110,'Anwesenheitsliste Bauausschuss.pdf'),('bauausschuss','Kevin Kneip','substitute',120,'Anwesenheitsliste Bauausschuss.pdf'),('bauausschuss','Robert Gorris','substitute',130,'Anwesenheitsliste Bauausschuss.pdf'),('bauausschuss','Thorsten Peermann','substitute',140,'Anwesenheitsliste Bauausschuss.pdf'),
  ('stadtrechtsausschuss','Anita Anspach-Olfers','member',10,'Anwesenheitsliste Stadtrechtsausschuss.pdf'),('stadtrechtsausschuss','Anna Raab','member',20,'Anwesenheitsliste Stadtrechtsausschuss.pdf'),('stadtrechtsausschuss','Harald Ledig','member',30,'Anwesenheitsliste Stadtrechtsausschuss.pdf'),('stadtrechtsausschuss','Michael Krauss','member',40,'Anwesenheitsliste Stadtrechtsausschuss.pdf'),
  ('sportausschuss','Jörg Harz','member',10,'Anwesenheitsliste Sportausschuss.pdf'),('sportausschuss','Alexander Lenz','member',20,'Anwesenheitsliste Sportausschuss.pdf'),('sportausschuss','Patrick Schäfer','member',30,'Anwesenheitsliste Sportausschuss.pdf'),('sportausschuss','Michael Schmitt','member',40,'Anwesenheitsliste Sportausschuss.pdf'),('sportausschuss','Michael Flesch','substitute',110,'Anwesenheitsliste Sportausschuss.pdf'),('sportausschuss','Luca Ganter','substitute',120,'Anwesenheitsliste Sportausschuss.pdf'),('sportausschuss','Andreas Eichhorn','substitute',130,'Anwesenheitsliste Sportausschuss.pdf'),('sportausschuss','Constantin Rubel','substitute',140,'Anwesenheitsliste Sportausschuss.pdf'),
  ('werkausschuss-stadtbildpflege','Marcel Schulz','member',10,'Anwesenheitsliste Werkausschuss Stadtbildpflege.pdf'),('werkausschuss-stadtbildpflege','Petra Janson-Peermann','member',20,'Anwesenheitsliste Werkausschuss Stadtbildpflege.pdf'),('werkausschuss-stadtbildpflege','Raymond Germany','member',30,'Anwesenheitsliste Werkausschuss Stadtbildpflege.pdf'),('werkausschuss-stadtbildpflege','Michael Krauss','member',40,'Anwesenheitsliste Werkausschuss Stadtbildpflege.pdf'),('werkausschuss-stadtbildpflege','Moritz Behncke','substitute',110,'Anwesenheitsliste Werkausschuss Stadtbildpflege.pdf'),('werkausschuss-stadtbildpflege','Harald Brandstädter','substitute',120,'Anwesenheitsliste Werkausschuss Stadtbildpflege.pdf'),('werkausschuss-stadtbildpflege','Jörg Harz','substitute',130,'Anwesenheitsliste Werkausschuss Stadtbildpflege.pdf'),('werkausschuss-stadtbildpflege','Janina Eispert','substitute',140,'Anwesenheitsliste Werkausschuss Stadtbildpflege.pdf')
on conflict (committee_slug, person_name, role) do update set sort_order = excluded.sort_order, source_file = excluded.source_file;

insert into public.calendar_sources (name, type, url, owner, enabled, notes) values
  ('RIS Kaiserslautern', 'ics', 'https://ris.kaiserslautern.de/buergerinfo/si0040.asp', 'Fraktion', true, 'Öffentlicher RIS-Kalender als Datenquelle für Sitzungstermine. Importlogik wird über Route/Cron schrittweise erweitert.')
on conflict do nothing;
