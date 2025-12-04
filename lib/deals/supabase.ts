import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Singleton instances to prevent multiple GoTrueClient instances
let dealsServiceClient: SupabaseClient | null = null;
let dealsPublicClient: SupabaseClient | null = null;

/**
 * Get Supabase client for deals operations
 * Uses service role key for server-side operations (bypasses RLS)
 * Uses singleton pattern to prevent multiple GoTrueClient instances
 */
export function getDealsClient(): SupabaseClient {
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured');
  }

  // Use service role key for server-side operations (bypasses RLS)
  if (supabaseServiceKey) {
    if (!dealsServiceClient) {
      dealsServiceClient = createClient(supabaseUrl, supabaseServiceKey);
    }
    return dealsServiceClient;
  }

  // Fallback to anon key (may have RLS restrictions)
  if (!supabaseAnonKey) {
    throw new Error('Supabase keys are not configured');
  }

  // Reuse public client if service key not available
  if (!dealsPublicClient) {
    dealsPublicClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return dealsPublicClient;
}

/**
 * Get Supabase client for client-side operations
 * Uses singleton pattern to prevent multiple GoTrueClient instances
 */
export function getDealsClientPublic(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  if (!dealsPublicClient) {
    dealsPublicClient = createClient(supabaseUrl, supabaseAnonKey);
  }

  return dealsPublicClient;
}

