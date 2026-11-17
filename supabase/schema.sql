-- Utsav India — Supabase schema
-- Run this entire file in the Supabase SQL Editor (Dashboard -> SQL -> New query).
-- It is safe to re-run.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  interests text[] not null default '{}',
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  category text not null default 'other',
  city text not null,
  venue_name text not null,
  venue_address text not null default '',
  latitude double precision not null default 22.5,
  longitude double precision not null default 79,
  starts_at timestamptz not null,
  ends_at timestamptz,
  image_url text,
  registration_url text not null default '',
  organizer_name text not null default '',
  is_free boolean not null default true,
  price numeric not null default 0,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  submitted_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

create table if not exists public.favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  minutes_before integer not null default 60,
  created_at timestamptz not null default now()
);

create index if not exists events_status_starts_idx on public.events (status, starts_at);
create index if not exists events_city_idx on public.events (city);
create index if not exists events_submitted_by_idx on public.events (submitted_by);
create index if not exists reminders_user_idx on public.reminders (user_id);

-- ---------------------------------------------------------------------------
-- Auto-create a profile when someone signs up
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, interests)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce(
      (
        select array_agg(value)
        from jsonb_array_elements_text(
          coalesce(new.raw_user_meta_data -> 'interests', '[]'::jsonb)
        )
      ),
      '{}'::text[]
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.favorites enable row level security;
alter table public.reminders enable row level security;

-- Profiles: users see and edit only their own row.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Events: approved events are public; owners and admins can see their own
-- pending/rejected submissions. Anyone can create a pending event. Only
-- admins can change the status.
drop policy if exists "events_select" on public.events;
create policy "events_select" on public.events
  for select using (
    status = 'approved'
    or auth.uid() = submitted_by
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin
    )
  );

drop policy if exists "events_insert_pending" on public.events;
create policy "events_insert_pending" on public.events
  for insert to anon, authenticated
  with check (
    status = 'pending'
    and (submitted_by is null or submitted_by = auth.uid())
  );

drop policy if exists "events_admin_update" on public.events;
create policy "events_admin_update" on public.events
  for update to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin
    )
  )
  with check (status in ('pending', 'approved', 'rejected'));

drop policy if exists "events_admin_delete" on public.events;
create policy "events_admin_delete" on public.events
  for delete to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin
    )
  );

-- Favourites and reminders are private to their owner.
drop policy if exists "favorites_all_own" on public.favorites;
create policy "favorites_all_own" on public.favorites
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "reminders_all_own" on public.reminders;
create policy "reminders_all_own" on public.reminders
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Admin helper: run this in the SQL editor with a real user's email.
-- e.g. select public.set_user_admin('you@example.com', true);
-- ---------------------------------------------------------------------------

create or replace function public.set_user_admin(user_email text, make_admin boolean default true)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set is_admin = make_admin
  where lower(email) = lower(user_email);
  if not found then
    raise exception 'No profile found for %', user_email;
  end if;
end;
$$;

revoke all on function public.set_user_admin(text, boolean) from public;
revoke all on function public.set_user_admin(text, boolean) from anon;
revoke all on function public.set_user_admin(text, boolean) from authenticated;
