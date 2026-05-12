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
// Aggressive cleanup: Remove quotes, hidden control characters, and whitespace
const sanitize = (val: string | undefined) => 
  val?.replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove control characters
     .replace(/"/g, "")                            // Remove quotes
     .trim()                                       // Remove surrounding spaces
     .replace(/\/$/, "");                          // Remove trailing slash

const supabaseUrl = sanitize(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = sanitize(import.meta.env.VITE_SUPABASE_ANON_KEY);

// Log initialization (Safe for debug, URL is public, Key is masked)
console.log('[Supabase] Initializing with URL:', supabaseUrl);
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Missing environment variables! Check .env.local');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
)
