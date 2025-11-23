/**
 * HTML Scraper
 * Scrapes deals from HTML pages using CSS selectors
 */

import * as cheerio from 'cheerio';
import { RawProduct } from './json-api';

export interface HtmlScrapeConfig {
  selectors: {
    productCard: string; // Container for each product
    name: string;
    thc?: string;
    weight?: string;
    price: string;
    type?: string;
  };
}

/**
 * Fetch products from HTML page
 */
export async function fetchHtmlScrape(
  menuUrl: string,
  config: HtmlScrapeConfig
): Promise<RawProduct[]> {
  try {
    const response = await fetch(menuUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP request failed: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const products: RawProduct[] = [];

    // Find all product cards
    $(config.selectors.productCard).each((_, element) => {
      const $card = $(element);

      // Extract product data
      const name = $card.find(config.selectors.name).text().trim();
      const thcText = config.selectors.thc ? $card.find(config.selectors.thc).text().trim() : '';
      const weightText = config.selectors.weight ? $card.find(config.selectors.weight).text().trim() : '';
      const priceText = $card.find(config.selectors.price).text().trim();
      const typeText = config.selectors.type ? $card.find(config.selectors.type).text().trim() : '';

      if (!name || !priceText) {
        return; // Skip invalid products
      }

      // Parse values
      const thc = extractNumber(thcText);
      const weight = extractNumber(weightText);
      const price = extractPrice(priceText);
      const type = normalizeProductType(typeText || '');

      products.push({
        productName: name,
        productType: type,
        thcPercent: thc,
        weightGrams: weight,
        priceUSD: price,
        rawData: {
          html: $card.html(),
          thcText,
          weightText,
          priceText,
        },
      });
    });

    return products;
  } catch (error) {
    console.error('Error scraping HTML:', error);
    throw error;
  }
}

/**
 * Extract number from string
 */
function extractNumber(value: string): number | null {
  if (!value) return null;
  
  // Remove common suffixes and extract number
  const cleaned = value.replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  
  return isNaN(num) ? null : num;
}

/**
 * Extract price from string
 */
function extractPrice(value: string): number {
  if (!value) return 0;
  
  // Remove $ and extract number
  const cleaned = value.replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  
  return isNaN(num) ? 0 : num;
}

/**
 * Normalize product type
 */
function normalizeProductType(type: string): RawProduct['productType'] {
  const normalized = type.toLowerCase();
  
  if (normalized.includes('flower') || normalized.includes('bud')) return 'flower';
  if (normalized.includes('cart') || normalized.includes('vape')) return 'cart';
  if (normalized.includes('edible') || normalized.includes('gummy')) return 'edible';
  if (normalized.includes('concentrate') || normalized.includes('wax')) return 'concentrate';
  if (normalized.includes('topical')) return 'topical';
  
  return 'other';
}

