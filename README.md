# Restaurant Operations Management

A full-stack internal tool for restaurant managers to track **inventory, daily sales, staff shifts, and operational tasks** — with a clean dashboard, simple reports, and Supabase-backed authentication.

Built as a portfolio project that mirrors a realistic small-business workflow. The stack is intentionally simple so the focus is on building real features end-to-end rather than enterprise scaffolding.

> **Stack:** React (Vite) · JavaScript · Supabase (Postgres + Auth + Row-Level Security) · Recharts · Vercel

---

## Features

- **Authentication** — Supabase email/password sign-in & sign-up, protected routes, logout
- **Dashboard** — Today's sales, total inventory, low-stock count, upcoming shifts, open tasks, recent sales table, today's shifts
- **Inventory** — Full CRUD, search, low-stock badge when `quantity ≤ reorder_level`
- **Sales** — Full CRUD, month filter, monthly total, automatic `total_sales` calculation
- **Shifts** — Full CRUD, date filter, role chips
- **Tasks** — Full CRUD, complete/incomplete toggle, priority, category, open/done filter
- **Reports** — Sales trend (line chart), sales breakdown by service period (pie), shifts by role (bar), low-stock list
- **Row-Level Security** — Each user only sees their own records
- **Responsive UI** — Works on desktop, tablet, and mobile

---

## Project Structure

```
src/
├── components/         Layout, ProtectedRoute, Modal, SummaryCard, etc.
├── context/            AuthContext (Supabase session)
├── lib/                supabase.js client, format.js helpers
├── pages/              Login, Dashboard, Inventory, Sales, Shifts, Tasks, Reports
├── App.jsx             Routes
├── main.jsx            Entry
└── index.css           Stylesheet
supabase/
├── schema.sql          Tables + RLS policies
└── seed.sql            Optional sample data for demo screenshots
```

---

## 1. Install dependencies

```bash
npm install
```

## 2. Set up Supabase

