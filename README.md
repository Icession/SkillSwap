# SkillSwap

> Trade what you know for what you need — a platform where students exchange skills directly, with no money involved.

**Live demo:** https://skill-swap-eight-eta.vercel.app

**Try it without signing up** — log in with:

- **Email:** demo1@skillswap.com
- **Password:** demo123

![SkillSwap](docs/screenshot.png)

SkillSwap is a full-stack web app that lets students and learners swap skills. You list what you can teach and what you want to learn, browse and filter other members, send swap requests, message each other to arrange a session, and leave a review once you're done — all without any payment.

## Features

- **Authentication** — email/password sign up & login with protected routes (Supabase Auth)
- **Profiles** — offered and wanted skills, each with its own proficiency level, plus bio, availability, hours per week, and a custom avatar color
- **Discover feed** — browse members with live search and filters for category, level, and availability
- **Swap requests** — send, accept, decline, and complete skill exchanges between real users; the completed-swap count on each profile updates automatically
- **Messaging** — a conversation thread scoped to each swap, with unread badges
- **Reviews & ratings** — after a completed swap, each participant can rate and review the other; every profile's average rating is recalculated automatically
- **Realtime** — swaps, messages, profiles, and reviews sync live across sessions via Supabase subscriptions, no refresh needed
- **Dashboard** — your personal activity (active / pending / completed swaps)
- **Settings** — edit your profile and skills, change your password, and delete your account
- **Account deletion** — a secure Postgres function removes only the signed-in user's own account and data
- **Row-Level Security** — database policies ensure users can only read and write data they're allowed to

## Tech stack

- **Frontend:** React 19, Vite, React Router
- **Backend & database:** Supabase (PostgreSQL, Auth, Row-Level Security, Realtime)
- **Hosting:** Vercel
- **Styling:** custom CSS design system

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

Then start the dev server:

```bash
npm run dev
```

## Database setup

In your Supabase project's **SQL Editor**, run these files in order:

1. `supabase/schema.sql` — core tables (profiles, swaps, messages, etc.) and RLS policies
2. `supabase/migration.sql` — additional profile columns (denormalized skills, availability, avatar color, rating, swap count)
3. `supabase/delete_user.sql` — secure function for account deletion
4. `supabase/reviews.sql` — reviews table, its policies, and the average-rating trigger
5. `supabase/swap_counts.sql` — trigger that keeps each profile's completed-swap count current

Then, still in the Supabase dashboard:

- **Authentication → Sign In / Providers:** turn **Confirm email** off so new accounts can sign in immediately.
- **Database → Publications → `supabase_realtime`:** enable `swap_requests`, `messages`, `profiles`, and `reviews` so changes broadcast live.
- For live status changes (accept / mark done) and read receipts under RLS, set full row replication so Realtime can evaluate who may see an update:

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

## Design

Designed in Figma before build: [view the design file](PASTE_YOUR_FIGMA_LINK_HERE)

## Roadmap

- Session scheduling tied to availability
- Avatar image upload (Supabase Storage)
- In-app notifications
- Dark mode

## License

MIT