ALTER TABLE product ENABLE ROW LEVEL SECURITY;
ALTER TABLE priceHist ENABLE ROW LEVEL SECURITY;

-- product SELECT: USER sees ACTIVE only, ADMIN/SUPERADMIN see all
CREATE POLICY product_select_visibility
ON product
FOR SELECT
TO authenticated
USING (
  record_status = 'ACTIVE'
  OR EXISTS (
    SELECT 1 FROM users
    WHERE userid = auth.uid()::text
    AND user_type IN ('ADMIN','SUPERADMIN')
  )
);

-- priceHist SELECT: same visibility rule
CREATE POLICY pricehist_select_visibility
ON priceHist
FOR SELECT
TO authenticated
USING (
  record_status = 'ACTIVE'
  OR EXISTS (
    SELECT 1 FROM users
    WHERE userid = auth.uid()::text
    AND user_type IN ('ADMIN','SUPERADMIN')
  )
);