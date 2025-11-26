/**
 * POST /api/deals/subscribe-with-auth
 * 
 * Subscribe to Daily Dispo Deals + Auto-create Supabase account
 * 
 * Flow:
 * 1. Check if user already exists
 * 2. If not, create auth user (sends magic link)
 * 3. Create/update newsletter subscriber
 * 4. Link subscriber to user
 * 5. If premium tier, initiate Stripe checkout
 */

import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/auth/supabase';
import { createSubscriber } from '@/lib/deals/subscriber';

export async function POST(request: Request) {
  try {
    const { email, zip, tier } = await request.json();

    if (!email || !zip) {
      return NextResponse.json(
        { success: false, error: 'Email and zip code are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServiceClient();

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('auth.users')
      .select('id, email')
      .eq('email', email.toLowerCase().trim())
      .single();

    let userId = existingUser?.id;

    // If user doesn't exist, create account and send magic link
    if (!existingUser) {
      console.log(`[Deals Subscribe] Creating new account for ${email}`);
      
      const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(
        email,
        {
          data: {
            source: 'daily_dispo_deals',
            zip_code: zip,
          },
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/deals?welcome=true`,
        }
      );

      if (authError) {
        console.error('[Deals Subscribe] Error creating auth user:', authError);
        // Don't fail the request - still create newsletter subscriber
      } else {
        userId = authData.user?.id;
        console.log(`[Deals Subscribe] Created user ${userId}`);
      }
    } else {
      console.log(`[Deals Subscribe] User already exists: ${userId}`);
    }

    // Create/update newsletter subscriber
    const subscriberResult = await createSubscriber({
      email,
      zipCode: zip,
      tier: tier === 'premium' ? 'premium' : 'free',
      userId: userId || undefined,
    });

    if (!subscriberResult.success) {
      return NextResponse.json(
        { success: false, error: subscriberResult.error || 'Failed to create newsletter subscription' },
        { status: 500 }
      );
    }

    // If premium tier requested, create Stripe checkout session
    if (tier === 'premium') {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/stripe/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          userId: userId || 'pending',
          zip,
        }),
      });

      const checkoutData = await response.json();

      if (checkoutData.success && checkoutData.url) {
        return NextResponse.json({
          success: true,
          requiresPayment: true,
          checkoutUrl: checkoutData.url,
          message: 'Check your email for a magic link to access your account!',
        });
      }
    }

    // Free tier or checkout failed
    return NextResponse.json({
      success: true,
      requiresPayment: false,
      message: existingUser
        ? 'Subscription updated! Check your email daily for deals.'
        : 'Account created! Check your email for a magic link to access your account.',
    });
  } catch (error) {
    console.error('[Deals Subscribe] Unexpected error:', error);
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

