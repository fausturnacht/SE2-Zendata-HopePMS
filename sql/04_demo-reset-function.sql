-- 04_demo-reset-function.sql
-- Run this in the Supabase SQL Editor to create the reset utility.

CREATE SCHEMA IF NOT EXISTS backup;

-- Create tables and copy data (run this once to snapshot the pristine state)
-- CREATE TABLE IF NOT EXISTS backup.employee AS SELECT * FROM public.employee;
-- CREATE TABLE IF NOT EXISTS backup.department AS SELECT * FROM public.department;
-- CREATE TABLE IF NOT EXISTS backup.job AS SELECT * FROM public.job;
-- CREATE TABLE IF NOT EXISTS backup.jobhistory AS SELECT * FROM public.jobhistory;
-- CREATE TABLE IF NOT EXISTS backup.customer AS SELECT * FROM public.customer;
-- CREATE TABLE IF NOT EXISTS backup.product AS SELECT * FROM public.product;
-- CREATE TABLE IF NOT EXISTS backup.pricehist AS SELECT * FROM public.pricehist;
-- CREATE TABLE IF NOT EXISTS backup.sales AS SELECT * FROM public.sales;
-- CREATE TABLE IF NOT EXISTS backup.salesdetail AS SELECT * FROM public.salesdetail;
-- CREATE TABLE IF NOT EXISTS backup.payment AS SELECT * FROM public.payment;

CREATE OR REPLACE FUNCTION public.reset_demo_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 1. Disable triggers temporarily to speed up and avoid conflicts
    SET session_replication_role = 'replica';

    -- 2. Truncate Transactional/Log Tables
    TRUNCATE TABLE public.product_stamp_log CASCADE;
    TRUNCATE TABLE public.pricehist_stamp_log CASCADE;
    TRUNCATE TABLE public.product_stamp_hist CASCADE;
    TRUNCATE TABLE public.user_stamp_hist CASCADE;
    
    -- 3. Clear Data Tables
    TRUNCATE TABLE public.employee CASCADE;
    TRUNCATE TABLE public.department CASCADE;
    TRUNCATE TABLE public.job CASCADE;
    TRUNCATE TABLE public.jobhistory CASCADE;
    TRUNCATE TABLE public.customer CASCADE;
    TRUNCATE TABLE public.product CASCADE;
    TRUNCATE TABLE public.pricehist CASCADE;
    TRUNCATE TABLE public.sales CASCADE;
    TRUNCATE TABLE public.salesdetail CASCADE;
    TRUNCATE TABLE public.payment CASCADE;

    -- 4. Restore Data from Backup Schema
    INSERT INTO public.employee SELECT * FROM backup.employee;
    INSERT INTO public.department SELECT * FROM backup.department;
    INSERT INTO public.job SELECT * FROM backup.job;
    INSERT INTO public.jobhistory SELECT * FROM backup.jobhistory;
    INSERT INTO public.customer SELECT * FROM backup.customer;
    INSERT INTO public.product SELECT * FROM backup.product;
    INSERT INTO public.pricehist SELECT * FROM backup.pricehist;
    INSERT INTO public.sales SELECT * FROM backup.sales;
    INSERT INTO public.salesdetail SELECT * FROM backup.salesdetail;
    INSERT INTO public.payment SELECT * FROM backup.payment;

    -- 5. Re-enable triggers
    SET session_replication_role = 'origin';

    RAISE NOTICE 'Demo data restored from backup schema.';
END;
$$;
