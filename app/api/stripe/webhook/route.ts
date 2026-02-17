/**
 * POST /api/stripe/webhook
 * 
 * Handles Stripe webhook events for subscription lifecycle
 * 
 * Events handled:
 * - checkout.session.completed: Upgrade subscriber to premium, send welcome email
 * - customer.subscription.updated: Handle subscription changes
 * - customer.subscription.deleted: Downgrade subscriber to free tier
 * - invoice.payment_succeeded: Confirm active subscription
 * - invoice.payment_failed: Handle failed payments
 */

import { NextResponse } from 'next/server';
import { constructWebhookEvent } from '@/lib/stripe';
import { updateSubscriberTier } from '@/lib/deals/subscriber';
import { upsertSubscription, linkNewsletterToUser } from '@/lib/subscription/premium';
import { getSupabaseServiceClient } from '@/lib/auth/supabase';
import { sendWelcomeEmail, isMailerSendConfigured } from '@/lib/mailersend';
import Stripe from 'stripe';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const event = constructWebhookEvent(body, signature);

    if (!event) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    console.log('[Stripe Webhook] Received event:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('[Stripe Webhook] Payment succeeded for invoice:', invoice.id);
        // Subscription is already active, no action needed
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.error('[Stripe Webhook] Payment failed for invoice:', invoice.id);
        // Consider sending notification to user
        break;
      }

      default:
        console.log('[Stripe Webhook] Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout session completion
 * Creates unified subscription and links to user account
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const email = session.customer_email || session.customer_details?.email;
    const zip = session.metadata?.zip;
    const subscription = session.subscription as string;

    if (!email) {
      console.error('[Stripe Webhook] No email in checkout session');
      return;
    }

    console.log('[Stripe Webhook] Checkout completed for:', email);

    // Get or create user in auth.users
    const supabase = getSupabaseServiceClient();
    
    if (!supabase) {
      // If Supabase is not configured, log the webhook but don't fail
      console.warn('[Stripe Webhook] Supabase not configured, skipping user creation');
      return NextResponse.json({ received: true });
    }
    
    let userId: string | null = null;

    // Try to find existing user by email
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const user = existingUser?.users?.find(u => u.email === email);

    if (user) {
      userId = user.id;
      console.log('[Stripe Webhook] Found existing user:', userId);
    } else {
      // Create new user account (they'll need to set password later via magic link/reset)
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
      });

      if (createError || !newUser.user) {
        console.error('[Stripe Webhook] Failed to create user:', createError);
        // Fall back to legacy tier update if user creation fails
        await updateSubscriberTier(email, 'premium');
        return;
      }

      userId = newUser.user.id;
      console.log('[Stripe Webhook] Created new user:', userId);
    }

    // Get subscription details from Stripe if available
    if (subscription && typeof subscription === 'string') {
      const stripe = (await import('@/lib/stripe')).stripe;
      if (stripe) {
        const subDetails: any = await stripe.subscriptions.retrieve(subscription, {
          expand: ['default_payment_method']
        });
        
        // Create unified subscription record
        const subscriptionId = await upsertSubscription({
          userId,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: subscription,
          stripePriceId: subDetails.items.data[0]?.price.id || '',
          status: subDetails.status,
          currentPeriodStart: new Date(subDetails.current_period_start * 1000),
          currentPeriodEnd: new Date(subDetails.current_period_end * 1000),
          cancelAtPeriodEnd: subDetails.cancel_at_period_end,
        });

        if (subscriptionId) {
          console.log('[Stripe Webhook] Created unified subscription:', subscriptionId);
        }
      }
    }

    // Link newsletter subscriber to user account
    await linkNewsletterToUser(email, userId);

    // Also update legacy tier field for backward compatibility
    await updateSubscriberTier(email, 'premium');

    console.log('[Stripe Webhook] Successfully upgraded subscriber to premium:', email);

    // Send welcome email
    if (isMailerSendConfigured() && zip) {
      const emailResult = await sendWelcomeEmail({
        toEmail: email,
        tier: 'premium',
        zipCode: zip,
      });

      if (!emailResult.success) {
        console.error('[Stripe Webhook] Failed to send welcome email:', emailResult.error);
      } else {
        console.log('[Stripe Webhook] Welcome email sent to:', email);
      }
    }
  } catch (error) {
    console.error('[Stripe Webhook] Error in handleCheckoutCompleted:', error);
  }
}

/**
 * Handle subscription deletion (cancellation)
 * Updates unified subscription status
 */
async function handleSubscriptionDeleted(subscription: any) {
  try {
    const subscriptionId = subscription.id;
    console.log('[Stripe Webhook] Subscription canceled:', subscriptionId);

    // Update unified subscription status
    const supabase = getSupabaseServiceClient();
    
    if (!supabase) {
      console.warn('[Stripe Webhook] Supabase not configured, skipping subscription update');
      return NextResponse.json({ received: true });
    }
    
    const { error } = await supabase
      .from('subscriptions')
      .update({ 
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId);

    if (error) {
      console.error('[Stripe Webhook] Failed to update subscription status:', error);
    } else {
      console.log('[Stripe Webhook] Updated subscription status to canceled');
    }

    // Also update legacy tier field for backward compatibility with newsletter system
    const email = subscription.metadata?.email;
    if (email) {
      await updateSubscriberTier(email, 'free');
      console.log('[Stripe Webhook] Downgraded legacy tier for:', email);
    }
  } catch (error) {
    console.error('[Stripe Webhook] Error in handleSubscriptionDeleted:', error);
  }
}

/**
 * Handle subscription updates
 * Updates unified subscription record
 */
async function handleSubscriptionUpdated(subscription: any) {
  try {
    const subscriptionId = subscription.id;
    const email = subscription.metadata?.email;

    console.log('[Stripe Webhook] Subscription updated:', subscriptionId, 'status:', subscription.status);

    // Update unified subscription record
    const supabase = getSupabaseServiceClient();
    
    if (!supabase) {
      console.warn('[Stripe Webhook] Supabase not configured, skipping subscription update');
      return NextResponse.json({ received: true });
    }
    
    const { error } = await supabase
      .from('subscriptions')
      .update({ 
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end || false,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId);

    if (error) {
      console.error('[Stripe Webhook] Failed to update subscription:', error);
    } else {
      console.log('[Stripe Webhook] Updated unified subscription record');
    }

    // Also update legacy tier field for backward compatibility
    if (email) {
      const tier = subscription.status === 'active' ? 'premium' : 'free';
      await updateSubscriberTier(email, tier);
      console.log('[Stripe Webhook] Updated legacy tier for:', email, 'to', tier);
    }
  } catch (error) {
    console.error('[Stripe Webhook] Error in handleSubscriptionUpdated:', error);
  }
}

