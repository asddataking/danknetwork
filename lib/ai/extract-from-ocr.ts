/**
 * Extract products from OCR text using GPT-4o Text API
 * Much cheaper than Vision API!
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ExtractedProduct {
  productName: string;
  productType: 'flower' | 'cart' | 'edible' | 'concentrate' | 'topical' | 'other';
  thcPercent: number | null;
  weightGrams: number | null;
  priceUSD: number | null;
}

/**
 * Extract products from OCR text using GPT-4o Text API
 */
export async function extractProductsFromOCRText(
  ocrText: string
): Promise<ExtractedProduct[]> {
  if (!ocrText || ocrText.length < 50) {
    return []; // Not enough text
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Text model, not vision
      messages: [
        {
          role: 'system',
          content: 'You are a data extraction assistant. Extract cannabis product information from text and return only valid JSON.',
        },
        {
          role: 'user',
          content: `Extract ALL cannabis products from this OCR text. Return a JSON object with a "products" array.

Each product should have:
- productName (string, required)
- productType (flower, cart, edible, concentrate, topical, or other)
- thcPercent (number 0-100, null if not found)
- weightGrams (number, null if not found)
- priceUSD (number, null if not found - extract numeric value only, remove $)

Rules:
- Extract ONLY numeric values (remove $, %, "g", etc.)
- If a field is missing, use null
- Return empty array if no products found
- Return only valid JSON, no markdown formatting

OCR Text:
${ocrText}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
      temperature: 0.3, // Lower temperature for more consistent extraction
    });

    const content = response.choices[0]?.message?.content || '{"products": []}';
    const parsed = JSON.parse(content);

    return parsed.products || [];
  } catch (error) {
    console.error('Error extracting from OCR text:', error);
    return [];
  }
}

/**
 * Extract products from HTML/text using GPT-4o Text API
 */
export async function extractProductsFromText(
  text: string
): Promise<ExtractedProduct[]> {
  return extractProductsFromOCRText(text); // Same function
}

