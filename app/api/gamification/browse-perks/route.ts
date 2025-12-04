import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/auth/supabase';
import { awardPoints } from '@/lib/rewards/supabase';

/**
 * POST /api/gamification/browse-perks
 * Awards points for browsing perks (first time only)
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

    // Check if user already got browse perks points
    const { data: existing } = await supabase
      .from('points_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('reference_type', 'promotion')
      .eq('description', 'Browse perks bonus')
      .limit(1)
      .single();

    if (existing) {
      return NextResponse.json({
        success: false,
        message: 'Browse perks bonus already awarded'
      });
    }

    // Award 25 points for browsing perks
    const success = await awardPoints(
      userId,
      25,
      'bonus',
      userId,
      'promotion',
      'Browse perks bonus'
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
      message: 'Browse perks bonus awarded!'
    });
  } catch (error) {
    console.error('Error awarding browse perks points:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

