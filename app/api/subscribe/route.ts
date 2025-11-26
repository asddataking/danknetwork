/**
 * POST /api/subscribe
 * 
 * Simple subscription endpoint that:
 * 1. Saves subscriber to Supabase (newsletter_subscribers table)
 * 2. Sends a welcome email via MailerSend
 * 
 * Body params:
 * - email: string (required)
 * - zip: string (required, 5 digits)
 * - tier: 'free' | 'premium' (optional, defaults to 'free')
 */

import { NextResponse } from 'next/server';
import { createSubscriber } from '@/lib/deals/subscriber';
import { sendWelcomeEmail, isMailerSendConfigured } from '@/lib/mailersend';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, zip, tier = 'free' } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!zip) {
      return NextResponse.json(
        { success: false, error: 'ZIP code is required' },
        { status: 400 }
      );
    }

    // Validate tier
    if (tier !== 'free' && tier !== 'premium') {
      return NextResponse.json(
        { success: false, error: 'Tier must be "free" or "premium"' },
        { status: 400 }
      );
    }

    // Save subscriber to database
    const subscriberResult = await createSubscriber({
      email,
      zipCode: zip,
      tier,
    });

    if (!subscriberResult.success) {
      return NextResponse.json(
        { success: false, error: subscriberResult.error },
        { status: 400 }
      );
    }

    // Send welcome email via MailerSend
    // This is a best-effort operation - don't fail the whole request if it fails
    if (isMailerSendConfigured()) {
      const emailResult = await sendWelcomeEmail({
        toEmail: email,
        tier,
        zipCode: zip,
      });

      if (!emailResult.success) {
        console.error('[Subscribe API] Failed to send welcome email:', emailResult.error);
        // Don't fail the request, just log the error
      } else {
        console.log('[Subscribe API] Welcome email sent successfully');
      }
    } else {
      console.warn('[Subscribe API] MailerSend not configured, skipping welcome email');
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed!',
      subscriber: {
        email: subscriberResult.subscriber?.email,
        zip: subscriberResult.subscriber?.zip,
        tier: subscriberResult.subscriber?.tier,
      },
    });
  } catch (error) {
    console.error('[Subscribe API] Unexpected error:', error);
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

