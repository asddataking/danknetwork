import { getDealsClient } from '@/lib/deals/supabase';
import { getZipsInGroup } from '@/lib/deals/zip-groups';

export interface Deal {
  id: string;
  dispensary_id: string;
  product_name: string;
  product_type: string;
  thc_percent: number | null;
  weight_grams: number | null;
  price_usd: number;
  zip: string;
  mg_thc: number | null;
  value_score: number;
  deal_label: string | null;
  fetched_at: string;
  dispensaries?: {
    name: string;
    zip: string;
  };
}

/**
 * Get top deals by ZIP group
 */
export async function getTopDealsByZipGroup(
  groupKey: string,
  limit: number = 15
): Promise<Deal[]> {
  const zips = getZipsInGroup(groupKey);

  if (zips.length === 0) {
    return [];
  }

  const supabase = getDealsClient();

  // Query deals for all ZIPs in this group
  // Only get deals from today (fetched_at is today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('deals')
    .select('*, dispensaries(name, zip)')
    .in('zip', zips)
    .gte('fetched_at', today.toISOString())
    .order('value_score', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching deals by ZIP group:', error);
    return [];
  }

  return (data || []) as Deal[];
}

/**
 * Get top deals by ZIP code (for proximity filtering)
 */
export async function getTopDealsByZip(
  zip: string,
  productType?: string,
  limit: number = 10
): Promise<Deal[]> {
  const supabase = getDealsClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let query = supabase
    .from('deals')
    .select('*, dispensaries(name, zip)')
    .eq('zip', zip)
    .gte('fetched_at', today.toISOString())
    .order('value_score', { ascending: false })
    .limit(limit);

  if (productType) {
    query = query.eq('product_type', productType);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching deals by ZIP:', error);
    return [];
  }

  return (data || []) as Deal[];
}

/**
 * Get deals above a minimum value score
 */
export async function getDealsAboveScore(
  minScore: number,
  zip?: string,
  limit: number = 20
): Promise<Deal[]> {
  const supabase = getDealsClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let query = supabase
    .from('deals')
    .select('*, dispensaries(name, zip)')
    .gte('value_score', minScore)
    .gte('fetched_at', today.toISOString())
    .order('value_score', { ascending: false })
    .limit(limit);

  if (zip) {
    query = query.eq('zip', zip);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching deals above score:', error);
    return [];
  }

  return (data || []) as Deal[];
}

/**
 * Get deals by label (STEAL, SOLID, MID)
 */
export async function getDealsByLabel(
  label: 'STEAL' | 'SOLID' | 'MID',
  zip?: string,
  limit: number = 20
): Promise<Deal[]> {
  const supabase = getDealsClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let query = supabase
    .from('deals')
    .select('*, dispensaries(name, zip)')
    .eq('deal_label', label)
    .gte('fetched_at', today.toISOString())
    .order('value_score', { ascending: false })
    .limit(limit);

  if (zip) {
    query = query.eq('zip', zip);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching deals by label:', error);
    return [];
  }

  return (data || []) as Deal[];
}

