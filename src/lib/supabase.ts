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
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Singleton Supabase client instance shared across the entire application.
 *
 * Fallback placeholder values prevent crashes when env vars are missing
 * (e.g. during CI builds or initial setup), but the app will NOT be
 * functional without real credentials.
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
)
