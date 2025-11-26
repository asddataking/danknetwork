// Utility functions for fetch-deals Edge Function
// These can be imported by the main index.ts

/**
 * Fetch deals from JSON API
 */
export async function fetchJsonApiDeals(
  menuUrl: string,
  config: any
): Promise<any[]> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(config.headers || {}),
    };

    if (config.apiKey) {
      const apiKey = Deno.env.get(config.apiKey.replace('env:', '')) || config.apiKey;
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(menuUrl, { headers });
    if (!response.ok) {
      throw new Error(`API failed: ${response.status}`);
    }

    const data = await response.json();
    let products = data;

    if (config.responsePath) {
      const pathParts = config.responsePath.split('.');
      for (const part of pathParts) {
        products = products?.[part];
      }
    }

    if (!Array.isArray(products)) {
      return [];
    }

    return products.map((p: any) => normalizeProduct(p));
  } catch (error) {
    console.error('JSON API fetch error:', error);
    return [];
  }
}

/**
 * Fetch deals from HTML (basic - would need Cheerio in Deno)
 */
export async function fetchHtmlScrapeDeals(
  menuUrl: string,
  config: any
): Promise<any[]> {
  // For Edge Functions, HTML scraping is more complex
  // Would need to use a Deno-compatible HTML parser
  // For now, return empty - can be enhanced later
  console.warn('HTML scraping not yet implemented for Edge Functions');
  return [];
}

/**
 * Fetch deals from PDF
 */
export async function fetchWeedmapsPDFDeals(
  menuUrl: string,
  config: any
): Promise<any[]> {
  // PDF processing would happen here
  // For now, return empty - needs PDF processing implementation
  console.warn('PDF processing not yet fully implemented');
  return [];
}

/**
 * Fetch deals using AI extraction (Gemini 1.5 Flash)
 */
export async function fetchHtmlAIDeals(
  menuUrl: string,
  config: any
): Promise<any[]> {
  try {
    // Import Gemini utilities
    const { extractDealsWithGemini, extractCompactTextFromHTML, isGeminiConfigured } = await import('../_shared/gemini.ts');
    
    if (!isGeminiConfigured()) {
      console.warn('Gemini API not configured, skipping AI extraction');
      return [];
    }

    // Fetch HTML
    const response = await fetch(menuUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${menuUrl}: ${response.status}`);
    }
    const html = await response.text();

    // Extract compact text from HTML
    const text = extractCompactTextFromHTML(html);
    
    if (!text || text.length < 100) {
      console.warn('Extracted text too short, likely no content');
      return [];
    }

    // Get dispensary name from config or URL
    const dispensaryName = config.name || new URL(menuUrl).hostname;

    // Use Gemini to extract and normalize deals
    const normalizedDeals = await extractDealsWithGemini(text, dispensaryName);

    // Convert to expected format
    return normalizedDeals.map((deal: any) => ({
      productName: deal.normalizedProductName || deal.productName,
      productType: deal.productType,
      brand: deal.brand,
      thcPercent: deal.thcPercent,
      weightGrams: deal.weightGrams,
      priceUSD: deal.priceUSD,
      rawData: {
        source: 'gemini_flash',
        originalName: deal.productName,
        confidence: deal.validationConfidence,
        notes: deal.validationNotes,
      },
    }));
  } catch (error) {
    console.error('Gemini AI extraction error:', error);
    return [];
  }
}

/**
 * Normalize product data
 */
function normalizeProduct(product: any): any {
  return {
    productName: product.name || product.productName || product.title || '',
    productType: normalizeType(product.type || product.productType || ''),
    brand: extractBrand(product),
    thcPercent: extractNumber(product.thc || product.thcPercent),
    weightGrams: extractNumber(product.weight || product.weightGrams),
    priceUSD: extractPrice(product.price || product.priceUSD),
    rawData: product,
  };
}

/**
 * Extract and normalize brand from product data
 */
function extractBrand(product: any): string | null {
  // Try multiple fields
  if (product.brand) return normalizeBrandName(product.brand);
  if (product.brandName) return normalizeBrandName(product.brandName);
  if (product.manufacturer) return normalizeBrandName(product.manufacturer);
  if (product.brand_name) return normalizeBrandName(product.brand_name);
  
  // Try extracting from product name
  // Common patterns: "Cookies Blue Dream", "Cresco - Lemon Haze", "Raw Garden Live Resin"
  const name = product.name || product.productName || product.title || '';
  
  // Pattern 1: First capitalized word (e.g., "Cookies Blue Dream")
  const firstWordMatch = name.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s/);
  if (firstWordMatch) {
    const potentialBrand = firstWordMatch[1];
    // Check if it's a known brand (common brand names)
    const knownBrands = ['cookies', 'cresco', 'raw garden', 'jungle boys', 'connected', 'alien labs', 'stiiizy', 'pax', 'select', 'raw garden'];
    if (knownBrands.some(b => potentialBrand.toLowerCase().includes(b))) {
      return normalizeBrandName(potentialBrand);
    }
  }
  
  // Pattern 2: Before dash or hyphen (e.g., "Cresco - Lemon Haze")
  const dashMatch = name.match(/^([^-]+)\s*[-–]\s*/);
  if (dashMatch) {
    return normalizeBrandName(dashMatch[1].trim());
  }
  
  return null;
}

/**
 * Normalize brand name for consistent storage
 */
function normalizeBrandName(brand: string): string {
  return brand
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^(the|a|an)\s+/i, ''); // Remove articles
}

function normalizeType(type: string): string {
  const t = type.toLowerCase();
  if (t.includes('flower') || t.includes('bud')) return 'flower';
  if (t.includes('cart') || t.includes('vape')) return 'cart';
  if (t.includes('preroll') || t.includes('pre-roll') || t.includes('pre roll')) return 'preroll';
  if (t.includes('edible')) return 'edible';
  if (t.includes('concentrate')) return 'concentrate';
  if (t.includes('topical')) return 'topical';
  return 'other';
}

function extractNumber(value: any): number | null {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return null;
  const cleaned = value.replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function extractPrice(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  const cleaned = value.replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

// NOTE: extractTextFromHTML and extractProductsFromText moved to _shared/gemini.ts
// The fetchHtmlAIDeals function now uses Gemini 1.5 Flash for cost-effective extraction

