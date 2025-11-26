/**
 * Shared TypeScript types for Supabase Edge Functions
 */

// Database types
export interface Dispensary {
  id: string;
  name: string;
  zip: string;
  address?: string;
  city?: string;
  state: string;
  menu_url: string;
  platform_type: 'json_api' | 'html_scrape' | 'weedmaps_pdf' | 'html_ai';
  extraction_config?: Record<string, any>;
  is_active: boolean;
  last_fetched_at?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  dispensary_id: string;
  product_name: string;
  product_type: ProductType;
  brand?: string | null;
  thc_percent?: number | null;
  weight_grams?: number | null;
  price_usd: number;
  zip: string;
  mg_thc?: number | null; // Computed
  value_score?: number | null; // Computed
  deal_label?: DealLabel;
  raw_data?: Record<string, any>;
  fetched_at: string;
  created_at: string;
}

export type ProductType = 'flower' | 'cart' | 'edible' | 'concentrate' | 'topical' | 'preroll' | 'other';

export type DealLabel = 'STEAL' | 'SOLID' | 'MID';

export interface FetchLog {
  id: string;
  dispensary_id?: string;
  status: 'success' | 'error' | 'partial';
  deals_found: number;
  error_message?: string;
  execution_time_ms?: number;
  timestamp: string;
}

// Raw product from fetchers (before normalization)
export interface RawProduct {
  productName: string;
  productType: ProductType;
  brand?: string | null;
  thcPercent?: number | null;
  weightGrams?: number | null;
  priceUSD: number;
  rawData?: Record<string, any>;
}

// Normalized deal for database insertion
export interface NormalizedDeal {
  dispensary_id: string;
  product_name: string;
  product_type: ProductType;
  brand?: string | null;
  thc_percent?: number | null;
  weight_grams?: number | null;
  price_usd: number;
  zip: string;
  deal_label?: DealLabel;
  raw_data?: Record<string, any>;
}

