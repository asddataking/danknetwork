import { NextResponse } from 'next/server';
import { PlacesService } from '@/lib/supabase';
import { PlacesQueryParams } from '@/types/place';

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
        places: [],
        error: 'Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL in Vercel environment variables.'
      }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const bbox = searchParams.get('bbox');
    const search = searchParams.get('search') || undefined;
    const counties = searchParams.get('counties')?.split(',').filter(Boolean);
    const cuisines = searchParams.get('cuisines')?.split(',').filter(Boolean);
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const priceMin = searchParams.get('priceMin') ? parseInt(searchParams.get('priceMin')!) : undefined;
    const priceMax = searchParams.get('priceMax') ? parseInt(searchParams.get('priceMax')!) : undefined;
    const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined;
    const featured = searchParams.get('featured') === 'true' ? true : searchParams.get('featured') === 'false' ? false : undefined;
    const verified = searchParams.get('verified') === 'true' ? true : searchParams.get('verified') === 'false' ? false : undefined;

    let places;

    // Use Supabase Edge Function for marker service (matching dankndevour implementation)
    try {
      // Build request body for edge function
      const edgeFunctionBody: any = {
        limit_count: 200,
      };

      // Add bounds if provided
      if (bbox) {
        const [minLng, minLat, maxLng, maxLat] = bbox.split(',').map(Number);
        edgeFunctionBody.min_lng = minLng;
        edgeFunctionBody.min_lat = minLat;
        edgeFunctionBody.max_lng = maxLng;
        edgeFunctionBody.max_lat = maxLat;
      }

      // Add filters
      if (search) edgeFunctionBody.search_text = search;
      if (counties && counties.length > 0) edgeFunctionBody.county_filter = counties;
      if (cuisines && cuisines.length > 0) edgeFunctionBody.cuisine_filter = cuisines;
      if (tags && tags.length > 0) edgeFunctionBody.tag_filter = tags;
      if (priceMin !== undefined) edgeFunctionBody.min_price = priceMin;
      if (priceMax !== undefined) edgeFunctionBody.max_price = priceMax;
      if (minRating !== undefined) edgeFunctionBody.min_rating = minRating;
      if (featured === true) edgeFunctionBody.featured_only = true;
      if (verified === true) edgeFunctionBody.verified_only = true;

      // Call Supabase Edge Function
      const edgeFunctionUrl = `${supabaseUrl}/functions/v1/search-places`;
      console.log('[API] Calling Supabase Edge Function:', edgeFunctionUrl);
      
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(edgeFunctionBody),
      });

      if (!response.ok) {
        throw new Error(`Edge function error: ${response.status} ${response.statusText}`);
      }

      const edgeFunctionData = await response.json();
      places = edgeFunctionData.data || [];

      // Transform location GeoJSON to latitude/longitude for compatibility
      places = places.map((place: any) => {
        if (place.location && place.location.coordinates) {
          return {
            ...place,
            longitude: place.location.coordinates[0],
            latitude: place.location.coordinates[1],
          };
        }
        return place;
      });

      console.log(`[API] Edge function returned ${places.length} places`);
    } catch (edgeFunctionError) {
      console.warn('[API] Edge function failed, falling back to direct query:', edgeFunctionError);
      // Fallback to direct Supabase query
      if (bbox) {
        const [minLng, minLat, maxLng, maxLat] = bbox.split(',').map(Number);
        places = await PlacesService.getPlacesInBounds(minLng, minLat, maxLng, maxLat);
      } else {
        const filters: PlacesQueryParams = {
          counties,
          cuisines,
          tags,
          priceMin,
          priceMax,
          minRating,
          featured,
          verified,
        };
        places = await PlacesService.searchPlaces(search, filters);
      }
    }

    // Filter out any places without coordinates as a safety check
    const validPlaces = places.filter((place: any) => place.latitude && place.longitude);

    console.log(`[API] Returning ${validPlaces.length} places (from ${places.length} total)`);
    
    return NextResponse.json({ places: validPlaces });
  } catch (error) {
    console.error('[API] Error fetching places:', error);
    return NextResponse.json({ 
      places: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

