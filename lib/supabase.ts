import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Place, PlacesQueryParams } from '@/types/place';

// Support both naming conventions: NEXT_PUBLIC_* (standard) and supabase_* (local dev)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.supabase_url || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.supabase_anon_key || '';
// Support both SUPABASE_SECRET_SERVICE_ROLE_KEY and SUPABASE_SERVICE_ROLE_KEY
const supabaseServiceKey = process.env.SUPABASE_SECRET_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Create Supabase clients only if credentials are available
let supabase: SupabaseClient | null = null;
let supabaseService: SupabaseClient | null = null;

/**
 * Get Supabase client for client-side operations (uses anon key)
 */
function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  
  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  
  return supabase;
}

/**
 * Get Supabase client for server-side operations (uses service role key, bypasses RLS)
 * This should be used in API routes and server components
 */
function getSupabaseServiceClient(): SupabaseClient | null {
  if (!supabaseUrl) {
    return null;
  }
  
  // Prefer service role key for server-side operations
  if (supabaseServiceKey) {
    if (!supabaseService) {
      supabaseService = createClient(supabaseUrl, supabaseServiceKey);
    }
    return supabaseService;
  }
  
  // Fallback to anon key if service role key is not available
  return getSupabaseClient();
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
      const client = getSupabaseServiceClient();
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
      const client = getSupabaseServiceClient();
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
   * Uses SQL to extract lat/lng directly from geography
   */
  static async getPlacesSimple(): Promise<Place[]> {
    try {
      const client = getSupabaseServiceClient();
      if (!client) {
        console.warn('[PlacesService] Supabase client not available');
        return [];
      }

          // Use RPC to get places with extracted coordinates, or fallback to direct query
          try {
            // Try using a SQL query that extracts coordinates
            let data, error;
            try {
              const result = await client.rpc('get_all_published_places');
              data = result.data;
              error = result.error;
            } catch (rpcError) {
              // RPC doesn't exist, use direct query
              const result = await client
                .from('places')
                .select('id, slug, name, address, city, county, state, zip, cuisines, tags, price_level, rating, website, menu_url, phone, ig_url, hours, hero_image_url, is_featured, is_verified, status, created_at, updated_at')
                .eq('status', 'published')
                .order('is_featured', { ascending: false })
                .order('created_at', { ascending: false })
                .limit(1000);
              data = result.data;
              error = result.error;
            }

        if (error) {
          console.error('[PlacesService] RPC error:', error);
          // Fallback to direct query
          return this.getPlacesDirect();
        }

        // RPC should return places with lat/lng already extracted
        if (data && Array.isArray(data)) {
          return data.map((place: any) => ({
            ...place,
            latitude: place.latitude || place.lat,
            longitude: place.longitude || place.lng,
          })).filter((place: any) => place.latitude && place.longitude);
        }
      } catch (rpcError) {
        console.warn('[PlacesService] RPC not available, using direct query');
      }

      // Fallback to direct query
      return this.getPlacesDirect();
    } catch (error) {
      console.error('[PlacesService] Error fetching places:', error);
      return [];
    }
  }

  /**
   * Direct query fallback - queries with coordinate extraction
   */
  private static async getPlacesDirect(): Promise<Place[]> {
    try {
      const client = getSupabaseServiceClient();
      if (!client) return [];

      // Query all fields except location, then fetch location separately or use a view
      // For now, select all and transform
      const { data, error } = await client
        .from('places')
        .select('*')
        .eq('status', 'published')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) {
        console.error('[PlacesService] Direct query error:', error);
        throw error;
      }

      console.log(`[PlacesService] Fetched ${data?.length || 0} places from database`);
      
      // Transform data to extract lat/lng from geography
      // Supabase JS client returns geography as GeoJSON: { type: 'Point', coordinates: [lng, lat] }
      const places = (data || []).map((place: any) => {
        // Check if location is GeoJSON format
        if (place.location && typeof place.location === 'object') {
          if (place.location.coordinates && Array.isArray(place.location.coordinates) && place.location.coordinates.length >= 2) {
            return {
              ...place,
              longitude: place.location.coordinates[0],
              latitude: place.location.coordinates[1],
            };
          }
          // Sometimes it might be stored as { lng, lat }
          if (place.location.lng !== undefined && place.location.lat !== undefined) {
            return {
              ...place,
              longitude: place.location.lng,
              latitude: place.location.lat,
            };
          }
        }
        // If already has lat/lng, return as is
        return place;
      }).filter((place: any) => {
        const hasCoords = place.latitude && place.longitude;
        if (!hasCoords) {
          console.warn(`[PlacesService] Place ${place.id || place.name} missing coordinates`);
        }
        return hasCoords;
      });

      console.log(`[PlacesService] Transformed to ${places.length} places with coordinates`);
      return places;
    } catch (error) {
      console.error('[PlacesService] Direct query error:', error);
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
      const client = getSupabaseServiceClient();
      if (!client) {
        return [];
      }

      // Try using the search_places RPC function first (if it exists)
      try {
        const rpcParams: any = {};
        if (searchTerm) rpcParams.search_text = searchTerm;
        if (filters?.counties && filters.counties.length > 0) rpcParams.county_filter = filters.counties;
        if (filters?.cuisines && filters.cuisines.length > 0) rpcParams.cuisine_filter = filters.cuisines;
        if (filters?.tags && filters.tags.length > 0) rpcParams.tag_filter = filters.tags;
        if (filters?.priceMin !== undefined) rpcParams.min_price = filters.priceMin;
        if (filters?.priceMax !== undefined) rpcParams.max_price = filters.priceMax;
        if (filters?.minRating !== undefined) rpcParams.min_rating = filters.minRating;
        if (filters?.featured !== undefined) rpcParams.featured_only = filters.featured;
        if (filters?.verified !== undefined) rpcParams.verified_only = filters.verified;
        rpcParams.limit_count = 500;

        const { data, error } = await client.rpc('search_places', rpcParams);
        
        if (!error && data && data.length > 0) {
          console.log(`[PlacesService] RPC search_places returned ${data.length} places`);
          // RPC returns location as GeoJSON: { type: 'Point', coordinates: [lng, lat] }
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
          
          if (places.length > 0) {
            return places;
          }
        }
      } catch (rpcError) {
        console.warn('[PlacesService] RPC search_places failed, using direct query:', rpcError);
      }

      // Fallback to direct query
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
        // Check if location is GeoJSON format
        if (place.location && typeof place.location === 'object') {
          if (place.location.coordinates && Array.isArray(place.location.coordinates) && place.location.coordinates.length >= 2) {
            return {
              ...place,
              longitude: place.location.coordinates[0],
              latitude: place.location.coordinates[1],
            };
          }
          // Sometimes it might be stored as { lng, lat }
          if (place.location.lng !== undefined && place.location.lat !== undefined) {
            return {
              ...place,
              longitude: place.location.lng,
              latitude: place.location.lat,
            };
          }
        }
        // If already has lat/lng, return as is
        return place;
      }).filter((place: any) => {
        const hasCoords = place.latitude && place.longitude;
        if (!hasCoords) {
          console.warn(`[PlacesService] Place ${place.id || place.name} missing coordinates after transformation`);
        }
        return hasCoords;
      });
      
      console.log(`[PlacesService] searchPlaces returning ${places.length} places with coordinates`);
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
      const client = getSupabaseServiceClient();
      if (!client) {
        return null;
      }

      // Normalize slug - trim and lowercase for matching
      const normalizedSlug = slug.trim().toLowerCase();

      // Try to find the place by slug (case-insensitive)
      // First try exact match
      let query = client
        .from('places')
        .select('*')
        .eq('slug', slug);
      
      const { data, error } = await query.maybeSingle();
      
      // If exact match found, use it
      if (data && !error) {
        const place: any = { ...data };
        
        // Extract coordinates from geography field
        if (place.location && typeof place.location === 'object') {
          if (place.location.coordinates && Array.isArray(place.location.coordinates) && place.location.coordinates.length >= 2) {
            place.longitude = place.location.coordinates[0];
            place.latitude = place.location.coordinates[1];
          } else if (place.location.lng !== undefined && place.location.lat !== undefined) {
            place.longitude = place.location.lng;
            place.latitude = place.location.lat;
          }
        }

        // Parse JSON fields if they're strings
        if (typeof place.cuisines === 'string') {
          try {
            place.cuisines = JSON.parse(place.cuisines);
          } catch (e) {
            place.cuisines = place.cuisines ? [place.cuisines] : [];
          }
        }
        if (typeof place.tags === 'string') {
          try {
            place.tags = JSON.parse(place.tags);
          } catch (e) {
            place.tags = place.tags ? [place.tags] : [];
          }
        }
        if (typeof place.hours === 'string') {
          try {
            place.hours = JSON.parse(place.hours);
          } catch (e) {
            place.hours = {};
          }
        }

        // Ensure arrays are arrays and required fields exist
        if (!Array.isArray(place.cuisines)) place.cuisines = [];
        if (!Array.isArray(place.tags)) place.tags = [];
        if (!place.hours || typeof place.hours !== 'object') place.hours = {};
        
        // Ensure required fields have fallback values
        if (!place.name) place.name = 'Unnamed Place';
        if (!place.slug) place.slug = place.id || '';
        if (typeof place.latitude !== 'number' || isNaN(place.latitude)) {
          place.latitude = place.latitude || 0;
        }
        if (typeof place.longitude !== 'number' || isNaN(place.longitude)) {
          place.longitude = place.longitude || 0;
        }

        console.log('[PlacesService] Found place by exact slug match:', { slug, placeId: place.id, name: place.name });
        return place;
      }
      
      // If exact match fails, try case-insensitive search
      console.log('[PlacesService] Exact slug match failed, trying case-insensitive search for:', slug);
      const { data: caseInsensitiveData, error: caseError } = await client
        .from('places')
        .select('*')
        .ilike('slug', slug)
        .maybeSingle();
      
      // If case-insensitive match found, use it
      if (!caseError && caseInsensitiveData) {
        const place: any = { ...caseInsensitiveData };
        
        // Extract coordinates from geography field
        if (place.location && typeof place.location === 'object') {
          if (place.location.coordinates && Array.isArray(place.location.coordinates) && place.location.coordinates.length >= 2) {
            place.longitude = place.location.coordinates[0];
            place.latitude = place.location.coordinates[1];
          } else if (place.location.lng !== undefined && place.location.lat !== undefined) {
            place.longitude = place.location.lng;
            place.latitude = place.location.lat;
          }
        }

        // Parse JSON fields if they're strings
        if (typeof place.cuisines === 'string') {
          try {
            place.cuisines = JSON.parse(place.cuisines);
          } catch (e) {
            place.cuisines = place.cuisines ? [place.cuisines] : [];
          }
        }
        if (typeof place.tags === 'string') {
          try {
            place.tags = JSON.parse(place.tags);
          } catch (e) {
            place.tags = place.tags ? [place.tags] : [];
          }
        }
        if (typeof place.hours === 'string') {
          try {
            place.hours = JSON.parse(place.hours);
          } catch (e) {
            place.hours = {};
          }
        }

        // Ensure arrays are arrays and required fields exist
        if (!Array.isArray(place.cuisines)) place.cuisines = [];
        if (!Array.isArray(place.tags)) place.tags = [];
        if (!place.hours || typeof place.hours !== 'object') place.hours = {};
        
        // Ensure required fields have fallback values
        if (!place.name) place.name = 'Unnamed Place';
        if (!place.slug) place.slug = place.id || '';
        if (typeof place.latitude !== 'number' || isNaN(place.latitude)) {
          place.latitude = place.latitude || 0;
        }
        if (typeof place.longitude !== 'number' || isNaN(place.longitude)) {
          place.longitude = place.longitude || 0;
        }

        console.log('[PlacesService] Found place by case-insensitive slug:', { slug, placeId: place.id, name: place.name, actualSlug: place.slug });
        return place;
      }

      // If both exact and case-insensitive matches failed, try ID fallback
      if (error || caseError) {
        // If slug lookup fails, try to find by ID (in case slug is actually an ID)
        const errorMsg = error?.message || caseError?.message || 'Unknown error';
        console.warn('[PlacesService] Slug lookup failed, trying ID fallback:', errorMsg);
        const idQuery = client
          .from('places')
          .select('*')
          .eq('id', slug)
          .single();
        
        const { data: idData, error: idError } = await idQuery;
        
        if (idError || !idData) {
          console.error('[PlacesService] Both slug and ID lookup failed:', { slug, slugError: error?.message || caseError?.message || 'Unknown error', idError: idError?.message });
          return null;
        }
        
        // Use the ID result
        const place: any = { ...idData };
        
        // Extract coordinates from geography field
        if (place.location && typeof place.location === 'object') {
          if (place.location.coordinates && Array.isArray(place.location.coordinates) && place.location.coordinates.length >= 2) {
            place.longitude = place.location.coordinates[0];
            place.latitude = place.location.coordinates[1];
          } else if (place.location.lng !== undefined && place.location.lat !== undefined) {
            place.longitude = place.location.lng;
            place.latitude = place.location.lat;
          }
        }

        // Parse JSON fields if they're strings
        if (typeof place.cuisines === 'string') {
          try {
            place.cuisines = JSON.parse(place.cuisines);
          } catch (e) {
            place.cuisines = place.cuisines ? [place.cuisines] : [];
          }
        }
        if (typeof place.tags === 'string') {
          try {
            place.tags = JSON.parse(place.tags);
          } catch (e) {
            place.tags = place.tags ? [place.tags] : [];
          }
        }
        if (typeof place.hours === 'string') {
          try {
            place.hours = JSON.parse(place.hours);
          } catch (e) {
            place.hours = {};
          }
        }

        // Ensure arrays are arrays
        if (!Array.isArray(place.cuisines)) place.cuisines = [];
        if (!Array.isArray(place.tags)) place.tags = [];
        if (!place.hours || typeof place.hours !== 'object') place.hours = {};

        console.log('[PlacesService] Found place by ID fallback:', { slug, placeId: place.id, name: place.name });
        return place;
      }

      // If all lookups failed, return null
      console.warn('[PlacesService] All lookup methods failed for slug:', slug);
      return null;
    } catch (error) {
      console.error('Error fetching place:', error);
      return null;
    }
  }
}

