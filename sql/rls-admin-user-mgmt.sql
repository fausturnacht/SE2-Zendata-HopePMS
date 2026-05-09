-- User table RLS: ADMIN can update record_status only if target is not SUPERADMIN
CREATE POLICY admin_cannot_touch_superadmin
ON users
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.userid = auth.uid()::text
    AND u.user_type = 'ADMIN'
  )
  AND user_type != 'SUPERADMIN'
);

-- UserModule_Rights RLS: ADMIN cannot modify SUPERADMIN rights
CREATE POLICY protect_superadmin_rights
ON UserModule_Rights
FOR ALL
TO authenticated
USING (
  userid NOT IN (
    SELECT userid FROM users
    WHERE user_type = 'SUPERADMIN'
  )
);
