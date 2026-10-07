create table if not exists public.customer_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 120),
  phone text check (phone is null or char_length(phone) <= 30),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customer_profiles enable row level security;
alter table public."UsersProfile" enable row level security;
alter table public.usersettings enable row level security;

drop policy if exists "customers read own profile" on public.customer_profiles;
drop policy if exists "customers insert own profile" on public.customer_profiles;
drop policy if exists "customers update own profile" on public.customer_profiles;
create policy "customers read own profile" on public.customer_profiles
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "customers insert own profile" on public.customer_profiles
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "customers update own profile" on public.customer_profiles
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "drivers read own profile" on public."UsersProfile";
drop policy if exists "drivers insert own profile" on public."UsersProfile";
drop policy if exists "drivers update own profile" on public."UsersProfile";
create policy "drivers read own profile" on public."UsersProfile"
  for select to authenticated using ((select auth.uid()) = owner_id);
create policy "drivers insert own profile" on public."UsersProfile"
  for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy "drivers update own profile" on public."UsersProfile"
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists "drivers read own settings" on public.usersettings;
drop policy if exists "drivers insert own settings" on public.usersettings;
drop policy if exists "drivers update own settings" on public.usersettings;
create policy "drivers read own settings" on public.usersettings
  for select to authenticated using ((select auth.uid()) = owner_id);
create policy "drivers insert own settings" on public.usersettings
  for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy "drivers update own settings" on public.usersettings
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

revoke all on public.customer_profiles from anon;
revoke all on public."UsersProfile" from anon;
revoke all on public.usersettings from anon;
grant select, insert, update on public.customer_profiles to authenticated;
grant select, insert, update on public."UsersProfile" to authenticated;
grant select, insert, update on public.usersettings to authenticated;

create or replace function public.request_trip(
  p_customer_id text,
  p_owner_id uuid,
  p_name text,
  p_pickup text,
  p_destination text,
  p_passenger_phone text default null,
  p_preferred_time text default null
)
returns table (trip_id bigint, created_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_trip public."Trips";
begin
  if length(trim(p_customer_id)) < 32 then
    raise exception 'Invalid customer identifier';
  end if;
  if auth.uid() is not null and p_customer_id <> auth.uid()::text then
    raise exception 'Authenticated customer identifier does not match the session';
  end if;
  if nullif(trim(p_name), '') is null
    or nullif(trim(p_pickup), '') is null
    or nullif(trim(p_destination), '') is null then
    raise exception 'Name, pickup and destination are required';
  end if;
  if not exists (
    select 1 from public."UsersProfile"
    where owner_id = p_owner_id and available is true
  ) then
    raise exception 'Driver is not available';
  end if;

  insert into public."Trips" (
    owner_id, customer_id, name, pickup, destination,
    passenger_phone, preferred_time, done
  ) values (
    p_owner_id, p_customer_id, trim(p_name), trim(p_pickup), trim(p_destination),
    nullif(trim(p_passenger_phone), ''), nullif(trim(p_preferred_time), ''), 'pending'
  ) returning * into inserted_trip;

  return query select inserted_trip.id, inserted_trip.created_at;
end;
$$;

create or replace function public.get_customer_last_trip(p_customer_id text)
returns table (
  trip_id bigint,
  done text,
  created_at timestamptz,
  owner_id uuid,
  pickup text,
  destination text,
  preferred_time text,
  price double precision,
  driver_name text,
  driver_available boolean
)
language plpgsql
security definer
set search_path = ''
stable
as $$
begin
  if auth.uid() is not null and p_customer_id <> auth.uid()::text then
    raise exception 'Authenticated customer identifier does not match the session';
  end if;

  return query
  select
    t.id, t.done, t.created_at, t.owner_id, t.pickup, t.destination,
    t.preferred_time, t.price::double precision,
    coalesce(p."displayName", p.username, 'Conductor'), p.available
  from public."Trips" t
  join public."UsersProfile" p on p.owner_id = t.owner_id
  where t.customer_id = p_customer_id and length(trim(p_customer_id)) >= 32
  order by t.created_at desc
  limit 1;
end;
$$;

revoke all on function public.request_trip(text, uuid, text, text, text, text, text) from public;
revoke all on function public.get_customer_last_trip(text) from public;
grant execute on function public.request_trip(text, uuid, text, text, text, text, text) to anon, authenticated;
grant execute on function public.get_customer_last_trip(text) to anon, authenticated;
