alter table public.user_progress
  add column if not exists daily_goal smallint not null default 1
  check (daily_goal between 1 and 3);

alter table public.user_progress
  add column if not exists daily_activity jsonb not null default '[]'::jsonb
  check (jsonb_typeof(daily_activity) = 'array');

revoke all privileges on table public.user_progress from anon;
revoke all privileges on table public.user_progress from authenticated;
grant select, insert, update on table public.user_progress to authenticated;
