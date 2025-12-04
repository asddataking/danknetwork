import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/auth/supabase';
import { processBusinessReferral } from '@/lib/rewards/referrals';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      businessName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      website,
      description,
      businessType,
      pointsMultiplier,
      referralCode,
      userId,
    } = body;

    // Validate required fields
    if (!businessName || !email || !phone || !address || !city || !state || !zipCode || !businessType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServiceClient();

    // Create partner application
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .insert({
        business_name: businessName,
        business_type: businessType,
        email,
        phone,
        address,
        city,
        state,
        zip_code: zipCode,
        website: website || null,
        description: description || null,
        points_multiplier: parseFloat(pointsMultiplier) || 1.0,
        application_status: 'pending',
        applied_at: new Date().toISOString(),
        application_data: {
          userId,
          referralCode: referralCode || null,
        },
      })
      .select()
      .single();

    if (partnerError) {
      console.error('Error creating partner application:', partnerError);
      return NextResponse.json(
        { error: 'Failed to submit application' },
        { status: 500 }
      );
    }

    // Process referral if code provided
    if (referralCode && userId) {
      try {
        await processBusinessReferral(userId, partner.id);
      } catch (refError) {
        console.error('Error processing referral:', refError);
        // Don't fail application if referral fails
      }
    }

    // TODO: Send confirmation email to applicant
    // TODO: Send notification to admin team

    return NextResponse.json({
      success: true,
      partner: {
        id: partner.id,
        businessName: partner.business_name,
        status: partner.application_status,
      },
    });
  } catch (error) {
    console.error('Error in partner application route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



