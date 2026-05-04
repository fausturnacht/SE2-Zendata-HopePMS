# Sprint 2: QA Execution Log & Summary

**Tester:** Julius Albert D. Ortiz

**Date:** May 4, 2026

**Environment:** Local Development (http://localhost:3001)

**Status:** ⚠️ BLOCKED (Pending Bug Fixes)

## 1. Executive Summary
Sprint 2 focused on enforcing the **User Rights Matrix** and implementing **Soft-Delete** logic across the Product and User modules. Testing involved 18 formal manual scenarios and a corresponding automated Vitest suite.

## 2. Rights Test Matrix Execution (Manual)
**Goal:** Verify that the `UserModule_Rights` configuration is correctly enforced at the UI level for all user roles.

### 2.1 SUPERADMIN Validation
**Expected Profile:** All rights enabled.
| Right ID | Feature / Component Tested | Expected | Actual | Notes |
| :--- | :--- | :--- | :--- | :--- |
| PRD_ADD | 'Add Product' Button Visibility | Visible | [✓] PASS | Text boxes for Product code and Description are quite small. "Add Product" button isn't readable. |
| PRD_EDIT | 'Edit' Button on Product Rows | Visible | [✓] PASS | Description text box is quite small. |
| PRD_DEL | 'Delete' (Soft) Button on Rows | Visible | [✓] PASS | |
| REP_001 | 'Product Report' Sidebar Link | Visible | [✓] PASS | |
| REP_002 | 'Top Selling' Sidebar Link | Visible | [✓] PASS | |
| ADM_USER | 'Admin / User Mgmt' Sidebar Link | Visible | [✓] PASS | |

### 2.2 ADMIN Validation
**Expected Profile:** Partial rights enabled.
| Right ID | Feature / Component Tested | Expected | Actual | Notes |
| :--- | :--- | :--- | :--- | :--- |
| PRD_ADD | 'Add Product' Button Visibility | Visible | [✓] PASS | UI text box issues persist. |
| PRD_EDIT | 'Edit' Button on Product Rows | Visible | [X] FAIL | The Edit Button isn't visible. |
| PRD_DEL | 'Delete' (Soft) Button on Rows | Hidden | [✓] PASS | |
| REP_001 | 'Product Report' Sidebar Link | Visible | [✓] PASS | |
| REP_002 | 'Top Selling' Sidebar Link | Hidden | [X] FAIL | The 'Top Selling' Sidebar Link is visible. |
| ADM_USER | 'Admin / User Mgmt' Sidebar Link | Hidden | [✓] PASS | |

### 2.3 USER Validation
**Expected Profile:** Limited rights enabled.
| Right ID | Feature / Component Tested | Expected | Actual | Notes |
| :--- | :--- | :--- | :--- | :--- |
| PRD_ADD | 'Add Product' Button Visibility | Visible | [✓] PASS | UI text box issues persist. |
| PRD_EDIT | 'Edit' Button on Product Rows | Visible | [X] FAIL | The Edit Button isn't visible. |
| PRD_DEL | 'Delete' (Soft) Button on Rows | Hidden | [✓] PASS | |
| REP_001 | 'Product Report' Sidebar Link | Visible | [✓] PASS | |
| REP_002 | 'Top Selling' Sidebar Link | Hidden | [X] FAIL | The 'Top Selling' Sidebar Link is visible. |
| ADM_USER | 'Admin / User Mgmt' Sidebar Link | Hidden | [✓] PASS | |

## 3. Soft-Delete & Security Audit Execution (Manual)
This section verifies the three absolute rules of the database implementation regarding "deleted" items.

### 3.1 The Soft-Delete Action Test
* **Action:** Log in as SUPERADMIN/ADMIN and delete a product.
* **Verification:** Confirm the item immediately disappears from the standard Product List view.
* **Result:** **PASS**. Item status updates to `DELETED` in the database, not hard-deleted.

### 3.2 The USER Invisibility Test & API Bypass
* **Action:** Log in as a standard USER.
* **Verification 1 (UI):** Confirm the deleted item does not appear in the standard Product List. (**PASS**)
* **Verification 2 (API Bypass - CRITICAL):** Attempt a direct API call via browser console to fetch the deleted product while logged in as a USER.
* **Result:** **FAIL**. Supabase RLS policy does NOT block the USER from seeing `INACTIVE` rows. They can bypass the frontend UI to fetch deleted data.

### 3.3 The Recovery Test
* **Action:** Log in as ADMIN/SUPERADMIN.
* **Verification 1:** Navigate to "Deleted Items" panel and verify product is visible. (**PASS**)
* **Verification 2:** Click the "Recover" button. (**PASS**)
* **Verification 3:** Log back in as a USER and confirm product reappeared in the standard list. (**PASS**)

### 3.4 "No Hard Delete" Codebase Audit
* **Action:** Global codebase search for `.delete()` commands.
* **Expected Result:** Zero instances of hard-delete SQL/API commands targeting 'product' or 'user' tables.
* **Result:** **FAIL**. Found one hard delete violation in `src/api/users.ts` on line 141 inside the `rejectUser` function (`await supabase.from('users').delete()`).

### 3.5 The Stamp Visibility Test
* **Verification 1:** Log in as USER. Ensure the stamp column (audit trail) is completely hidden. (**PASS**)
* **Verification 2:** Log in as ADMIN/SUPERADMIN. Ensure stamp column is visible. (**PASS**)

## 4. Automated Testing (Vitest)
Automated suites were added to verify UI gating and security leaks.
* **Total Tests:** 12
* **Passed:** 8
* **Failed:** 4 (Accurately reflecting the UI and Logic bugs listed above).

## 5. Required Fixes for Sprint 3 Gate
1. **Database:** Refactor `src/api/users.ts` Line 141 to use `UPDATE` instead of `DELETE`.
2. **Database:** Update Supabase RLS policies to filter by `record_status = 'ACTIVE'` for non-admin roles.
3. **Frontend:** Correct UI gating for `REP_002` and `PRD_EDIT` in the Sidebar and ProductList components.
4. **Frontend (Minor):** Adjust input box sizes for Product Code and Description in the "Add Product" modal for better readability.

---
*End of Sprint 2 Log*