# Sprint 3 | Week 1 Standup - April 27, 2026

> **Minutes of the Meeting**: 
> * **Date:** April 27, 2026
> * **Time:** 9:00 PM
> * **Duration:** 45 minutes
> * **Summary:** Kickoff for Sprint 3, our final development sprint. The Sprint 2 Gate was successfully passed after hotfixing the API bypass and hard-delete issues. This week's focus is on building the Reports Module, the Admin User Management panel, and establishing our live Vercel production environment.

## Agenda

### **Project Lead (M1)** - **What I completed since last week**:
  - Validated the Sprint 2 bug fixes and merged `dev` to `main` for a stable checkpoint.
- **What I am working on this week**: 
  - Wiring the `REP_001` (Full Product Listing) and `REP_002` (Top Selling) API queries to the frontend.
  - Setting up the Vercel deployment and configuring the production Supabase environment variables.
- **Any blockers or help needed**:
  - M4 will need to update the Google OAuth Redirect URLs in the Supabase Dashboard once the Vercel URL is live.

### **Frontend Developer (M2)** - **What I completed since last week**: 
  - Finalized the `DeletedItemsPage` and fixed the "Add Product" input box dimensions.
- **What I am working on this week**: 
  - Building the `ProductReportPage` and `TopSellingPage` components.
  - Designing the `UserManagementPage` to list all accounts with Activate/Deactivate buttons.
- **Any blockers or help needed**:
  - Need M4 to provide the exact logic for disabling the action buttons on `SUPERADMIN` rows.

### **DB Engineer (M3)** - **What I completed since last week**: 
  - Pushed the critical Sprint 2 RLS patches to block `USER` accounts from querying `INACTIVE` rows.
- **What I am working on this week**: 
  - Creating the `top_selling_products` SQL view by joining the `product` and `salesDetail` tables.
  - Writing the RLS policies for the `user` table so `ADMIN` accounts can only update `record_status` where the target is not a `SUPERADMIN`.
- **Any blockers or help needed**: 
  - Monitoring Supabase Security Advisor warnings regarding RLS on non-essential public tables.

### **Rights & Authentication Lead (M4)** - **What I completed since last week**:
  - Fixed the UI visibility leaks for the sidebar and stamp columns.
- **What I am working on this week**:
  - Gating the new Reports (`REP_001`, `REP_002`) and Admin (`ADM_USER`) sidebar links based on the context map.
  - Implementing the frontend SUPERADMIN protection: ensuring action buttons are fully disabled on `SUPERADMIN` rows, complete with a tooltip.
- **Any blockers or help needed**: 
  - None currently. Coordinating with M1 on the production deployment.

### **QA & Documentation Lead (M5)** - **What I completed since last week**:
  - Officially signed off on the Sprint 2 testing gate.
- **What I am working on this week**: 
  - Drafting the final production End-to-End (E2E) test plan.
  - Beginning the transition of our feature notes into the Version 2.0 Comprehensive User Manual.
- **Any blockers or help needed**: 
  - Waiting for the live Vercel link from M1. I will not be running Vitest locally this sprint; all final tests must be executed in the live production environment.