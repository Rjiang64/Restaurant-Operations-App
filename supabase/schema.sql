-- Restaurant Operations Management — Schema + RLS
-- Run this in the Supabase SQL editor for a new project.

-- 1. Tables ------------------------------------------------------------

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

-- 2. Helpful indexes ---------------------------------------------------

create index if not exists idx_inventory_user on public.inventory_items(user_id);
create index if not exists idx_sales_user_date on public.sales_records(user_id, sale_date desc);
create index if not exists idx_shifts_user_date on public.shifts(user_id, shift_date);
create index if not exists idx_tasks_user_completed on public.tasks(user_id, completed);

-- 3. Row Level Security ------------------------------------------------

alter table public.inventory_items enable row level security;
alter table public.sales_records enable row level security;
alter table public.shifts enable row level security;
alter table public.tasks enable row level security;

-- inventory_items policies
drop policy if exists "Users select own inventory" on public.inventory_items;
create policy "Users select own inventory"
  on public.inventory_items for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own inventory" on public.inventory_items;
create policy "Users insert own inventory"
  on public.inventory_items for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own inventory" on public.inventory_items;
create policy "Users update own inventory"
  on public.inventory_items for update
  using (auth.uid() = user_id);

drop policy if exists "Users delete own inventory" on public.inventory_items;
create policy "Users delete own inventory"
  on public.inventory_items for delete
  using (auth.uid() = user_id);

-- sales_records policies
drop policy if exists "Users select own sales" on public.sales_records;
create policy "Users select own sales"
  on public.sales_records for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own sales" on public.sales_records;
create policy "Users insert own sales"
  on public.sales_records for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own sales" on public.sales_records;
create policy "Users update own sales"
  on public.sales_records for update
  using (auth.uid() = user_id);

drop policy if exists "Users delete own sales" on public.sales_records;
create policy "Users delete own sales"
  on public.sales_records for delete
  using (auth.uid() = user_id);

-- shifts policies
drop policy if exists "Users select own shifts" on public.shifts;
create policy "Users select own shifts"
  on public.shifts for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own shifts" on public.shifts;
create policy "Users insert own shifts"
  on public.shifts for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own shifts" on public.shifts;
create policy "Users update own shifts"
  on public.shifts for update
  using (auth.uid() = user_id);

drop policy if exists "Users delete own shifts" on public.shifts;
create policy "Users delete own shifts"
  on public.shifts for delete
  using (auth.uid() = user_id);

-- tasks policies
drop policy if exists "Users select own tasks" on public.tasks;
create policy "Users select own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own tasks" on public.tasks;
create policy "Users insert own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own tasks" on public.tasks;
create policy "Users update own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

drop policy if exists "Users delete own tasks" on public.tasks;
create policy "Users delete own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);
