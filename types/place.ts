export interface Place {
  id: string;
  slug: string;
  name: string;
  address?: string;
  city?: string;
  county?: string;
  state?: string;
  zip?: string;
  latitude: number;
  longitude: number;
  cuisines?: string[];
  tags?: string[];
  price_level?: number;
  rating?: number;
  website?: string;
  menu_url?: string;
  phone?: string;
  ig_url?: string;
  hours?: Record<string, any>;
  hero_image_url?: string;
  is_featured?: boolean;
  is_verified?: boolean;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PlacesQueryParams {
  bbox?: string; // minLng,minLat,maxLng,maxLat
  search?: string;
  counties?: string[];
  cuisines?: string[];
  tags?: string[];
  priceMin?: number;
  priceMax?: number;
  minRating?: number;
  featured?: boolean;
  verified?: boolean;
}

