# Kitchen Manager

> Restaurant operations, simplified.

A full-stack internal tool for small restaurant managers to track **inventory, daily sales, staff shifts, biweekly timecards, labor reports, and manager tasks** — all in one place.

**Live demo:** https://restaurant-operations-app.vercel.app

---

## Features

- **Authentication** — Email/password and Google sign-in via Supabase, protected routes for every app page
- **Dashboard** — At-a-glance snapshot of today's sales, low-stock items, upcoming shifts, open tasks, recent sales, and the day's schedule
- **Inventory** — Track stock by item, category, unit, supplier, reorder threshold, and per-unit cost. Low-stock badges appear automatically when `quantity ≤ reorder_level`
- **Sales** — Record daily sales split by lunch, dinner, takeout, and delivery, with auto-calculated totals and a month filter
- **Shifts** — Two tabs:
  - *Timecards:* Monday-anchored 2-week pay periods with per-employee hours (including unpaid breaks and overnight shifts), estimated pay from hourly rates, drill-in detail modals, and **one-click CSV export**
  - *All Shifts:* flat list view with search by employee/role and date filter
- **Employees** — Roster with hourly rates, contact info, and an active/inactive toggle that preserves shift history when someone leaves
- **Reports** — Period-aware analytics (This Week / Last Week / This Month / current Pay Period / All Time) surfacing:
  - Total sales, average daily sales
  - **Labor cost, labor cost as a % of sales, sales per labor hour**
  - Sales trend, sales breakdown by service period
  - Labor hours by role, shifts by role
  - Employee hours leaderboard
  - Auto-generated Manager Insights bullets
- **Tasks** — Manager checklist with priority, category, and due date. Inline complete toggle, Open/Done/All filter

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | React 18 (Vite) + JavaScript |
| Routing | React Router 6 |
| Charts | Recharts |
| Styling | Hand-written CSS with design tokens (no Tailwind or CSS-in-JS) |
| Backend | Supabase — Postgres + Auth + auto-generated REST |
| Security | Postgres Row-Level Security — per-user data isolation enforced at the database |
| Hosting | Vercel (SPA fallback via `vercel.json`) |

---

## Running locally

```bash
npm install
```

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-PUBLIC-ANON-KEY
```

Run [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL Editor to create the tables + RLS policies. Optional demo data lives in [`supabase/seed.sql`](./supabase/seed.sql).

```bash
npm run dev
```

App opens at http://localhost:5173.

---

## Screenshots

_Add screenshots here once the deployed version is populated with data._

---

## More documentation

For a deeper walkthrough of the architecture, database schema, RLS policies, auth flow, and page-by-page implementation, see [`KITCHEN_MANAGER_DOCS.md`](./KITCHEN_MANAGER_DOCS.md).
