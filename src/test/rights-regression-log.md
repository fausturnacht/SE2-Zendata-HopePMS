# End-to-End (E2E) Rights & Authentication Regression Log

**Tested By:** Rights and Authentication Specialist  

## Overview
This document logs the final End-to-End (E2E) regression testing of the Authentication and Role-Based Access Control (RBAC) systems implemented across Sprints 1, 2, and 3. Testing validates the integrity of the login guards, context-driven UI gating, specific module rights mapping, and security guards across all three user tiers (`USER`, `ADMIN`, `SUPERADMIN`).

## E2E Test Execution Matrix

**Test ID:** TC-01  
**Module:** Auth  
**Feature / Scenario:** OAuth & Trigger Provisioning (Production & Local)  
**Role / Setup:** New Google OAuth Sign-in  
**Expected Behavior:** Google OAuth successfully redirects. `provision_new_user()` trigger fires on `auth.users` INSERT. Creates `USER` with `INACTIVE` status and default rights.  
**Actual Result:** OAuth redirect successful. Database trigger fired and provisioned user correctly.  
**Status:** [✓] PASS  

---

**Test ID:** TC-02  
**Module:** Auth  
**Feature / Scenario:** Login Guard & Redirects  
**Role / Setup:** `USER` (`INACTIVE`)  
**Expected Behavior:** Post-authentication callback checks `record_status`. User is actively signed out and routed back to `/login` with an error.  
**Actual Result:** Guard successfully blocked entry and forced sign-out.  
**Status:** [✓] PASS  

---

**Test ID:** TC-03  
**Module:** Products  
**Feature / Scenario:** Action Gating (`PRD` Rights)  
**Role / Setup:** `ADMIN` (`PRD_ADD`: 1, `PRD_EDIT`: 1, `PRD_DEL`: 0)  
**Expected Behavior:** Add and Edit buttons rendered via `useRights()`. Delete button strictly hidden from DOM.  
**Actual Result:** UI correctly mounts only the components authorized by context.  
**Status:** [✓] PASS  

---

**Test ID:** TC-04  
**Module:** Products  
**Feature / Scenario:** Stamp & Deleted Items Gating  
**Role / Setup:** `ADMIN` / `SUPERADMIN`  
**Expected Behavior:** Stamp column in tables and 'Deleted Items' sidebar link are visible based strictly on `user_type`.  
**Actual Result:** Conditional UI correctly evaluated `user_type` state.  
**Status:** [✓] PASS  

---

**Test ID:** TC-05  
**Module:** Reports  
**Feature / Scenario:** Granular Tab Gating (`REP` Rights)  
**Role / Setup:** User with `REP_001` ONLY  
**Expected Behavior:** Sidebar shows "Reports". Internal navigation renders only the `REP_001` link/tab. `REP_002` remains hidden.  
**Actual Result:** Granular mapping successful without broad role reliance.  
**Status:** [✓] PASS  

---

**Test ID:** TC-06  
**Module:** Admin  
**Feature / Scenario:** Admin Module Gating (`ADM` Rights)  
**Role / Setup:** User with `ADM_USER`: 1  
**Expected Behavior:** Admin Module link appears in the sidebar.  
**Actual Result:** Link rendered successfully when right is granted.  
**Status:** [✓] PASS  

---

**Test ID:** TC-07  
**Module:** Admin  
**Feature / Scenario:** SuperAdmin Guard & Tooltip  
**Role / Setup:** Any authorized Admin  
**Expected Behavior:** Action buttons disabled on any row where `targetUser.user_type === 'SUPERADMIN'`. Tooltip displays on hover.  
**Actual Result:** Buttons unclickable. Hover state accurately displays "SUPERADMIN accounts cannot be modified."  
**Status:** [✓] PASS  

---

## Sign-off
* **Production Validation:** Google OAuth and redirect URLs successfully verified in the live production environment. 
* **Regression Status:** All 6 granular rights and base authentication flows operate smoothly without regression.