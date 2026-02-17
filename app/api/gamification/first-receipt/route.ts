import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/auth/supabase';
import { awardPoints } from '@/lib/rewards/supabase';

/**
 * POST /api/gamification/first-receipt
 * Awards bonus points for first receipt upload
 */
export async function POST(request: Request) {
  try {
    const { userId, receiptId } = await request.json();

    if (!userId || !receiptId) {
      return NextResponse.json(
        { success: false, error: 'User ID and receipt ID are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServiceClient();
    
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Check if this is user's first receipt
    const { count } = await supabase
      .from('receipts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'approved');

    // Only award if this is the first approved receipt
    if (count !== 1) {
      return NextResponse.json({
        success: false,
        message: 'Not first receipt or receipt not approved yet'
      });
    }

    // Check if user already got first receipt bonus
    const { data: existing } = await supabase
      .from('points_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('reference_type', 'promotion')
      .eq('description', 'First receipt bonus')
      .limit(1)
      .single();

    if (existing) {
      return NextResponse.json({
        success: false,
        message: 'First receipt bonus already awarded'
      });
    }

    // Award 50 points for first receipt
    const success = await awardPoints(
      userId,
      50,
      'bonus',
      receiptId,
      'promotion',
      'First receipt bonus'
    );

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to award points' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      pointsAwarded: 50,
      message: 'First receipt bonus awarded!'
    });
  } catch (error) {
    console.error('Error awarding first receipt points:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

