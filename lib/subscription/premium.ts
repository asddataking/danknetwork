/**
 * Unified Premium/Subscription Helpers
 * 
 * Single source of truth for checking premium status across the entire Dank Network app.
 * Works with the unified subscriptions table created in migration 005.
 */

import { getSupabaseClient, getSupabaseServiceClient } from '@/lib/auth/supabase';

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Check if a user has an active premium subscription
 * Uses the unified subscriptions table
 * 
 * @param userId - The user's UUID
 * @param useServiceRole - Whether to use service role (bypasses RLS)
 * @returns boolean indicating premium status
 */
export async function isUserPremium(userId: string, useServiceRole = false): Promise<boolean> {
  try {
    const supabase = useServiceRole ? getSupabaseServiceClient() : getSupabaseClient();
    
    const { data, error } = await supabase
      .rpc('is_user_premium', { p_user_id: userId });
    
    if (error) {
      console.error('[Premium] Error checking premium status:', error);
      return false;
    }
    
    return data === true;
  } catch (error) {
    console.error('[Premium] Unexpected error checking premium:', error);
    return false;
  }
}

/**
 * Get user's active subscription
 * 
 * @param userId - The user's UUID
 * @param useServiceRole - Whether to use service role (bypasses RLS)
 * @returns Subscription object or null
 */
export async function getUserSubscription(
  userId: string, 
  useServiceRole = false
): Promise<Subscription | null> {
  try {
    const supabase = useServiceRole ? getSupabaseServiceClient() : getSupabaseClient();
    
    const { data, error } = await supabase
      .rpc('get_user_subscription', { p_user_id: userId })
      .single();
    
    if (error) {
      // No subscription found is not an error
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('[Premium] Error fetching subscription:', error);
      return null;
    }
    
    return data as Subscription | null;
  } catch (error) {
    console.error('[Premium] Unexpected error fetching subscription:', error);
    return null;
  }
}

/**
 * Get all subscriptions for a user (including inactive)
 * 
 * @param userId - The user's UUID
 * @param useServiceRole - Whether to use service role (bypasses RLS)
 * @returns Array of subscriptions
 */
export async function getUserSubscriptions(
  userId: string,
  useServiceRole = false
): Promise<Subscription[]> {
  try {
    const supabase = useServiceRole ? getSupabaseServiceClient() : getSupabaseClient();
    
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('[Premium] Error fetching subscriptions:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('[Premium] Unexpected error fetching subscriptions:', error);
    return [];
  }
}

/**
 * Create or update a subscription (server-side only, typically called by webhooks)
 * 
 * @param params - Subscription parameters from Stripe
 * @returns Subscription ID or null
 */
export async function upsertSubscription(params: {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd?: boolean;
}): Promise<string | null> {
  try {
    const supabase = getSupabaseServiceClient();
    
    const { data, error } = await supabase.rpc('upsert_subscription', {
      p_user_id: params.userId,
      p_stripe_customer_id: params.stripeCustomerId,
      p_stripe_subscription_id: params.stripeSubscriptionId,
      p_stripe_price_id: params.stripePriceId,
      p_status: params.status,
      p_current_period_start: params.currentPeriodStart.toISOString(),
      p_current_period_end: params.currentPeriodEnd.toISOString(),
      p_cancel_at_period_end: params.cancelAtPeriodEnd || false,
    });
    
    if (error) {
      console.error('[Premium] Error upserting subscription:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('[Premium] Unexpected error upserting subscription:', error);
    return null;
  }
}

/**
 * Cancel a subscription (mark for cancellation at period end)
 * 
 * @param subscriptionId - The subscription UUID
 * @returns Success boolean
 */
export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseServiceClient();
    
    const { error } = await supabase
      .from('subscriptions')
      .update({ 
        cancel_at_period_end: true,
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId);
    
    if (error) {
      console.error('[Premium] Error canceling subscription:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('[Premium] Unexpected error canceling subscription:', error);
    return false;
  }
}

/**
 * Link newsletter subscriber to authenticated user
 * This allows premium status to flow from subscriptions -> user -> newsletter
 * 
 * @param email - Newsletter subscriber email
 * @param userId - Auth user ID
 * @returns Success boolean
 */
export async function linkNewsletterToUser(email: string, userId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseServiceClient();
    
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ user_id: userId })
      .eq('email', email.toLowerCase().trim());
    
    if (error) {
      console.error('[Premium] Error linking newsletter to user:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('[Premium] Unexpected error linking newsletter:', error);
    return false;
  }
}

/**
 * Get premium status for newsletter subscriber (backward compatibility)
 * Checks both subscriptions table (via user_id) and legacy tier field
 * 
 * @param email - Newsletter subscriber email
 * @returns Premium status boolean
 */
export async function isNewsletterSubscriberPremium(email: string): Promise<boolean> {
  try {
    const supabase = getSupabaseServiceClient();
    
    // Get subscriber
    const { data: subscriber, error } = await supabase
      .from('newsletter_subscribers')
      .select('user_id, tier')
      .eq('email', email.toLowerCase().trim())
      .single();
    
    if (error || !subscriber) {
      return false;
    }
    
    // If linked to a user, check subscriptions table
    if (subscriber.user_id) {
      return await isUserPremium(subscriber.user_id, true);
    }
    
    // Fall back to legacy tier field
    return subscriber.tier === 'premium';
  } catch (error) {
    console.error('[Premium] Error checking newsletter premium status:', error);
    return false;
  }
}

/**
 * Constants
 */
export const PLANS = {
  NETWORK_PREMIUM: {
    id: 'network_premium',
    name: 'Network Premium',
    price: 4.20,
    currency: 'USD',
    interval: 'month',
    features: [
      'DankPass Premium - 1.5x points multiplier',
      'DankPass Premium - Unlimited receipt uploads',
      'DankPass Premium - Exclusive perks access',
      'Daily Dispo Deals Premium - Full daily deal list (10+ deals)',
      'Daily Dispo Deals Premium - Early sends (7am vs 9am)',
      'Daily Dispo Deals Premium - Custom brand filtering',
      'Priority support',
      'Early access to new features',
    ],
  },
} as const;

