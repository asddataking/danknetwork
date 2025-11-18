import { NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      console.error('[API] Supabase environment variables not configured');
      return NextResponse.json({ 
        counties: [],
        cuisines: [],
        tags: [],
        error: 'Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL in Vercel environment variables.'
      }, { status: 500 });
    }

    // Use Supabase Edge Function for filter options (matching dankndevour implementation)
    try {
      const edgeFunctionUrl = `${supabaseUrl}/functions/v1/get-filter-options`;
      console.log('[API] Calling Supabase Edge Function:', edgeFunctionUrl);
      
      const response = await fetch(edgeFunctionUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Edge function error: ${response.status} ${response.statusText}`);
      }

      const edgeFunctionData = await response.json();
      const filterOptions = edgeFunctionData.data || { counties: [], cuisines: [], tags: [] };

      console.log(`[API] Edge function returned filter options: ${filterOptions.counties.length} counties, ${filterOptions.cuisines.length} cuisines, ${filterOptions.tags.length} tags`);
      
      return NextResponse.json(filterOptions, {
        headers: {
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour (matching edge function)
        },
      });
    } catch (edgeFunctionError) {
      console.warn('[API] Edge function failed, returning empty filter options:', edgeFunctionError);
      // Return empty arrays on error
      return NextResponse.json({ 
        counties: [],
        cuisines: [],
        tags: [],
      });
    }
  } catch (error) {
    console.error('[API] Error fetching filter options:', error);
    return NextResponse.json({ 
      counties: [],
      cuisines: [],
      tags: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

