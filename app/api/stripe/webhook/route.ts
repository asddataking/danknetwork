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
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const email = session.customer_email || session.customer_details?.email;
    const zip = session.metadata?.zip;

    if (!email) {
      console.error('[Stripe Webhook] No email in checkout session');
      return;
    }

    console.log('[Stripe Webhook] Checkout completed for:', email);

    // Upgrade subscriber to premium
    const updateResult = await updateSubscriberTier(email, 'premium');

    if (!updateResult.success) {
      console.error('[Stripe Webhook] Failed to upgrade subscriber:', updateResult.error);
      return;
    }

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
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    // Get customer email from subscription
    const customerId = subscription.customer as string;
    const email = subscription.metadata?.email;

    if (!email) {
      console.warn('[Stripe Webhook] No email metadata in subscription, cannot downgrade');
      return;
    }

    console.log('[Stripe Webhook] Subscription canceled for:', email);

    // Downgrade subscriber to free tier
    const updateResult = await updateSubscriberTier(email, 'free');

    if (!updateResult.success) {
      console.error('[Stripe Webhook] Failed to downgrade subscriber:', updateResult.error);
      return;
    }

    console.log('[Stripe Webhook] Successfully downgraded subscriber to free:', email);
  } catch (error) {
    console.error('[Stripe Webhook] Error in handleSubscriptionDeleted:', error);
  }
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const email = subscription.metadata?.email;

    if (!email) {
      console.warn('[Stripe Webhook] No email metadata in subscription update');
      return;
    }

    // Check subscription status
    if (subscription.status === 'active') {
      console.log('[Stripe Webhook] Subscription active for:', email);
      await updateSubscriberTier(email, 'premium');
    } else if (['canceled', 'unpaid', 'past_due'].includes(subscription.status)) {
      console.log('[Stripe Webhook] Subscription inactive for:', email, 'status:', subscription.status);
      await updateSubscriberTier(email, 'free');
    }
  } catch (error) {
    console.error('[Stripe Webhook] Error in handleSubscriptionUpdated:', error);
  }
}

