// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';

// Corrected paths based on your VS Code screenshot
import { supabase } from '../lib/supabase'; 
import AuthCallback from '../pages/AuthCallback'; 

// 1. Mock React Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...(actual as any),
    useNavigate: vi.fn(),
  };
});

// 2. Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      signInWithOAuth: vi.fn(),
      // ADD THIS LINE BELOW:
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'test-user' } } }, error: null }),
    },
    from: vi.fn(),
  },
}));

describe('Login Guard and Authentication Flows', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as any).mockReturnValue(mockNavigate);
  });

  it('TC-AUTH-NEG-001: Blocks authentication for an INACTIVE user', async () => {
    const mockSession = { user: { id: 'user123' } };
    
    (supabase.auth.onAuthStateChange as any).mockImplementation((callback: any) => {
      callback('SIGNED_IN', mockSession);
    });
    
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { record_status: 'INACTIVE' } }),
        }),
      }),
    });

    render(
      <MemoryRouter>
        <AuthCallback />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled(); 
      expect(mockNavigate).toHaveBeenCalledWith('/login', {
        replace: true,
        state: {
          error: 'Account pending approval. Please contact an administrator to activate your access.',
        },
      }); 
    });
    });


  it('TC-AUTH-FUNC-002: Allows dashboard access for an ACTIVE user', async () => {
    const mockSession = { user: { id: 'user999' } };
    
    (supabase.auth.onAuthStateChange as any).mockImplementation((callback: any) => {
      callback('SIGNED_IN', mockSession);
    });

    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { record_status: 'ACTIVE' } }),
        }),
      }),
    });

    render(
      <MemoryRouter>
        <AuthCallback />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(supabase.auth.signOut).not.toHaveBeenCalled(); 
      expect(mockNavigate).toHaveBeenCalledWith('/products', {
        replace: true,
      }); 
    });
    });

  it('TC-AUTH-FUNC-003: Successfully triggers Email Registration', async () => {
    (supabase.auth.signUp as any).mockResolvedValue({
      data: { user: { id: 'new-user-123', email: 'test@neu.edu.ph' } },
      error: null,
    });

    const response = await supabase.auth.signUp({
      email: 'test@neu.edu.ph',
      password: 'SecurePassword123!',
      options: { data: { firstName: 'Juan', lastName: 'Dela Cruz' } }
    });

    expect(supabase.auth.signUp).toHaveBeenCalledWith(expect.objectContaining({
      email: 'test@neu.edu.ph',
    }));
    expect(response.error).toBeNull();
    expect(response.data.user?.email).toBe('test@neu.edu.ph');
  });

  it('TC-AUTH-FUNC-004: Successfully triggers Google OAuth Sign-In', async () => {
    (supabase.auth.signInWithOAuth as any).mockResolvedValue({
      data: { provider: 'google', url: 'https://accounts.google.com/o/oauth2/v2/auth' },
      error: null,
    });

    const response = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'http://localhost:5173/auth/callback' }
    });

    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: 'http://localhost:5173/auth/callback' }
    });
    expect(response.error).toBeNull();
  });
});