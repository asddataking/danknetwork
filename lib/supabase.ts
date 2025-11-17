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

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching places in bounds:', error);
      // Fallback to simple query if RPC doesn't exist
      return this.getPlacesSimple();
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

      const { data, error } = await client
        .from('places')
        .select('*')
        .eq('status', 'published')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;
      return data || [];
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
      return data || [];
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

