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

vi.mock('../api/products', () => ({
  getProducts: vi.fn().mockResolvedValue([
    { prodcode: 'P001', description: 'Test Product', unit: 'pc', stamp: 'VERIFIED' }
  ]),
}));

vi.mock('../api/priceHistory', () => ({
  getPriceHistory: vi.fn().mockResolvedValue([]),
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
        rights: { ADD_PRODUCT: 1, EDIT_PRODUCT: 1, DELETE_PRODUCT: 1, REP_001: 1, REP_002: 1, ADM_USER: 1 },
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
      // Use findByRole to wait for the button to appear and be specific
      const addButton = await screen.findAllByText(/Add Product/i);
      expect(addButton[0]).toBeInTheDocument();
    });
  });

  // ==========================================
  // PART 2: ADMIN (Partial Rights)
  // ==========================================
  describe('Role: ADMIN', () => {
    const adminRightsMap: Record<string, number> = {
      ADD_PRODUCT: 1, EDIT_PRODUCT: 1, DELETE_PRODUCT: 1, REP_001: 1, REP_002: 0, ADM_USER: 0
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
        hasRight: (right: string) => {
          if (right === 'REP_002') return false;
          if (right === 'REP_001' || right === 'ADD_PRODUCT' || right === 'EDIT_PRODUCT' || right === 'DELETE_PRODUCT' || right === 'ADM_USER') return true;
          return adminRightsMap[right] === 1;
        }
      });
    });

    it('renders Add Product and SHOWS the Soft Delete button', async () => {
      renderWithRouter(<ProductListPage />);
      
      // Wait for page load
      await screen.findAllByText(/Add Product/i);
      
      // Verification: Soft Delete buttons should now be visible
      const deleteButtons = await screen.findAllByTitle(/Delete product/i);
      expect(deleteButtons.length).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // PART 3: USER (Limited Rights)
  // ==========================================
  describe('Role: USER', () => {
    const userRightsMap: Record<string, number> = {
      ADD_PRODUCT: 1, EDIT_PRODUCT: 1, DELETE_PRODUCT: 1, REP_001: 1, REP_002: 0, ADM_USER: 0
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
          if (right === 'REP_002') return false;
          if (right === 'REP_001' || right === 'ADD_PRODUCT' || right === 'EDIT_PRODUCT' || right === 'DELETE_PRODUCT') return true;
          if (right === 'ADM_USER' || right === 'STAMP') return false;
          return userRightsMap[right] === 1;
        }
      });
    });

    it('hides the Stamp column in the Product List', async () => {
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
          if (right === 'REP_002') return false;
          if (right === 'REP_001' || right === 'ADD_PRODUCT' || right === 'EDIT_PRODUCT' || right === 'DELETE_PRODUCT') return true;
          if (right === 'ADM_USER' || right === 'STAMP') return false;
          return userRightsMap[right] === 1;
        }
      });

      renderWithRouter(<ProductListPage />);
      
      // Wait for table to load
      await screen.findByText(/Test Product/i);
      
      // Verification: Ensure the audit trail header is hidden from non-admin users
      expect(screen.queryByRole('columnheader', { name: /Stamp/i })).toBeNull();
    });
    
    it('SHOWS the Soft Delete functionality for regular users', async () => {
      renderWithRouter(<ProductListPage />);
      
      await screen.findAllByText(/^Products$/i);
      
      // Verification: Soft Delete buttons should now be visible to everyone
      const deleteButtons = await screen.findAllByTitle(/Delete product/i);
      expect(deleteButtons.length).toBeGreaterThan(0);
    });
  });
});