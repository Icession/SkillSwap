-- ============================================================================
-- SkillSwap — secure account deletion
-- Run this in your Supabase SQL Editor (re-running replaces the old version).
--
-- Runs with definer privileges but only ever deletes the CALLER's own account
-- (auth.uid()). It cleans up the tables the app actually uses, then removes the
-- login itself. The frontend calls it with supabase.rpc('delete_user').
-- ============================================================================
create or replace function public.delete_user()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  -- Messages in any swap the user is part of
  delete from public.messages
  where swap_id in (
    select id from public.swap_requests
    where requester_id = uid or recipient_id = uid
  );

  -- The user's swap requests
  delete from public.swap_requests
  where requester_id = uid or recipient_id = uid;

  -- The profile, then the auth (login) account itself
  delete from public.profiles where id = uid;
  delete from auth.users where id = uid;
end;
$$;

grant execute on function public.delete_user() to authenticated;