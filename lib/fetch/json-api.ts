/**
 * JSON API Fetcher
 * Fetches deals from dispensaries with JSON/GraphQL APIs
 */

export interface JsonApiConfig {
  apiKey?: string;
  endpoint?: string;
  responsePath?: string; // e.g., "data.products"
  headers?: Record<string, string>;
}

export interface RawProduct {
  productName: string;
  productType: 'flower' | 'cart' | 'edible' | 'concentrate' | 'topical' | 'other';
  thcPercent: number | null;
  weightGrams: number | null;
  priceUSD: number;
  rawData?: any;
}

/**
 * Fetch products from JSON API
 */
export async function fetchJsonApi(
  menuUrl: string,
  config: JsonApiConfig
): Promise<RawProduct[]> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers,
    };

    // Add API key if provided
    if (config.apiKey) {
      const apiKey = process.env[config.apiKey.replace('env:', '')] || config.apiKey;
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(menuUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Extract products using response path
    let products = data;
    if (config.responsePath) {
      const pathParts = config.responsePath.split('.');
      for (const part of pathParts) {
        products = products?.[part];
      }
    }

    if (!Array.isArray(products)) {
      throw new Error('API response is not an array of products');
    }

    // Normalize products
    return products.map((product: any) => normalizeProduct(product));
  } catch (error) {
    console.error('Error fetching JSON API:', error);
    throw error;
  }
}

/**
 * Normalize product data from API response
 */
function normalizeProduct(product: any): RawProduct {
  // Common field mappings
  const name = product.name || product.productName || product.title || product.product_name || '';
  const type = normalizeProductType(product.type || product.productType || product.category || '');
  const thc = extractNumber(product.thc || product.thcPercent || product.thc_percent || product.thcPercent);
  const weight = extractNumber(product.weight || product.weightGrams || product.weight_grams || product.size);
  const price = extractPrice(product.price || product.priceUSD || product.price_usd || product.cost);

  return {
    productName: name,
    productType: type,
    thcPercent: thc,
    weightGrams: weight,
    priceUSD: price,
    rawData: product,
  };
}

/**
 * Normalize product type
 */
function normalizeProductType(type: string): RawProduct['productType'] {
  const normalized = type.toLowerCase();
  
  if (normalized.includes('flower') || normalized.includes('bud')) return 'flower';
  if (normalized.includes('cart') || normalized.includes('vape') || normalized.includes('cartridge')) return 'cart';
  if (normalized.includes('edible') || normalized.includes('gummy') || normalized.includes('chocolate')) return 'edible';
  if (normalized.includes('concentrate') || normalized.includes('wax') || normalized.includes('shatter')) return 'concentrate';
  if (normalized.includes('topical') || normalized.includes('cream') || normalized.includes('lotion')) return 'topical';
  
  return 'other';
}

/**
 * Extract number from string (removes $, %, g, etc.)
 */
function extractNumber(value: any): number | null {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return null;

  // Remove common suffixes and extract number
  const cleaned = value.replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  
  return isNaN(num) ? null : num;
}

/**
 * Extract price from string or number
 */
function extractPrice(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;

  // Remove $ and extract number
  const cleaned = value.replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  
  return isNaN(num) ? 0 : num;
}

