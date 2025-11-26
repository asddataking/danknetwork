/**
 * Stripe Integration for Daily Dispo Deals Premium Subscriptions
 * 
 * Required environment variables:
 * - STRIPE_SECRET_KEY: Your Stripe secret key
 * - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: Your Stripe publishable key
 * - STRIPE_WEBHOOK_SECRET: Your webhook signing secret
 * - STRIPE_PREMIUM_PRICE_ID: Price ID for $4.20/mo Premium plan
 */

import Stripe from 'stripe';

// Initialize Stripe with the secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn('[Stripe] STRIPE_SECRET_KEY not configured');
}

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-11-17.clover',
      typescript: true,
    })
  : null;

/**
 * Check if Stripe is properly configured
 */
export function isStripeConfigured(): boolean {
  return !!(
    process.env.STRIPE_SECRET_KEY &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
    process.env.STRIPE_PREMIUM_PRICE_ID
  );
}

/**
 * Create a Stripe Checkout Session for Premium subscription
 * 
 * @param email - Customer email
 * @param zip - Customer ZIP code
 * @returns Checkout session or error
 */
export async function createCheckoutSession({
  email,
  zip,
}: {
  email: string;
  zip: string;
}): Promise<{ sessionId?: string; url?: string; error?: string }> {
  if (!stripe) {
    return { error: 'Stripe is not configured' };
  }

  const priceId = process.env.STRIPE_PREMIUM_PRICE_ID;
  if (!priceId) {
    return { error: 'Premium price ID not configured' };
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: email,
      metadata: {
        email, // Include email in metadata for webhook processing
        zip,
        tier: 'premium',
      },
      subscription_data: {
        metadata: {
          email, // Include email in subscription metadata for webhook processing
          zip,
          tier: 'premium',
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/deals?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/deals?canceled=true`,
      allow_promotion_codes: true,
    });

    return {
      sessionId: session.id,
      url: session.url || undefined,
    };
  } catch (error) {
    console.error('[Stripe] Error creating checkout session:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to create checkout session',
    };
  }
}

/**
 * Verify Stripe webhook signature
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event | null {
  if (!stripe) {
    console.error('[Stripe] Stripe not initialized');
    return null;
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[Stripe] Webhook secret not configured');
    return null;
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error('[Stripe] Webhook signature verification failed:', error);
    return null;
  }
}

/**
 * Get customer's active subscriptions
 */
export async function getCustomerSubscriptions(
  customerId: string
): Promise<Stripe.Subscription[]> {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'active',
  });

  return subscriptions.data;
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<{ success: boolean; error?: string }> {
  if (!stripe) {
    return { success: false, error: 'Stripe is not configured' };
  }

  try {
    await stripe.subscriptions.cancel(subscriptionId);
    return { success: true };
  } catch (error) {
    console.error('[Stripe] Error canceling subscription:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel subscription',
    };
  }
}

