insert into public.tasks (title, description, assignee, due_date, status, priority, event_id, case_id)
select
  'Planung nächstes Zukunftsforum - Zukunft unserer Schulgebäude',
  '[Patrick→Luca] Probeauftrag von Patrick an Luca zur Planung des nächsten Zukunftsforums zum Thema Zukunft unserer Schulgebäude.',
  'Luca Hoffmann',
  null,
  'offen',
  'hoch',
  null,
  null
where not exists (
  select 1 from public.tasks
  where title = 'Planung nächstes Zukunftsforum - Zukunft unserer Schulgebäude'
    and assignee = 'Luca Hoffmann'
);
