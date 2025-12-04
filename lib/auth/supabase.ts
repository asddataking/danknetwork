/**
 * Unified Supabase Auth Helpers
 * 
 * Single source of truth for authentication across the entire Dank Network app.
 * Uses Supabase Auth for all authentication needs (Rewards, Deals, etc.)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Singleton instances to prevent multiple GoTrueClient instances
let supabaseClient: SupabaseClient | null = null;
let supabaseServiceClient: SupabaseClient | null = null;

/**
 * Get Supabase client for client-side operations (uses anon key)
 * Uses singleton pattern to prevent multiple GoTrueClient instances
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and anon key must be configured');
  }
  
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  
  return supabaseClient;
}

/**
 * Get Supabase client for server-side operations (uses service role key)
 * This bypasses RLS policies and should only be used in API routes/server actions
 * Uses singleton pattern to prevent multiple GoTrueClient instances
 */
export function getSupabaseServiceClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase URL and service role key must be configured');
  }
  
  if (!supabaseServiceClient) {
    supabaseServiceClient = createClient(supabaseUrl, supabaseServiceKey);
  }
  
  return supabaseServiceClient;
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
export async function signUp(email: string, password: string, metadata?: Record<string, any>, referralCode?: string) {
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

  // Create user profile if user was created (first time signup)
  if (data.user) {
    try {
      // Import here to avoid circular dependencies
      const { createUserProfile } = await import('@/lib/rewards/supabase');
      await createUserProfile(data.user.id, email.split('@')[0]);
      
      // Handle referral code if provided
      if (referralCode) {
        try {
          const { processReferralCode } = await import('@/lib/rewards/referrals');
          await processReferralCode(referralCode, data.user.id);
        } catch (refError) {
          console.error('[Auth] Error processing referral code:', refError);
          // Don't fail signup if referral processing fails
        }
      }
    } catch (profileError) {
      console.error('[Auth] Error creating user profile:', profileError);
      // Don't fail signup if profile creation fails
    }
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
  if (typeof window === 'undefined') {
    return { error: 'resetPassword can only be called from the client side' };
  }

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

