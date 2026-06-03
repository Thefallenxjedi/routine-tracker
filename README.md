# Routine — Personal Activity Tracker

Track daily activities and habits with simple yes/no completion. Built with Next.js, Supabase, and shadcn/ui.

## Features

- **Email + password auth** — sign up and sign in via Supabase
- **Daily checklist** — mark activities complete with optimistic UI
- **Streaks** — per-activity consecutive day tracking
- **Analytics** — daily progress, weekly bar chart, monthly heatmap
- **Activity management** — create, edit, and archive activities

## Tech Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth + PostgreSQL)
- Vercel deployment

## Getting Started

### 1. Clone and install

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/001_initial_schema.sql` via the SQL Editor
3. Enable Email auth under Authentication → Providers → Email, and turn on **Email + Password**

### 3. Configure environment

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Configure auth URLs (optional, for email confirmation)

If email confirmation is enabled in Supabase, add these under Authentication → URL Configuration:

| Setting | Value |
|---------|-------|
| Site URL | `http://localhost:3000` (dev) or your Vercel URL (prod) |
| Redirect URLs | `http://localhost:3000/auth/callback`, `http://localhost:3001/auth/callback`, `https://routine-tracker-tawny.vercel.app/auth/callback` |

**Note:** If port 3000 is busy, Next.js uses 3001. Add both redirect URLs in Supabase, or run `npm run dev -- -p 3000` after freeing port 3000.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Update Supabase redirect URLs with your production domain
5. Deploy

## Project Structure

```
src/
├── app/
│   ├── (app)/          # Authenticated routes (dashboard, activities)
│   ├── (auth)/         # Login page
│   └── auth/callback/  # Email confirmation handler (if enabled)
├── components/
│   ├── dashboard/      # Progress, checklist, streaks, charts
│   ├── activities/     # CRUD UI
│   └── layout/         # Header, mobile nav
├── lib/
│   ├── actions/        # Server Actions
│   ├── data/           # Data fetching
│   ├── supabase/       # SSR clients
│   └── utils/          # Dates, streaks, stats
└── types/              # TypeScript types
```

## Database Schema

**activities** — user-owned trackable items (name, category, active status)

**activity_logs** — daily completion records (one row per activity per day)

Row Level Security ensures users can only access their own data.
