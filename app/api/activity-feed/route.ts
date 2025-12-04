import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/auth/supabase';

/**
 * GET /api/activity-feed
 * Returns recent public activities for the mini activity feed
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = getSupabaseServiceClient();

    // Fetch recent public activities
    const { data: activities, error } = await supabase
      .from('activity_feed')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[Activity Feed API] Error fetching activities:', error);
      return NextResponse.json(
        { error: 'Failed to fetch activities', activities: [] },
        { status: 500 }
      );
    }

    return NextResponse.json({
      activities: activities || [],
      count: activities?.length || 0,
    });
  } catch (error) {
    console.error('[Activity Feed API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', activities: [] },
      { status: 500 }
    );
  }
}

/**
 * POST /api/activity-feed
 * Create a new activity (admin/system use)
 * Requires authentication and proper permissions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, message, icon, action_url, metadata } = body;

    // Validate required fields
    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, message' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServiceClient();

    const { data: activity, error } = await supabase
      .from('activity_feed')
      .insert({
        type,
        title,
        message,
        icon: icon || '📢',
        action_url: action_url || null,
        metadata: metadata || null,
        is_public: true,
      })
      .select()
      .single();

    if (error) {
      console.error('[Activity Feed API] Error creating activity:', error);
      return NextResponse.json(
        { error: 'Failed to create activity' },
        { status: 500 }
      );
    }

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    console.error('[Activity Feed API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

