import { NextResponse } from 'next/server';
import { PlacesService } from '@/lib/supabase';
import { PlacesQueryParams } from '@/types/place';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
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

    // If bbox is provided, use bounds query
    if (bbox) {
      const [minLng, minLat, maxLng, maxLat] = bbox.split(',').map(Number);
      places = await PlacesService.getPlacesInBounds(minLng, minLat, maxLng, maxLat);
    } else {
      // Otherwise use search with filters
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

    // PlacesService already handles GeoJSON transformation
    // Just filter out any places without coordinates as a safety check
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

