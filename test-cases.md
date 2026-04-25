# Hope, Inc. Product Management System (PMS) - QA Test Cases

### **Test ID:** TC-AUTH-FUNC-001
**Feature:** Google OAuth & Auto-Provisioning

**Scenario:** Google OAuth auto-provisioning assigns default USER role and INACTIVE status.

**Steps:**
1. Navigate to the PMS Login page.
2. Click "Continue with Google" and authenticate using a valid Google account not previously registered.
3. Inspect the provisioned user record in the Supabase user profile table.

**Expected Result:** The OAuth handshake succeeds. The user profile is auto-provisioned with `role = 'USER'` and `record_status = 'INACTIVE'`.

**Actual Result:**

**Status:** 

**Notes:** 

### **Test ID:** TC-AUTH-NEG-001
**Feature:** Authentication & Login Guard

**Scenario:** Login Guard blocks authentication for a Google account with an INACTIVE status.

**Steps:**
1. Navigate to the PMS Login page.
2. Attempt to log in via Google OAuth with an account known to have `record_status = 'INACTIVE'`.
3. Observe the frontend routing and Supabase session state.

**Expected Result:** The Login Guard detects the INACTIVE status after the OAuth callback, triggers `supabase.auth.signOut()`, redirects to Login, and displays an "Account Pending Approval" toast.

**Actual Result:**

**Status:** 

**Notes:** 

### **Test ID:** TC-AUTH-FUNC-002
**Feature:** Authentication & Login Guard

**Scenario:** Login Guard allows dashboard access for an ACTIVE Google-authenticated user.

**Steps:**
1. Navigate to the PMS Login page.
2. Log in via Google OAuth with an account where `record_status = 'ACTIVE'`.
3. Observe the frontend routing.

**Expected Result:** The Login Guard verifies the ACTIVE status and successfully permits the redirect to the internal dashboard.

**Actual Result:**

**Status:** 

**Notes:** 

### **Test ID:** TC-RGHT-NEG-001

**Feature:** Rights Matrix Gating

**Scenario:** Verify a USER cannot see or access the PRD_DEL (Delete Product) action.

**Steps:**
1. Log in as an ACTIVE standard USER (PRD_DEL = 0).
2. Navigate to the Product Management dashboard.
3. Select an existing product and check for the "Delete" action.

**Expected Result:** The "Delete" button is not rendered in the UI. Component-level permission checks return false for the USER role.

**Actual Result:**

**Status:** 

**Notes:** 

### **Test ID:** TC-RGHT-NEG-002
**Feature:** Rights Matrix Gating

**Scenario:** Verify the audit stamp column is strictly hidden from USER accounts.

**Steps:**
1. Log in as an ACTIVE standard USER.
2. Navigate to the Product list/grid.
3. Inspect the table columns and the React component props.

**Expected Result:** The audit stamp column (Created By/At) is not visible in the UI and is excluded from the data mapping for this role.

**Actual Result:**

**Status:** 

**Notes:** 

### **Test ID:** TC-RGHT-FUNC-001
**Feature:** Rights Matrix Gating

**Scenario:** Verify an ADMIN can access and view the REP_001 report.

**Steps:**
1. Log in as an ACTIVE ADMIN (REP_001 = 1).
2. Navigate to the Reports sidebar and click "Report 001".

**Expected Result:** Access is granted; the report component mounts and fetches data successfully.

**Actual Result:**

**Status:** 

**Notes:** 

### **Test ID:** TC-RGHT-NEG-003
**Feature:** Rights Matrix Gating

**Scenario:** Verify an ADMIN is restricted from accessing the REP_002 (Top Selling) report.

**Steps:**
1. Log in as an ACTIVE ADMIN (REP_002 = 0).
2. Attempt to click the REP_002 link or navigate directly to `/reports/top-selling`.

**Expected Result:** The link is hidden. Manual navigation triggers a redirect to the "Unauthorized" page via the global route guard.

**Actual Result:**

**Status:** 

**Notes:** 

### **Test ID:** TC-DEL-NEG-001
**Feature:** Soft-Delete & Visibility

**Scenario:** A SUPERADMIN soft-deletes a product; verify it is hidden from USER accounts.

**Steps:**
1. As SUPERADMIN, set a product status to 'INACTIVE'.
2. Log in as an ACTIVE USER.
3. Search for the specific product in the main inventory list.

**Expected Result:** The product does not appear in the search results or the list view for the USER.

**Actual Result:**

**Status:** 

**Notes:** 

### **Test ID:** TC-DEL-SEC-001
**Feature:** Soft-Delete & Visibility

