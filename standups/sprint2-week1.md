# Sprint 2 | Week 1 Standup - April 13, 2026

> **Minutes of the Meeting**: 
> * **Date:** April 13, 2026
> * **Time:** 9:00 PM
> * **Duration:** 45 minutes
> * **Summary:** Kickoff for Sprint 2. The team successfully passed the Sprint 1 gate (Authentication & Database Seed). The agenda for this week is strictly focused on building the core Product CRUD operations, implementing the Price History panel, and beginning the Row Level Security (RLS) and UI gating implementations. 

## Agenda

### **Project Lead (M1)** - **What I completed since last week**:
  - Merged all Sprint 1 authentication and routing PRs into the `dev` branch.
  - Verified that the Google OAuth and Email login guards are functioning correctly.

- **What I am working on this week**: 
  - Wiring all product API calls using the Supabase JS client (`getProducts`, `addProduct`, `updateProduct`, `softDeleteProduct`, `recoverProduct`).
  - Wiring the `priceHist` API calls (`getPriceHistory`, `addPriceEntry`).

- **Any blockers or help needed**:
  - Waiting on M3 to finalize the RLS policies so I can test if the `getProducts` call correctly filters out `INACTIVE` rows for standard users.

### **Frontend Developer (M2)** - **What I completed since last week**: 
  - Completed the App shell, Navbar, and Sidebar components.

- **What I am working on this week**: 
  - Building the `ProductListPage` table with columns for prodCode, description, unit, and current price.
  - Creating the `AddProductModal`, `EditProductModal`, and `SoftDeleteConfirmDialog`.

- **Any blockers or help needed**:
  - Need M4 to finish the `useRights()` hook so I can conditionally hide the Add/Edit/Delete buttons on the product rows based on the logged-in user's rights.

### **DB Engineer (M3)** - **What I completed since last week**: 
  - Successfully seeded the `HopeDB` database and the `SUPERADMIN` account.

- **What I am working on this week**: 
  - Writing the core RLS policies for the `product` table: SELECT (ACTIVE-only for USER), INSERT, UPDATE, and soft-delete/recovery rules.
  - Creating the `current_product_price` SQL view to fetch the latest unit price per product.

- **Any blockers or help needed**: 
  - None currently. Testing the RLS policies in the Supabase SQL editor using impersonation.

### **Rights & Authentication Lead (M4)** - **What I completed since last week**:
  - Finished the auto-provisioning PostgreSQL trigger for Google OAuth and Email signups.

- **What I am working on this week**:
  - Building the `UserRightsContext.jsx` to query and store the `UserModule_Rights` on login.
  - Creating the `useRights()` hook to pass the rights map (e.g., `{ PRD_ADD: 1, PRD_DEL: 0 }`) to the frontend components.

- **Any blockers or help needed**: 
  - Need to coordinate with M2 to ensure the rights logic is applied to the UI buttons cleanly without copy-pasting checks everywhere.

### **QA & Documentation Lead (M5)** - **What I completed since last week**:
  - Finalized the Sprint 1 test suites (Vitest) for the Auth flows and updated the README.

- **What I am working on this week**: 
  - Designing the 18-case rights test matrix (3 user types × 6 rights) for manual and automated execution.
  - Preparing the audit checklist for the "No hard deletes" rule to grep the codebase for any `delete()` calls.

- **Any blockers or help needed**: 
  - Reminding the team that I will be doing a direct API bypass test. M3 needs to ensure the DB-level RLS prevents `USER` accounts from fetching `INACTIVE` rows.

