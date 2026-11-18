# Utsav India — Events Discovery Platform

A React + TypeScript app for discovering events across India, backed by Supabase
(Postgres, Auth and Row Level Security), with a local demo mode when no Supabase
credentials are configured. Browse events in three ways — list, month calendar
and an interactive map — with shared city/category/date/price filters.

## Features

- **Accounts** — email/password sign-up & sign-in, persisted sessions, account
  menu, sign-out, and an interests picker during sign-up and on the profile.
- **Discovery** — hero search, "happening this week", personalised
  recommendations, city quick-navigation, and filtering by keyword, city,
  category, date range, free/paid and sort order.
- **City pages** — choosing a city (from the quick strip or the city filter)
  opens a dedicated `/city/:city` page with a compact header and events
  immediately visible — no home hero to scroll past. Other filters and the
  chosen view are preserved when switching cities.
- **Three views** — default list, a month calendar with per-day event chips and
  a clickable day panel, and a Leaflet/OpenStreetMap view with category-coloured
  pins and preview cards. The map automatically falls back to a city-grouped
  pin list if map tiles can't load (or you can switch manually).
- **Event details** — full description, timing, venue with directions link,
  organiser, pricing, external registration link, related events, share,
  favourite and reminder actions.
- **Favourites & reminders** — heart any event and save it; set reminders for
  15 min / 1 hr / 1 day / 2 days / 1 week before and manage them in dedicated
  pages.
- **Submissions & moderation** — an open "Submit an Event" form creates
  `pending` events; a protected admin view approves, rejects or unpublishes
  them. Approved events flow into all three browsing views.
- **Design** — vibrant saffron / spice / turquoise India-inspired palette (no
  purples), Lucide icons, category colour coding, responsive layout, and
  graceful loading/empty states.

## Tech stack

| Concern | Choice |
| --- | --- |
| Build | Vite 6 + TypeScript (strict) |
| UI | React 18, Tailwind CSS 3, Lucide icons |
| Routing | React Router 6 (filters and view stored in the URL) |
| Database / Auth | Supabase (`@supabase/supabase-js`) |
| Map | React Leaflet + OpenStreetMap tiles, with a no-network fallback |

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173.

### Demo mode (no credentials needed)

If `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are missing, left as the
placeholders, or set to a Supabase dashboard URL, the app runs in **demo mode**
with a complete, preloaded sample dataset (stored locally, no "demo" prefixes in
the data itself):

- 72 approved events across all 14 cities and 8 categories, including events
  happening today and this week (with images, prices and map coordinates).
- 8 pending submissions and 2 rejected submissions for the admin review flow.
- Three ready-made accounts on the sign-in page (one-click buttons):

  | Account | Password | What it demonstrates |
  | --- | --- | --- |
  | `aanya@utsav.in` | `utsav2026` | Interests, 10 favourites, 5 reminders and personalised recommendations |
  | `rohan@utsav.in` | `utsav2026` | Approved, pending and rejected submissions under "My submissions" |
  | `admin@utsav.in` | `utsav2026` | Admin review — approve/reject submissions and see them go live |

- Any other valid email + a password of 6+ characters also signs you in; emails
  containing `admin` get admin access.
- Submitted events, favourites, reminders and interest changes survive reloads.
  The sample data is versioned, so it refreshes cleanly when the demo content
  changes while keeping you signed in.

## Connecting Supabase

### 1. Create a project

1. Sign in at https://supabase.com/dashboard and click **New project**.
2. Give it a name, a database password, and pick a region close to your users
   (Singapore works well for India). The free tier is enough for this app.
3. Wait until the status shows **Active**.

### 2. Get the two public keys

Go to **Project Settings → API**. Copy:

- **Project URL** — looks like `https://abcdefgh.supabase.co`. This is **not**
  the `https://supabase.com/dashboard/...` URL you see in the browser address
  bar; using the dashboard URL causes CORS failures.
- **anon / public key** — either the newer `sb_publishable_...` format or the
  older long `eyJ...` JWT format. Both work.

> Only use the **anon / publishable** key in this frontend. Never put the
> `service_role` key in the app or in Vercel env vars — it bypasses all Row Level
> Security.

### 3. Run the database setup

