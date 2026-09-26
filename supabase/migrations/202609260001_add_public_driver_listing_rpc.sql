-- Public, read-only projection used by the anonymous customer view.
-- SECURITY DEFINER is intentional: direct access to UsersProfile can be
-- restricted independently while this function exposes only safe fields.
create or replace function public.list_available_drivers()
returns table (
  id bigint,
  owner_id uuid,
  username text,
  "displayName" text,
  "carModel" text,
  "carPlate" text,
  "pictureUrl" text,
  available boolean,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    p.id,
    p.owner_id,
    p.username,
    p."displayName",
    p."carModel",
    p."carPlate",
    p."pictureUrl",
    coalesce(p.available, false) as available,
    p.created_at
  from public."UsersProfile" as p
  where coalesce(p.available, false) = true
  order by p.created_at desc;
$$;

revoke execute on function public.list_available_drivers() from public;
revoke execute on function public.list_available_drivers() from anon;
revoke execute on function public.list_available_drivers() from authenticated;
grant execute on function public.list_available_drivers() to anon, authenticated;
