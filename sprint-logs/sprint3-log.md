# Sprint 3: QA Execution Log & Summary

**Tester:** Julius Albert D. Ortiz

**Date:** May 5, 2026

**Environment:** Live Production (https://zendata-hope-pms.vercel.app/)

**Status:** ✅ APPROVED. Ready for Handover.

## 1. Executive Summary
Sprint 3 focused on executing final End-to-End (E2E) testing on the live Vercel production deployment. Testing verified the resolution of all Sprint 2 bugs, confirmed the strict enforcement of the **"No Hard Delete"** policy, and validated the **SUPERADMIN Protection Protocol**. All required documentation and presentation assets have been finalized for project handover.

## 2. Rights Test Matrix Execution (Production E2E)
**Goal:** Verify that the `UserModule_Rights` configuration is correctly enforced at the UI level for all user roles in the production environment, confirming fixes from Sprint 2.

### 2.1 SUPERADMIN Validation
**Expected Profile:** All rights enabled.
| Right ID | Feature / Component Tested | Expected | Actual | Notes |
| :--- | :--- | :--- | :--- | :--- |
| PRD_ADD | 'Add Product' Button Visibility | Visible | [✓] PASS | UI text box sizes were fixed and are now readable. |
| PRD_EDIT | 'Edit' Button on Product Rows | Visible | [✓] PASS | Action buttons correctly appear on row hover. |
| PRD_DEL | 'Delete' (Soft) Button on Rows | Visible | [✓] PASS | Action buttons correctly appear on row hover. |
| REP_001 | 'Full Product Listing' Sidebar Link | Visible | [✓] PASS | Technical prefix "REP-001" successfully removed from UI. |
| REP_002 | 'Top Selling' Sidebar Link | Visible | [✓] PASS | Technical prefix "REP-002" successfully removed from UI. |
| ADM_USER | 'Manage Users' Sidebar Link | Visible | [✓] PASS | |

### 2.2 ADMIN Validation
**Expected Profile:** Partial rights enabled.
| Right ID | Feature / Component Tested | Expected | Actual | Notes |
| :--- | :--- | :--- | :--- | :--- |
| PRD_ADD | 'Add Product' Button Visibility | Visible | [✓] PASS | |
| PRD_EDIT | 'Edit' Button on Product Rows | Visible | [✓] PASS | **FIXED:** Edit button now correctly appears on hover. |
| PRD_DEL | 'Delete' (Soft) Button on Rows | Hidden | [✓] PASS | |
| REP_001 | 'Full Product Listing' Sidebar Link | Visible | [✓] PASS | |
| REP_002 | 'Top Selling' Sidebar Link | Hidden | [✓] PASS | **FIXED:** Top Selling link is correctly hidden from Admin. |
| ADM_USER | 'Manage Users' Sidebar Link | Hidden | [✓] PASS | |

### 2.3 USER Validation
**Expected Profile:** Limited rights enabled.
| Right ID | Feature / Component Tested | Expected | Actual | Notes |
| :--- | :--- | :--- | :--- | :--- |
| PRD_ADD | 'Add Product' Button Visibility | Visible | [✓] PASS | |
| PRD_EDIT | 'Edit' Button on Product Rows | Visible | [✓] PASS | **FIXED:** Edit button now correctly appears on hover. |
| PRD_DEL | 'Delete' (Soft) Button on Rows | Hidden | [✓] PASS | |
| REP_001 | 'Full Product Listing' Sidebar Link | Visible | [✓] PASS | |
| REP_002 | 'Top Selling' Sidebar Link | Hidden | [✓] PASS | **FIXED:** Top Selling link is correctly hidden from User. |
| ADM_USER | 'Manage Users' Sidebar Link | Hidden | [✓] PASS | |

## 3. Soft-Delete & Security Audit Execution (Production)
This section verifies the absolute rules of the database implementation and the newly introduced Sprint 3 security gates.

### 3.1 The Soft-Delete Action Test
* **Action:** Log in as SUPERADMIN and delete a product.
* **Verification:** Confirm the item immediately disappears from the standard Product List view.
* **Result:** **PASS**. Item status safely updates to `INACTIVE`.

### 3.2 The USER Invisibility Test & API Bypass
* **Action:** Log in as a standard USER.
* **Verification 1 (UI):** Confirm the deleted item does not appear in the standard Product List. (**PASS**)
* **Verification 2 (API Bypass - CRITICAL):** Attempt a direct API call to fetch the deleted product while logged in as a USER.
* **Result:** **PASS**. **FIXED:** Supabase RLS policy successfully blocks the USER from seeing `INACTIVE` rows. Data leak patched.

### 3.3 The Recovery Test
* **Action:** Log in as SUPERADMIN.
* **Verification 1:** Navigate to "Deleted Items" panel and verify product is visible. (**PASS**)
* **Verification 2:** Click the "Recover" button. (**PASS**)
* **Verification 3:** Log back in as a USER and confirm product reappeared in the active list. (**PASS**)

### 3.4 "No Hard Delete" Codebase Audit
* **Action:** Global codebase search for `.delete()` commands.
* **Expected Result:** Zero instances of hard-delete SQL/API commands.
* **Result:** **PASS**. **FIXED:** The violation found in `src/api/users.ts` during Sprint 2 was successfully refactored to an `UPDATE` query.

### 3.5 The Stamp Visibility Test
* **Verification 1:** Log in as USER. Ensure the stamp column (audit trail) is completely hidden. (**PASS**)
* **Verification 2:** Log in as ADMIN/SUPERADMIN. Ensure stamp column is visible. (**PASS**)

### 3.6 SUPERADMIN Protection Protocol (CRITICAL)
* **Action:** Log in as ADMIN and attempt to modify a SUPERADMIN profile via the User Management tab.
* **Verification 1 (UI):** Confirm all Action buttons (Edit/Deactivate) are disabled for SUPERADMIN rows. (**PASS**)
* **Verification 2 (Interaction):** Click the disabled UI. Confirm a red security toast notification is triggered preventing the action. (**PASS**)

## 4. Production Verification (Replacing Automated Testing)
For Sprint 3, focus shifted from local Vitest automation to Live Production verification to ensure Vercel environment variables, Google OAuth callbacks, and production Supabase RLS policies functioned correctly. 
* **Live Google OAuth:** **PASS**. Auto-provisioning properly creates accounts as `USER` / `INACTIVE`.
* **Login Gate:** **PASS**. Unactivated users are successfully blocked from routing to the dashboard.

## 5. Completed Handover Deliverables
As all critical security gates and tests passed, the following artifacts were finalized for Sprint 3 closure:
1. **PR-01:** Final Production E2E Test Report & Screenshot Library.
2. **PR-02:** Comprehensive User Manual (Version 2.0).
3. **PR-02:** 14-Slide Presentation Deck Blueprint.
4. **PR-02:** QA (M5) and DB Engineer (M3) AI Prompt Logs.

---
*End of Sprint 3 Log*