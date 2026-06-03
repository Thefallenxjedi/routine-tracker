# Routine — Personal Activity Tracker

Track daily activities and habits with yes/no or numeric metrics (km, steps, minutes, and more). Built with Next.js, Supabase, and shadcn/ui.

## Features

- **Google auth** — sign in or sign up with Google via Supabase
- **Activity metrics** — yes/no checkboxes or numeric tracking with preset units (km, steps, minutes, reps, pages, liters, kcal, custom)
- **Daily checklist** — yes/no toggle or numeric input with save/clear
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
2. Run the migrations via the SQL Editor:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_weight_logs.sql`
   - `supabase/migrations/003_user_preferences.sql`
   - `supabase/migrations/004_activity_metrics.sql`
3. Enable **Google** under Authentication → Providers → Google
4. Add your Google OAuth Client ID and Client Secret (see below)

#### Google OAuth credentials

1. Open [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Create an **OAuth 2.0 Client ID** (Web application)
3. Add **Authorized redirect URIs**:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
   Find your project ref in Supabase → Settings → API → Project URL.
4. Copy the Client ID and Client Secret into Supabase → Authentication → Providers → Google

### 3. Configure environment

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Configure auth redirect URLs

Add these under Supabase → Authentication → URL Configuration:

| Setting | Value |
|---------|-------|
| Site URL | `http://localhost:3000` (dev) or `https://routine-tracker-tawny.vercel.app` (prod) |
| Redirect URLs | `http://localhost:3000/auth/callback`, `http://localhost:3001/auth/callback`, `https://routine-tracker-tawny.vercel.app/auth/callback` |

**Note:** If port 3000 is busy, Next.js uses 3001. Add both localhost redirect URLs.

### 5. Local dev without login (optional)

To skip the login screen while developing locally, add to `.env.local`:

```
DEV_BYPASS_AUTH=true
```

Restart `npm run dev` — you'll go straight to the dashboard. **This only works in development** and is ignored in production.

To also read/write real data locally (create activities, toggle checkboxes), add:

```
DEV_USER_ID=<uuid from Supabase → Authentication → Users>
SUPABASE_SERVICE_ROLE_KEY=<from Supabase → Settings → API → service_role>
```

Without those two, pages load with empty data — fine for UI work.

### 6. Run locally

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
│   └── auth/callback/  # OAuth callback handler
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
