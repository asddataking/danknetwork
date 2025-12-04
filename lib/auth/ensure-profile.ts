/**
 * Ensure user profile exists
 * Called on first login or when profile is missing
 */

import { getSupabaseClient } from './supabase';
import { createUserProfile } from '@/lib/rewards/supabase';

/**
 * Ensure user has a profile, create if missing
 * Returns the profile or null if creation failed
 */
export async function ensureUserProfile(userId: string, email?: string): Promise<any> {
  const supabase = getSupabaseClient();

  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (existingProfile) {
    return existingProfile;
  }

  // Profile doesn't exist, create it
  const displayName = email?.split('@')[0] || 'User';
  const profile = await createUserProfile(userId, displayName);

  return profile;
}

