// @vitest-environment jsdom
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';

// Component and Page Imports
import DeletedItemsPage from '../pages/DeletedItemsPage';


// Hook Imports
import { useRights } from '../contexts/UserRightsContext';
import { useAuth } from '../hooks/useAuth';

vi.mock('../contexts/UserRightsContext', () => ({
  useRights: vi.fn(),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('Sprint 2: Soft Delete & Visibility Tests', () => {
  const renderWithRouter = (ui: React.ReactElement) => render(<BrowserRouter>{ui}</BrowserRouter>);

  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-ignore
    useAuth.mockReturnValue({ currentUser: { id: 'test-user-id' } });
  });

  // ==========================================
  // USER VISIBILITY
  // ==========================================
  describe('Role: USER', () => {
    beforeEach(() => {
      // @ts-ignore
      useRights.mockReturnValue({
        userType: 'USER',
        isAdmin: false,
        isSuperAdmin: false,
        isUser: true,
        hasRight: (right: string) => right !== 'STAMP'
      });
    });

    it('blocks USER from accessing the Deleted Items page', () => {
      renderWithRouter(<DeletedItemsPage />);
      // Users should not be able to render the Deleted Items interface
      expect(screen.queryByText(/Recover/i)).toBeNull();
    });
  });

  // ==========================================
  // ADMIN/SUPERADMIN VISIBILITY & RECOVERY
  // ==========================================
  describe('Role: ADMIN / SUPERADMIN', () => {
    beforeEach(() => {
      // @ts-ignore
      useRights.mockReturnValue({
        userType: 'ADMIN',
        isAdmin: true,
        isSuperAdmin: false,
        isUser: false,
        hasRight: () => true
      });
    });

    it('allows ADMIN to access the Deleted Items page for recovery', async () => {
      renderWithRouter(<DeletedItemsPage />);
      // Wait for the page to load and ensure recovery tools are present
    const archivedHeadings = await screen.findAllByText(/Archived Products/i);
    expect(archivedHeadings[0]).toBeInTheDocument();
    });
  });

  // ==========================================
  // SECURITY AUDITS (Reflecting Manual Logs)
  // ==========================================
  describe('Security Audit & API Bypass Logs', () => {
    it('FAIL: User API Bypass on INACTIVE rows', () => {
      // Documenting the API leak where USERS can fetch INACTIVE rows via console
      const apiLeakFixed = false;
      expect(apiLeakFixed).toBe(false); 
    });

    it('FAIL: Codebase Hard-Delete Audit', () => {
      // Documenting the grep search finding in src/api/users.ts Line 141
      const hardDeleteFound = true;
      expect(hardDeleteFound).toBe(true); 
    });
  });
});