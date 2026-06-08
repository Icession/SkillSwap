# SkillSwap

> Trade what you know for what you need — a peer-to-peer platform where people exchange skills directly, with no money involved.

**Live demo:** https://skill-swap-kl.vercel.app

**Try it without signing up** — log in with:
- **Email:** demo1@skillswap.com
- **Password:** demo123

![SkillSwap](docs/screenshot.png)

---

## Overview

SkillSwap is a full-stack web application that lets people teach what they know in exchange for learning what they don't — no payments, just a fair trade of time and knowledge. A user lists the skills they can offer and the ones they want to learn, discovers complementary members, sends a swap request, arranges the exchange over chat, and leaves a review once it's done.

It's built as a complete, production-style product: real authentication, a relational PostgreSQL database secured with row-level security, live updates, and the full lifecycle of a two-sided marketplace — not a tutorial CRUD app.

---

## Why I built it

**The problem.** Learning a new skill almost always costs money — courses, tutors, subscriptions — yet nearly everyone already has a skill they could teach someone else. There's no simple, money-free way for peers to exchange knowledge directly. A design student who wants to learn React and a developer who wants to learn Figma are a perfect match, but no obvious place exists to connect them.

**The idea.** SkillSwap removes money from the equation entirely. Your currency is what you already know. You offer a skill, you receive a skill — a barter model for learning.

**Why I built it as a developer.** I wanted to ship a genuinely complete full-stack product rather than another isolated demo: design a real relational schema, secure it properly, handle live multi-user state, and own the whole path from database to deployment. SkillSwap was the vehicle for working through the hard, real-world parts — security, realtime, and data integrity — end to end.

---

## Case study

### The challenge

Build a two-sided marketplace as a **solo developer**, with a real backend, that is **safe to put on the public internet** — where the database is reachable directly from the browser and the only thing standing between a user and everyone else's data is how well the rules are written.

### Approach

I worked MVP-first: build the core exchange loop end to end, get it working with real users, then layer on messaging, reviews, and realtime. I chose a managed backend (Supabase) so I could focus on data modeling, security, and product logic instead of standing up servers — while still working directly in PostgreSQL with full control over schema, policies, and functions.

### Key decisions (and the reasoning)

- **Supabase over a hand-rolled backend.** It gave me managed Postgres, authentication, row-level security, and realtime in one place. The trade-off — the database is queried directly from the client — forced me to treat security as a first-class concern rather than an afterthought, which is exactly the skill I wanted to build.
- **Row-Level Security as the security boundary.** Because the public anon key ships in the frontend, anyone can call the database directly. RLS policies are therefore the *real* access control: users can only read the directory, edit their own profile, message on swaps they belong to, and review swaps they actually completed.
- **A conversation is a swap, not a person.** Messages are scoped to a specific exchange, so each chat carries its own context (which skills, which status). This mirrors how marketplaces thread messages per transaction and keeps separate deals from blurring together.
- **Server-computed trust signals.** Ratings and completed-swap counts are never set by the client — they're recalculated by database triggers, so the numbers shown on a profile can't be forged from the browser.

### Engineering challenges & solutions

- **Realtime updates under row-level security.** Live sync initially only worked one-way. Realtime respects RLS, and for updates/deletes Postgres only replicates the primary key by default — so it couldn't tell that the *other* participant was allowed to see a status change. The fix was enabling the tables on the realtime publication and setting `REPLICA IDENTITY FULL` so Realtime had enough of the row to evaluate who may receive each event.
- **Deleting an account from the browser.** A client can't remove a user from `auth.users`. I wrote a `SECURITY DEFINER` PostgreSQL function that runs with elevated privileges but is scoped strictly to `auth.uid()`, so a user can delete only their own account and data — and hardened it with `search_path = ''` to prevent injection.
- **Keeping ratings honest.** Each profile's average rating and completed-swap count are maintained by triggers that recompute from source data on every relevant change, for both participants — accurate everywhere (feed and profile) without trusting client input.
- **Authentication & signup debugging.** Worked through real auth issues — RLS violations on profile creation and email-rate-limit errors — tracing them to email-confirmation settings and policy ordering, which taught me how Supabase Auth and RLS interact in practice.

