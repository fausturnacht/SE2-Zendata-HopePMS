# Sprint 1: Database Schema Documentation

## Overview
This document outlines the structure and purpose of the database schema used in the Hope Product Management System.

## Core Tables
- **product**
  - Primary Key: `prodCode`
  - Columns: `description`, `unit`, `record_status`, `stamp`
  - Purpose: Master list of products. Supports soft delete via `record_status`.
- **priceHist**
  - Primary Key: (`prodCode`, `effDate`)
  - Columns: `unitPrice`, `stamp`
  - Purpose: Tracks historical prices for each product.
  - Relationship: FK `prodCode` → `product.prodCode`.

## Rights Management Tables
- **users**
  - Primary Key: `userid`
  - Columns: `email`, `username`, `user_type`, `record_status`, `stamp`
  - Purpose: Stores user accounts and roles (`SUPERADMIN`, `ADMIN`, `USER`).
- **Module**
  - Primary Key: `Module_ID`
  - Purpose: Defines system modules (Product, Report, Admin).
- **rights**
  - Primary Key: `Right_ID`
  - Purpose: Defines granular actions (e.g., PRD_ADD, REP_001).
- **user_module**
  - Composite Key: (`userid`, `Module_ID`)
  - Purpose: Maps users to modules with `rights_value`.
  - Relationships: FK to `users` and `Module`.
- **UserModule_Rights**
  - Composite Key: (`userid`, `Right_ID`)
  - Purpose: Maps users to specific rights.
  - Relationships: FK to `users` and `rights`.

## Audit & Soft Delete Strategy
- Every table includes:
  - `record_status` → ensures no hard deletes (ACTIVE vs. INACTIVE).
  - `stamp` → audit trail of who/when performed changes.
- **Soft Delete Policy:**
  1. No `DELETE` statements allowed.
  2. To “delete”: `UPDATE ... SET record_status = 'INACTIVE', stamp = '<stamp>'`.
  3. USER queries always filter `WHERE record_status = 'ACTIVE'`.
  4. ADMIN/SUPERADMIN can view and recover INACTIVE records.

## SUPERADMIN Protection
- The SUPERADMIN seed row (`jcesperanza@neu.edu.ph`) is inserted directly into the database.
- SUPERADMIN accounts cannot be created or modified via the application UI.
- RLS policies and UI logic enforce that ADMIN cannot alter SUPERADMIN rights or status.

## Relationships Summary
- `priceHist.prodCode` → `product.prodCode`
- `user_module.userid` → `users.userid`
- `user_module.Module_ID` → `Module.Module_ID`
- `UserModule_Rights.userid` → `users.userid`
- `UserModule_Rights.Right_ID` → `rights.Right_ID`
