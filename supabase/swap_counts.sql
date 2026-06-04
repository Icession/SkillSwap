-- ============================================================
-- SkillSwap — keep profiles.swaps = number of completed ('Done') swaps
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor →
-- New query → paste → Run).
--
-- Adds a trigger that recomputes the count for BOTH participants
-- whenever a swap is created, changed, or deleted, plus a one-time
-- backfill so swaps that are already 'Done' count immediately.
-- Safe to run more than once.
-- ============================================================

create or replace function public.refresh_swap_counts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  a uuid := coalesce(new.requester_id, old.requester_id);
  b uuid := coalesce(new.recipient_id, old.recipient_id);
begin
  update public.profiles p
  set swaps = (
    select count(*)
    from public.swap_requests s
    where s.status = 'Done'
      and (s.requester_id = p.id or s.recipient_id = p.id)
  )
  where p.id in (a, b);
  return null;
end;
$$;

drop trigger if exists swaps_refresh_counts on public.swap_requests;

create trigger swaps_refresh_counts
  after insert or update or delete on public.swap_requests
  for each row execute function public.refresh_swap_counts();

-- One-time backfill for swaps that are already 'Done'.
update public.profiles p
set swaps = (
  select count(*)
  from public.swap_requests s
  where s.status = 'Done'
    and (s.requester_id = p.id or s.recipient_id = p.id)
);