In the Supabase dashboard, open **SQL Editor → New query** and run these two
files in order (paste the whole file and click **Run**):

1. [`supabase/schema.sql`](supabase/schema.sql) — tables, indexes, the signup
   profile trigger, and all RLS policies. Safe to re-run.
2. [`supabase/seed.sql`](supabase/seed.sql) — 82 sample events (72 approved,
   8 pending, 2 rejected) across all 14 cities. Dates are relative to when you
   run it, and re-running refreshes them without creating duplicates.

### 4. Tune authentication

- **Authentication → Providers → Email**: turn **Confirm email** off if you
  want people to sign up and enter immediately. (Keep it on if you want verified
  emails; then each new user must click the confirmation link.)
- **Authentication → URL Configuration**: set **Site URL** to your deployed
  URL (e.g. `https://your-app.vercel.app`) and add
  `https://your-app.vercel.app/**` to **Redirect URLs**. Before deployment you
  can use `http://localhost:5173` instead.

### 5. Run locally with Supabase

```bash
cp .env.example .env.local
```

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Restart `npm run dev`. The "Demo mode" badge disappears and all data comes from
Supabase. The one-click local accounts are hidden — sign up normally instead.

### Making an account an admin

Sign up through the app first, then run this in the SQL Editor:

```sql
select public.set_user_admin('you@example.com', true);
```

Reload the app — **Admin** now appears in the navigation. Use this account to
approve or reject the seeded pending submissions.

### Troubleshooting

- **CORS error in the browser console** — `VITE_SUPABASE_URL` must be the
  **Project URL** (`https://<project-ref>.supabase.co`), not the
  `https://supabase.com/dashboard/...` address. The app logs a clear error and
  stays in demo mode if you use the dashboard URL. Restart `npm run dev` (or
  redeploy) after changing it.
- **Sign-up/redirect fails** — add your current origin to **Authentication →
  URL Configuration → Redirect URLs**: `http://localhost:5173/**` locally and
  `https://your-app.vercel.app/**` when deployed.
- **"new row violates row-level security policy"** — confirm you ran
  `supabase/schema.sql` in the same project, and that you are signed in before
  favouriting, submitting events or setting reminders.
- **Empty event list** — run `supabase/seed.sql`; only `approved` events are
  public.

## Deploying to Vercel

1. Push this folder to a GitHub/GitLab/Bitbucket repository.
2. In Vercel, click **Add New → Project** and import that repository. Framework
   preset **Vite** is detected automatically; leave build settings as-is.
3. Under **Environment Variables**, add exactly these two (for Production,
   Preview and Development):

   | Name | Value |
   | --- | --- |
   | `VITE_SUPABASE_URL` | your Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | your Supabase anon/public key |

4. Click **Deploy**. `vercel.json` includes an SPA rewrite, so direct links to
   `/city/Mumbai`, `/events/...` and `/favourites` work after a refresh.
5. Copy the deployment URL back into Supabase's **Site URL / Redirect URLs**
   (step 4 above), then redeploy if you changed env vars.

> Vite embeds `VITE_*` values into the JavaScript at **build time**. If you add
> or change an env var later, you must **Redeploy** (not just save the setting).

## Data model

| Table | Purpose |
| --- | --- |
| `profiles` | User details, interests array, `is_admin` flag (1:1 with `auth.users`) |
| `events` | Event listings with category, city, coordinates, dates, status |
| `favorites` | Composite key of user + event |
| `reminders` | User, event and `minutes_before` |

Key RLS rules: approved events are readable by everyone; anyone can insert a
`pending` event; only admins can change event status; favourites and reminders
are private to their owner.

## Notes

- Reminders are stored per account and shown in **My Reminders**. Browser
  notifications/email delivery would be a natural next step (Supabase Edge
  Function + cron), but are not part of this build.
- The map uses public OpenStreetMap tiles. If tiles fail to load after several
  attempts, the app switches to the always-available city-grouped pin list.
- Event images use remote Unsplash URLs with a category-coloured fallback if an
  image can't load.

## Scripts

```bash
npm run dev        # start dev server
npm run build      # typecheck + production build
npm run preview    # preview the production build
npm run typecheck  # TypeScript only
```
