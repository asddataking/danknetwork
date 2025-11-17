import { NextResponse } from 'next/server';
import { PlacesService } from '@/lib/supabase';
import { PlacesQueryParams } from '@/types/place';

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

    // Transform places to include lat/lng from PostGIS geography if needed
    const transformedPlaces = places.map((place: any) => {
      // If location is a PostGIS geography object, extract coordinates
      if (place.location && typeof place.location === 'object') {
        const coords = place.location.coordinates || [];
        return {
          ...place,
          longitude: coords[0] || place.longitude,
          latitude: coords[1] || place.latitude,
        };
      }
      return place;
    });

    return NextResponse.json({ places: transformedPlaces });
  } catch (error) {
    console.error('Error fetching places:', error);
    return NextResponse.json({ places: [] }, { status: 500 });
  }
}

