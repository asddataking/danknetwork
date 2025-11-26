/**
 * Unified Supabase Auth Helpers
 * 
 * Single source of truth for authentication across the entire Dank Network app.
 * Uses Supabase Auth for all authentication needs (Rewards, Deals, etc.)
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Get Supabase client for client-side operations (uses anon key)
 */
export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and anon key must be configured');
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Get Supabase client for server-side operations (uses service role key)
 * This bypasses RLS policies and should only be used in API routes/server actions
 */
export function getSupabaseServiceClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase URL and service role key must be configured');
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Get current user from Supabase Auth (client-side)
 */
export async function getCurrentUser() {
  const supabase = getSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('[Auth] Error fetching user:', error);
    return null;
  }
  
  return user;
}

/**
 * Get current session (client-side)
 */
export async function getCurrentSession() {
  const supabase = getSupabaseClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('[Auth] Error fetching session:', error);
    return null;
  }
  
  return session;
}

/**
 * Sign up a new user
 */
export async function signUp(email: string, password: string, metadata?: Record<string, any>) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });
  
  if (error) {
    console.error('[Auth] Sign up error:', error);
    return { user: null, error: error.message };
  }
  
  return { user: data.user, error: null };
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    console.error('[Auth] Sign in error:', error);
    return { user: null, session: null, error: error.message };
  }
  
  return { user: data.user, session: data.session, error: null };
}

/**
 * Sign out current user
 */
export async function signOut() {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('[Auth] Sign out error:', error);
    return { error: error.message };
  }
  
  return { error: null };
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string) {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  
  if (error) {
    console.error('[Auth] Password reset error:', error);
    return { error: error.message };
  }
  
  return { error: null };
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string) {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  
  if (error) {
    console.error('[Auth] Update password error:', error);
    return { error: error.message };
  }
  
  return { error: null };
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  const supabase = getSupabaseClient();
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  
  return subscription;
}

