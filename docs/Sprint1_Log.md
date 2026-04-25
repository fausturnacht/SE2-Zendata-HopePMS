# Quality Assurance and Documentation Log: Sprint 1

**Role:** M5 (QA and Documentation Specialist)

**Sprint Dates:** April 8, 2026 to April 22, 2026

## 1. Sprint 1 Objectives
The primary objectives for Sprint 1 were to establish the development environment, initialize the complete database schema with seed data, verify the core authentication flows (Email and Google OAuth), ensure the Login Guard successfully restricts inactive users, and initialize the foundational project documentation.

## 2. Completed Tasks

### M1 (Project Lead)
* Scaffolded the Vite and React 18 project and configured the Tailwind CSS framework.
* Initialized the Supabase JavaScript client and established the environment variable configurations.
* Implemented React Router v6, utilizing a `ProtectedRoute` component to prevent unauthenticated access.
* Configured placeholder routing for `/login`, `/register`, `/products`, `/reports`, `/admin`, and `/deleted-items`.

### M2 (Frontend Developer)
* Developed the Login and Register interfaces, incorporating both Email/Password forms and Google OAuth integration.
* Constructed the primary application shell layout, including the Navigation Bar and Sidebar skeleton.
* Implemented the `/auth/callback` routing page with a dedicated loading state to handle session exchanges.

### M3 (Database Engineer)
* Executed the HopeDB SQL script to provision the 5 core tables.
* Executed the Rights Scripts to create and populate the `user`, `Module`, `user_module`, `rights`, and `UserModule_Rights` tables.
* Integrated the `record_status` and `stamp` audit columns into the `product` and `priceHist` tables.
* Seeded the initial `SUPERADMIN` user account into the database.

### M4 (Rights and Authentication Specialist)
* Implemented `AuthContext.jsx` to manage global user sessions and state.
* Integrated `supabase.auth.signUp()` and `signInWithOAuth()` with the frontend client forms.
* Authored and deployed the `provision_new_user()` PostgreSQL database trigger to automatically provision new registrations with a `USER` role and an `INACTIVE` status.
* Configured Google OAuth credentials within the Google Cloud Console and the Supabase Dashboard.

### M5 (QA and Documentation Specialist)
* Installed and configured the Vitest and React Testing Library frameworks for the frontend testing suite.
* Authored and successfully passed unit tests validating the Email Registration and Google OAuth provisioning flows.
* Authored and successfully passed security tests for the Login Guard, verifying the system strictly blocks `INACTIVE` accounts and permits access to `ACTIVE` accounts.
* Updated `README.md` to include comprehensive local setup instructions, environment variable configurations, and testing execution commands.

## 3. Impediments and Blockers
1. **Script Configuration:** The Node Package Manager (NPM) initially failed to recognize the `npm test` command during test execution.
2. **Environment Simulation:** The React Testing Library produced a `ReferenceError: document is not defined` exception because Vitest was executing within a Node.js server environment rather than a simulated browser Document Object Model (DOM).
3. **Mocking Discrepancies:** The `AuthCallback` component utilized the `supabase.auth.getSession()` method, which was not initially provided in the Vitest mock suite, resulting in unhandled promise rejections during the test run.

## 4. Implemented Resolutions
1. Modified the `package.json` file to explicitly define `"test": "vitest"` within the scripts configuration block.
2. Appended the `@vitest-environment jsdom` pragma to the file header of the test suite to accurately simulate the browser DOM.
3. Expanded the Supabase mock object to include a simulated `getSession` response and updated the `mockNavigate` assertions to perfectly align with the React Router state and `replace: true` parameters utilized by the frontend implementation.

## 5. Sprint 2 Objectives
* Execute the comprehensive 18-case Rights Test Matrix, verifying the 6 distinct system rights across the 3 user types.
* Perform strict view-only enforcement testing to ensure no unauthorized mutation actions (Add, Edit, Delete) are accessible on the `product` and `priceHist` interfaces.
* Conduct soft-delete visibility audits to ensure `INACTIVE` products are completely omitted from lists and API calls executed by `USER` accounts.