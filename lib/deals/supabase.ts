import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Get Supabase client for deals operations
 * Uses service role key for server-side operations (bypasses RLS)
 */
export function getDealsClient(): SupabaseClient {
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured');
  }

  // Use service role key for server-side operations (bypasses RLS)
  if (supabaseServiceKey) {
    return createClient(supabaseUrl, supabaseServiceKey);
  }

  // Fallback to anon key (may have RLS restrictions)
  if (!supabaseAnonKey) {
    throw new Error('Supabase keys are not configured');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Get Supabase client for client-side operations
 */
export function getDealsClientPublic(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

