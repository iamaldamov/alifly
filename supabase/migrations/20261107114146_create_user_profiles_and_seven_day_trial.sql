create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  age smallint,
  gender text,
  avatar_id text not null default 'sprout',
  trial_started_at timestamptz not null,
  trial_ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_profiles_display_name_length check (char_length(display_name) <= 40),
  constraint user_profiles_age_range check (age is null or age between 13 and 120),
  constraint user_profiles_gender_allowed check (gender is null or gender in ('female', 'male', 'prefer_not_to_say')),
  constraint user_profiles_avatar_allowed check (avatar_id in ('sprout', 'leaf', 'moon', 'star', 'book', 'palm')),
  constraint user_profiles_trial_order check (trial_ends_at > trial_started_at)
);

alter table public.user_profiles enable row level security;
revoke all on table public.user_profiles from anon, authenticated;
grant select on table public.user_profiles to authenticated;
grant update (display_name, age, gender, avatar_id) on table public.user_profiles to authenticated;

create policy "Users can read their own ALIFLY profile"
on public.user_profiles for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can update their own ALIFLY profile"
on public.user_profiles for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create or replace function public.handle_new_alifly_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.user_profiles (user_id, trial_started_at, trial_ends_at)
  values (new.id, new.created_at, new.created_at + interval '7 days')
  on conflict (user_id) do nothing;
  return new;
end;
$$;
revoke all on function public.handle_new_alifly_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_alifly_profile on auth.users;
create trigger on_auth_user_created_alifly_profile
after insert on auth.users for each row execute function public.handle_new_alifly_user();

create or replace function public.set_alifly_profile_updated_at()
returns trigger language plpgsql set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists set_alifly_profile_updated_at on public.user_profiles;
create trigger set_alifly_profile_updated_at
before update on public.user_profiles for each row execute function public.set_alifly_profile_updated_at();

insert into public.user_profiles (user_id, trial_started_at, trial_ends_at)
select id, created_at, created_at + interval '7 days'
from auth.users
on conflict (user_id) do nothing;
