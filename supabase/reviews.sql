drop table if exists public.reviews cascade;

create table public.reviews (
  id          bigint generated always as identity primary key,
  swap_id     bigint references public.swap_requests(id) on delete cascade,
  reviewer_id uuid   not null references public.profiles(id) on delete cascade,
  reviewee_id uuid   not null references public.profiles(id) on delete cascade,
  rating      int    not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz not null default now(),
  -- one review per person, per swap
  unique (swap_id, reviewer_id)
);

create index reviews_reviewee_idx on public.reviews (reviewee_id);

alter table public.reviews enable row level security;

create policy "Reviews are readable by signed-in users"
  on public.reviews
  for select
  to authenticated
  using (true);

create policy "Users can review their finished swaps"
  on public.reviews
  for insert
  to authenticated
  with check (
    auth.uid() = reviewer_id
    and exists (
      select 1
      from public.swap_requests s
      where s.id = swap_id
        and s.status = 'Done'
        and (
          (s.requester_id = auth.uid() and s.recipient_id = reviewee_id)
          or
          (s.recipient_id = auth.uid() and s.requester_id = reviewee_id)
        )
    )
  );

create or replace function public.refresh_user_rating()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target uuid := coalesce(new.reviewee_id, old.reviewee_id);
begin
  update public.profiles
  set rating = coalesce((
    select round(avg(rating)::numeric, 1)
    from public.reviews
    where reviewee_id = target
  ), 0)
  where id = target;
  return null;
end;
$$;

drop trigger if exists reviews_refresh_rating on public.reviews;

create trigger reviews_refresh_rating
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_user_rating();