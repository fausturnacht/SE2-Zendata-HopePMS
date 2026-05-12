-- 04_demo-reset-function.sql
-- Run this in the Supabase SQL Editor to create the reset utility.

CREATE OR REPLACE FUNCTION public.reset_demo_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with high privileges to allow truncating
AS $$
BEGIN
    -- 1. Disable triggers temporarily to speed up and avoid conflicts
    SET session_replication_role = 'replica';

    -- 2. Truncate Transactional/Log Tables
    TRUNCATE TABLE public.product_stamp_log CASCADE;
    TRUNCATE TABLE public.pricehist_stamp_log CASCADE;
    TRUNCATE TABLE public.product_stamp_hist CASCADE;
    TRUNCATE TABLE public.user_stamp_hist CASCADE;
    
    -- 3. Clear Data Tables (Wait, only if we have a re-seed script!)
    -- If you have a full seed script, uncomment these:
    -- TRUNCATE TABLE public.product CASCADE;
    -- TRUNCATE TABLE public.pricehist CASCADE;
    -- TRUNCATE TABLE public.sales CASCADE;
    -- TRUNCATE TABLE public.salesdetail CASCADE;

    -- 4. Re-enable triggers
    SET session_replication_role = 'origin';

    -- Note: To fully automate the reset, you can call this function 
    -- from a Supabase Edge Function triggered by a Cron job (pg_cron).
    
    RAISE NOTICE 'Demo data reset completed.';
END;
$$;
