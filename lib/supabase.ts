import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Place, PlacesQueryParams } from '@/types/place';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client only if credentials are available
let supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  
  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  
  return supabase;
}

export class PlacesService {
  /**
   * Get places within a bounding box
   */
  static async getPlacesInBounds(
    minLng: number,
    minLat: number,
    maxLng: number,
    maxLat: number
  ): Promise<Place[]> {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return [];
      }

      const { data, error } = await client.rpc('get_places_in_bounds', {
        min_lng: minLng,
        min_lat: minLat,
        max_lng: maxLng,
        max_lat: maxLat,
      });

      if (error) {
        console.error('RPC error, falling back to direct query:', error);
        // Fallback: query with bounding box using PostGIS
        return this.getPlacesInBoundsDirect(minLng, minLat, maxLng, maxLat);
      }
      
      // RPC returns location as GeoJSON: { type: 'Point', coordinates: [lng, lat] }
      return (data || []).map((place: any) => {
        if (place.location && place.location.coordinates) {
          return {
            ...place,
            longitude: place.location.coordinates[0],
            latitude: place.location.coordinates[1],
          };
        }
        return place;
      });
    } catch (error) {
      console.error('Error fetching places in bounds:', error);
      // Fallback to simple query if RPC doesn't exist
      return this.getPlacesSimple();
    }
  }

  /**
   * Direct query for places in bounds (fallback)
   */
  private static async getPlacesInBoundsDirect(
    minLng: number,
    minLat: number,
    maxLng: number,
    maxLat: number
  ): Promise<Place[]> {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return [];
      }

      // Use a bounding box query with PostGIS
      // This is a simplified version - the RPC function should be preferred
      const { data, error } = await client
        .from('places')
        .select('*')
        .eq('status', 'published')
        .limit(500);

      if (error) throw error;

      // Filter by bounds and extract coordinates
      return (data || [])
        .map((place: any) => {
          // Extract lat/lng from geography if needed
          if (place.location && typeof place.location === 'object' && !place.latitude) {
            if (place.location.coordinates) {
              place.longitude = place.location.coordinates[0];
              place.latitude = place.location.coordinates[1];
            }
          }
          return place;
        })
        .filter((place: any) => {
          if (!place.latitude || !place.longitude) return false;
          return (
            place.longitude >= minLng &&
            place.longitude <= maxLng &&
            place.latitude >= minLat &&
            place.latitude <= maxLat
          );
        });
    } catch (error) {
      console.error('Error in direct bounds query:', error);
      return [];
    }
  }

  /**
   * Simple query for all published places
   */
  static async getPlacesSimple(): Promise<Place[]> {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return [];
      }

      // Query places - Supabase returns geography as GeoJSON when selected directly
      const { data, error } = await client
        .from('places')
        .select('*')
        .eq('status', 'published')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;
      
      // Transform data to extract lat/lng from geography GeoJSON
      // Direct select returns: { type: 'Point', coordinates: [lng, lat] }
      const places = (data || []).map((place: any) => {
        if (place.location && typeof place.location === 'object') {
          if (place.location.coordinates && Array.isArray(place.location.coordinates) && place.location.coordinates.length >= 2) {
            return {
              ...place,
              longitude: place.location.coordinates[0],
              latitude: place.location.coordinates[1],
            };
          }
        }
        return place;
      }).filter((place: any) => place.latitude && place.longitude);
      
      return places;
    } catch (error) {
      console.error('Error fetching places:', error);
      return [];
    }
  }

  /**
   * Search places with filters
   */
  static async searchPlaces(
    searchTerm?: string,
    filters?: PlacesQueryParams
  ): Promise<Place[]> {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return [];
      }

      // Use a query that extracts lat/lng from geography
      // We'll select all fields and let the API route handle coordinate extraction
      let query = client
        .from('places')
        .select('*')
        .eq('status', 'published');

      if (searchTerm) {
        query = query.or(
          `name.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`
        );
      }

      if (filters?.counties && filters.counties.length > 0) {
        query = query.in('county', filters.counties);
      }

      if (filters?.cuisines && filters.cuisines.length > 0) {
        query = query.overlaps('cuisines', filters.cuisines);
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      if (filters?.priceMin !== undefined) {
        query = query.gte('price_level', filters.priceMin);
      }

      if (filters?.priceMax !== undefined) {
        query = query.lte('price_level', filters.priceMax);
      }

      if (filters?.minRating !== undefined) {
        query = query.gte('rating', filters.minRating);
      }

      if (filters?.featured !== undefined) {
        query = query.eq('is_featured', filters.featured);
      }

      if (filters?.verified !== undefined) {
        query = query.eq('is_verified', filters.verified);
      }

      const { data, error } = await query
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false, nullsFirst: false })
        .limit(500);

      if (error) throw error;
      
      // Transform data to extract lat/lng from geography GeoJSON
      const places = (data || []).map((place: any) => {
        if (place.location && typeof place.location === 'object') {
          if (place.location.coordinates && Array.isArray(place.location.coordinates) && place.location.coordinates.length >= 2) {
            return {
              ...place,
              longitude: place.location.coordinates[0],
              latitude: place.location.coordinates[1],
            };
          }
        }
        return place;
      }).filter((place: any) => place.latitude && place.longitude);
      
      return places;
    } catch (error) {
      console.error('Error searching places:', error);
      return [];
    }
  }

  /**
   * Get a single place by slug
   */
  static async getPlaceBySlug(slug: string): Promise<Place | null> {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return null;
      }

      const { data, error } = await client
        .from('places')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching place:', error);
      return null;
    }
  }
}

