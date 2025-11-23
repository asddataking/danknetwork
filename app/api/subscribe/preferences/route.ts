import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getZipGroup } from '@/lib/deals/zip-groups';

export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await request.json();
    const {
      email,
      zip,
      preferredProductTypes = [],
      preferredBrands = [],
      minThcPercent,
      maxThcPercent,
      filterByBestQuantity = true,
      minValueScore,
    } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Get ZIP group
    const zipGroup = zip ? getZipGroup(zip) : null;

    // 1. Save/update subscriber
    const { data: subscriber, error: subError } = await supabase
      .from('newsletter_subscribers')
      .upsert({
        email: normalizedEmail,
        zip: zip || null,
        zip_group: zipGroup,
      }, {
        onConflict: 'email',
      })
      .select()
      .single();

    if (subError) {
      console.error('Error saving subscriber:', subError);
      return NextResponse.json(
        { error: 'Failed to save subscriber', details: subError.message },
        { status: 500 }
      );
    }

    // 2. Save/update preferences
    const { error: prefError } = await supabase
      .from('user_preferences')
      .upsert({
        email: normalizedEmail,
        preferred_product_types: preferredProductTypes.length > 0 ? preferredProductTypes : null,
        preferred_brands: preferredBrands.length > 0 ? preferredBrands : null,
        min_thc_percent: minThcPercent || null,
        max_thc_percent: maxThcPercent || null,
        filter_by_best_quantity: filterByBestQuantity ?? true,
        min_value_score: minValueScore || null,
        max_distance_miles: 15, // Default
      }, {
        onConflict: 'email',
      });

    if (prefError) {
      console.error('Error saving preferences:', prefError);
      return NextResponse.json(
        { error: 'Failed to save preferences', details: prefError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      email: normalizedEmail,
      zipGroup,
      message: 'Preferences saved successfully',
    });
  } catch (error) {
    console.error('Error in preferences route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

