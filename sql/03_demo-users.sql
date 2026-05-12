-- 03_demo-users.sql
-- Run this in the Supabase SQL Editor to seed the demo environment.

-- 1. Create Demo Users in public.users
-- Note: These IDs should ideally match the UUIDs from auth.users after you create them in the dashboard.
-- For now, we use deterministic UUIDs for demo purposes.

INSERT INTO public.users (userid, email, username, user_type, record_status, stamp)
VALUES 
  ('8803d07f-8d50-42ae-bb2f-0f24a13a3d27', 'admin@demo.hope.com', 'Demo Admin', 'SUPERADMIN', 'ACTIVE', 'SYSTEM SEED'),
  ('4daf42c2-559b-48a3-91cc-4aebe55bc5ab', 'manager@demo.hope.com', 'Demo Manager', 'ADMIN', 'ACTIVE', 'SYSTEM SEED'),
  ('9bd53979-a830-4cdb-9ec9-f05d044b3340', 'staff@demo.hope.com', 'Demo Staff', 'USER', 'ACTIVE', 'SYSTEM SEED')
ON CONFLICT (userid) DO UPDATE 
SET email = EXCLUDED.email, username = EXCLUDED.username, user_type = EXCLUDED.user_type, record_status = EXCLUDED.record_status;

-- 2. Grant Module Access
-- SUPERADMIN gets everything automatically via hasRight logic in Frontend, 
-- but we seed usermodule_rights for completeness/RBAC testing.

-- Delete existing rights for demo users to avoid duplicates
DELETE FROM public.usermodule_rights WHERE userid IN (
  '8803d07f-8d50-42ae-bb2f-0f24a13a3d27', 
  '4daf42c2-559b-48a3-91cc-4aebe55bc5ab', 
  '9bd53979-a830-4cdb-9ec9-f05d044b3340'
);

-- Admin Rights
INSERT INTO public.usermodule_rights (userid, right_id, right_value)
VALUES 
  ('8803d07f-8d50-42ae-bb2f-0f24a13a3d27', 'PRD_ADD', 1),
  ('8803d07f-8d50-42ae-bb2f-0f24a13a3d27', 'PRD_EDIT', 1),
  ('8803d07f-8d50-42ae-bb2f-0f24a13a3d27', 'PRD_DEL', 1),
  ('8803d07f-8d50-42ae-bb2f-0f24a13a3d27', 'REP_001', 1),
  ('8803d07f-8d50-42ae-bb2f-0f24a13a3d27', 'REP_002', 1),
  ('8803d07f-8d50-42ae-bb2f-0f24a13a3d27', 'ADM_USER', 1);

-- Manager Rights
INSERT INTO public.usermodule_rights (userid, right_id, right_value)
VALUES 
  ('4daf42c2-559b-48a3-91cc-4aebe55bc5ab', 'PRD_ADD', 1),
  ('4daf42c2-559b-48a3-91cc-4aebe55bc5ab', 'PRD_EDIT', 1),
  ('4daf42c2-559b-48a3-91cc-4aebe55bc5ab', 'REP_001', 1);

-- Staff Rights (Mostly View Only)
INSERT INTO public.usermodule_rights (userid, right_id, right_value)
VALUES 
  ('9bd53979-a830-4cdb-9ec9-f05d044b3340', 'REP_001', 1);
