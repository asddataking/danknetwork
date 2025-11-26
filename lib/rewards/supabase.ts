// Rewards System Supabase Helper Functions
// Unified with Dank Network auth and premium system

import { createClient } from '@supabase/supabase-js';
import type { UserProfile, Receipt, Perk, PerkRedemption, Partner } from '@/types/rewards';
import { getSupabaseClient, getSupabaseServiceClient } from '@/lib/auth/supabase';
import { isUserPremium } from '@/lib/subscription/premium';

// Export unified Supabase client
export const supabase = getSupabaseClient();

/**
 * Get or create user profile
 * 
 * NOTE: Premium status should be checked via isUserPremium() from @/lib/subscription/premium
 * The is_premium field in this table is DEPRECATED and may not be accurate.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  // Note: Premium status in this object may be stale
  // Always check premium status via isUserPremium(userId) for accurate results
  return data;
}

/**
 * Get user profile with current premium status
 * This is the recommended way to fetch user data with accurate premium info
 */
export async function getUserProfileWithPremium(userId: string): Promise<(UserProfile & { isPremium: boolean }) | null> {
  const [profile, isPremium] = await Promise.all([
    getUserProfile(userId),
    isUserPremium(userId),
  ]);

  if (!profile) {
    return null;
  }

  return {
    ...profile,
    isPremium, // Override with current premium status from subscriptions table
  };
}

/**
 * Create user profile on signup
 */
export async function createUserProfile(userId: string, displayName?: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      id: userId,
      display_name: displayName,
      points: 0,
      tier: 'Bronze'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating user profile:', error);
    return null;
  }

  return data;
}

/**
 * Get user's receipts
 */
export async function getUserReceipts(userId: string, limit = 10): Promise<Receipt[]> {
  const { data, error } = await supabase
    .from('receipts')
    .select(`
      *,
      partner:partners(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching receipts:', error);
    return [];
  }

  return data || [];
}

/**
 * Upload receipt
 */
export async function uploadReceipt(
  userId: string,
  file: File
): Promise<{ url: string; receipt: Receipt } | null> {
  try {
    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(fileName);

    // Create receipt record
    const { data: receipt, error: receiptError } = await supabase
      .from('receipts')
      .insert({
        user_id: userId,
        image_url: publicUrl,
        status: 'pending'
      })
      .select()
      .single();

    if (receiptError) {
      console.error('Error creating receipt record:', receiptError);
      return null;
    }

    return { url: publicUrl, receipt };
  } catch (error) {
    console.error('Error in uploadReceipt:', error);
    return null;
  }
}

/**
 * Get active perks
 */
export async function getActivePerks(includePartner = true): Promise<Perk[]> {
  const selectQuery = includePartner ? '*, partner:partners(*)' : '*';
  const { data, error } = await supabase
    .from('perks')
    .select(selectQuery)
    .eq('is_active', true)
    .order('points_cost', { ascending: true });

  if (error) {
    console.error('Error fetching perks:', error);
    return [];
  }

  return (data as any) || [];
}

/**
 * Redeem a perk
 */
export async function redeemPerk(
  userId: string,
  perkId: string,
  pointsCost: number
): Promise<PerkRedemption | null> {
  // Check if user has enough points
  const profile = await getUserProfile(userId);
  if (!profile || profile.points < pointsCost) {
    console.error('Insufficient points');
    return null;
  }

  // Create redemption
  const redemptionCode = generateRedemptionCode();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

  const { data, error } = await supabase
    .from('perk_redemptions')
    .insert({
      user_id: userId,
      perk_id: perkId,
      points_spent: pointsCost,
      redemption_code: redemptionCode,
      expires_at: expiresAt.toISOString(),
      status: 'active'
    })
    .select()
    .single();

  if (error) {
    console.error('Error redeeming perk:', error);
    return null;
  }

  // BURN points via RPC function
  const { data: burnSuccess, error: burnError } = await supabase.rpc('burn_points', {
    p_user_id: userId,
    p_amount: pointsCost,
    p_source_type: 'perk_redemption',
    p_source_id: data.id,
    p_description: `Burned ${pointsCost} points for perk redemption`
  });

  if (burnError || !burnSuccess) {
    console.error('Error burning points:', burnError);
    // Rollback: Delete the redemption we just created
    await supabase.from('perk_redemptions').delete().eq('id', data.id);
    return null;
  }

  // Update perk redeemed count (increment)
  // Note: Supabase doesn't support raw SQL in updates, so we fetch and increment
  const { data: perkData } = await supabase
    .from('perks')
    .select('redeemed_count')
    .eq('id', perkId)
    .single();
  
  if (perkData) {
    await supabase
      .from('perks')
      .update({ redeemed_count: (perkData.redeemed_count || 0) + 1 })
      .eq('id', perkId);
  }

  return data;
}

/**
 * Get user's redemptions
 */
export async function getUserRedemptions(userId: string): Promise<PerkRedemption[]> {
  const { data, error } = await supabase
    .from('perk_redemptions')
    .select(`
      *,
      perk:perks(*)
    `)
    .eq('user_id', userId)
    .order('redeemed_at', { ascending: false });

  if (error) {
    console.error('Error fetching redemptions:', error);
    return [];
  }

  return data || [];
}

/**
 * Get active partners
 */
export async function getActivePartners(): Promise<Partner[]> {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .eq('is_active', true)
    .order('business_name', { ascending: true });

  if (error) {
    console.error('Error fetching partners:', error);
    return [];
  }

  return data || [];
}

/**
 * Generate unique redemption code
 */
function generateRedemptionCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

/**
 * Award points to user
 */
export async function awardPoints(
  userId: string,
  amount: number,
  transactionType: 'earned' | 'bonus' | 'adjustment',
  referenceId?: string,
  referenceType?: 'receipt' | 'promotion' | 'admin',
  description?: string
): Promise<boolean> {
  const { error } = await supabase.rpc('award_points', {
    p_user_id: userId,
    p_amount: amount,
    p_transaction_type: transactionType,
    p_reference_id: referenceId,
    p_reference_type: referenceType,
    p_description: description
  });

  if (error) {
    console.error('Error awarding points:', error);
    return false;
  }

  return true;
}

