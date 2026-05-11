-- KitchenOps — Schema + RLS
-- Safe to re-run: every statement is idempotent.

-- =============================================================
-- Tables
-- =============================================================

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  item_name text not null,
  category text,
  quantity numeric not null default 0,
  unit text,
  reorder_level numeric not null default 0,
  cost_per_unit numeric not null default 0,
  supplier text,
  created_at timestamptz not null default now()
);

create table if not exists public.sales_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  sale_date date not null,
  lunch_sales numeric not null default 0,
  dinner_sales numeric not null default 0,
  takeout_sales numeric not null default 0,
  delivery_sales numeric not null default 0,
  total_sales numeric not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

-- Employees roster (new in v2)
create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  title text not null,
  phone text,
  email text,
  hourly_rate numeric,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.shifts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  employee_name text not null,
  shift_date date not null,
  start_time time not null,
  end_time time not null,
  role text,
  notes text,
  created_at timestamptz not null default now()
);

-- v2 additions on shifts (run safely on existing data)
alter table public.shifts
  add column if not exists employee_id uuid references public.employees(id) on delete cascade;

alter table public.shifts
  add column if not exists unpaid_break_minutes integer not null default 0;

-- employee_name keeps backward compat for any rows created before the
-- employees table existed. New shifts created by the app populate
-- BOTH employee_id and employee_name.
alter table public.shifts
  alter column employee_name drop not null;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  task_name text not null,
  category text,
  priority text not null default 'medium',
  due_date date,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

-- =============================================================
-- Indexes
-- =============================================================

create index if not exists idx_inventory_user        on public.inventory_items(user_id);
create index if not exists idx_sales_user_date       on public.sales_records(user_id, sale_date desc);
create index if not exists idx_shifts_user_date      on public.shifts(user_id, shift_date);
create index if not exists idx_shifts_employee       on public.shifts(employee_id);
create index if not exists idx_employees_user        on public.employees(user_id);
create index if not exists idx_employees_user_active on public.employees(user_id, active);
create index if not exists idx_tasks_user_completed  on public.tasks(user_id, completed);

-- =============================================================
-- Row Level Security
-- =============================================================

alter table public.inventory_items enable row level security;
alter table public.sales_records   enable row level security;
alter table public.employees       enable row level security;
alter table public.shifts          enable row level security;
alter table public.tasks           enable row level security;

-- ------- inventory_items -------
drop policy if exists "Users select own inventory" on public.inventory_items;
create policy "Users select own inventory" on public.inventory_items
  for select using (auth.uid() = user_id);
drop policy if exists "Users insert own inventory" on public.inventory_items;
create policy "Users insert own inventory" on public.inventory_items
  for insert with check (auth.uid() = user_id);
drop policy if exists "Users update own inventory" on public.inventory_items;
create policy "Users update own inventory" on public.inventory_items
  for update using (auth.uid() = user_id);
drop policy if exists "Users delete own inventory" on public.inventory_items;
create policy "Users delete own inventory" on public.inventory_items
  for delete using (auth.uid() = user_id);

-- ------- sales_records -------
drop policy if exists "Users select own sales" on public.sales_records;
create policy "Users select own sales" on public.sales_records
  for select using (auth.uid() = user_id);
drop policy if exists "Users insert own sales" on public.sales_records;
create policy "Users insert own sales" on public.sales_records
  for insert with check (auth.uid() = user_id);
drop policy if exists "Users update own sales" on public.sales_records;
create policy "Users update own sales" on public.sales_records
  for update using (auth.uid() = user_id);
drop policy if exists "Users delete own sales" on public.sales_records;
create policy "Users delete own sales" on public.sales_records
  for delete using (auth.uid() = user_id);

-- ------- employees -------
drop policy if exists "Users select own employees" on public.employees;
create policy "Users select own employees" on public.employees
  for select using (auth.uid() = user_id);
drop policy if exists "Users insert own employees" on public.employees;
create policy "Users insert own employees" on public.employees
  for insert with check (auth.uid() = user_id);
drop policy if exists "Users update own employees" on public.employees;
create policy "Users update own employees" on public.employees
  for update using (auth.uid() = user_id);
drop policy if exists "Users delete own employees" on public.employees;
create policy "Users delete own employees" on public.employees
  for delete using (auth.uid() = user_id);

-- ------- shifts -------
drop policy if exists "Users select own shifts" on public.shifts;
create policy "Users select own shifts" on public.shifts
  for select using (auth.uid() = user_id);
drop policy if exists "Users insert own shifts" on public.shifts;
create policy "Users insert own shifts" on public.shifts
  for insert with check (auth.uid() = user_id);
drop policy if exists "Users update own shifts" on public.shifts;
create policy "Users update own shifts" on public.shifts
  for update using (auth.uid() = user_id);
drop policy if exists "Users delete own shifts" on public.shifts;
create policy "Users delete own shifts" on public.shifts
  for delete using (auth.uid() = user_id);

-- ------- tasks -------
drop policy if exists "Users select own tasks" on public.tasks;
create policy "Users select own tasks" on public.tasks
  for select using (auth.uid() = user_id);
drop policy if exists "Users insert own tasks" on public.tasks;
create policy "Users insert own tasks" on public.tasks
  for insert with check (auth.uid() = user_id);
drop policy if exists "Users update own tasks" on public.tasks;
create policy "Users update own tasks" on public.tasks
  for update using (auth.uid() = user_id);
drop policy if exists "Users delete own tasks" on public.tasks;
create policy "Users delete own tasks" on public.tasks
  for delete using (auth.uid() = user_id);
