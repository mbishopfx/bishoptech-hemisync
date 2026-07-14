-- Restore the profile usage counter expected by Sync without coupling Studio
-- project creation to the retired social profile serializer.

alter table public.profiles
  add column if not exists generation_count integer not null default 0;

create or replace function public.increment_generation_count(user_uuid uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  next_count integer;
begin
  update public.profiles
  set generation_count = generation_count + 1,
      updated_at = now()
  where id = user_uuid
  returning generation_count into next_count;

  return coalesce(next_count, 0);
end;
$$;

revoke all on function public.increment_generation_count(uuid) from public;
grant execute on function public.increment_generation_count(uuid) to authenticated;
grant execute on function public.increment_generation_count(uuid) to service_role;
