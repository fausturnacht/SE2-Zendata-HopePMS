# Sprint 2 | Week 2 Standup - April 20, 2026

> **Minutes of the Meeting**: 
> * **Date:** April 20, 2026
> * **Time:** 9:00 PM
> * **Duration:** 60 minutes
> * **Summary:** Final week of Sprint 2. The focus shifted heavily to QA testing, bug fixing, and enforcing the absolute security rules. M5 presented the results of the 18-case matrix and the security audit. The Sprint 2 Gate is currently BLOCKED pending critical fixes to hard-deletes and UI gating leaks.

## Agenda

### **Project Lead (M1)** - **What I completed since last week**:
  - Wired all CRUD and Price History API functions. 
  - Implemented the route guard for `/deleted-items` to redirect `USER` accounts away.

- **What I am working on this week**: 
  - Integrating `UserRightsContext` at the app level.
  - Assisting M2 and M3 with fixing the bugs found by QA, specifically the hard delete violation in the API routes.

- **Any blockers or help needed**:
  - Need M3 to refactor the database call in `src/api/users.ts` to use `UPDATE` instead of `.delete()` before we can pass the sprint gate.

### **Frontend Developer (M2)** - **What I completed since last week**: 
  - Built the `DeletedItemsPage` accessible only to ADMIN/SUPERADMIN.
  - Implemented the `PriceHistoryPanel`.

- **What I am working on this week**: 
  - Fixing UI bugs reported by QA: The "Add Product" input text boxes are too small and unreadable.
  - Fixing the missing "Edit" button on product rows for ADMIN and USER accounts.

- **Any blockers or help needed**:
  - Need M4 to help review the gating logic on the Sidebar. QA reported that `REP_002` (Top Selling) is visibly leaking to Admin and User accounts when it should be hidden.

### **DB Engineer (M3)** - **What I completed since last week**: 
  - Deployed the `current_product_price` view and initial RLS policies.

- **What I am working on this week**: 
  - **CRITICAL FIX:** QA found a direct API bypass where `USER` accounts can see `INACTIVE` rows. I am updating the `product` SELECT RLS policy to strictly filter `record_status = 'ACTIVE'` for non-admins.
  - Replacing the `.delete()` call found in `src/api/users.ts` with a soft-delete `UPDATE` statement.

- **Any blockers or help needed**: 
  - None. Prioritizing the security patches to unblock the Sprint 2 gate.

### **Rights & Authentication Lead (M4)** - **What I completed since last week**:
  - Deployed `UserRightsContext` and the `useRights()` hook.

- **What I am working on this week**:
  - Centralizing the UI gating logic.
  - Fixing the bug where the stamp column was remaining visible to `USER` accounts. Ensuring it only renders if `currentUser.user_type` is ADMIN or SUPERADMIN.
  - Fixing the `REP_002` visibility leak on the sidebar.

- **Any blockers or help needed**: 
  - Working directly with M2 to patch the component visibility issues.

### **QA & Documentation Lead (M5)** - **What I completed since last week**:
  - Executed the full manual Rights Test Matrix and automated Vitest suites.
  - Conducted the Codebase Audit and discovered a hard-delete violation on line 141 of `src/api/users.ts`.

- **What I am working on this week**: 
  - Re-testing the API bypass and UI gating once M2, M3, and M4 push their hotfixes.
  - Compiling the final `sprint2-log.md` detailing the test failures and subsequent fixes.

- **Any blockers or help needed**: 
  - The Sprint 2 Gate remains ⚠️ BLOCKED until the hard delete is removed and the `INACTIVE` API bypass is patched. Will run regression testing once PRs are merged.