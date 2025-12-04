import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/auth/supabase';
import { awardPoints } from '@/lib/rewards/supabase';

/**
 * POST /api/gamification/complete-profile
 * Awards points for completing profile (first time only)
 */
export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServiceClient();

    // Check if user already got profile completion points
    const { data: existing } = await supabase
      .from('points_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('reference_type', 'promotion')
      .eq('description', 'Profile completion bonus')
      .limit(1)
      .single();

    if (existing) {
      return NextResponse.json({
        success: false,
        message: 'Profile completion bonus already awarded'
      });
    }

    // Award 25 points for profile completion
    const success = await awardPoints(
      userId,
      25,
      'bonus',
      userId,
      'promotion',
      'Profile completion bonus'
    );

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to award points' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      pointsAwarded: 25,
      message: 'Profile completion bonus awarded!'
    });
  } catch (error) {
    console.error('Error awarding profile completion points:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

