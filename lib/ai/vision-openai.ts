/**
 * OpenAI Vision API - For analyzing deal images from PDFs
 * Replaces Claude Vision
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
 * Analyze deal image using OpenAI Vision API
 * Used when OCR + Text API fails or for direct image analysis
 */
export async function analyzeDealImageOpenAI(
  imageBuffer: Buffer,
  mimeType: string = 'image/png'
): Promise<ExtractedProduct[]> {
  try {
    const base64Image = imageBuffer.toString('base64');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // GPT-4o supports vision
      messages: [
        {
          role: 'system',
          content: 'You are a data extraction assistant. Extract cannabis product information from images and return only valid JSON.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
            {
              type: 'text',
              text: `Analyze this dispensary deal image and extract ALL products. Return a JSON object with a "products" array.

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
- Return only valid JSON, no markdown formatting`,
            },
          ],
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
    console.error('Error analyzing image with OpenAI Vision:', error);
    return [];
  }
}

