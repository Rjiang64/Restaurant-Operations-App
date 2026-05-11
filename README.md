# KitchenOps

> **Restaurant operations, simplified.**

A full-stack internal tool for restaurant managers to track **inventory, daily sales, staff shifts, and operational tasks** — with a clean dashboard, simple reports, and Supabase-backed authentication.

Built as a portfolio project that mirrors a realistic small-business workflow. The stack is intentionally simple so the focus is on building real features end-to-end rather than enterprise scaffolding.

> **Stack:** React (Vite) · JavaScript · Supabase (Postgres + Auth + Row-Level Security) · Recharts · Vercel

---

## Features

- **Public landing page** — branded marketing front (`/`) with hero, feature grid, and CTAs
- **Authentication** — Supabase email/password sign-in & sign-up, protected routes, logout
- **Dashboard** — Today's sales, total inventory, low-stock count, upcoming shifts, open tasks, recent sales table, today's shifts (joined to the employee roster)
- **Biweekly Timecards** — Monday-anchored 2-week pay periods with prev/next navigation, per-employee hours/shifts/estimated-pay cards, drill-in detail modal, and one-click CSV export. Employees are managed in a dedicated roster modal with name, title, contact info, hourly rate, and active/inactive status.
- **Inventory** — Full CRUD, search, low-stock badge when `quantity ≤ reorder_level`
- **Sales** — Full CRUD, month filter, monthly total, automatic `total_sales` calculation
- **Shifts** — Full CRUD, date filter, role chips
- **Tasks** — Full CRUD, complete/incomplete toggle, priority, category, open/done filter
- **Reports** — Pay-period-aware analytics with a filter bar (This Week, Last Week, This Month, current 2-week Pay Period as default, All Time). Surfaces **labor cost %, labor hours, sales per labor hour, labor hours by role, an employee hours leaderboard, sales trend, sales breakdown by service period, shifts by role, low-stock list**, and an auto-generated **Manager Insights** panel with the top revenue channel, busiest role, labor cost ratio, and reorder alerts.
- **Row-Level Security** — Each user only sees their own records
- **Responsive UI** — Works on desktop, tablet, and mobile

---

## Project Structure

```
src/
├── components/         Layout, ProtectedRoute, Modal, SummaryCard, etc.
├── context/            AuthContext (Supabase session)
├── lib/                supabase.js client, format.js helpers
├── pages/              Landing, Login, Dashboard, Inventory, Sales, Shifts, Tasks, Reports
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

Open the **SQL Editor** in Supabase, paste the contents of [`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates five tables:

- `inventory_items`
- `sales_records`
- `employees` *(roster used by the Shifts timecard view)*
- `shifts` *(now has `employee_id` FK → `employees.id` and `unpaid_break_minutes`)*
- `tasks`

Each table has `id` (uuid), `created_at`, a `user_id` referencing `auth.users`, and full **Row-Level Security** policies so users can only see and modify their own rows. The schema script is idempotent — safe to re-run on an existing database; it adds the new employees table and shift columns without dropping any data.

### Notes on the timecard model

- Pay periods are **14 days, Monday-start**, anchored to `2024-01-01` (which was a Monday). Any date maps deterministically to one period.
- **Overnight shifts are supported**: when `end_time <= start_time`, the shift is interpreted as crossing midnight (24h added automatically).
- **Estimated pay** is `hours × employees.hourly_rate`. Employees without a rate show "—" and are excluded from the payroll summary.
- **Deactivating** an employee hides them from the timecard grid but preserves all historical shifts. Deleting an employee cascades and removes their shifts.

### Optional seed data

1. Run the app and sign up once (`npm run dev`).
2. In Supabase, go to **Authentication → Users**, copy your user's UID.
3. Open [`supabase/seed.sql`](./supabase/seed.sql), replace `PASTE-YOUR-USER-ID-HERE` with that UID, and run it in the SQL editor. Your demo dashboard, charts, and tables will instantly look populated.

## 4. Environment variables

Create a `.env` file in the project root with the following keys (the file is gitignored — it never gets committed):

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

> Because the app uses client-side React Router, the included [`vercel.json`](./vercel.json) rewrites all paths to `index.html` so direct visits to `/login`, `/inventory`, etc. don't 404 on Vercel.

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

