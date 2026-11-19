alter table public.user_profiles
  drop constraint if exists user_profiles_avatar_allowed;

update public.user_profiles
set avatar_id = 'duck'
where avatar_id = 'sprout';

alter table public.user_profiles
  alter column avatar_id set default 'duck';

alter table public.user_profiles
  add constraint user_profiles_avatar_allowed
  check (avatar_id = any (array['duck','owl','turtle','fox','cat','panda']::text[]));

revoke all privileges on table public.user_profiles from anon;
revoke all privileges on table public.user_profiles from authenticated;
grant select, update on table public.user_profiles to authenticated;
