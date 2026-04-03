# Login Page UI Implementation

**Sprint 1 - M2 Frontend Developer**  
**Component:** `src/pages/LoginPage.jsx`  
**Branch:** `feature/ui-login-page`  
**Date:** April 03, 2026

## Overview
This page implements the Login screen for the **HOPE, INC. Product Management System**.  
It closely follows the Stitch wireframe (desktop + mobile views) with clean academic styling using Tailwind CSS.

### Key Features Implemented
- Clean centered login card with backdrop blur effect
- Email and Password input fields with Material Symbols icons (mail, lock)
- Form validation using **React Hook Form + Zod**
- "Sign In" button with loading state and gradient styling
- Google OAuth "Continue with Google" button
- "Forgot Password?" and "Create an institutional ID" (Register) links
- Fully responsive design (desktop + mobile)
- Error message display for authentication failures
- Header with HOPE, INC. branding and footer with New Era University
- Matches Stitch color palette (`#0053db` primary blue, soft surface colors)

### Technologies Used
- React 18
- Tailwind CSS
- React Hook Form + Zod (for validation)
- Supabase Auth (`signInWithPassword` and `signInWithOAuth`)
- React Router (`Link` for Register navigation)
- Material Symbols (Google Fonts)

### Wireframes (Stitch AI)

#### Desktop View
![Login Page - Desktop Wireframe](https://github.com/fausturnacht/SE2-Zendata-HopePMS/blob/feature/ui-login-page/docs/login-page-desktop.png)

#### Mobile View
![Login Page - Mobile Wireframe](https://github.com/fausturnacht/SE2-Zendata-HopePMS/blob/feature/ui-login-page/docs/login-page-mobileview.png)