- Built **KitchenOps**, a full-stack restaurant operations management app (React, JavaScript, Supabase/Postgres) used to track inventory, daily sales, staff shifts, and tasks across a single manager workflow.
- Designed a normalized Postgres schema with **five entities and a relational `employees → shifts` foreign key**, plus **row-level security policies** on every table so each authenticated user only reads and writes their own data.
- Implemented a **biweekly timecard system** with a Monday-anchored 2-week pay period, prev/next navigation, per-employee hours and estimated-pay calculations, drill-in detail modals, and one-click client-side **CSV export** for payroll handoff.
- Implemented end-to-end **email/password authentication** with React Router protected routes, a session context, and graceful login/logout flows.
- Built **CRUD interfaces** with form validation, search/filter, and modal-based editing for inventory, sales, shifts, employees, and tasks — all backed by Supabase auto-generated REST APIs.
- Designed and shipped a **pay-period aware reports dashboard** computing labor cost, labor cost as % of sales, sales per labor hour, labor hours by role, and an employee hours leaderboard — alongside sales trend, sales-by-service-period, and low-stock visualizations (Recharts).
- Authored an **auto-generated Manager Insights panel** that surfaces business-language summaries (top revenue channel, busiest role, labor-cost ratio, low-stock alerts) from the same client-side aggregations.
- Translated **prior restaurant operations experience** into the data model (lunch/dinner/takeout/delivery split, reorder thresholds, biweekly pay periods, employee roster with hourly rates) — bridging product domain knowledge and engineering.
- Deployed to Vercel with environment-driven Supabase configuration; no servers to manage.

---

## Interview Talking Points

When asked "tell me about a project," walk through these in order — they map cleanly to common follow-up questions:

1. **Why this project?** "I worked in restaurants before pivoting to engineering, and I noticed managers track sales, inventory, and shifts in a mishmash of spreadsheets, Notes apps, and clipboard sheets. I built a single internal tool that consolidates it."
2. **Architecture decisions** — Vite + React for fast dev, Supabase as the backend so I could focus on product work instead of writing my own auth + API + Postgres layer. Recharts because the charts are simple and it ships small.
3. **Data modeling** — Five tables, all keyed by `user_id` to `auth.users`, plus a relational FK from `shifts.employee_id` to `employees.id`. Walk through one schema (e.g. `sales_records`) and explain why I split lunch/dinner/takeout/delivery into separate columns instead of a generic JSON blob (queryable, easy to chart, matches how managers actually report). Then explain why the timecard view requires a separate `employees` table — denormalized employee names on shifts were OK for v1 but broke as soon as I needed roster-level aggregations like "hours per employee per pay period."
4. **Security** — RLS policies are the actual security boundary, not the front-end. Even if someone bypassed the React app, they could only see their own data. Show a policy in `schema.sql`.
5. **Tradeoffs** — Kept it intentionally beginner-friendly: no TypeScript, no Docker, no complicated role permissions, no payment system. Explain what I'd add next (see Future Improvements) and why I didn't add it now (scope discipline).
6. **What I'd do at a real job** — Add tests, CI, error monitoring (Sentry), proper analytics, and a real design system. Talk about how this MVP is the seed of a real product, not the finished product.
7. **Data analyst angle** — The Reports page is where the data work lives. I filter every record by the selected period (this week / last week / this month / current pay period / all time), then aggregate three ways: sales by channel for revenue mix, labor hours and cost per role for staffing distribution, and per-employee totals for the leaderboard. From those primitives I derive the headline restaurant metrics — **labor cost as a percent of sales** (the canonical labor-efficiency KPI, typically 25–35%) and **sales per labor hour** (revenue productivity). The auto-generated Insights panel turns those numbers into plain-English bullets the manager actually wants to read. All client-side aggregation over the same Postgres tables — no warehouse, no ETL.

8. **Timecard math** — Walk through how the biweekly pay period is anchored to a fixed Monday (`2024-01-01`) and any date maps to exactly one 14-day period via integer division on the day-delta. Each shift's hours = `end_time - start_time - unpaid_break_minutes`, with overnight shifts handled by adding 24h when `end <= start`. Total period hours = sum of shift hours filtered by `employee_id` and `shift_date BETWEEN period_start AND period_end`. Estimated pay = hours × `employees.hourly_rate`. The CSV export is generated entirely client-side via `Blob` + a temporary download link — no server roundtrip.
