/**
 * Google Gemini API Integration for Supabase Edge Functions
 * 
 * Uses Gemini 1.5 Flash for cost-effective product extraction from HTML text
 * 
 * Cost: ~$0.075 per 1M input tokens (15-60x cheaper than OpenAI)
 */

export interface RawDealRow {
  productName: string;
  price: string | number;
  thc?: string | number;
  weight?: string | number;
  type?: string;
  brand?: string;
}

export interface NormalizedDeal {
  productName: string;
  normalizedProductName: string;
  productType: 'flower' | 'cart' | 'edible' | 'concentrate' | 'topical' | 'preroll' | 'other';
  brand: string | null;
  thcPercent: number | null;
  weightGrams: number | null;
  priceUSD: number;
  validationConfidence: number; // 0-1
  validationNotes: string | null;
}

/**
 * Extract and normalize deals from HTML text using Gemini 1.5 Flash
 */
export async function extractDealsWithGemini(
  htmlText: string,
  dispensaryName: string
): Promise<NormalizedDeal[]> {
  const apiKey = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('GOOGLE_GEMINI_API_KEY');
  const model = Deno.env.get('GEMINI_MODEL_NAME') || 'gemini-1.5-flash';

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  try {
    // Trim HTML text to first 50k characters to reduce token cost
    const compactText = htmlText.slice(0, 50000);

    const prompt = buildExtractionPrompt(compactText, dispensaryName);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1, // Low temperature for consistent extraction
            topK: 1,
            topP: 1,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json', // Request JSON response
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      console.warn('No content in Gemini response');
      return [];
    }

    // Parse JSON response
    const parsed = JSON.parse(content);
    const deals = parsed.deals || [];

    // Validate and normalize each deal
    return deals
      .map((deal: any) => normalizeGeminiDeal(deal))
      .filter((deal: NormalizedDeal | null) => deal !== null) as NormalizedDeal[];
  } catch (error) {
    console.error('Gemini extraction error:', error);
    throw error;
  }
}

/**
 * Build extraction prompt for Gemini
 */
function buildExtractionPrompt(htmlText: string, dispensaryName: string): string {
  return `You are a data extraction specialist for cannabis dispensary menus. Extract ALL product deals from the following HTML text.

DISPENSARY: ${dispensaryName}

HTML TEXT:
${htmlText}

EXTRACTION RULES:
1. Find ALL cannabis products with prices
2. Extract: product name, price, THC%, weight/quantity, product type, brand (if mentioned)
3. Normalize product names (fix typos, standardize formatting)
4. Clean numeric values: remove $, %, "g", etc. - keep only numbers
5. Classify product type: flower, cart (vape/cartridge), edible, concentrate, topical, preroll, or other
6. Extract brand if clearly mentioned (e.g., "Cookies", "Cresco", "Raw Garden")
7. Skip non-product items (store info, hours, etc.)
8. If THC% or weight is missing, use null
9. Confidence score (0-1): how confident you are about this extraction
10. Validation notes: mention any issues (missing data, unclear info, etc.)

PRODUCT TYPE CLASSIFICATION:
- flower: buds, flower, nugs
- cart: cartridges, vapes, pens
- preroll: pre-rolls, joints, blunts
- edible: gummies, chocolates, beverages, food items
- concentrate: wax, shatter, diamonds, live resin, rosin, hash
- topical: lotions, balms, creams
- other: anything else

WEIGHT CONVERSIONS (convert to grams):
- 1/8 oz = 3.5g
- 1/4 oz = 7g
- 1/2 oz = 14g
- 1 oz = 28g
- 1 lb = 453.6g

RETURN FORMAT (valid JSON only, no markdown):
{
  "deals": [
    {
      "productName": "original product name from menu",
      "normalizedProductName": "cleaned up product name",
      "productType": "flower|cart|edible|concentrate|topical|preroll|other",
      "brand": "brand name or null",
      "thcPercent": 25.5,
      "weightGrams": 3.5,
      "priceUSD": 35.00,
      "validationConfidence": 0.95,
      "validationNotes": "all data clear" or "missing THC%" or null
    }
  ]
}

Return ONLY valid JSON. No explanations, no markdown formatting.`;
}

/**
 * Normalize a deal from Gemini response
 */
function normalizeGeminiDeal(deal: any): NormalizedDeal | null {
  try {
    // Validate required fields
    if (!deal.productName || !deal.priceUSD) {
      return null;
    }

    // Normalize product type
    const validTypes = ['flower', 'cart', 'edible', 'concentrate', 'topical', 'preroll', 'other'];
    const productType = validTypes.includes(deal.productType?.toLowerCase())
      ? deal.productType.toLowerCase()
      : 'other';

    // Extract and validate numbers
    const thcPercent = extractNumber(deal.thcPercent);
    const weightGrams = extractNumber(deal.weightGrams);
    const priceUSD = extractNumber(deal.priceUSD);

    if (!priceUSD || priceUSD <= 0) {
      return null; // Skip deals without valid price
    }

    // Validate THC percent is reasonable (0-100)
    const validThc = thcPercent !== null && thcPercent >= 0 && thcPercent <= 100 ? thcPercent : null;

    // Validate weight is reasonable (0-1000g)
    const validWeight = weightGrams !== null && weightGrams > 0 && weightGrams <= 1000 ? weightGrams : null;

    return {
      productName: String(deal.productName).trim(),
      normalizedProductName: String(deal.normalizedProductName || deal.productName).trim(),
      productType: productType as any,
      brand: deal.brand ? String(deal.brand).trim() : null,
      thcPercent: validThc,
      weightGrams: validWeight,
      priceUSD,
      validationConfidence: extractNumber(deal.validationConfidence) || 0.5,
      validationNotes: deal.validationNotes || null,
    };
  } catch (error) {
    console.error('Error normalizing deal:', error, deal);
    return null;
  }
}

/**
 * Extract numeric value from any input
 */
function extractNumber(value: any): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }
  return null;
}

/**
 * Extract compact text from HTML (remove tags, scripts, styles)
 */
export function extractCompactTextFromHTML(html: string): string {
  // Remove script and style tags with their content
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ');

  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode common HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Check if Gemini is properly configured
 */
export function isGeminiConfigured(): boolean {
  const apiKey = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('GOOGLE_GEMINI_API_KEY');
  return !!apiKey;
}