1. Create a free Supabase project at [supabase.com](https://supabase.com).
2. In **Settings → API**, copy your **Project URL** and **anon public key**.
3. In **Authentication → Providers**, make sure **Email** is enabled. For easier local dev, you can also turn off "Confirm email" in Authentication → Providers → Email so test sign-ups work without an inbox.

## 3. Run the SQL

Open the **SQL Editor** in Supabase, paste the contents of [`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates four tables:

- `inventory_items`
- `sales_records`
- `shifts`
- `tasks`

Each table has `id` (uuid), `created_at`, a `user_id` referencing `auth.users`, and full **Row-Level Security** policies so users can only see and modify their own rows.

### Optional seed data

1. Run the app and sign up once (`npm run dev`).
2. In Supabase, go to **Authentication → Users**, copy your user's UID.
3. Open [`supabase/seed.sql`](./supabase/seed.sql), replace `PASTE-YOUR-USER-ID-HERE` with that UID, and run it in the SQL editor. Your demo dashboard, charts, and tables will instantly look populated.

## 4. Environment variables

Create a `.env` file in the project root (use `.env.example` as a template):

```
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-PUBLIC-ANON-KEY
```

> ⚠️ The `VITE_` prefix is required by Vite to expose env vars to the browser. Restart the dev server after editing `.env`.

## 5. Run locally

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173). You'll be redirected to **/login**. Create an account, then explore the dashboard.

## 6. Deploy to Vercel

1. Push the project to GitHub.
2. Go to [vercel.com](https://vercel.com), click **New Project**, and import the repo.
3. Vercel auto-detects Vite. Leave defaults: build command `npm run build`, output directory `dist`.
4. In **Environment Variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
5. Click **Deploy**. You'll get a live URL — use it on your resume.

> Because the app uses client-side React Router, no special rewrites config is needed for Vite + Vercel — the default `vercel.json`-less setup works.

---

## Screenshots to take for your portfolio

When the app is running with seed data, capture:

1. **Login page** — clean auth screen
2. **Dashboard** — summary cards lit up + today's sales + recent sales table
3. **Inventory** — table view with at least one "Low stock" badge
4. **Inventory edit modal** — to show CRUD + form design
5. **Sales** — list with month filter applied
6. **Shifts** — schedule for today with role chips
7. **Tasks** — open list with priority badges + a completed item
8. **Reports** — charts (sales trend, breakdown pie, shifts-by-role bar)
9. **Mobile view** — open the sidebar on a narrow viewport

Drop the screenshots into a `/screenshots` folder, and link them in this README.

---

## Future Improvements

These are realistic next steps if you wanted to extend the project:

- **Multi-user team support** — invite staff, simple role-based read/write
- **Sales import** — upload a daily POS CSV instead of manual entry
- **Inventory consumption** — link recipes to inventory and auto-decrement on sales
- **Labor cost report** — shift hours × hourly rate vs. total sales
- **Email/SMS alerts** — Supabase Edge Function notifies manager when stock is low
- **Audit log** — track who changed what
- **Tests** — Vitest + React Testing Library for the CRUD flows
- **CI** — GitHub Actions running lint/build on every PR

---

## Resume Bullets

Adapt these to match your voice — they highlight the parts hiring managers care about for entry-level SWE / Full-Stack / App Dev / Technical Analyst / Data Analyst roles:

- Built a full-stack restaurant operations management app (React, JavaScript, Supabase/Postgres) used to track inventory, daily sales, staff shifts, and tasks across a single manager workflow.
- Designed a normalized Postgres schema with four entities and **row-level security policies** so every authenticated user only reads and writes their own data.
- Implemented end-to-end **email/password authentication** with React Router protected routes, a session context, and graceful login/logout flows.
- Built **CRUD interfaces** with form validation, search/filter, and modal-based editing for inventory, sales, shifts, and tasks (~25 endpoints' worth of behavior backed by Supabase auto-generated APIs).
- Designed and shipped a **reports dashboard** with sales trend, sales-by-service-period, shifts-by-role, and low-stock visualizations using Recharts.
- Translated **prior restaurant operations experience** into the data model (lunch/dinner/takeout/delivery split, reorder thresholds, role-based shift roster) — bridging product domain knowledge and engineering.
- Deployed to Vercel with environment-driven Supabase configuration; no servers to manage.

---

## Interview Talking Points

When asked "tell me about a project," walk through these in order — they map cleanly to common follow-up questions:

1. **Why this project?** "I worked in restaurants before pivoting to engineering, and I noticed managers track sales, inventory, and shifts in a mishmash of spreadsheets, Notes apps, and clipboard sheets. I built a single internal tool that consolidates it."
2. **Architecture decisions** — Vite + React for fast dev, Supabase as the backend so I could focus on product work instead of writing my own auth + API + Postgres layer. Recharts because the charts are simple and it ships small.
3. **Data modeling** — Four tables, all keyed by `user_id` to `auth.users`. Walk through one schema (e.g. `sales_records`) and explain why I split lunch/dinner/takeout/delivery into separate columns instead of a generic JSON blob (queryable, easy to chart, matches how managers actually report).
4. **Security** — RLS policies are the actual security boundary, not the front-end. Even if someone bypassed the React app, they could only see their own data. Show a policy in `schema.sql`.
5. **Tradeoffs** — Kept it intentionally beginner-friendly: no TypeScript, no Docker, no complicated role permissions, no payment system. Explain what I'd add next (see Future Improvements) and why I didn't add it now (scope discipline).
6. **What I'd do at a real job** — Add tests, CI, error monitoring (Sentry), proper analytics, and a real design system. Talk about how this MVP is the seed of a real product, not the finished product.
7. **Data analyst angle** — The Reports page is where data work lives. I aggregate by service period, compute averages, surface low-stock anomalies. With more data this becomes COGS reports, labor-as-a-percent-of-sales, week-over-week trend, etc.
