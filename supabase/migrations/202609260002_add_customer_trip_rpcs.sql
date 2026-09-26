alter table public."Trips"
  alter column customer_id type text using customer_id::text,
  alter column passenger_phone type text using passenger_phone::text,
  alter column preferred_time type text using preferred_time::text;

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

  if nullif(trim(p_name), '') is null
    or nullif(trim(p_pickup), '') is null
    or nullif(trim(p_destination), '') is null then
    raise exception 'Name, pickup and destination are required';
  end if;

  if not exists (
    select 1
    from public."UsersProfile"
    where owner_id = p_owner_id and available is true
  ) then
    raise exception 'Driver is not available';
  end if;

  insert into public."Trips" (
    owner_id,
    customer_id,
    name,
    pickup,
    destination,
    passenger_phone,
    preferred_time,
    done
  ) values (
    p_owner_id,
    p_customer_id,
    trim(p_name),
    trim(p_pickup),
    trim(p_destination),
    nullif(trim(p_passenger_phone), ''),
    nullif(trim(p_preferred_time), ''),
    'pending'
  )
  returning * into inserted_trip;

  return query select inserted_trip.id, inserted_trip.created_at;
end;
$$;

drop function if exists public.get_customer_last_trip(text);

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
language sql
security definer
set search_path = ''
stable
as $$
  select
    t.id,
    t.done,
    t.created_at,
    t.owner_id,
    t.pickup,
    t.destination,
    t.preferred_time,
    t.price::double precision,
    coalesce(p."displayName", p.username, 'Conductor') as driver_name,
    p.available as driver_available
  from public."Trips" t
  join public."UsersProfile" p on p.owner_id = t.owner_id
  where t.customer_id = p_customer_id
    and length(trim(p_customer_id)) >= 32
  order by t.created_at desc
  limit 1;
$$;

revoke all on function public.request_trip(text, uuid, text, text, text, text, text) from public;
revoke all on function public.get_customer_last_trip(text) from public;

grant execute on function public.request_trip(text, uuid, text, text, text, text, text) to anon, authenticated;
grant execute on function public.get_customer_last_trip(text) to anon, authenticated;
