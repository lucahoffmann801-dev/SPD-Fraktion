alter table public.tasks
  add column if not exists progress integer not null default 0;

alter table public.tasks
  drop constraint if exists tasks_progress_range;

alter table public.tasks
  add constraint tasks_progress_range check (progress >= 0 and progress <= 100);
