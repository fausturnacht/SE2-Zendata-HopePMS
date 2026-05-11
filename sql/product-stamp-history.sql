-- Create stamp log and trigger

-- PRODUCT
-- 1. Create audit log table
CREATE TABLE IF NOT EXISTS public.product_stamp_log (
    id SERIAL PRIMARY KEY,
    prodCode TEXT NOT NULL,
    action TEXT NOT NULL,
    userid UUID,
    stamp TIMESTAMP DEFAULT NOW()
);

-- 2. Trigger function to log changes
CREATE OR REPLACE FUNCTION public.log_product_stamp()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.product_stamp_log (prodCode, action, userid)
    VALUES (NEW.prodCode, TG_OP, auth.uid());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Attach trigger to product table
DROP TRIGGER IF EXISTS product_stamp_trigger ON public.product;

CREATE TRIGGER product_stamp_trigger
AFTER INSERT OR UPDATE ON public.product
FOR EACH ROW
EXECUTE FUNCTION public.log_product_stamp();

-- PRICEHIST
-- 1. Create audit log table
CREATE TABLE IF NOT EXISTS public.pricehist_stamp_log (
    id SERIAL PRIMARY KEY,
    prodCode TEXT NOT NULL,
    action TEXT NOT NULL,
    userid UUID,
    stamp TIMESTAMP DEFAULT NOW()
);

-- 2. Trigger function to log changes
CREATE OR REPLACE FUNCTION public.log_pricehist_stamp()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.pricehist_stamp_log (prodCode, action, userid)
    VALUES (NEW.prodCode, TG_OP, auth.uid());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Attach trigger to pricehist table
DROP TRIGGER IF EXISTS pricehist_stamp_trigger ON public.pricehist;

CREATE TRIGGER pricehist_stamp_trigger
AFTER INSERT OR UPDATE ON public.pricehist
FOR EACH ROW
EXECUTE FUNCTION public.log_pricehist_stamp();
