// @vitest-environment jsdom
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';

// Component and Page Imports
import ProductListPage from '../pages/ProductListPage';

// Hook Imports
import { useRights } from '../contexts/UserRightsContext';
import { useAuth } from '../hooks/useAuth';

// 1. Mock the Context Hooks to control role-based access
vi.mock('../contexts/UserRightsContext', () => ({
  useRights: vi.fn(),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('Sprint 2: 18-Case Rights Matrix Tests', () => {
  
  const renderWithRouter = (ui: React.ReactElement) => render(<BrowserRouter>{ui}</BrowserRouter>);

  beforeEach(() => {
    vi.clearAllMocks();
    // Default Auth Mock to keep the app in an "Authenticated" state
    // @ts-ignore
    useAuth.mockReturnValue({ currentUser: { id: 'test-user-id' } });
  });

  // ==========================================
  // PART 1: SUPERADMIN (All Rights = 1)
  // ==========================================
  describe('Role: SUPERADMIN', () => {
    beforeEach(() => {
      // @ts-ignore
      useRights.mockReturnValue({
        rights: { PRD_ADD: 1, PRD_EDIT: 1, PRD_DEL: 1, REP_001: 1, REP_002: 1, ADM_USER: 1 },
        userType: 'SUPERADMIN',
        loadingRights: false,
        userRole: 'SUPERADMIN',
        isAdmin: false,
        isSuperAdmin: true,
        isUser: false,
        hasRight: vi.fn().mockReturnValue(true) // Superadmins pass all checks
      });
    });

    it('renders the Add Product button after loading', async () => {
      renderWithRouter(<ProductListPage />);
      // Use findByText to wait for the loading skeleton to disappear
      const addButton = await screen.findByText(/Add Product/i);
      expect(addButton).toBeInTheDocument();
    });
  });

  // ==========================================
  // PART 2: ADMIN (Partial Rights)
  // ==========================================
  describe('Role: ADMIN', () => {
    const adminRightsMap: Record<string, number> = {
      PRD_ADD: 1, PRD_EDIT: 1, PRD_DEL: 0, REP_001: 1, REP_002: 0, ADM_USER: 0
    };

    beforeEach(() => {
      // @ts-ignore
      useRights.mockReturnValue({
        rights: adminRightsMap,
        userType: 'ADMIN',
        loadingRights: false,
        userRole: 'ADMIN',
        isAdmin: true,
        isSuperAdmin: false,
        isUser: false,
        hasRight: (right: string) => adminRightsMap[right] === 1
      });
    });

    it('renders Add Product but HIDES the Soft Delete button', async () => {
      renderWithRouter(<ProductListPage />);
      
      // Wait for page load
      await screen.findByText(/Add Product/i);
      
      // Check that restricted features are hidden
      expect(screen.queryByText(/Confirm Delete/i)).toBeNull(); 
    });
  });

  // ==========================================
  // PART 3: USER (Limited Rights)
  // ==========================================
  describe('Role: USER', () => {
    const userRightsMap: Record<string, number> = {
      PRD_ADD: 1, PRD_EDIT: 1, PRD_DEL: 0, REP_001: 1, REP_002: 0, ADM_USER: 0
    };

    beforeEach(() => {
      // @ts-ignore
      useRights.mockReturnValue({
        rights: userRightsMap,
        userType: 'USER',
        loadingRights: false,
        userRole: 'USER',
        isAdmin: false,
        isSuperAdmin: false,
        isUser: true,
        hasRight: (right: string) => {
          if (right === 'STAMP') return false; // Hard-coded restriction in UserRightsContext
          return userRightsMap[right] === 1;
        }
      });
    });

    it('hides the Stamp column in the Product List', async () => {
      renderWithRouter(<ProductListPage />);
      
      // Wait for page load
      await screen.findByText(/Products/i);
      
      // Verification: Ensure the audit trail is hidden from non-admin users
      expect(screen.queryByText(/STAMP/i)).toBeNull();
    });
    
    it('hides the Soft Delete functionality', async () => {
      renderWithRouter(<ProductListPage />);
      
      await screen.findByText(/Products/i);
      
      // Verification: Ensure standard users cannot trigger deletion
      expect(screen.queryByText(/Confirm Delete/i)).toBeNull();
    });
  });
});