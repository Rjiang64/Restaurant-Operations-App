-- KitchenOps — Optional demo data for portfolio screenshots.
--
-- HOW TO RUN
--   1. Sign up / log in once in the app to create an auth user.
--   2. In Auth → Users, copy your user's UID.
--   3. Replace the demo_user value below with your UID.
--   4. Run this script in the Supabase SQL editor.
--
-- This script is destructive for the named user: it deletes any
-- existing rows that user owns before re-inserting clean demo data.
-- The script does NOT touch other users.

do $$
declare
  demo_user uuid := '4607958a-882d-40be-95ac-a77ed10ce4bc';

  -- biweekly pay period (Monday-anchored, period of 14 days from 2024-01-01)
  anchor       date := date '2024-01-01';
  period_start date := date '2024-01-01' + ((current_date - date '2024-01-01') / 14) * 14;
  period_end   date := period_start + 13;

  emp_maria   uuid;
  emp_jordan  uuid;
  emp_aisha   uuid;
  emp_diego   uuid;
  emp_priya   uuid;
  emp_sam     uuid;
  emp_ravi    uuid;
  emp_chris   uuid;
begin
  -- ----- Wipe previous demo rows for this user -----
  delete from public.shifts          where user_id = demo_user;
  delete from public.employees       where user_id = demo_user;
  delete from public.sales_records   where user_id = demo_user;
  delete from public.inventory_items where user_id = demo_user;
  delete from public.tasks           where user_id = demo_user;

  -- ----- Inventory -----
  insert into public.inventory_items
    (user_id, item_name, category, quantity, unit, reorder_level, cost_per_unit, supplier)
  values
    (demo_user, 'Chicken Breast',  'Meat',     12, 'lb',    20,  3.25, 'Sysco'),
    (demo_user, 'Ground Beef',     'Meat',     30, 'lb',    25,  4.50, 'Sysco'),
    (demo_user, 'Romaine Lettuce', 'Produce',   8, 'case',  10,  18.00, 'Local Farms'),
    (demo_user, 'Tomatoes',        'Produce',  40, 'lb',    25,  1.20, 'Local Farms'),
    (demo_user, 'Olive Oil',       'Pantry',    6, 'bottle', 4,  12.50, 'US Foods'),
    (demo_user, 'Mozzarella',      'Dairy',    18, 'lb',    20,  4.10, 'Sysco'),
    (demo_user, 'Pasta - Penne',   'Pantry',   45, 'lb',    25,  1.80, 'US Foods'),
    (demo_user, 'Napkins',         'Supplies', 12, 'case',  15,  22.00, 'Restaurant Depot'),
    (demo_user, 'Takeout Boxes',   'Supplies', 80, 'ea',    50,   0.45, 'Restaurant Depot'),
    (demo_user, 'Lemons',          'Produce',   3, 'case',   6,  24.00, 'Local Farms');

  -- ----- Sales (last 14 days) -----
  insert into public.sales_records
    (user_id, sale_date, lunch_sales, dinner_sales, takeout_sales, delivery_sales, total_sales, notes)
  values
    (demo_user, current_date - 13, 820,  1640,  430, 290, 3180, 'Steady Monday'),
    (demo_user, current_date - 12, 910,  1520,  510, 320, 3260, ''),
    (demo_user, current_date - 11, 740,  1410,  390, 280, 2820, 'Slow lunch'),
    (demo_user, current_date - 10, 880,  1880,  470, 350, 3580, 'Live music night'),
    (demo_user, current_date - 9,  1200, 2400,  610, 410, 4620, 'Friday rush'),
    (demo_user, current_date - 8,  1320, 2510,  580, 390, 4800, 'Saturday'),
    (demo_user, current_date - 7,  990,  1790,  430, 300, 3510, 'Sunday brunch'),
    (demo_user, current_date - 6,  810,  1610,  450, 310, 3180, ''),
    (demo_user, current_date - 5,  870,  1700,  500, 330, 3400, ''),
    (demo_user, current_date - 4,  790,  1480,  410, 290, 2970, ''),
    (demo_user, current_date - 3,  920,  1820,  460, 360, 3560, ''),
    (demo_user, current_date - 2,  1110, 2310,  590, 410, 4420, 'Pre-weekend'),
    (demo_user, current_date - 1,  1280, 2480,  610, 420, 4790, 'Saturday'),
    (demo_user, current_date,      950,  1840,  480, 340, 3610, 'Today');

  -- ----- Employees -----
  insert into public.employees (user_id, name, title, phone, email, hourly_rate, active)
    values (demo_user, 'Maria Gonzalez', 'Manager', '555-0101', 'maria@example.com', 26.00, true)
    returning id into emp_maria;

  insert into public.employees (user_id, name, title, phone, email, hourly_rate, active)
    values (demo_user, 'Jordan Thompson', 'Server', '555-0102', 'jordan@example.com', 15.50, true)
    returning id into emp_jordan;

  insert into public.employees (user_id, name, title, phone, email, hourly_rate, active)
    values (demo_user, 'Aisha Khan', 'Server', '555-0103', 'aisha@example.com', 15.50, true)
    returning id into emp_aisha;

  insert into public.employees (user_id, name, title, phone, email, hourly_rate, active)
    values (demo_user, 'Diego Ramirez', 'Cook', '555-0104', 'diego@example.com', 19.00, true)
    returning id into emp_diego;

  insert into public.employees (user_id, name, title, phone, email, hourly_rate, active)
    values (demo_user, 'Priya Shah', 'Cook', '555-0105', 'priya@example.com', 18.50, true)
    returning id into emp_priya;

  insert into public.employees (user_id, name, title, phone, email, hourly_rate, active)
    values (demo_user, 'Sam Lee', 'Bartender', '555-0106', 'sam@example.com', 16.00, true)
    returning id into emp_sam;

  insert into public.employees (user_id, name, title, phone, email, hourly_rate, active)
    values (demo_user, 'Ravi Patel', 'Cashier', '555-0107', 'ravi@example.com', 14.50, true)
    returning id into emp_ravi;

  insert into public.employees (user_id, name, title, phone, email, hourly_rate, active)
    values (demo_user, 'Chris Nguyen', 'Dishwasher', '555-0108', 'chris@example.com', 14.00, true)
    returning id into emp_chris;

  -- ----- Shifts for the current pay period (period_start .. period_end) -----
  insert into public.shifts
    (user_id, employee_id, employee_name, shift_date, start_time, end_time, unpaid_break_minutes, role, notes)
  values
    -- Week 1
    (demo_user, emp_maria,  'Maria Gonzalez',  period_start,      '09:00', '17:00', 30, 'Manager',    'Open + lunch'),
    (demo_user, emp_jordan, 'Jordan Thompson', period_start,      '11:00', '19:00', 30, 'Server',     'Section A'),
    (demo_user, emp_aisha,  'Aisha Khan',      period_start,      '16:00', '23:00', 30, 'Server',     'Dinner'),
    (demo_user, emp_diego,  'Diego Ramirez',   period_start,      '10:00', '18:00', 30, 'Cook',       ''),
    (demo_user, emp_ravi,   'Ravi Patel',      period_start,      '11:00', '15:00',  0, 'Cashier',    'Lunch only'),

    (demo_user, emp_maria,  'Maria Gonzalez',  period_start + 1,  '09:00', '17:00', 30, 'Manager',    ''),
    (demo_user, emp_jordan, 'Jordan Thompson', period_start + 1,  '16:00', '23:00', 30, 'Server',     ''),
    (demo_user, emp_priya,  'Priya Shah',      period_start + 1,  '10:00', '18:00', 30, 'Cook',       ''),
    (demo_user, emp_sam,    'Sam Lee',         period_start + 1,  '17:00', '23:00',  0, 'Bartender',  ''),
    (demo_user, emp_chris,  'Chris Nguyen',    period_start + 1,  '14:00', '22:00', 30, 'Dishwasher', ''),

    (demo_user, emp_aisha,  'Aisha Khan',      period_start + 2,  '11:00', '19:00', 30, 'Server',     ''),
    (demo_user, emp_diego,  'Diego Ramirez',   period_start + 2,  '10:00', '18:00', 30, 'Cook',       ''),
    (demo_user, emp_ravi,   'Ravi Patel',      period_start + 2,  '11:00', '15:00',  0, 'Cashier',    ''),

    (demo_user, emp_maria,  'Maria Gonzalez',  period_start + 3,  '09:00', '17:00', 30, 'Manager',    ''),
    (demo_user, emp_jordan, 'Jordan Thompson', period_start + 3,  '11:00', '19:00', 30, 'Server',     ''),
    (demo_user, emp_priya,  'Priya Shah',      period_start + 3,  '10:00', '18:00', 30, 'Cook',       ''),

    (demo_user, emp_aisha,  'Aisha Khan',      period_start + 4,  '16:00', '23:00', 30, 'Server',     'Friday'),
    (demo_user, emp_jordan, 'Jordan Thompson', period_start + 4,  '11:00', '19:00', 30, 'Server',     ''),
    (demo_user, emp_diego,  'Diego Ramirez',   period_start + 4,  '14:00', '23:00', 45, 'Cook',       'Dinner shift'),
    (demo_user, emp_sam,    'Sam Lee',         period_start + 4,  '17:00', '23:00',  0, 'Bartender',  ''),
    (demo_user, emp_chris,  'Chris Nguyen',    period_start + 4,  '17:00', '23:00',  0, 'Dishwasher', ''),

    (demo_user, emp_maria,  'Maria Gonzalez',  period_start + 5,  '10:00', '18:00', 30, 'Manager',    'Sat'),
    (demo_user, emp_jordan, 'Jordan Thompson', period_start + 5,  '16:00', '23:00', 30, 'Server',     ''),
    (demo_user, emp_aisha,  'Aisha Khan',      period_start + 5,  '16:00', '23:00', 30, 'Server',     ''),
    (demo_user, emp_diego,  'Diego Ramirez',   period_start + 5,  '14:00', '23:00', 45, 'Cook',       ''),
    (demo_user, emp_priya,  'Priya Shah',      period_start + 5,  '11:00', '19:00', 30, 'Cook',       ''),
    (demo_user, emp_sam,    'Sam Lee',         period_start + 5,  '17:00', '23:00',  0, 'Bartender',  ''),

    (demo_user, emp_maria,  'Maria Gonzalez',  period_start + 6,  '10:00', '16:00', 30, 'Manager',    'Sun brunch'),
    (demo_user, emp_aisha,  'Aisha Khan',      period_start + 6,  '10:00', '16:00', 30, 'Server',     'Brunch'),
    (demo_user, emp_priya,  'Priya Shah',      period_start + 6,  '09:00', '15:00', 30, 'Cook',       'Brunch'),

    -- Week 2
    (demo_user, emp_maria,  'Maria Gonzalez',  period_start + 7,  '09:00', '17:00', 30, 'Manager',    ''),
    (demo_user, emp_jordan, 'Jordan Thompson', period_start + 7,  '11:00', '19:00', 30, 'Server',     ''),
    (demo_user, emp_diego,  'Diego Ramirez',   period_start + 7,  '10:00', '18:00', 30, 'Cook',       ''),

    (demo_user, emp_aisha,  'Aisha Khan',      period_start + 8,  '16:00', '23:00', 30, 'Server',     ''),
    (demo_user, emp_priya,  'Priya Shah',      period_start + 8,  '10:00', '18:00', 30, 'Cook',       ''),
    (demo_user, emp_chris,  'Chris Nguyen',    period_start + 8,  '14:00', '22:00', 30, 'Dishwasher', ''),
    (demo_user, emp_ravi,   'Ravi Patel',      period_start + 8,  '11:00', '15:00',  0, 'Cashier',    ''),

    (demo_user, emp_maria,  'Maria Gonzalez',  period_start + 9,  '09:00', '17:00', 30, 'Manager',    ''),
    (demo_user, emp_jordan, 'Jordan Thompson', period_start + 9,  '11:00', '19:00', 30, 'Server',     ''),
    (demo_user, emp_diego,  'Diego Ramirez',   period_start + 9,  '10:00', '18:00', 30, 'Cook',       ''),

    (demo_user, emp_aisha,  'Aisha Khan',      period_start + 10, '11:00', '19:00', 30, 'Server',     ''),
    (demo_user, emp_priya,  'Priya Shah',      period_start + 10, '10:00', '18:00', 30, 'Cook',       ''),
    (demo_user, emp_sam,    'Sam Lee',         period_start + 10, '17:00', '23:00',  0, 'Bartender',  ''),

    (demo_user, emp_jordan, 'Jordan Thompson', period_start + 11, '16:00', '23:00', 30, 'Server',     'Friday'),
    (demo_user, emp_aisha,  'Aisha Khan',      period_start + 11, '16:00', '23:00', 30, 'Server',     ''),
    (demo_user, emp_diego,  'Diego Ramirez',   period_start + 11, '14:00', '23:00', 45, 'Cook',       ''),
    (demo_user, emp_sam,    'Sam Lee',         period_start + 11, '17:00', '23:00',  0, 'Bartender',  ''),

    (demo_user, emp_maria,  'Maria Gonzalez',  period_start + 12, '10:00', '18:00', 30, 'Manager',    'Sat'),
    (demo_user, emp_jordan, 'Jordan Thompson', period_start + 12, '16:00', '23:00', 30, 'Server',     ''),
    (demo_user, emp_aisha,  'Aisha Khan',      period_start + 12, '16:00', '23:00', 30, 'Server',     ''),
    (demo_user, emp_diego,  'Diego Ramirez',   period_start + 12, '14:00', '23:00', 45, 'Cook',       ''),
    (demo_user, emp_chris,  'Chris Nguyen',    period_start + 12, '17:00', '23:00',  0, 'Dishwasher', ''),

    (demo_user, emp_maria,  'Maria Gonzalez',  period_start + 13, '10:00', '16:00', 30, 'Manager',    'Sun'),
    (demo_user, emp_priya,  'Priya Shah',      period_start + 13, '09:00', '15:00', 30, 'Cook',       'Brunch');

  -- ----- Tasks -----
  insert into public.tasks
    (user_id, task_name, category, priority, due_date, completed)
  values
    (demo_user, 'Order produce from Local Farms',   'Inventory',   'high',   current_date,     false),
    (demo_user, 'Schedule next 2-week period',      'Staffing',    'high',   current_date + 1, false),
    (demo_user, 'Replace patio bulbs',              'Maintenance', 'low',    current_date + 5, false),
    (demo_user, 'Renew food handler certs',         'Compliance',  'medium', current_date + 10, false),
    (demo_user, 'Deep clean walk-in cooler',        'Maintenance', 'medium', current_date + 3, false),
    (demo_user, 'Audit weekly inventory variance',  'Inventory',   'medium', current_date - 1, true),
    (demo_user, 'Run new server training session',  'Staffing',    'low',    current_date + 7, false);

  raise notice 'Seeded data for pay period: % to %', period_start, period_end;
end $$;
