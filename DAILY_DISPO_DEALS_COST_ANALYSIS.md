# Daily Dispo Deals - AI Cost Analysis & Optimization

## Current Plan vs Alternatives

### Current Plan: GPT-4o Vision

**What we're using:**
- GPT-4o Vision API for analyzing PDF images
- Cost: ~$0.01-0.03 per image

**Monthly Cost (50 images/day = 1,500/month):**
- 1,500 images × $0.02 = **$30/month**

---

## Alternative 1: OCR + GPT-4o Text API (Cheaper!)

### Strategy

Instead of using Vision API on images, use:
1. **OCR first** (Tesseract - FREE, or Google Vision - $0.0015/image)
2. **GPT-4o Text API** on OCR'd text (much cheaper than Vision)

### Cost Breakdown

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

**Total: $0-6/month** (vs $30/month with Vision)

**Savings: $24-30/month (80-100% cheaper!)**

### Implementation

**File: `lib/ai/extract-from-ocr.ts`**

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Extract products from OCR text (much cheaper than Vision API)
 */
export async function extractProductsFromOCRText(
  ocrText: string
): Promise<{
  products: Array<{
    productName: string;
    productType: string;
    thcPercent: number | null;
    weightGrams: number | null;
    priceUSD: number | null;
  }>;
}> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o', // Text model, not vision
    messages: [
      {
        role: 'user',
        content: `Extract cannabis product information from this OCR text.

Text:
${ocrText}

Extract ALL products and return JSON array with:
- productName (required)
- productType (flower, cart, edible, concentrate, topical, other)
- thcPercent (number 0-100, null if not found)
- weightGrams (number, null if not found)
- priceUSD (number, null if not found)

Return only valid JSON array, no markdown.`,
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content || '{"products": []}';
  return JSON.parse(content);
}
```

**Pros:**
- ✅ **Much cheaper** - 80-100% cost reduction
- ✅ **Faster** - Text API is faster than Vision
- ✅ **More reliable** - OCR text is cleaner than image analysis

**Cons:**
- ⚠️ **OCR quality matters** - Bad OCR = bad extraction
- ⚠️ **Misses visual context** - Can't see product images, layout

---

## Alternative 2: GPT-4o-mini Vision (Cheaper Vision Option)

### Strategy

Use GPT-4o-mini instead of GPT-4o for vision (if it supports vision)

**Note:** GPT-4o-mini doesn't have vision yet, but if it did:
- Cost: ~$0.001-0.005 per image (estimated)
- 1,500 images × $0.003 = **$4.50/month**

**Savings: $25.50/month (85% cheaper)**

---

## Alternative 3: Claude 3.5 Sonnet (Best Balance)

### Strategy

Use Claude 3.5 Sonnet for vision instead of GPT-4o

**Cost:**
- Claude 3.5 Sonnet Vision: ~$0.003-0.012 per image
- 1,500 images × $0.006 = **$9/month**

**Savings: $21/month (70% cheaper)**

**Quality:** Claude 3.5 Sonnet is very good at structured extraction, often better than GPT-4o for this use case.

---

## Alternative 4: Hybrid Approach (Recommended)

### Strategy

**Best of both worlds:**
1. **OCR first** (Tesseract - free)
2. **Try GPT-4o Text API** on OCR text (cheap)
3. **Fallback to Claude Vision** if OCR fails or unclear

### Cost Breakdown

**Scenario:** 80% success with OCR+Text, 20% need Vision

**OCR + Text (80%):**
- 1,200 images × $0 (Tesseract) + $0.0025 (GPT-4o text) = **$3/month**

**Vision Fallback (20%):**
- 300 images × $0.006 (Claude) = **$1.80/month**

**Total: $4.80/month**

**Savings: $25.20/month (84% cheaper!)**

### Implementation

```typescript
async function extractProductsHybrid(imagePath: string) {
  // Step 1: Try OCR (free)
  const ocrText = await extractTextFromImage(imagePath);
  
  if (ocrText.length > 100) {
    // Step 2: Use GPT-4o Text API on OCR text (cheap)
    try {
      const products = await extractProductsFromOCRText(ocrText);
      if (products.products.length > 0) {
        return products; // Success!
      }
    } catch (error) {
      console.warn('OCR extraction failed, trying vision...');
    }
  }
  
  // Step 3: Fallback to Claude Vision (if OCR fails)
  return await analyzeDealImageClaude(imagePath);
}
```

---

## Cost Comparison Table

| Approach | Monthly Cost | Savings vs Current | Quality |
|----------|-------------|-------------------|---------|
| **Current: GPT-4o Vision** | $30 | - | ⭐⭐⭐⭐⭐ |
| **OCR + GPT-4o Text** | $0-6 | $24-30 (80-100%) | ⭐⭐⭐⭐ |
| **Claude 3.5 Sonnet Vision** | $9 | $21 (70%) | ⭐⭐⭐⭐⭐ |
| **Hybrid (OCR+Text+Claude)** | $4.80 | $25.20 (84%) | ⭐⭐⭐⭐⭐ |

---

## Recommended Approach: Hybrid

### Why Hybrid is Best

1. **Cheapest** - $4.80/month vs $30/month
2. **Best quality** - OCR+Text for most cases, Vision for complex
3. **Resilient** - Multiple fallbacks
4. **Fast** - Text API is faster than Vision

### Implementation Flow

```
PDF Image
  ↓
OCR (Tesseract - FREE)
  ↓
Is OCR text good? (>100 chars, readable)
  ├─→ YES: GPT-4o Text API ($0.0025/image)
  │     ↓
  │   Success? → Return products
  │     ↓
  │   Failed? → Fallback to Vision
  │
  └─→ NO: Claude Vision ($0.006/image)
        ↓
      Return products
```

### Monthly Cost Breakdown

**Assumptions:**
- 50 images/day = 1,500/month
- 80% success with OCR+Text
- 20% need Vision fallback

**Costs:**
- OCR (Tesseract): $0
- GPT-4o Text (1,200 images): $3
- Claude Vision (300 images): $1.80
- **Total: $4.80/month**

**vs Current: $30/month**

**Savings: $25.20/month (84% reduction)**

---

## Updated Profitability

### With Hybrid Approach

**Fixed Costs:**
- Supabase: $0-25/month
- Vercel: $0-20/month
- AI (Hybrid): **$4.80/month** (vs $30)
- Substack: 10% of revenue

**Total: $4.80-49.80/month** (vs $30-75/month)

**Break-Even:**
- Minimum: $4.80 ÷ $6.30 = **1 subscriber** (almost free!)
- Maximum: $49.80 ÷ $6.30 = **8 subscribers**

**Much better!**

### At Scale

**50 subscribers:**
- Revenue: $315/month (after Substack fee)
- Costs: $4.80-49.80/month
- **Profit: $265-310/month (84-98% margin)**

**100 subscribers:**
- Revenue: $630/month
- Costs: $4.80-49.80/month
- **Profit: $580-625/month (92-98% margin)**

**200 subscribers:**
- Revenue: $1,260/month
- Costs: $4.80-49.80/month
- **Profit: $1,210-1,255/month (96-99% margin)**

---

## Implementation Code

### Updated Edge Function

**File: `supabase/functions/fetch-deals/index.ts`**

```typescript
import { extractTextFromImage } from '../_shared/ocr/tesseract.ts';
import { extractProductsFromOCRText } from '../_shared/ai/extract-from-ocr.ts';
import { analyzeDealImageClaude } from '../_shared/ai/vision-claude.ts';

async function processImage(imagePath: string) {
  // Step 1: OCR (free)
  const ocrText = await extractTextFromImage(imagePath);
  
  // Step 2: Try GPT-4o Text API if OCR is good
  if (ocrText.length > 100 && ocrText.match(/\d/)) {
    try {
      const result = await extractProductsFromOCRText(ocrText);
      if (result.products && result.products.length > 0) {
        console.log(`✅ Extracted ${result.products.length} products via OCR+Text`);
        return result.products;
      }
    } catch (error) {
      console.warn('OCR+Text extraction failed, trying vision...', error);
    }
  }
  
  // Step 3: Fallback to Claude Vision
  console.log('Using Claude Vision as fallback...');
  const result = await analyzeDealImageClaude(imagePath);
  return result.products;
}
```

---

## Summary

### Answer: Yes, Much Cheaper!

**Using OCR + GPT-4o Text API instead of Vision API:**

- **Current:** $30/month (GPT-4o Vision)
- **Alternative:** $4.80/month (Hybrid: OCR+Text+Claude)
- **Savings: $25.20/month (84% reduction)**

### Recommended Strategy

1. **Start with OCR** (Tesseract - free)
2. **Use GPT-4o Text API** on OCR text (cheap, fast)
3. **Fallback to Claude Vision** if OCR fails (still cheaper than GPT-4o Vision)

### Benefits

- ✅ **84% cost reduction** ($4.80 vs $30)
- ✅ **Better break-even** (1-8 subscribers vs 5-12)
- ✅ **Higher margins** (92-99% vs 68-88%)
- ✅ **Still high quality** (multiple fallbacks)

**This is the way to go!**

---

**End of Cost Analysis**

