# SkillSwap

> Trade what you know for what you need — a platform where students exchange skills directly, with no money involved.

**Live demo:** https://skill-swap-eight-eta.vercel.app

SkillSwap is a full-stack web app that lets students and learners swap skills. You list what you can teach and what you want to learn, browse and filter other members, send swap requests, and message each other to arrange a session — all without any payment.

## Features

- **Authentication** — email/password sign up & login with protected routes (Supabase Auth)
- **Profiles** — offered and wanted skills, each with its own proficiency level, plus bio and availability
- **Discover feed** — browse members with live search and filters for category, level, and availability
- **Swap requests** — send, accept, decline, and complete skill exchanges between real users
- **Messaging** — a conversation thread per swap
- **Dashboard** — your personal activity (active / pending / completed swaps)
- **Settings** — edit your profile and manage your skills
- **Row-Level Security** — database policies ensure users can only access their own swaps and messages

## Tech stack

- **Frontend:** React 19, Vite, React Router
- **Backend & database:** Supabase (PostgreSQL, Auth, Row-Level Security)
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

Set up the database by running the SQL in `supabase/schema.sql` (then `supabase/migration.sql`) in your Supabase project's SQL editor. In Supabase Authentication settings, turn **Confirm email** off so accounts sign in immediately.

Then start the dev server:

```bash
npm run dev
```

## Project structure

```
src/
├── components/   # shared UI (Navbar, ProtectedRoute, RequestSwapModal)
├── context/      # AppContext — auth + data layer (talks to Supabase)
├── lib/          # supabase client
├── pages/        # Landing, Feed, Profile, Dashboard, Messages, Settings, 404
│   └── auth/     # Login + 3-step registration
└── data/         # skill → category reference data
```

## Roadmap

- Realtime updates via Supabase subscriptions (no refresh needed)
- Reviews and ratings after completed swaps
- Session scheduling

## License

MIT