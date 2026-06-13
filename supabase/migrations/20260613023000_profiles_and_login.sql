create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  full_name text not null,
  display_name text not null,
  role text not null,
  board_role text,
  portal_role text not null default 'ratsmitglied',
  is_council_member boolean not null default true,
  is_staff boolean not null default false,
  email text,
  phone text,
  committees text,
  bio text,
  permissions text[] default array['termine','aufgaben','dokumente'],
  avatar_initials text not null,
  accent text default 'red',
  sort_order integer not null default 100,
  login_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_sort_order_idx on public.profiles(sort_order);
create index if not exists profiles_portal_role_idx on public.profiles(portal_role);

alter table public.profiles enable row level security;

drop policy if exists "prototype_read_profiles" on public.profiles;
create policy "prototype_read_profiles" on public.profiles for select using (true);
drop policy if exists "prototype_write_profiles" on public.profiles;
create policy "prototype_write_profiles" on public.profiles for all using (true) with check (true);

insert into public.profiles (slug, full_name, display_name, role, board_role, portal_role, is_council_member, is_staff, bio, permissions, avatar_initials, accent, sort_order, login_enabled) values
  ('luca-hoffmann', 'Luca Hoffmann', 'Luca', 'Fraktionssekretär', null, 'fraktionssekretariat', false, true, 'Fraktionssekretär / Organisation, Termine, Anträge, Social Media und interne Koordination.', array['termine','aufgaben','dokumente','kalender','profile','admin'], 'LH', 'red', 5, true),
  ('patrick-schaefer', 'Patrick Schäfer', 'Patrick', 'Fraktionsvorsitzender', 'Vorsitzender', 'fraktionsvorsitz', true, false, 'Fraktionsvorsitzender der SPD-Stadtratsfraktion Kaiserslautern.', array['termine','aufgaben','dokumente','kalender','admin-lite'], 'PS', 'red', 10, true),
  ('janina-eispert', 'Janina Eispert', 'Janina', 'Stellvertretende Vorsitzende', 'Stellvertretende Vorsitzende', 'stellvertretung', true, false, 'Mitglied des Fraktionsvorstands und Ratsmitglied.', array['termine','aufgaben','dokumente','kalender'], 'JE', 'pink', 20, true),
  ('harald-brandstaedter', 'Harald Brandstädter', 'Harald', 'Stellvertretender Vorsitzender', 'Stellvertretender Vorsitzender', 'stellvertretung', true, false, 'Mitglied des Fraktionsvorstands und Ratsmitglied.', array['termine','aufgaben','dokumente','kalender'], 'HB', 'blue', 30, true),
  ('andreas-rahm', 'Andreas Rahm', 'Andreas', 'Fraktionsmitglied', null, 'ratsmitglied', true, false, 'Ratsmitglied der SPD-Fraktion Kaiserslautern.', array['termine','aufgaben','dokumente'], 'AR', 'slate', 40, true),
  ('raymond-germany', 'Raymond Germany', 'Raymond', 'Fraktionsmitglied', null, 'ratsmitglied', true, false, 'Ratsmitglied der SPD-Fraktion Kaiserslautern.', array['termine','aufgaben','dokumente'], 'RG', 'violet', 50, true),
  ('michael-krauss', 'Michael Krauß', 'Michael', 'Fraktionsmitglied', null, 'ratsmitglied', true, false, 'Ratsmitglied der SPD-Fraktion Kaiserslautern.', array['termine','aufgaben','dokumente'], 'MK', 'orange', 60, true),
  ('anna-raab', 'Anna Raab', 'Anna', 'Fraktionsmitglied', null, 'ratsmitglied', true, false, 'Ratsmitglied der SPD-Fraktion Kaiserslautern.', array['termine','aufgaben','dokumente'], 'AR', 'rose', 70, true),
  ('heike-spies', 'Heike Spies', 'Heike', 'Fraktionsmitglied', null, 'ratsmitglied', true, false, 'Ratsmitglied der SPD-Fraktion Kaiserslautern.', array['termine','aufgaben','dokumente'], 'HS', 'green', 80, true),
  ('petra-janson-peermann', 'Petra Janson-Peermann', 'Petra', 'Fraktionsmitglied', null, 'ratsmitglied', true, false, 'Ratsmitglied der SPD-Fraktion Kaiserslautern.', array['termine','aufgaben','dokumente'], 'PJ', 'teal', 90, true),
  ('moritz-behncke', 'Moritz Behncke', 'Moritz', 'Fraktionsmitglied', null, 'ratsmitglied', true, false, 'Ratsmitglied der SPD-Fraktion Kaiserslautern.', array['termine','aufgaben','dokumente'], 'MB', 'indigo', 100, true),
  ('joerg-harz', 'Jörg Harz', 'Jörg', 'Fraktionsmitglied', null, 'ratsmitglied', true, false, 'Ratsmitglied der SPD-Fraktion Kaiserslautern.', array['termine','aufgaben','dokumente'], 'JH', 'amber', 110, true),
  ('marcel-schulz', 'Marcel Schulz', 'Marcel', 'Fraktionsmitglied', null, 'ratsmitglied', true, false, 'Ratsmitglied der SPD-Fraktion Kaiserslautern.', array['termine','aufgaben','dokumente'], 'MS', 'cyan', 120, true)
on conflict (slug) do update set
  full_name = excluded.full_name,
  display_name = excluded.display_name,
  role = excluded.role,
  board_role = excluded.board_role,
  portal_role = excluded.portal_role,
  is_council_member = excluded.is_council_member,
  is_staff = excluded.is_staff,
  bio = excluded.bio,
  permissions = excluded.permissions,
  avatar_initials = excluded.avatar_initials,
  accent = excluded.accent,
  sort_order = excluded.sort_order,
  login_enabled = excluded.login_enabled,
  updated_at = now();