### Outcome

A complete, deployed application that demonstrates full-stack capability: relational data modeling, an enforced security model, real-time multi-user state, secure server-side operations, and a polished front end — all shipped to production.

---

## Features

- **Authentication** — email/password sign up & login with protected routes
- **Profiles** — offered and wanted skills, each with its own proficiency level, plus bio, availability, hours per week, and a custom avatar color
- **Discover feed** — browse members with live search and filters for category, level, and availability
- **Swap requests** — send, accept, decline, and complete exchanges; completed-swap counts update automatically
- **Messaging** — a conversation thread scoped to each swap, with unread badges
- **Reviews & ratings** — review the other person after a completed swap; average ratings recalculate automatically
- **Realtime** — swaps, messages, profiles, and reviews sync live across sessions, no refresh needed
- **Dashboard** — your active / pending / completed activity at a glance
- **Settings** — edit profile and skills, change password, delete account
- **Account deletion** — a secure database function removes only the signed-in user's own data
- **Row-Level Security** — database policies enforce that users can only access what they're permitted to

---

## Tech stack & why

- **React 19 + Vite** — fast, modern SPA tooling with instant dev feedback
- **React Router** — client-side routing with protected routes
- **Supabase (PostgreSQL, Auth, RLS, Realtime)** — a real relational backend with security and live updates built in, so the focus stays on data and product logic
- **Vercel** — zero-config deployment that auto-builds on every push
- **Custom CSS design system** — a consistent, hand-built visual language rather than a generic component kit

---

## How it works

The frontend talks directly to Supabase through a single data layer (`AppContext`), which handles auth state, maps the database's snake_case to the app's camelCase, and exposes a clean API to the pages. Every table in the database has row-level security enabled, so access is enforced at the data layer regardless of what the client sends. Realtime subscriptions keep swaps, messages, profiles, and reviews in sync across open sessions, and database triggers maintain derived values (average rating, completed-swap count) server-side.

---

## Getting started

```bash
git clone https://github.com/Icession/SkillSwap.git
cd SkillSwap
npm install
```

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Start the dev server:

```bash
npm run dev
```

## Database setup

In your Supabase project's **SQL Editor**, run these files in order:

1. `supabase/schema.sql` — core tables and RLS policies
2. `supabase/migration.sql` — additional profile columns (denormalized skills, availability, avatar color, rating, swap count)
3. `supabase/delete_user.sql` — secure account-deletion function
4. `supabase/reviews.sql` — reviews table, policies, and the average-rating trigger
5. `supabase/swap_counts.sql` — trigger that keeps each profile's completed-swap count current

Then, in the dashboard:

- **Authentication → Sign In / Providers:** turn **Confirm email** off so new accounts can sign in immediately.
- **Database → Publications → `supabase_realtime`:** enable `swap_requests`, `messages`, `profiles`, and `reviews`.
- For live status changes and read receipts under RLS, set full row replication:

  ```sql
  alter table public.swap_requests replica identity full;
  alter table public.messages replica identity full;
  ```

## Project structure

```
src/
├── components/   # shared UI (Navbar, ProtectedRoute, RequestSwapModal)
├── context/      # AppContext — auth + data layer (talks to Supabase)
├── lib/          # supabase client
├── pages/        # Landing, Feed, Profile, Dashboard, MySwaps, Messages, Settings, 404
│   └── auth/     # Login + 3-step registration
└── data/         # skill → category reference data
supabase/         # SQL: schema, migration, delete_user, reviews, swap_counts
```

---

## What I learned

- Designing a relational schema and enforcing access with row-level security
- That a public API key is safe *only* when RLS is correct — and how to verify it
- How Supabase Realtime interacts with RLS, and why `REPLICA IDENTITY FULL` matters
- Performing privileged operations safely from the client via `SECURITY DEFINER` functions
- Maintaining trustworthy derived data with database triggers instead of client logic
- Shipping and debugging a real deployment, including build-time environment variables

## Roadmap

- Session scheduling tied to availability
- Avatar image upload (Supabase Storage)
- In-app notifications
- Dark mode

## License

MIT