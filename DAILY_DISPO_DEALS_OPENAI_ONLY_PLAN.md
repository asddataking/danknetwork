# Daily Dispo Deals - OpenAI-Only Implementation Plan

## Overview

Remove all Anthropic/Claude dependencies and use **OpenAI only** for all AI operations:
- **OpenAI Chat Completions API** (GPT-4o) - For text extraction from OCR/HTML
- **OpenAI Vision API** (GPT-4o Vision) - For image analysis from PDFs

---

## Current State

### What We Have:
- ✅ `lib/ai/extract-from-ocr.ts` - Uses OpenAI Text API (GPT-4o) ✅
- ❌ `lib/ai/vision-claude.ts` - Uses Claude Vision (needs replacement)
- ❌ `lib/fetch/pdf-processor.ts` - References Claude Vision (needs update)
- ❌ `supabase/functions/fetch-deals/utils.ts` - May reference Claude (needs check)
- ❌ `package.json` - Has `@anthropic-ai/sdk` dependency (needs removal)

### What We Need:
- ✅ Create `lib/ai/vision-openai.ts` - OpenAI Vision API for images
- ✅ Update `lib/fetch/pdf-processor.ts` - Use OpenAI Vision instead of Claude
- ✅ Update Edge Functions - Remove Claude references
- ✅ Update `package.json` - Remove Anthropic dependency
- ✅ Update documentation - Remove all Claude references

---

## Implementation Plan

### Phase 1: Create OpenAI Vision Utility

**File: `lib/ai/vision-openai.ts`** (NEW)

```typescript
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
```

**Key Features:**
- Uses GPT-4o (supports vision natively)
- Base64 image encoding
- JSON response format for structured extraction
- Error handling with empty array fallback

---

### Phase 2: Update PDF Processor

**File: `lib/fetch/pdf-processor.ts`** (UPDATE)

**Changes:**
1. Remove Claude import
2. Import OpenAI Vision instead
3. Update function calls
4. Update source tracking

```typescript
// OLD:
import { analyzeDealImageClaude } from '../ai/vision-claude';

// NEW:
import { analyzeDealImageOpenAI } from '../ai/vision-openai';
```

```typescript
// OLD:
const visionProducts = await analyzeDealImageClaude(imageBuffer);
allProducts.push(...visionProducts.map(p => ({
  ...p,
  rawData: { source: 'claude_vision' },
})));

// NEW:
const visionProducts = await analyzeDealImageOpenAI(imageBuffer);
allProducts.push(...visionProducts.map(p => ({
  ...p,
  rawData: { source: 'openai_vision' },
})));
```

**Hybrid Strategy (Recommended):**
1. Try OCR + GPT-4o Text API first (cheaper)
2. Fallback to OpenAI Vision if OCR fails or unclear

```typescript
// Step 5: Process each image with hybrid approach
for (const imageBuffer of imageBuffers) {
  try {
    // Option A: Try OCR + GPT-4o Text API first (cheaper)
    // const ocrText = await extractTextFromImage(imageBuffer);
    // if (ocrText && ocrText.length > 100) {
    //   const textProducts = await extractProductsFromOCRText(ocrText);
    //   allProducts.push(...textProducts.map(p => ({
    //     ...p,
    //     rawData: { source: 'ocr_text' },
    //   })));
    // } else {
    //   // Option B: Fallback to OpenAI Vision
    //   const visionProducts = await analyzeDealImageOpenAI(imageBuffer);
    //   allProducts.push(...visionProducts.map(p => ({
    //     ...p,
    //     rawData: { source: 'openai_vision' },
    //   })));
    // }
    
    // For now, use OpenAI Vision directly (until OCR is implemented)
    const visionProducts = await analyzeDealImageOpenAI(imageBuffer);
    allProducts.push(...visionProducts.map(p => ({
      ...p,
      rawData: { source: 'openai_vision' },
    })));
  } catch (error) {
    console.error('Error processing PDF image:', error);
  }
}
```

---

### Phase 3: Update Edge Functions

**File: `supabase/functions/fetch-deals/utils.ts`** (UPDATE)

**Check for Claude references:**
- Currently uses OpenAI Text API for HTML AI extraction ✅
- No Claude references in current implementation ✅

**No changes needed** - Edge Functions already use OpenAI only.

---

### Phase 4: Update Package Dependencies

**File: `package.json`** (UPDATE)

**Remove:**
```json
"@anthropic-ai/sdk": "^0.27.0",
```

**Keep:**
```json
"openai": "^4.28.0",
```

**After update:**
```bash
npm install
```

---

### Phase 5: Update Environment Variables

**Remove from all configs:**
- `ANTHROPIC_API_KEY` (no longer needed)

**Keep:**
- `OPENAI_API_KEY` (required)

**Supabase Edge Function Secrets:**
```bash
# Remove:
supabase secrets unset ANTHROPIC_API_KEY

# Keep:
supabase secrets set OPENAI_API_KEY=your_key
```

**Vercel Environment Variables:**
- Remove `ANTHROPIC_API_KEY`
- Keep `OPENAI_API_KEY`

---

### Phase 6: Update Documentation

**Files to update:**
- `DAILY_DISPO_DEALS_SETUP.md` - Remove Anthropic references
- `DAILY_DISPO_DEALS_COMPLETE.md` - Update AI section
- `DAILY_DISPO_DEALS_COST_ANALYSIS.md` - Update cost estimates
- Any other docs mentioning Claude

---

## Cost Analysis: OpenAI-Only Approach

### Option 1: OpenAI Vision Only (Direct)
**Use Case:** Direct image analysis from PDFs

