/**
 * Referral System Helpers
 */

import { getSupabaseServiceClient } from '@/lib/auth/supabase';
import { awardPoints } from '@/lib/rewards/supabase';
import { createNotification, notifyReferralReward } from '@/lib/notifications/create';

/**
 * Process a referral code when a new user signs up
 */
export async function processReferralCode(referralCode: string, newUserId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseServiceClient();

    // Find the referral code
    const { data: codeData, error: codeError } = await supabase
      .from('user_referral_codes')
      .select('user_id, code')
      .eq('code', referralCode)
      .eq('is_active', true)
      .single();

    if (codeError || !codeData) {
      console.log('Referral code not found or inactive:', referralCode);
      return false;
    }

    // Don't allow self-referral
    if (codeData.user_id === newUserId) {
      return false;
    }

    // Create referral record
    const { data: referral, error: referralError } = await supabase
      .from('referrals')
      .insert({
        referrer_id: codeData.user_id,
        referee_id: newUserId,
        referral_code: referralCode,
        referral_type: 'user_signup',
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (referralError) {
      console.error('Error creating referral record:', referralError);
      return false;
    }

    // Award points to both users
    const referrerPoints = 100; // Points for referrer
    const refereePoints = 50; // Welcome bonus for new user

    // Award points to referrer
    await awardPoints(
      codeData.user_id,
      referrerPoints,
      'bonus',
      referral.id,
      'promotion',
      'Referral reward - user signup'
    );

    // Award points to new user
    await awardPoints(
      newUserId,
      refereePoints,
      'bonus',
      referral.id,
      'promotion',
      'Welcome bonus - referred signup'
    );

    // Update referral record with points awarded
    await supabase
      .from('referrals')
      .update({
        referrer_points_awarded: referrerPoints,
        referee_points_awarded: refereePoints,
      })
      .eq('id', referral.id);

    // Update referral code usage count
    try {
      const { error: rpcError } = await supabase.rpc('increment_referral_code_uses', { code_id: codeData.user_id });
      if (rpcError) {
        // Fallback if function doesn't exist - increment manually
        const { data: currentCode } = await supabase
          .from('user_referral_codes')
          .select('total_uses')
          .eq('id', codeData.user_id)
          .single();
        
        if (currentCode) {
          await supabase
            .from('user_referral_codes')
            .update({ total_uses: (currentCode.total_uses || 0) + 1 })
            .eq('id', codeData.user_id);
        }
      }
    } catch (error) {
      // Silently fail - referral code usage tracking is not critical
      console.log('Error updating referral code usage count:', error);
    }

    // Create notifications
    await notifyReferralReward(codeData.user_id, referrerPoints, 'user_signup');
    await createNotification({
      userId: newUserId,
      type: 'points_awarded',
      title: 'Welcome Bonus! 🎉',
      message: `You earned ${refereePoints} bonus points for signing up with a referral code!`,
      actionUrl: '/rewards',
      metadata: { points: refereePoints, source: 'referral' },
    });

    return true;
  } catch (error) {
    console.error('Error processing referral code:', error);
    return false;
  }
}

/**
 * Process business referral
 */
export async function processBusinessReferral(referrerId: string, businessId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseServiceClient();

    // Create referral record
    const { data: referral, error: referralError } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrerId,
        business_id: businessId,
        referral_type: 'business_signup',
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (referralError) {
      console.error('Error creating business referral:', referralError);
      return false;
    }

    // Award points to referrer
    const points = 500; // Higher reward for business referrals

    await awardPoints(
      referrerId,
      points,
      'bonus',
      referral.id,
      'promotion',
      'Referral reward - business signup'
    );

    // Update referral record
    await supabase
      .from('referrals')
      .update({
        referrer_points_awarded: points,
      })
      .eq('id', referral.id);

    // Create notification
    await notifyReferralReward(referrerId, points, 'business_signup');

    return true;
  } catch (error) {
    console.error('Error processing business referral:', error);
    return false;
  }
}

/**
 * Process premium upgrade referral
 */
export async function processPremiumReferral(referrerId: string, newPremiumUserId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseServiceClient();

    // Find referral code used by new premium user
    const { data: referralData } = await supabase
      .from('referrals')
      .select('referral_code, referrer_id')
      .eq('referee_id', newPremiumUserId)
      .eq('referral_type', 'user_signup')
      .single();

    if (!referralData || referralData.referrer_id !== referrerId) {
      return false;
    }

    // Create premium upgrade referral
    const { data: referral, error: referralError } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrerId,
        referee_id: newPremiumUserId,
        referral_code: referralData.referral_code,
        referral_type: 'premium_upgrade',
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (referralError) {
      console.error('Error creating premium referral:', referralError);
      return false;
    }

    // Award points to referrer
    const points = 250; // Reward for premium upgrade

    await awardPoints(
      referrerId,
      points,
      'bonus',
      referral.id,
      'promotion',
      'Referral reward - premium upgrade'
    );

    // Update referral record
    await supabase
      .from('referrals')
      .update({
        referrer_points_awarded: points,
      })
      .eq('id', referral.id);

    // Create notification
    await notifyReferralReward(referrerId, points, 'premium_upgrade');

    return true;
  } catch (error) {
    console.error('Error processing premium referral:', error);
    return false;
  }
}



