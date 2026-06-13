insert into public.members (name, role, notes)
select seed.name, seed.role, seed.notes
from (values
  ('Patrick Schäfer', 'Fraktionsvorsitzender', 'Fraktionsvorsitzender der SPD-Stadtratsfraktion Kaiserslautern.'),
  ('Janina Eispert', 'Stellvertretende Vorsitzende', 'Mitglied des Fraktionsvorstands und Ratsmitglied.'),
  ('Harald Brandstädter', 'Stellvertretender Vorsitzender', 'Mitglied des Fraktionsvorstands und Ratsmitglied.'),
  ('Andreas Rahm', 'Fraktionsmitglied', 'Ratsmitglied der SPD-Fraktion Kaiserslautern.'),
  ('Raymond Germany', 'Fraktionsmitglied', 'Ratsmitglied der SPD-Fraktion Kaiserslautern.'),
  ('Michael Krauß', 'Fraktionsmitglied', 'Ratsmitglied der SPD-Fraktion Kaiserslautern.'),
  ('Anna Raab', 'Fraktionsmitglied', 'Ratsmitglied der SPD-Fraktion Kaiserslautern.'),
  ('Heike Spies', 'Fraktionsmitglied', 'Ratsmitglied der SPD-Fraktion Kaiserslautern.'),
  ('Petra Janson-Peermann', 'Fraktionsmitglied', 'Ratsmitglied der SPD-Fraktion Kaiserslautern.'),
  ('Moritz Behncke', 'Fraktionsmitglied', 'Ratsmitglied der SPD-Fraktion Kaiserslautern.'),
  ('Jörg Harz', 'Fraktionsmitglied', 'Ratsmitglied der SPD-Fraktion Kaiserslautern.'),
  ('Marcel Schulz', 'Fraktionsmitglied', 'Ratsmitglied der SPD-Fraktion Kaiserslautern.')
) as seed(name, role, notes)
where not exists (
  select 1 from public.members existing where existing.name = seed.name
);
