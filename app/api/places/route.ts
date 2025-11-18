import { NextResponse } from 'next/server';
import { PlacesService } from '@/lib/supabase';
import { PlacesQueryParams, Place } from '@/types/place';

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

    let places: Place[] = [];

    // Use direct Supabase queries for faster response (skip edge function)
    // This ensures places are available immediately when map loads
    try {
      if (bbox) {
        const [minLng, minLat, maxLng, maxLat] = bbox.split(',').map(Number);
        console.log('[API] Fetching places in bounds:', { minLng, minLat, maxLng, maxLat });
        places = await PlacesService.getPlacesInBounds(minLng, minLat, maxLng, maxLat);
      } else {
        // If no bbox, use searchPlaces with filters, fallback to getPlacesSimple
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
        
        console.log('[API] Fetching places with filters:', filters);
        
        try {
          places = await PlacesService.searchPlaces(search, filters);
          if (!places || places.length === 0) {
            console.log('[API] searchPlaces returned empty, trying getPlacesSimple');
            places = await PlacesService.getPlacesSimple();
          }
        } catch (searchError) {
          console.warn('[API] searchPlaces failed, using getPlacesSimple:', searchError);
          places = await PlacesService.getPlacesSimple();
        }
      }
      
      console.log(`[API] Direct query returned ${places.length} places`);
    } catch (error) {
      console.error('[API] Error fetching places:', error);
      places = [];
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

