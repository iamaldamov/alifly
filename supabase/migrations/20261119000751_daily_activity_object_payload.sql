alter table public.user_progress
  alter column daily_activity set default '{"date":"","lessonIds":[]}'::jsonb;

alter table public.user_progress
  drop constraint if exists user_progress_daily_activity_check;

alter table public.user_progress
  add constraint user_progress_daily_activity_is_object
  check (
    jsonb_typeof(daily_activity) = 'object'
    and jsonb_typeof(daily_activity -> 'date') = 'string'
    and jsonb_typeof(daily_activity -> 'lessonIds') = 'array'
  );