**Cost:**
- GPT-4o Vision: ~$0.01-0.03 per image (depends on image size)
- 50 images/day × 30 days = 1,500 images/month
- 1,500 × $0.02 = **$30/month**

**Pros:**
- Simple, direct approach
- High accuracy
- No OCR setup needed

**Cons:**
- More expensive than hybrid approach

---

### Option 2: Hybrid (OCR + Text API + Vision Fallback) ⭐ RECOMMENDED

**Use Case:** Cost-optimized approach

**Strategy:**
1. **OCR first** (Tesseract - FREE, or Google Vision - $0.0015/image)
2. **GPT-4o Text API** on OCR text (much cheaper than Vision)
3. **OpenAI Vision fallback** if OCR fails or unclear

**Cost Breakdown:**

**OCR:**
- Tesseract: **$0** (free, self-hosted)
- Google Vision OCR: $1.50/1K images = $0.0015/image
- 1,500 images × $0.0015 = **$2.25/month** (if using Google)

**GPT-4o Text API:**
- Input: ~$2.50/1M tokens
- Output: ~$10/1M tokens
- Average OCR text: ~500-1,000 tokens per image
- 1,500 images × 1,000 tokens = 1.5M tokens
- Cost: 1.5M × $2.50/1M = **$3.75/month**

**OpenAI Vision (Fallback - 20% of images):**
- 300 images × $0.02 = **$6/month**

**Total: $0-12/month** (vs $30/month with Vision only)

**Savings: $18-30/month (60-100% cheaper!)**

---

### Option 3: OpenAI Vision Only (Simpler, More Expensive)

**Cost:** ~$30/month (as shown above)

**When to use:**
- If OCR setup is too complex
- If you want simplest implementation
- If cost is not a primary concern

---

## Recommended Approach

**Use Hybrid Approach (Option 2):**

1. **Primary:** OCR + GPT-4o Text API
   - Cheapest option
   - Works well for text-heavy images
   - Cost: ~$0-6/month

2. **Fallback:** OpenAI Vision API
   - Use when OCR fails or unclear
   - Handles complex layouts
   - Cost: ~$6/month (20% fallback rate)

**Total: ~$6-12/month** (vs $30/month with Vision only)

---

## Implementation Steps

### Step 1: Create OpenAI Vision Utility
- [ ] Create `lib/ai/vision-openai.ts`
- [ ] Implement `analyzeDealImageOpenAI()` function
- [ ] Add error handling and JSON parsing

### Step 2: Update PDF Processor
- [ ] Remove Claude import
- [ ] Add OpenAI Vision import
- [ ] Update function calls
- [ ] Update source tracking

### Step 3: Update Dependencies
- [ ] Remove `@anthropic-ai/sdk` from `package.json`
- [ ] Run `npm install`
- [ ] Verify no Anthropic references remain

### Step 4: Update Edge Functions (if needed)
- [ ] Check `supabase/functions/fetch-deals/utils.ts`
- [ ] Verify no Claude references
- [ ] Update if needed

### Step 5: Update Environment Variables
- [ ] Remove `ANTHROPIC_API_KEY` from Vercel
- [ ] Remove `ANTHROPIC_API_KEY` from Supabase secrets
- [ ] Verify `OPENAI_API_KEY` is set

### Step 6: Update Documentation
- [ ] Update `DAILY_DISPO_DEALS_SETUP.md`
- [ ] Update `DAILY_DISPO_DEALS_COMPLETE.md`
- [ ] Update cost analysis docs
- [ ] Remove all Claude references

### Step 7: Test
- [ ] Test OpenAI Vision with sample image
- [ ] Test PDF processor with OpenAI Vision
- [ ] Verify Edge Functions work
- [ ] Check cost estimates

---

## Files to Create/Update

### Create:
- ✅ `lib/ai/vision-openai.ts` (NEW)

### Update:
- ✅ `lib/fetch/pdf-processor.ts` (UPDATE)
- ✅ `package.json` (UPDATE - remove Anthropic)
- ✅ `DAILY_DISPO_DEALS_SETUP.md` (UPDATE)
- ✅ `DAILY_DISPO_DEALS_COMPLETE.md` (UPDATE)

### Delete:
- ❌ `lib/ai/vision-claude.ts` (DELETE - no longer needed)

---

## API Usage Summary

### OpenAI Chat Completions API (Text)
- **Model:** `gpt-4o`
- **Use:** Extract products from OCR text, HTML text
- **Cost:** ~$2.50/1M input tokens, $10/1M output tokens
- **File:** `lib/ai/extract-from-ocr.ts` ✅

### OpenAI Vision API (Images)
- **Model:** `gpt-4o` (with vision support)
- **Use:** Analyze deal images from PDFs
- **Cost:** ~$0.01-0.03 per image
- **File:** `lib/ai/vision-openai.ts` (NEW)

---

## Next Steps

1. **Review this plan** - Confirm approach
2. **Create OpenAI Vision utility** - Implement `vision-openai.ts`
3. **Update PDF processor** - Replace Claude with OpenAI
4. **Remove Anthropic dependency** - Clean up `package.json`
5. **Update environment variables** - Remove Anthropic keys
6. **Test implementation** - Verify everything works
7. **Update documentation** - Remove Claude references

---

## Questions to Consider

1. **OCR Implementation:** Do you want to implement OCR first (Tesseract/Google Vision) for cost savings, or use OpenAI Vision directly?

2. **Fallback Strategy:** Should we always try OCR + Text API first, or use Vision directly for simplicity?

3. **Cost Priority:** Is cost optimization important, or is simplicity more important?

**Recommendation:** Start with OpenAI Vision directly for simplicity, then add OCR later for cost optimization if needed.

---

**Ready to implement?** Let me know and I'll start building! 🚀