**Scenario:** Security API Bypass—USER attempts to fetch INACTIVE products via direct Supabase API call.

**Steps:**
1. Log in as an ACTIVE USER and capture the JWT.
2. Use an API client to query the `products` table where `record_status = 'INACTIVE'`.

**Expected Result:** Supabase RLS returns an empty array or 403, as the policy for USER role only allows `SELECT` where `record_status = 'ACTIVE'`.

**Actual Result:**

**Status:** 

**Notes:** 

### **Test ID:** TC-ADMIN-NEG-001
**Feature:** SUPERADMIN Protection

**Scenario:** ADMIN attempts to deactivate a SUPERADMIN via the User Management Page.

**Steps:**
1. Log in as an ACTIVE ADMIN.
2. Navigate to User Management.
3. Locate a SUPERADMIN and attempt to click the "Deactivate" toggle.

**Expected Result:** The toggle is disabled (grayed out) with a tooltip stating "Protected Account". The UI prevents the action.

**Actual Result:**

**Status:** 

**Notes:** 

### **Test ID:** TC-ADMIN-SEC-001
**Feature:** SUPERADMIN Protection

**Scenario:** ADMIN attempts to bypass UI to alter a SUPERADMIN record via Supabase API.

**Steps:**
1. As an ADMIN, attempt an API `UPDATE` on a SUPERADMIN’s user type or status.

**Expected Result:** The database RLS policy (checking `target.role != 'SUPERADMIN'`) blocks the update, returning a database error.

**Actual Result:**

**Status:** 

**Notes:** 

### **Test ID:** TC-DEL-FUNC-001
**Feature:** Soft-Delete & Recovery

**Scenario:** SUPERADMIN soft-deletes a product (record_status change).

**Steps:**
1. As SUPERADMIN, click "Delete" on an active product.

**Expected Result:** The product disappears from the active view; database verification shows `record_status` is now 'INACTIVE'.

**Actual Result:**

**Status:** 

**Notes:** 

### **Test ID:** TC-DEL-FUNC-002
**Feature:** Soft-Delete & Recovery

**Scenario:** ADMIN recovers an INACTIVE product from the Deleted Items panel.

**Steps:**
1. As ADMIN, navigate to "Deleted Items".
2. Locate the product and click "Restore".

**Expected Result:** The product status returns to 'ACTIVE' and it becomes visible in the standard Product list.

**Actual Result:**

**Status:** 

**Notes:** 

### **Test ID:** TC-PROD-FUNC-001
**Feature:** Product Management

**Scenario:** USER successfully adds a new product.

**Steps:**
1. As USER, fill out the "New Product" form and click "Save".

**Expected Result:** Product is created successfully; UI displays a success notification and updates the list.

**Actual Result:**

**Status:** 

**Notes:** 

### **Test ID:** TC-PROD-EDGE-001
**Feature:** Price History Panel

**Scenario:** Verify price changes trigger a record in the Price History audit log.

**Steps:**
1. As ADMIN, edit a product's price and save.
2. Open the "Price History" panel for that product.

**Expected Result:** A new entry exists showing the old price, the new price, and the timestamp of the change.

**Actual Result:**

**Status:** 

**Notes:** 

### **Test ID:** TC-PROD-FUNC-002
**Feature:** Product Management

**Scenario:** USER edits an existing product but cannot change the status.

**Steps:**
1. As USER, open the "Edit Product" modal.
2. Look for the "Record Status" dropdown or toggle.

**Expected Result:** The status field is read-only or hidden for the USER role, preventing unauthorized self-activation/deactivation.

**Actual Result:**

**Status:** 

**Notes:** 

### **Test ID:** TC-ADMIN-FUNC-001
**Feature:** User Management

**Scenario:** ADMIN activates a newly registered Google USER.

**Steps:**
1. As ADMIN, go to User Management.
2. Find the INACTIVE user and change status to ACTIVE.

**Expected Result:** Record updates successfully. User can now pass the Login Guard.

**Actual Result:**

**Status:** 

**Notes:** 

### **Test ID:** TC-ADMIN-FUNC-002
**Feature:** Rights Matrix

**Scenario:** SUPERADMIN updates an ADMIN's permission to include PRD_DEL.

**Steps:**
1. As SUPERADMIN, edit an ADMIN's rights matrix.
2. Set PRD_DEL to 1 and save.

**Expected Result:** Permission is updated. The ADMIN can now see and use the Delete button upon refresh.

**Actual Result:**

**Status:** 

**Notes:** 
