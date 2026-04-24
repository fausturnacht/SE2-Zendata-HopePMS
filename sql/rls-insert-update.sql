-- Product INSERT: only if PRD_ADD = 1
CREATE POLICY product_insert
ON product
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM UserModule_Rights
    WHERE userid = auth.uid()::text
    AND Right_ID = 'PRD_ADD'
    AND right_value = 1
  )
);

-- Product UPDATE (edit fields): only if PRD_EDIT = 1
CREATE POLICY product_update_edit
ON product
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM UserModule_Rights
    WHERE userid = auth.uid()::text
    AND Right_ID = 'PRD_EDIT'
    AND right_value = 1
  )
);

-- Product UPDATE (soft delete): only if PRD_DEL = 1
CREATE POLICY product_soft_delete
ON product
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM UserModule_Rights
    WHERE userid = auth.uid()::text
    AND Right_ID = 'PRD_DEL'
    AND right_value = 1
  )
)
WITH CHECK (
  record_status = 'INACTIVE'
);

-- Product UPDATE (recovery): only ADMIN or SUPERADMIN
CREATE POLICY product_recover
ON product
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE userid = auth.uid()::text
    AND user_type IN ('ADMIN','SUPERADMIN')
  )
)
WITH CHECK (
  record_status = 'ACTIVE'
);

-- priceHist INSERT: allowed if PRD_ADD = 1
CREATE POLICY pricehist_insert
ON priceHist
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM UserModule_Rights
    WHERE userid = auth.uid()::text
    AND Right_ID = 'PRD_ADD'
    AND right_value = 1
  )
);