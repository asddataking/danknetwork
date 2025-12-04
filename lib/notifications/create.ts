/**
 * Notification Creation Helpers
 * Centralized functions for creating notifications
 */

import { getSupabaseServiceClient } from '@/lib/auth/supabase';

export type NotificationType = 
  | 'receipt_approved'
  | 'receipt_rejected'
  | 'points_awarded'
  | 'deal_alert'
  | 'referral_reward'
  | 'perk_available'
  | 'friend_activity'
  | 'system_announcement'
  | 'collection_updated';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

/**
 * Create a notification for a user
 */
export async function createNotification(params: CreateNotificationParams): Promise<string | null> {
  try {
    const supabase = getSupabaseServiceClient();

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        action_url: params.actionUrl || null,
        metadata: params.metadata || null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Error in createNotification:', error);
    return null;
  }
}

/**
 * Create receipt approved notification
 */
export async function notifyReceiptApproved(
  userId: string,
  receiptId: string,
  pointsAwarded: number,
  merchantName?: string
): Promise<void> {
  await createNotification({
    userId,
    type: 'receipt_approved',
    title: 'Receipt Approved! 🎉',
    message: merchantName
      ? `Your receipt from ${merchantName} was approved. You earned ${pointsAwarded} points!`
      : `Your receipt was approved. You earned ${pointsAwarded} points!`,
    actionUrl: `/rewards`,
    metadata: { receiptId, pointsAwarded },
  });
}

/**
 * Create receipt rejected notification
 */
export async function notifyReceiptRejected(
  userId: string,
  receiptId: string,
  reason?: string
): Promise<void> {
  await createNotification({
    userId,
    type: 'receipt_rejected',
    title: 'Receipt Review Needed',
    message: reason || 'Your receipt needs manual review. Our team will contact you soon.',
    actionUrl: `/rewards/upload`,
    metadata: { receiptId, reason },
  });
}

/**
 * Create points awarded notification
 */
export async function notifyPointsAwarded(
  userId: string,
  points: number,
  reason: string,
  actionUrl?: string
): Promise<void> {
  await createNotification({
    userId,
    type: 'points_awarded',
    title: `+${points} Points!`,
    message: reason,
    actionUrl: actionUrl || `/rewards`,
    metadata: { points, reason },
  });
}

/**
 * Create referral reward notification
 */
export async function notifyReferralReward(
  userId: string,
  points: number,
  referralType: 'user_signup' | 'business_signup' | 'premium_upgrade'
): Promise<void> {
  const messages = {
    user_signup: 'Someone signed up using your referral code!',
    business_signup: 'A business joined using your referral!',
    premium_upgrade: 'Someone upgraded to Premium using your referral!',
  };

  await createNotification({
    userId,
    type: 'referral_reward',
    title: 'Referral Reward! 🎁',
    message: `${messages[referralType]} You earned ${points} bonus points!`,
    actionUrl: `/rewards/referrals`,
    metadata: { points, referralType },
  });
}

/**
 * Create deal alert notification
 */
export async function notifyDealAlert(
  userId: string,
  dealTitle: string,
  dispensaryName: string,
  dealUrl?: string
): Promise<void> {
  await createNotification({
    userId,
    type: 'deal_alert',
    title: 'New Deal Available! 🔥',
    message: `${dealTitle} at ${dispensaryName}`,
    actionUrl: dealUrl || `/deals`,
    metadata: { dealTitle, dispensaryName },
  });
}

/**
 * Create perk available notification
 */
export async function notifyPerkAvailable(
  userId: string,
  perkTitle: string,
  perkId: string
): Promise<void> {
  await createNotification({
    userId,
    type: 'perk_available',
    title: 'New Perk Available!',
    message: `${perkTitle} is now available to redeem`,
    actionUrl: `/rewards/perks`,
    metadata: { perkId, perkTitle },
  });
}

/**
 * Create collection updated notification
 */
export async function notifyCollectionUpdated(
  userId: string,
  collectionName: string,
  dealCount: number
): Promise<void> {
  await createNotification({
    userId,
    type: 'collection_updated',
    title: 'Collection Updated',
    message: `${collectionName} now has ${dealCount} deal${dealCount !== 1 ? 's' : ''}`,
    actionUrl: `/deals/collections`,
    metadata: { collectionName, dealCount },
  });
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: string, userId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseServiceClient();

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    return !error;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsRead(userId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseServiceClient();

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    return !error;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
}



