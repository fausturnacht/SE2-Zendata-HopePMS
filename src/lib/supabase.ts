/**
 * @file supabase.ts
 * @description Initializes and exports a singleton Supabase client used throughout
 * the application for all database queries, authentication, and real-time operations.
 *
 * Environment variables required (set in `.env.local`):
 *   - VITE_SUPABASE_URL     — The Supabase project URL (e.g. https://xyz.supabase.co)
 *   - VITE_SUPABASE_ANON_KEY — The public anonymous key for client-side access
 *
 * @see https://supabase.com/docs/reference/javascript/initializing
 */
import { createClient } from '@supabase/supabase-js'

// Read Supabase credentials from Vite environment variables.
// These must be set in a `.env.local` file at the project root.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/"/g, '').trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.replace(/"/g, '').trim()

// Log initialization (Safe for debug, URL is public, Key is masked)
console.log('[Supabase] Initializing with URL:', supabaseUrl);
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Missing environment variables! Check .env.local');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
)
