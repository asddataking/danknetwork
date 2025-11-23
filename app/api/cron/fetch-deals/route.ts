import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: 'Supabase not configured' },
      { status: 500 }
    );
  }

  try {
    // Call Supabase Edge Function
    const response = await fetch(`${supabaseUrl}/functions/v1/fetch-deals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        trigger: 'daily_cron',
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Edge function failed: ${error}`);
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Deal fetch triggered',
      result,
    });
  } catch (error) {
    console.error('Error triggering fetch-deals:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

