-- Optional sample data for demo / portfolio screenshots.
-- IMPORTANT:
--   1. Sign up / log in once in the app to create an auth user.
--   2. In the Supabase SQL editor, replace the placeholder below with your
--      auth user id (Auth → Users → copy the UID).
--   3. Run this script.

do $$
declare
  demo_user uuid := '4607958a-882d-40be-95ac-a77ed10ce4bc';
begin
  -- Inventory ----------------------------------------------------------
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

  -- Sales (last 14 days) ----------------------------------------------
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

  -- Shifts (next 7 days) ----------------------------------------------
  insert into public.shifts
    (user_id, employee_name, shift_date, start_time, end_time, role, notes)
  values
    (demo_user, 'Maria G.',   current_date,     '10:00', '16:00', 'Manager',    'Open + lunch'),
    (demo_user, 'Jordan T.',  current_date,     '15:00', '23:00', 'Server',     'Dinner section A'),
    (demo_user, 'Aisha K.',   current_date,     '15:00', '23:00', 'Server',     'Dinner section B'),
    (demo_user, 'Diego R.',   current_date,     '11:00', '19:00', 'Cook',       ''),
    (demo_user, 'Priya S.',   current_date + 1, '10:00', '18:00', 'Manager',    ''),
    (demo_user, 'Jordan T.',  current_date + 1, '15:00', '23:00', 'Server',     ''),
    (demo_user, 'Sam L.',     current_date + 2, '17:00', '23:00', 'Bartender',  ''),
    (demo_user, 'Ravi P.',    current_date + 3, '11:00', '19:00', 'Cook',       ''),
    (demo_user, 'Maria G.',   current_date + 4, '10:00', '18:00', 'Manager',    ''),
    (demo_user, 'Aisha K.',   current_date + 4, '17:00', '23:00', 'Server',     '');

  -- Tasks --------------------------------------------------------------
  insert into public.tasks
    (user_id, task_name, category, priority, due_date, completed)
  values
    (demo_user, 'Order produce from Local Farms',   'Inventory',   'high',   current_date,     false),
    (demo_user, 'Schedule next week''s shifts',     'Staffing',    'high',   current_date + 1, false),
    (demo_user, 'Replace patio bulbs',              'Maintenance', 'low',    current_date + 5, false),
    (demo_user, 'Renew food handler certs',         'Compliance',  'medium', current_date + 10, false),
    (demo_user, 'Deep clean walk-in cooler',        'Maintenance', 'medium', current_date + 3, false),
    (demo_user, 'Audit weekly inventory variance',  'Inventory',   'medium', current_date - 1, true),
    (demo_user, 'Run new server training session',  'Staffing',    'low',    current_date + 7, false);
end $$;
