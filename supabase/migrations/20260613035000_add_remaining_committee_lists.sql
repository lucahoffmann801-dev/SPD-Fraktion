-- Ergänzung der übrigen sechs hochgeladenen Anwesenheitslisten.
-- Normalisiert zugleich bekannte Schreibvarianten, damit Profilkarten sauber matchen.

update public.committee_memberships set person_name = 'Michael Krauß' where person_name = 'Michael Krauss';
update public.committee_memberships set person_name = 'Petra Janson-Peermann' where person_name = 'Petra Janson Peermann';
update public.members set name = 'Michael Krauß' where name = 'Michael Krauss';
update public.members set name = 'Petra Janson-Peermann' where name = 'Petra Janson Peermann';

insert into public.committees (slug, title, short_ref, notes) values
  ('hufa-personalausschuss', 'Haupt- und Finanzausschuss & Personalausschuss', 'HuFa/PA', 'Seed aus gemeinsamer Anwesenheitsliste HuFa & PA vom 01.06.2026'),
  ('kulturausschuss', 'Kulturausschuss', 'KA', 'Seed aus Anwesenheitsliste Kulturausschuss vom 28.05.2026'),
  ('regionalausschuss', 'Regionalausschuss', 'RA', 'Seed aus Anwesenheitsliste Regionalausschuss'),
  ('jugendhilfeausschuss', 'Jugendhilfeausschuss', 'JHA', 'Seed aus Anwesenheitsliste JHA vom 27.05.2026'),
  ('marktausschuss', 'Marktausschuss', 'MA', 'Seed aus Anwesenheitsliste Marktausschuss'),
  ('umweltausschuss', 'Umweltausschuss', 'UA', 'Seed aus Anwesenheitsliste Umweltausschuss')
on conflict (slug) do update set
  title = excluded.title,
  short_ref = excluded.short_ref,
  notes = excluded.notes,
  updated_at = now();

insert into public.committee_memberships (committee_slug, person_name, role, sort_order, source_file) values
  ('hufa-personalausschuss','Patrick Schäfer','member',10,'Anwesenheitsliste HuFa Personalausschuss 01062026.pdf'),
  ('hufa-personalausschuss','Janina Eispert','member',20,'Anwesenheitsliste HuFa Personalausschuss 01062026.pdf'),
  ('hufa-personalausschuss','Raymond Germany','member',30,'Anwesenheitsliste HuFa Personalausschuss 01062026.pdf'),
  ('hufa-personalausschuss','Michael Krauß','member',40,'Anwesenheitsliste HuFa Personalausschuss 01062026.pdf'),
  ('hufa-personalausschuss','Moritz Behncke','substitute',110,'Anwesenheitsliste HuFa Personalausschuss 01062026.pdf'),
  ('hufa-personalausschuss','Petra Janson-Peermann','substitute',120,'Anwesenheitsliste HuFa Personalausschuss 01062026.pdf'),
  ('hufa-personalausschuss','Jörg Harz','substitute',130,'Anwesenheitsliste HuFa Personalausschuss 01062026.pdf'),
  ('hufa-personalausschuss','Harald Brandstädter','substitute',140,'Anwesenheitsliste HuFa Personalausschuss 01062026.pdf'),

  ('kulturausschuss','Moritz Behncke','member',10,'Anwesenheitsliste Kulturausschuss 28052026.pdf'),
  ('kulturausschuss','Michael Krauß','member',20,'Anwesenheitsliste Kulturausschuss 28052026.pdf'),
  ('kulturausschuss','Ella Schulz','member',30,'Anwesenheitsliste Kulturausschuss 28052026.pdf'),
  ('kulturausschuss','Heike Spies','member',40,'Anwesenheitsliste Kulturausschuss 28052026.pdf'),
  ('kulturausschuss','Ulrike Müller-Ressel','substitute',110,'Anwesenheitsliste Kulturausschuss 28052026.pdf'),
  ('kulturausschuss','Brigitte Seidler','substitute',120,'Anwesenheitsliste Kulturausschuss 28052026.pdf'),
  ('kulturausschuss','Anna Raab','substitute',130,'Anwesenheitsliste Kulturausschuss 28052026.pdf'),
  ('kulturausschuss','Gerda Hoppe','substitute',140,'Anwesenheitsliste Kulturausschuss 28052026.pdf'),

  ('regionalausschuss','Patrick Schäfer','member',10,'Anwesenheitsliste Regionalausschuss.pdf'),
  ('regionalausschuss','Moritz Behncke','member',20,'Anwesenheitsliste Regionalausschuss.pdf'),
  ('regionalausschuss','Janina Eispert','substitute',110,'Anwesenheitsliste Regionalausschuss.pdf'),
  ('regionalausschuss','Jaqueline Schröder','substitute',120,'Anwesenheitsliste Regionalausschuss.pdf'),

  ('jugendhilfeausschuss','Moritz Behncke','member',10,'Anwesenheitsliste JHA 27052026.pdf'),
  ('jugendhilfeausschuss','Janina Eispert','member',20,'Anwesenheitsliste JHA 27052026.pdf'),
  ('jugendhilfeausschuss','Anna Raab','substitute',110,'Anwesenheitsliste JHA 27052026.pdf'),
  ('jugendhilfeausschuss','Marcel Schulz','substitute',120,'Anwesenheitsliste JHA 27052026.pdf'),

  ('marktausschuss','Andreas Rahm','member',10,'Anwesenheitsliste Marktausschuss.pdf'),
  ('marktausschuss','Petra Janson-Peermann','member',20,'Anwesenheitsliste Marktausschuss.pdf'),
  ('marktausschuss','Heike Spies','member',30,'Anwesenheitsliste Marktausschuss.pdf'),
  ('marktausschuss','Reiner Becker','member',40,'Anwesenheitsliste Marktausschuss.pdf'),
  ('marktausschuss','Reiner Kiefhaber','substitute',110,'Anwesenheitsliste Marktausschuss.pdf'),
  ('marktausschuss','Moritz Behncke','substitute',120,'Anwesenheitsliste Marktausschuss.pdf'),
  ('marktausschuss','Anita Anspach-Olfers','substitute',130,'Anwesenheitsliste Marktausschuss.pdf'),
  ('marktausschuss','Marcel Schulz','substitute',140,'Anwesenheitsliste Marktausschuss.pdf'),

  ('umweltausschuss','Jens van Boekel','member',10,'Anwesenheitsliste Umweltausschuss.pdf'),
  ('umweltausschuss','Marcel Schulz','member',20,'Anwesenheitsliste Umweltausschuss.pdf'),
  ('umweltausschuss','Petra Janson-Peermann','member',30,'Anwesenheitsliste Umweltausschuss.pdf'),
  ('umweltausschuss','Heike Spies','member',40,'Anwesenheitsliste Umweltausschuss.pdf'),
  ('umweltausschuss','Luca Ganter','substitute',110,'Anwesenheitsliste Umweltausschuss.pdf'),
  ('umweltausschuss','Michael Loos','substitute',120,'Anwesenheitsliste Umweltausschuss.pdf'),
  ('umweltausschuss','Michael Flesch','substitute',130,'Anwesenheitsliste Umweltausschuss.pdf'),
  ('umweltausschuss','Moritz Behncke','substitute',140,'Anwesenheitsliste Umweltausschuss.pdf')
on conflict (committee_slug, person_name, role) do update set
  sort_order = excluded.sort_order,
  source_file = excluded.source_file;
