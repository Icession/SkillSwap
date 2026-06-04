-- ============================================================================
-- SkillSwap — database schema
-- Run this first in your Supabase project's SQL Editor, then run migration.sql.
-- Safe to re-run: tables use "if not exists" and policies are dropped first.
-- ============================================================================

-- ---------- PROFILES ----------
create table if not exists profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  first_name    text not null,
  last_name     text not null,
  location      text,
  role          text default 'Member',
  bio           text,
  initials      text,
  avatar_color  text default '#298C6E',
  hours_per_week int,
  created_at    timestamptz default now()
);

-- ---------- SKILLS (reference list) ----------
create table if not exists skills (
  id       bigint generated always as identity primary key,
  name     text not null unique,
  category text
);

-- ---------- USER_SKILLS (normalized skill links) ----------
create table if not exists user_skills (
  id       bigint generated always as identity primary key,
  user_id  uuid references profiles (id) on delete cascade,
  skill_id bigint references skills (id) on delete cascade,
  kind     text check (kind in ('offer', 'want')),
  level    text
);

-- ---------- AVAILABILITY_SLOTS ----------
create table if not exists availability_slots (
  id         bigint generated always as identity primary key,
  user_id    uuid references profiles (id) on delete cascade,
  day        text,
  start_time text,
  end_time   text
);

-- ---------- SWAP_REQUESTS ----------
create table if not exists swap_requests (
  id           bigint generated always as identity primary key,
  requester_id uuid references profiles (id) on delete cascade not null,
  recipient_id uuid references profiles (id) on delete cascade not null,
  offer_skill  text,
  want_skill   text,
  status       text default 'Pending',
  created_at   timestamptz default now()
);

-- ---------- MESSAGES ----------
create table if not exists messages (
  id         bigint generated always as identity primary key,
  swap_id    bigint references swap_requests (id) on delete cascade not null,
  sender_id  uuid references profiles (id) on delete cascade not null,
  body       text not null,
  read       boolean default false,
  created_at timestamptz default now()
);

-- ---------- REVIEWS ----------
create table if not exists reviews (
  id          bigint generated always as identity primary key,
  swap_id     bigint references swap_requests (id) on delete cascade,
  reviewer_id uuid references profiles (id) on delete cascade,
  reviewee_id uuid references profiles (id) on delete cascade,
  rating      int check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz default now()
);

-- ============================================================================
-- ROW-LEVEL SECURITY
-- ============================================================================
alter table profiles           enable row level security;
alter table skills             enable row level security;
alter table user_skills        enable row level security;
alter table availability_slots enable row level security;
alter table swap_requests      enable row level security;
alter table messages           enable row level security;
alter table reviews            enable row level security;

-- ---------- PROFILES: readable by any signed-in user; writable only by owner
drop policy if exists "Profiles are viewable by authenticated users" on profiles;
create policy "Profiles are viewable by authenticated users"
  on profiles for select to authenticated using (true);

drop policy if exists "Users can insert their own profile" on profiles;
create policy "Users can insert their own profile"
  on profiles for insert to authenticated with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on profiles;
create policy "Users can update their own profile"
  on profiles for update to authenticated using (auth.uid() = id);

-- ---------- SKILLS: readable by all signed-in users
drop policy if exists "Skills are viewable by authenticated users" on skills;
create policy "Skills are viewable by authenticated users"
  on skills for select to authenticated using (true);

-- ---------- USER_SKILLS: readable by all; managed by owner
drop policy if exists "User skills are viewable by authenticated users" on user_skills;
create policy "User skills are viewable by authenticated users"
  on user_skills for select to authenticated using (true);

drop policy if exists "Users manage their own user_skills" on user_skills;
create policy "Users manage their own user_skills"
  on user_skills for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- AVAILABILITY: readable by all; managed by owner
drop policy if exists "Availability is viewable by authenticated users" on availability_slots;
create policy "Availability is viewable by authenticated users"
  on availability_slots for select to authenticated using (true);

drop policy if exists "Users manage their own availability" on availability_slots;
create policy "Users manage their own availability"
  on availability_slots for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- SWAP_REQUESTS: only the two participants
drop policy if exists "Participants can view their swaps" on swap_requests;
create policy "Participants can view their swaps"
  on swap_requests for select to authenticated
  using (auth.uid() = requester_id or auth.uid() = recipient_id);

drop policy if exists "Users can create swaps they request" on swap_requests;
create policy "Users can create swaps they request"
  on swap_requests for insert to authenticated
  with check (auth.uid() = requester_id);

drop policy if exists "Participants can update their swaps" on swap_requests;
create policy "Participants can update their swaps"
  on swap_requests for update to authenticated
  using (auth.uid() = requester_id or auth.uid() = recipient_id);

-- ---------- MESSAGES: only participants of the linked swap
drop policy if exists "Participants can view swap messages" on messages;
create policy "Participants can view swap messages"
  on messages for select to authenticated
  using (exists (
    select 1 from swap_requests s
    where s.id = messages.swap_id
      and (auth.uid() = s.requester_id or auth.uid() = s.recipient_id)
  ));

drop policy if exists "Participants can send messages" on messages;
create policy "Participants can send messages"
  on messages for insert to authenticated
  with check (
    auth.uid() = sender_id and exists (
      select 1 from swap_requests s
      where s.id = messages.swap_id
        and (auth.uid() = s.requester_id or auth.uid() = s.recipient_id)
    )
  );

drop policy if exists "Participants can update message read state" on messages;
create policy "Participants can update message read state"
  on messages for update to authenticated
  using (exists (
    select 1 from swap_requests s
    where s.id = messages.swap_id
      and (auth.uid() = s.requester_id or auth.uid() = s.recipient_id)
  ));

drop policy if exists "Reviews are viewable by authenticated users" on reviews;
create policy "Reviews are viewable by authenticated users"
  on reviews for select to authenticated using (true);

drop policy if exists "Users can write reviews they author" on reviews;
create policy "Users can write reviews they author"
  on reviews for insert to authenticated with check (auth.uid() = reviewer_id);