/**
 * Receipt OCR and Validation using Google Gemini Flash
 * 
 * Similar to deals extraction, uses Gemini 1.5 Flash for cost-effective
 * receipt parsing and line item extraction
 */

export interface ReceiptLineItem {
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category?: string; // e.g., 'flower', 'edible', 'cart', etc.
}

export interface ExtractedReceipt {
  merchantName: string | null;
  merchantAddress: string | null;
  purchaseDate: string | null; // ISO date string
  totalAmount: number | null;
  taxAmount: number | null;
  subtotal: number | null;
  lineItems: ReceiptLineItem[];
  validationConfidence: number; // 0-1
  validationNotes: string | null;
  isValid: boolean; // Whether this looks like a valid receipt
}

/**
 * Extract receipt data from image using Gemini Vision
 */
export async function extractReceiptWithGemini(
  imageBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<ExtractedReceipt> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL_NAME || 'gemini-1.5-flash';

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  try {
    const prompt = buildReceiptExtractionPrompt();

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
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: imageBase64,
                  },
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
      return createEmptyReceipt('No OCR content returned');
    }

    // Parse JSON response
    const parsed = JSON.parse(content);
    
    // Validate and normalize the receipt
    return normalizeReceiptData(parsed);
  } catch (error) {
    console.error('Gemini receipt extraction error:', error);
    return createEmptyReceipt(`Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Build extraction prompt for receipt OCR
 */
function buildReceiptExtractionPrompt(): string {
  return `You are an OCR specialist for retail receipts. Extract ALL information from this receipt image.

EXTRACTION RULES:
1. Extract merchant name, address, date, and all purchase amounts
2. Extract EVERY line item with: name, quantity, unit price, total price
3. If this is a cannabis dispensary receipt, categorize items by type:
   - flower: buds, flower
   - cart: cartridges, vapes, pens
   - preroll: pre-rolls, joints
   - edible: gummies, chocolates, beverages
   - concentrate: wax, shatter, diamonds, live resin
   - topical: lotions, balms
   - other: accessories, non-cannabis items
4. Clean all numeric values: remove $, commas, etc. - keep only numbers
5. Date format: convert to YYYY-MM-DD
6. If text is unclear or missing, use null
7. Provide confidence score (0-1): how confident you are this is a valid receipt
8. Validation notes: mention any issues (blurry text, missing info, not a receipt, etc.)

VALIDATION CHECKS:
- Does this look like a real receipt? (has merchant, items, total)
- Is the math correct? (do line items add up to subtotal/total?)
- Is the date reasonable? (not future, not too old)
- Are prices reasonable? (not negative, not impossibly high)

RETURN FORMAT (valid JSON only, no markdown):
{
  "merchantName": "Business Name" or null,
  "merchantAddress": "123 Main St, City, State" or null,
  "purchaseDate": "2024-01-15" or null,
  "totalAmount": 45.99,
  "taxAmount": 3.50,
  "subtotal": 42.49,
  "lineItems": [
    {
      "itemName": "Product Name",
      "quantity": 1,
      "unitPrice": 15.00,
      "totalPrice": 15.00,
      "category": "flower" or null
    }
  ],
  "validationConfidence": 0.95,
  "validationNotes": "all data clear" or "blurry text" or null,
  "isValid": true
}

IMPORTANT: Set isValid to false if:
- This is not a receipt (e.g., random image, document, menu)
- Critical data is missing (no merchant, no items, no total)
- Image is too blurry or damaged to read
- Math doesn't add up

Return ONLY valid JSON. No explanations, no markdown formatting.`;
}

/**
 * Normalize and validate receipt data
 */
function normalizeReceiptData(data: any): ExtractedReceipt {
  try {
    // Validate line items
    const lineItems: ReceiptLineItem[] = (data.lineItems || [])
      .map((item: any) => {
        try {
          return {
            itemName: String(item.itemName || 'Unknown Item').trim(),
            quantity: extractNumber(item.quantity) || 1,
            unitPrice: extractNumber(item.unitPrice) || 0,
            totalPrice: extractNumber(item.totalPrice) || 0,
            category: item.category || null,
          };
        } catch {
          return null;
        }
      })
      .filter((item: any) => item !== null);

    // Extract amounts
    const totalAmount = extractNumber(data.totalAmount);
    const taxAmount = extractNumber(data.taxAmount);
    const subtotal = extractNumber(data.subtotal);

    // Additional validation
    const hasRequiredData = 
      data.merchantName && 
      lineItems.length > 0 && 
      totalAmount !== null && 
      totalAmount > 0;

    const isValid = data.isValid === true && hasRequiredData;

    return {
      merchantName: data.merchantName ? String(data.merchantName).trim() : null,
      merchantAddress: data.merchantAddress ? String(data.merchantAddress).trim() : null,
      purchaseDate: data.purchaseDate || null,
      totalAmount,
      taxAmount,
      subtotal,
      lineItems,
      validationConfidence: extractNumber(data.validationConfidence) || 0,
      validationNotes: data.validationNotes || null,
      isValid,
    };
  } catch (error) {
    console.error('Error normalizing receipt:', error);
    return createEmptyReceipt('Failed to normalize data');
  }
}

/**
 * Create empty/invalid receipt response
 */
function createEmptyReceipt(reason: string): ExtractedReceipt {
  return {
    merchantName: null,
    merchantAddress: null,
    purchaseDate: null,
    totalAmount: null,
    taxAmount: null,
    subtotal: null,
    lineItems: [],
    validationConfidence: 0,
    validationNotes: reason,
    isValid: false,
  };
}

/**
 * Extract numeric value from any input
 */
function extractNumber(value: any): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }
  return null;
}

/**
 * Check if Gemini is properly configured
 */
export function isGeminiConfigured(): boolean {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
  return !!apiKey;
}

/**
 * Calculate points from receipt amount
 * Default: $1 = 2 points
 * Premium: $1 = 3 points (1.5x multiplier)
 */
export function calculatePointsFromReceipt(
  totalAmount: number,
  isPremium: boolean,
  partnerMultiplier: number = 1.0
): number {
  const basePoints = Math.floor(totalAmount * 2); // $1 = 2 points
  const premiumMultiplier = isPremium ? 1.5 : 1.0;
  const finalPoints = Math.floor(basePoints * premiumMultiplier * partnerMultiplier);
  return finalPoints;
}

