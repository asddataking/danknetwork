/**
 * POST /api/stripe/create-checkout
 * 
 * Creates a Stripe Checkout Session for Premium subscription
 * 
 * Body params:
 * - email: string (required)
 * - zip: string (required, 5 digits)
 */

import { NextResponse } from 'next/server';
import { createCheckoutSession, isStripeConfigured } from '@/lib/stripe';
import { createSubscriber } from '@/lib/deals/subscriber';

export async function POST(request: Request) {
  try {
    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Payment processing is not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { email, zip } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!zip || !/^\d{5}$/.test(zip)) {
      return NextResponse.json(
        { success: false, error: 'Valid 5-digit ZIP code is required' },
        { status: 400 }
      );
    }

    // Pre-create subscriber with 'free' tier
    // Will be upgraded to 'premium' after successful payment via webhook
    const subscriberResult = await createSubscriber({
      email,
      zipCode: zip,
      tier: 'free', // Start as free, webhook will upgrade after payment
    });

    if (!subscriberResult.success) {
      return NextResponse.json(
        { success: false, error: subscriberResult.error },
        { status: 400 }
      );
    }

    // Create Stripe Checkout Session
    const checkoutResult = await createCheckoutSession({ email, zip });

    if (checkoutResult.error || !checkoutResult.url) {
      return NextResponse.json(
        { success: false, error: checkoutResult.error || 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sessionId: checkoutResult.sessionId,
      url: checkoutResult.url,
    });
  } catch (error) {
    console.error('[Stripe Checkout API] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

